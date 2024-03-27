function serialize(value) {
	if (typeof value === 'number') {
		if (value == 0) {
			return ' '
		}
		if (value < 0 || value % 1 !== 0 || !isFinite(value)) {
			throw new Error('Invalid number')
		}
		return value.toString(16).toUpperCase() + ' '
	}
	if (typeof value === 'string') {
		return serialize(value.length) + value
	}
	if (Array.isArray(value)) {
		return serialize(value.length) + value.map(serialize).join('')
	}
	if (value instanceof Set) {
		return serialize([...value])
	}
	if (value instanceof Map) {
		let result = serialize(value.size)
		for (const [k, v] of value.entries()) {
			result += serialize(k) + serialize(v)
		}
		return result
	}
	if (typeof value === 'object') {
		if (typeof value.serialize === 'function' && value.serialize.length === 0) {
			return value.serialize()
		}
		throw new Error('Invalid object')
	}
	throw new Error('Invalid value', '123', value)
}

function deserialize(str, type) {
	if (typeof type === 'number') {
		const spaceIndex = str.indexOf(' ')
		if (spaceIndex === -1) {
			throw new Error('Invalid number')
		}
		if (spaceIndex === 0) {
			return [0, str.slice(1)]
		}
		const value = parseInt(str.slice(0, spaceIndex), 16)
		if (isNaN(value)) {
			throw new Error('Invalid number')
		}
		return [value, str.slice(spaceIndex + 1)]
	}
	if (typeof type === 'string') {
		let len
		[len, str] = deserialize(str, 0)
		const value = str.slice(0, len)
		if (value.length < len) {
			throw new Error('Invalid string')
		}
		return [value, str.slice(len)]
	}
	if (Array.isArray(type)) {
		let len, value
		[len, str] = deserialize(str, 0)
		const result = []
		for (let i = 0; i < len; i++) {
			[value, str] = deserialize(str, type[0])
			result.push(value)
		}
		return [result, str]
	}
	if (type instanceof Set) {
		const [value, str] = deserialize(str, [...type])
		return [new Set(value), str]
	}
	if (type instanceof Map) {
		let len
		[len, str] = deserialize(str, 0)
		const result = new Map()
		const firstKey = type.keys().next().value
		const firstValue = type.get(firstKey)
		for (let i = 0; i < len; i++) {
			let key
			[key, str] = deserialize(str, firstKey)
			let value
			[value, str] = deserialize(str, firstValue)
			result.set(key, value)
		}
		return [result, str]
	}
	if (typeof type === 'object') {
		if (typeof type.deserialize === 'function' && type.deserialize.length === 1) {
			return type.deserialize(str)
		}
		throw new Error('Invalid object')
	}
	throw new Error('Invalid type')
}

function metp_request(host, metp) {
	class Constant {
		static metp_head = '\x02\x36\x34\x20'
		static map = new Map([['', '']])
	}

	if (!(metp instanceof Map)) {
		throw new Error('Invalid metp')
	}
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest()
		xhr.open('POST', host)
		xhr.setRequestHeader('Microlife', 'dgtp')
		xhr.onreadystatechange = function () {
			if (xhr.readyState === XMLHttpRequest.DONE) {
				if (xhr.status === 200) {
					const [res, str] = deserialize(xhr.responseText, Constant.map)
					if (str.length > 0) {
						reject(new Error('Invalid response'))
					}
					resolve(res)
				} else {
					reject(new Error('HTTP error: ' + xhr.status))
				}
			}
		}
		xhr.onerror = function () {
			reject(new Error('Network error'))
		}
		xhr.send(Constant.metp_head + serialize(metp))
	})
}

function add_to_map(metp, key, value) {
	if (typeof value === 'number') {
		metp.set(key, value.toString())
		return
	}
	if (typeof value === 'string') {
		metp.set(key, value)
		return
	}
	if (typeof value === 'boolean') {
		metp.set(key, value === true ? 'true' : 'false')
		return
	}
	if (value === null || value === undefined) {
		metp.set(key, 'null')
		return
	}
	if (Array.isArray(value)) {
		for (let i = 0; i < value.length; i++) {
			add_to_map(metp, key + '[' + i.toString() + ']', value[i])
		}
		return
	}
	if (value instanceof Map) {
		value.forEach((v, k) => {
			add_to_map(metp, key + '.' + k, v)
		})
		return
	}
	if (typeof value === 'object') {
		for (const k in value) {
			add_to_map(metp, key + '.' + k, value[k])
		}
		return
	}
	throw new Error('Invalid value')
}

function to_metp(j) {
	if (typeof j === 'object') {
		const metp = new Map()
		for (const key in j) {
			add_to_map(metp, key, j[key])
		}
		return metp
	}
	if (j instanceof Map) {
		const metp = new Map()
		j.forEach((value, key) => {
			add_to_map(metp, key, value)
		})
		return metp
	}
	throw new Error('Invalid value')
}

function to_json_stringify(value) {
	function format_json(j, deep = 0) {
		if (typeof j === 'number') {
			return j.toString()
		}
		if (typeof j === 'string') {
			return `"${j}"`
		}
		if (typeof j === 'boolean') {
			return j === true ? 'true' : 'false'
		}
		if (j === null || j === undefined) {
			return 'null'
		}
		if (Array.isArray(j)) {
			let str = '[\n'
			for (const value of j) {
				str += '\t'.repeat(deep + 1) + format_json(value, deep + 1) + ',\n'
			}
			str += ']'
			return str
		}
		if (j instanceof Map) {
			let str = '{\n'
			j.forEach((value, key) => {
				if (typeof key !== 'string') {
					throw new Error('key must be string')
				}
				str +=
					'\t'.repeat(deep + 1) + `"${key}": ${format_json(value, deep + 1)},\n`
			})
			str += '}'
			return str
		}
		if (typeof j === 'object') {
			let str = '{\n'
			for (const key in j) {
				str +=
					'\t'.repeat(deep + 1) +
					`"${key}": ${format_json(j[key], deep + 1)},\n`
			}
			str += '}'
			return str
		}
		throw new Error('unknown type')
	}

	return format_json(value)
}

export default {
	serialize,
	deserialize,
	metp_request,
	to_metp,
	to_json_stringify,
}
