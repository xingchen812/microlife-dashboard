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
		const firstKey = type.keys().next().value;
		const firstValue = type.get(firstKey);
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
		const xhr = new XMLHttpRequest();
		xhr.open('POST', host);
		xhr.setRequestHeader('Microlife', 'dgtp');
		xhr.onreadystatechange = function () {
			if (xhr.readyState === XMLHttpRequest.DONE) {
				if (xhr.status === 200) {
					const [res, str] = deserialize(xhr.responseText, Constant.map);
					if (str.length > 0) {
						reject(new Error('Invalid response'))
					}
					resolve(res);
				} else {
					reject(new Error('HTTP error: ' + xhr.status));
				}
			}
		};
		xhr.onerror = function () {
			reject(new Error('Network error'));
		};
		xhr.send(Constant.metp_head + serialize(metp));
	});
}

export default {
	serialize,
	deserialize,
	metp_request
};
