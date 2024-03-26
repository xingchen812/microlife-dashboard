import React from 'react'
import { Button } from 'antd';

export default function App() {
	const [count, setCount] = React.useState(0)

	return (
		<>
			<div>Hello World</div>
			<Button type="primary" onClick={() => setCount((count) => count + 1)}>
				count is {count}
			</Button>
		</>
	)
}
