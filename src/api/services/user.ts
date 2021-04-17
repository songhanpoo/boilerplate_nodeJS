import User, {IUser} from '@src/api/models/user';
import logger from '@src/utils/logger'


export type CreateUserResponse = ErrorResponse | {userId: string}


function createUser(email: string, password: string, name: string): Promise<CreateUserResponse> {
  return new Promise(function(resolve, reject) {
    const user = new User({email: email, password: password, name: name})
    user.save()
      .then(u => {
        resolve({userId: u._id.toString()})
      })
      .catch(err => {
        if (err.code === 11000) {
          resolve({error: {type: 'account_already_exists', message: `${email} already exists`}})
        } else {
          logger.error(`createUser: ${err}`)
          reject(err)
        }
      })
  })
}

export default {createUser: createUser}