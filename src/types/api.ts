import * as Local from './local';

// export interface application_t {
//     id: string                      // unique id
//     name: string                    // user defined name 
//     meta: any                       // json.object
//     running: any | undefined        // is running?
// }

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
    const requestBody = `${dgtpMetpHead}${Local.serialize(user.username)}${await encrypt(user, Local.serialize(req))}`
    const response = await fetch(user.host, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/octet-stream',
            'Microlife': 'dgtp',
        },
        body: new TextEncoder().encode(requestBody),
    })

    // 处理响应
    if (response.ok) {
        const responseData = await response.arrayBuffer()
        const responseText = new TextDecoder().decode(new Uint8Array(responseData))
        const { value: deserializedMap } = Local.deserialize(await decrypt(user, responseText), Local.typeInstantiation.metp_mt)

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
    const res = await request(user, new Map([['_.ui', "0"]]));
    const res_json = JSON.parse(res.get('_.d') || '')
    return {
        name: res_json["name"] || '',
        version: res_json["version"] || '',
    }
}

