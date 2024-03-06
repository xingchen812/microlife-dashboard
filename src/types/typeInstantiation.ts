import * as Local from './local'

export const integer: number = 0
export const string: string = ''
export const user: Local.User = {
  uuid: '',
  host: '',
  username: '',
  encryptType: '',
  encryptKey: '',
  meta: {
    avatar: {
      type: 'none',
      data: '',
    },
    nickname: '',
    description: '',
  },
}
export const metp_mt = new Map<string, string>([['', '']])
export const make_tuple = <T extends any[]>(...values: T): Local.Tuple<T> => new Local.Tuple(...values)
