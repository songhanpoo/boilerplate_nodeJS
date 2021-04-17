import * as express from 'express'

import UserService, {ErrorResponse} from '@src/api/services/auth';
import {writeJsonResponse} from '@src/log/express';
import logger from '@src/utils/logger';

export function auth(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const token = req.headers.authorization!
  UserService.auth(token)
    .then(authResponse => {
      if (!(authResponse as any).error) {
        res.locals.auth = {
          userId: (authResponse as {userId: string}).userId
        }
        next()
      } else {
        writeJsonResponse(res, 401, authResponse)
      }
    })
    .catch(err => {
      logger.error(`auth: ${err}`)
      writeJsonResponse(res, 500, {error: {type: 'internal_server_error', message: 'Internal Server Error'}})
    })
}

export function login(req: express.Request, res: express.Response): void {
  const {email, password} = req.body

  UserService.login(email, password)
    .then(resp => {
      if ((resp as any).error) {
        if ((resp as ErrorResponse).error.type === 'invalid_credentials') {
          writeJsonResponse(res, 404, resp)
        } else {
          throw new Error(`unsupported ${resp}`)
        }
      } else {
        const {userId, token, expireAt} = resp as {token: string, userId: string, expireAt: Date}
        writeJsonResponse(res, 200, {userId: userId, token: token}, {'X-Expires-After': expireAt.toISOString()})
      }
    })
    .catch((err: any) => {
      logger.error(`login: ${err}`)
      writeJsonResponse(res, 500, {error: {type: 'internal_server_error', message: 'Internal Server Error'}})
    })
}