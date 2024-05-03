import React from 'react'
import PropTypes from 'prop-types'
import { Button, Space, Card, Input, Row, Col } from 'antd'
import json5 from 'json5'

import Metp from '../utils/metp'
import CodeEditor from '../utils/CodeEditor'
import { GlobalContext } from '../main'

export default function App({ data }) {
	const { global } = React.useContext(GlobalContext)
	const [host, setHost] = React.useState(data.host)
	const [request, setRequest] = React.useState(
		JSON.stringify(data.fields, null, 2)
	)
	const [response, setResponse] = React.useState('')

	React.useEffect(() => {
		setHost(data.host)
	}, [data])

	return (
		<Card>
			<Space wrap style={{ marginTop: 10, marginBottom: 10 }}>
				<Button
					type="primary"
					onClick={() => {
						setResponse('')
						Metp.metp_request_once(host, Metp.to_metp(json5.parse(request)))
							.then((response) => {
								setResponse(
									JSON.stringify(
										json5.parse(Metp.to_json_stringify(response)),
										null,
										2
									)
								)
								global.messageApi.success('Request success')
							})
							.catch((error) => {
								setResponse(error.toString())
								global.messageApi.error('Request failed')
								console.log(error)
							})
					}}
				>
					Request
				</Button>
				Host:
				<Input
					value={host}
					onChange={(e) => {
						setHost(e.target.value)
					}}
				></Input>
			</Space>
			<Row gutter={16}>
				<Col span={12}>
					<CodeEditor
						defaultValue={JSON.stringify(data.fields, null, 2)}
						defaultLanguage={'json'}
						onChange={setRequest}
					></CodeEditor>
				</Col>
				<Col span={12}>
					<CodeEditor
						defaultValue={response}
						defaultLanguage={'json'}
						onChange={setResponse}
					></CodeEditor>
				</Col>
			</Row>
		</Card>
	)
}

App.propTypes = {
	data: PropTypes.any,
}
