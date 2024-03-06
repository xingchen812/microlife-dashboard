import * as Local from './local'

// export interface application_t {
//     id: string                      // unique id
//     name: string                    // user defined name
//     meta: any                       // json.object
//     running: any | undefined        // is running?
// }

export type User = Local.User

const dgtpMetpHead = (() => {
  const periodTimestampS = 1735689600
  const periodType = 2
  const periodId = 100
  let res = ''

  // 判断当前时间(s) 是否大于 period_timestamp_s
  const now = Math.floor(new Date().getTime() / 1000)
  if (now > periodTimestampS) {
    res += String.fromCharCode(0)
    res += Local.serialize(periodTimestampS)
  }
  res += String.fromCharCode(periodType)
  res += Local.serialize(periodId)
  return res
})()

async function encrypt(user: Local.User, data: string) {
  return data
}

async function decrypt(user: Local.User, data: string) {
  return data
}

export async function request(user: Local.User, req: Local.metp_mt) {
  const requestBody = `${dgtpMetpHead}${Local.serialize(
    user.username,
  )}${await encrypt(user, Local.serialize(req))}`
  const response = await fetch(user.host, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      Microlife: 'dgtp',
    },
    body: new TextEncoder().encode(requestBody),
  })

  // 处理响应
  if (response.ok) {
    const responseData = await response.arrayBuffer()
    const responseText = new TextDecoder().decode(new Uint8Array(responseData))
    const { value: deserializedMap } = Local.deserialize(
      await decrypt(user, responseText),
      Local.typeInstantiation.metp_mt,
    )

    if (deserializedMap.get('_.c') !== '0') {
      console.error('Request failed: ', deserializedMap)
      throw new Error('Request failed')
    }

    return deserializedMap
  } else {
    console.error('Network error:', response.statusText)
    throw new Error('Network error')
  }
}

export async function core_version(user: Local.User) {
  const res = await request(user, new Map([['_.ui', '0']]))
  const res_json = JSON.parse(res.get('_.d') ?? '')
  return {
    name: Local.convertType<string>(
      res_json.name as string,
      Local.typeInstantiation.string,
    ),
    version: Local.convertType<string>(
      res_json.version as string,
      Local.typeInstantiation.string,
    ),
    api: Local.convertType<string>(
      res_json.api as string,
      Local.typeInstantiation.string,
    ),
  }
}

export async function core_stop(user: Local.User) {
  await request(user, new Map([
    ['_.ui', '1'],
  ]))
}

export async function core_mgid_next_prefix(user: Local.User) {
  const response = await request(user, new Map([
    ['_.ui', '4'],
  ]))
  const data = response.get('_.d') ?? ''
  if (data === '') {
    throw new Error('Request failed')
  }
  return data
}

export async function core_mgid_next(user: Local.User, num: number = 1) {
  const response = await request(user, new Map([
    ['_.ui', '5'],
    ['_.d', Local.serialize(num)],
  ]))
  const data = response.get('_.d') ?? ''
  if (data === '') {
    throw new Error('Request failed')
  }
  return data
}

export async function core_resmeta_set(user: Local.User, mgid: string, type: string, data: string) {
  await request(user, new Map([
    ['_.ui', '6'],
    ['_.d', mgid],
    ['type', type],
    ['data', data],
  ]))
}

export async function core_resmeta_get(user: Local.User, mgid: string) {
  const response = await request(user, new Map([
    ['_.ui', '7'],
    ['_.d', mgid],
  ]))
  const type = response.get('_.d') ?? ''
  const data = response.get('data') ?? ''
  if (type === '') {
    throw new Error('mgid not found')
  }
  return {
    type,
    data,
  }
}

export async function core_resmeta_list(_user: Local.User) {
  throw new Error('Not implemented')
}

export async function core_resmeta_remove(user: Local.User, mgid: string) {
  await request(user, new Map([
    ['_.ui', '9'],
    ['_.d', mgid],
  ]))
}

export async function core_resmeta_meta_item_set(user: Local.User, mgid: string, group: string, key: string, value: string) {
  await request(user, new Map([
    ['_.ui', 'A'],
    ['_.d', mgid],
    ['group', group],
    ['key', key],
    ['value', value],
  ]))
}

export async function core_resmeta_meta_item_get(user: Local.User, mgid: string, group: string, key: string) {
  const response = await request(user, new Map([
    ['_.ui', 'B'],
    ['_.d', mgid],
    ['group', group],
    ['key', key],
  ]))
  const data = response.get('_.d') ?? ''
  if (data === '') {
    throw new Error('key not found')
  }
  return data
}

export async function core_resmeta_meta_item_remove(user: Local.User, mgid: string, group: string, key: string) {
  await request(user, new Map([
    ['_.ui', 'C'],
    ['_.d', mgid],
    ['group', group],
    ['key', key],
  ]))
}

export async function core_resmeta_meta_get_groups(user: Local.User, mgid: string, offset: number, length: number) {
  const response = await request(user, new Map([
    ['_.ui', 'D'],
    ['_.d', mgid],
    ['_.of', Local.serialize(offset)],
    ['_.lh', Local.serialize(length)],
  ]))
  const { value } = Local.deserialize(response.get('_.d') ?? '', [''])
  const of = response.get('_.of')
  const lh = response.get('_.lh')
  return {
    offset: of ? Local.deserialize(of, Local.typeInstantiation.integer) : 0,
    remaining: lh ? Local.deserialize(lh, Local.typeInstantiation.integer) : undefined,
    value,
  }
}

export async function core_resmeta_meta_remove_group(user: Local.User, mgid: string, group: string) {
  await request(user, new Map([
    ['_.ui', 'E'],
    ['_.d', mgid],
    ['group', group],
  ]))
}

export async function core_resmeta_meta_get_group_items(user: Local.User, mgid: string, group: string, offset: number, length: number) {
  const response = await request(user, new Map([
    ['_.ui', 'F'],
    ['_.d', mgid],
    ['group', group],
    ['_.of', Local.serialize(offset)],
    ['_.lh', Local.serialize(length)],
  ]))
  const { value } = Local.deserialize(response.get('_.d') ?? '', [''])
  const of = response.get('_.of')
  const lh = response.get('_.lh')
  return {
    offset: of ? Local.deserialize(of, Local.typeInstantiation.integer) : 0,
    remaining: lh ? Local.deserialize(lh, Local.typeInstantiation.integer) : undefined,
    value,
  }
}

export async function core_user_set(user: Local.User, mgid: string, parent: string | undefined, encryptor: string | undefined, prouter: string | undefined, router: string | undefined) {
  const req = new Map([
    ['_.ui', '10'],
    ['_.d', mgid],
  ])
  if (parent) {
    req.set('parent', parent)
  }
  if (encryptor) {
    req.set('encryptor', encryptor)
  }
  if (prouter) {
    req.set('prouter', prouter)
  }
  if (router) {
    req.set('router', router)
  }
  await request(user, req)
}

export async function core_user_get(user: Local.User, mgid: string) {
  const response = await request(user, new Map([
    ['_.ui', '11'],
    ['_.d', mgid],
  ]))
  return {
    parent: response.get('parent') ?? '',
    encryptor: response.get('encryptor') ?? '',
    prouter: response.get('prouter') ?? '',
    router: response.get('router') ?? '',
  }
}

export async function core_user_remove(user: Local.User, mgid: string) {
  await request(user, new Map([
    ['_.ui', '12'],
    ['_.d', mgid],
  ]))
}

export async function core_user_childs(user: Local.User, mgid: string, offset: number, length: number) {
  const response = await request(user, new Map([
    ['_.ui', '13'],
    ['_.d', mgid],
    ['_.of', Local.serialize(offset)],
    ['_.lh', Local.serialize(length)],
  ]))
  const { value } = Local.deserialize(response.get('_.d') ?? '', [''])
  const of = response.get('_.of')
  const lh = response.get('_.lh')
  return {
    offset: of ? Local.deserialize(of, Local.typeInstantiation.integer) : 0,
    remaining: lh ? Local.deserialize(lh, Local.typeInstantiation.integer) : undefined,
    value,
  }
}

export async function core_get_absolute_path(user: Local.User, uri: string) {
  const response = await request(user, new Map([
    ['_.ui', '14'],
    ['_.p', uri],
  ]))
  return response.get('_.p') ?? ''
}
