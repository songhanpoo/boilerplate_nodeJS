import express from 'express';
import mongo from './mongo';
import redis from './redis';
import {OpenApiValidator} from 'express-openapi-validator'
import {Express} from 'express-serve-static-core'
import morgan from 'morgan'
import morganBody from 'morgan-body'
import {connector, summarise} from 'swagger-routes-express'
import YAML from 'yamljs'
import * as api from '@src/api/controllers';

import {devLogger} from '@src/log/devLogger';
import config from '@src/config';
import logger from '@src/utils/logger';

class Server{
  public srv: express.Application = express();

  constructor(){
    this.configSetup()
    this.mongoSetup();
    this.redisSetup();
  }
  private mongoSetup():void{
    mongo.open();
  }
  private redisSetup():void{
    redis.open();
  }
  private async configSetup(): Promise<void>{
    const yamlSpecFile = './docs/openapi.yml'
    const apiDefinition = YAML.load(yamlSpecFile)
    const apiSummary = summarise(apiDefinition)
    logger.info(apiSummary)
           
    /* istanbul ignore next */
    if (config.morganLogger) {
      this.srv.use(morgan(':method :url :status :response-time ms - :res[content-length]'))
    }
    
    /* istanbul ignore next */
    if (config.morganBodyLogger) {
      morganBody(this.srv)
    }
  
    /* istanbul ignore next */
    if (config.DevLogger) {
      this.srv.use(devLogger)
    }
    
    // setup API validator
    const validatorOptions = {
      apiSpec: yamlSpecFile,
      validateRequests: true,
      validateResponses: true
    }
    await new OpenApiValidator(validatorOptions).install(this.srv)
    
    // error customization, if request is invalid
    this.srv.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.status(err.status).json({
        error: {
          type: 'request_validation',
          message: err.message,
          errors: err.errors
        }
      })
    })
   
    const connect = connector(api, apiDefinition, {
      onCreateRoute: (method: string, descriptor: any[]) => {
        descriptor.shift()
        logger.verbose(`${method}: ${descriptor.map((d: any) => d.name).join(', ')}`)
      }
    })
    connect(this.srv)
  }
}

export default new Server().srv;