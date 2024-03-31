import React from 'react'
import { message, Form, Radio, Input, Card, Button, Select } from 'antd'

import CodeEditor from '../utils/CodeEditor'
import { GlobalContext } from '../main'

function ConfigEditor() {
	const { global } = React.useContext(GlobalContext)
	const [config, setConfig] = React.useState(global.config.userStr)

	React.useEffect(() => {
		setConfig(global.config.userStr)
	}, [global])

	return (
		<Card>
			<Button
				type="primary"
				onClick={() => {
					global.config
						.update({ user: config })
						.then(() => {
							message.success('save success')
						})
						.catch((e) => {
							message.error('save failed: ' + e)
						})
				}}
			>
				Save
			</Button>
			<CodeEditor
				defaultValue={global.config.userStr}
				defaultLanguage={'json'}
				onChange={(value) => {
					setConfig(value)
				}}
				editorStyle={{ height: '70vh' }}
			/>
		</Card>
	)
}

function ConfigStorage() {
	const { global } = React.useContext(GlobalContext)
	const [form] = Form.useForm()
	const type = Form.useWatch('type', form)

	return (
		<Card>
			<Form
				initialValues={global.config.storage}
				form={form}
				autoComplete="off"
				onFinish={(v) => {
					global.config
						.update({ storage: v })
						.then(() => {
							message.success('save success')
						})
						.catch((e) => {
							message.error('save failed: ' + e)
						})
				}}
			>
				<Form.Item label="config storage location" name="type">
					<Select>
						<Select.Option value="localStorage">localStorage</Select.Option>
						<Select.Option value="microlife">microlife</Select.Option>
					</Select>
				</Form.Item>
				{(() => {
					switch (type) {
						case 'localStorage':
							return undefined

						case 'microlife':
							return (
								<Form.Item label="base uri" name="data">
									<Input />
								</Form.Item>
							)

						default:
							return undefined
					}
				})()}
				<Form.Item>
					<Button type="primary" htmlType="submit">
						Save
					</Button>
				</Form.Item>
			</Form>
		</Card>
	)
}

export default function App() {
	const [formType, setFormType] = React.useState('config json')

	return (
		<>
			<Radio.Group
				value={formType}
				onChange={(e) => setFormType(e.target.value)}
				style={{ marginBottom: 16 }}
			>
				<Radio.Button value="config json">config json</Radio.Button>
				<Radio.Button value="storage">storage</Radio.Button>
			</Radio.Group>
			{(() => {
				switch (formType) {
					case 'config json':
						return <ConfigEditor />

					case 'storage':
						return <ConfigStorage />

					default:
						return undefined
				}
			})()}
		</>
	)
}
