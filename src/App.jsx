import React from 'react'
import { Button } from 'antd';
import Metp from '../microlife/metp';

export default function App() {
	const [count, setCount] = React.useState(0)

	Metp.metp_request('http://localhost:6813', new Map([['_.u', '/core/version']])).then((response) => {
		console.log("name: " + response.get('name'))
		console.log("version: " + response.get('_.d'))
	}).catch((error) => {
		console.error(error)
	})

	return (
		<>
			<div>Hello World</div>
			<Button type="primary" onClick={() => setCount((count) => count + 1)}>
				count is {count}
			</Button>
		</>
	)
}
