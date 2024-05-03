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
		const v = value.filter((v) => v !== undefined && v !== null)
		return serialize(v.length) + v.map(serialize).join('')
	}
	if (value instanceof Set) {
		return serialize([...value].filter((v) => v !== undefined && v !== null))
	}
	if (value instanceof Map) {
		let result = serialize(value.size)
		for (const [k, v] of value.entries()) {
			if (k === undefined || k === null || v === undefined || v === null) {
				continue
			}
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
	if (value === null || value === undefined) {
		throw new Error('Invalid value undefined/null')
	}
	console.log(value)
	throw new Error('Invalid value', value)
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
		;[len, str] = deserialize(str, 0)
		const value = str.slice(0, len)
		if (value.length < len) {
			throw new Error('Invalid string')
		}
		return [value, str.slice(len)]
	}
	if (Array.isArray(type)) {
		let len
		;[len, str] = deserialize(str, 0)
		const result = []
		for (let i = 0; i < len; i++) {
			let value
			;[value, str] = deserialize(str, type[0])
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
		;[len, str] = deserialize(str, 0)
		const result = new Map()
		const firstKey = type.keys().next().value
		const firstValue = type.get(firstKey)
		for (let i = 0; i < len; i++) {
			let key
			;[key, str] = deserialize(str, firstKey)
			let value
			;[value, str] = deserialize(str, firstValue)
			result.set(key, value)
		}
		return [result, str]
	}
	if (typeof type === 'object') {
		if (
			typeof type.deserialize === 'function' &&
			type.deserialize.length === 1
		) {
			return type.deserialize(str)
		}
		throw new Error('Invalid object')
	}
	throw new Error('Invalid type')
}

async function async_deserialize(reader, type) {
	if (typeof type === 'number') {
		let valueStr = ''
		let char
		// eslint-disable-next-line no-constant-condition
		while (true) {
			char = await reader(1)
			if (char === ' ') break
			valueStr += char
		}
		const value = parseInt(valueStr, 16)
		if (isNaN(value)) {
			throw new Error('Invalid number')
		}
		return value
	}
	if (typeof type === 'string') {
		const len = await async_deserialize(reader, 0)
		return await reader(len)
	}
	if (Array.isArray(type)) {
		const len = await async_deserialize(reader, 0)
		const result = []
		for (let i = 0; i < len; i++) {
			result.push(await async_deserialize(reader, type[0]))
		}
		return result
	}
	if (type instanceof Set) {
		return new Set(await async_deserialize(reader, [type[0]]))
	}
	if (type instanceof Map) {
		const len = await async_deserialize(reader, 0)
		const result = new Map()
		const firstKey = type.keys().next().value
		const firstValue = type.get(firstKey)
		for (let i = 0; i < len; i++) {
			const key = await async_deserialize(reader, firstKey)
			const value = await async_deserialize(reader, firstValue)
			result.set(key, value)
		}
		return result
	}
	if (typeof type === 'object') {
		if (
			typeof type.async_deserialize === 'function' &&
			type.async_deserialize.length === 1
		) {
			return type.async_deserialize(reader)
		}
		throw new Error('Invalid object')
	}
	throw new Error('Invalid type')
}

class WebSocketStream {
	constructor(url) {
		this.socket = new WebSocket(url)
		this.socket.binaryType = 'arraybuffer'
		this.readQueue = []
		this.bufferedData = []
		this.totalBuffered = 0
		this.isOpen = false

		this.socket.onopen = () => (this.isOpen = true)
		this.socket.onmessage = (event) => this.handleMessage(event)
		this.socket.onerror = (event) => this.handleError(event)
		this.socket.onclose = () => this.handleClose()
		this.decoder = new TextDecoder('ascii')
	}

	handleError(event) {
		this.isOpen = false
		const errorMessage =
			event instanceof ErrorEvent ? event.message : 'WebSocket connection error'
		for (const pending of this.readQueue) {
			pending.reject(new Error(errorMessage))
		}
		this.readQueue = []
	}

	handleMessage(event) {
		this.bufferedData.push(event.data)
		this.totalBuffered += event.data.byteLength
		this.resolveReads()
	}

	resolveReads() {
		while (
			this.readQueue.length > 0 &&
			this.totalBuffered >= this.readQueue[0].size
		) {
			const readRequest = this.readQueue.shift()
			const size = readRequest.size
			const dataToReturn = this.collectData(size)

			readRequest.resolve(dataToReturn)
		}
	}

	collectData(size) {
		let collected = new Uint8Array(size)
		let collectedLength = 0

		while (collectedLength < size) {
			const firstBuffer = this.bufferedData[0]
			const remaining = size - collectedLength
			const toCopy = Math.min(remaining, firstBuffer.byteLength)

			collected.set(
				new Uint8Array(firstBuffer.slice(0, toCopy)),
				collectedLength
			)
			collectedLength += toCopy

			if (toCopy < firstBuffer.byteLength) {
				this.bufferedData[0] = firstBuffer.slice(toCopy)
			} else {
				this.bufferedData.shift()
			}
		}

		this.totalBuffered -= size
		return this.decoder.decode(collected)
	}

	async read(size) {
		if (this.totalBuffered >= size) {
			return this.collectData(size)
		} else {
			return new Promise((resolve, reject) => {
				this.readQueue.push({ size, resolve, reject })
			})
		}
	}

	write(data) {
		if (this.socket.readyState === WebSocket.OPEN) {
			const buffer = new TextEncoder().encode(data)
			this.socket.send(buffer)
		} else {
			throw new Error('WebSocket is not open.')
		}
	}

	handleClose() {
		this.isOpen = false
		for (const pending of this.readQueue) {
			pending.reject(new Error('WebSocket connection closed'))
		}
		this.readQueue = []
		this.bufferedData = []
	}
}

async function* metp_request(host) {
	class Constant {
		static metp_head = '\x02\x36\x34\x20'
		static map = new Map([['', '']])
	}

	const ws = new WebSocketStream(host)
	await new Promise((resolve, reject) => {
		ws.socket.onopen = resolve
		ws.socket.onerror = reject
	}).catch((err) => {
		throw new Error('Unable to connect to server: ' + err.message)
	})
	let req = yield null
	while (true) {
		if (!(req instanceof Map)) {
			throw new Error('Invalid metp')
		}
		ws.write(Constant.metp_head)
		ws.write(serialize(req))
		req = yield await async_deserialize(ws.read.bind(ws), Constant.map)
	}
}

async function metp_request_once(host, metp) {
	try {
		const generator = metp_request(host)
		await generator.next()
		return generator.next(metp)
	} catch (error) {
		console.error('Error in metp_request_once: ' + error.message)
		throw error
	}
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
			return JSON.stringify(j)
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
			str += '\t'.repeat(deep) + ']'
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
			str += '\t'.repeat(deep) + '}'
			return str
		}
		if (typeof j === 'object') {
			let str = '{\n'
			for (const key in j) {
				str +=
					'\t'.repeat(deep + 1) +
					`"${key}": ${format_json(j[key], deep + 1)},\n`
			}
			str += '\t'.repeat(deep) + '}'
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
	metp_request_once,
	to_metp,
	to_json_stringify,
}
