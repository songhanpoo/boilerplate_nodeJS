import * as express from 'express'

import UserService, {ErrorResponse} from '@src/api/services/auth'
import {writeJsonResponse} from '@src/log/express'
import logger from '@src/utils/logger'

export function createUser(req: express.Request, res: express.Response): void {
  const {email, password, name} = req.body

  UserService.createUser(email, password, name)
    .then(resp => {
      if ((resp as any).error) {
        if ((resp as ErrorResponse).error.type === 'account_already_exists') {
          writeJsonResponse(res, 409, resp)
        } else {
          throw new Error(`unsupported ${resp}`)
        }
      } else {
        writeJsonResponse(res, 201, resp)
      }
    })
    .catch((err: any) => {
      logger.error(`createUser: ${err}`)
      writeJsonResponse(res, 500, {error: {type: 'internal_server_error', message: 'Internal Server Error'}})
    })
}
