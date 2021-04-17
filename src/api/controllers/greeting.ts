import * as express from 'express'
import {writeJsonResponse} from '@src/log/express'


export function hello(req: express.Request, res: express.Response): void {
  const name = req.query.name || 'stranger'
  writeJsonResponse(res, 200, {"message": `Hello, ${name}!`})
}
