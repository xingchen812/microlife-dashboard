import React from 'react'
import PropTypes from 'prop-types'
import {
	message,
	Form,
	Input,
	Button,
	Select,
	InputNumber,
	Checkbox,
	Card,
} from 'antd'

import CodeEditor from '../utils/CodeEditor'
import Metp from '../utils/metp'

function Editor({ value, onChange }) {
	const [defaultValue] = React.useState(value)

	return <CodeEditor defaultValue={defaultValue} onChange={onChange} />
}

Editor.propTypes = {
	value: PropTypes.any,
	onChange: PropTypes.func,
}

function MyCheckBox({ value, onChange }) {
	return (
		<Checkbox
			checked={value.toString() === 'true'}
			onChange={(e) => {
				onChange(e.target.checked.toString())
			}}
		/>
	)
}

MyCheckBox.propTypes = {
	value: PropTypes.any,
	onChange: PropTypes.func,
}

function DynamicComponent(data) {
	try {
		if (data.shown === false) {
			return undefined
		}

		switch (data.type) {
			case 'text':
				return (
					<Form.Item
						key={data.key}
						label={data.label}
						name={'_' + data.key}
						disabled={data.disabled}
						rules={[{ required: data.required }]}
					>
						<Input />
					</Form.Item>
				)

			case 'select':
				return (
					<Form.Item
						key={data.key}
						label={data.label}
						name={'_' + data.key}
						disabled={data.disabled}
						rules={[{ required: data.required }]}
					>
						<Select
							options={data.typeData.map((item) => {
								return { label: item, value: item }
							})}
						/>
					</Form.Item>
				)

			case 'checkbox':
				return (
					<Form.Item
						key={data.key}
						label={data.label}
						name={'_' + data.key}
						disabled={data.disabled}
						rules={[{ required: data.required }]}
					>
						<MyCheckBox />
					</Form.Item>
				)

			case 'textarea':
				return (
					<Form.Item
						key={data.key}
						label={data.label}
						name={'_' + data.key}
						disabled={data.disabled}
						rules={[{ required: data.required }]}
					>
						<Input.TextArea />
					</Form.Item>
				)

			case 'editor':
				return (
					<Form.Item
						key={data.key}
						label={data.label}
						name={'_' + data.key}
						disabled={data.disabled}
						rules={[{ required: data.required }]}
					>
						<Editor />
					</Form.Item>
				)

			case 'number':
				return (
					<Form.Item
						key={data.key}
						label={data.label}
						name={'_' + data.key}
						disabled={data.disabled}
						rules={[{ required: data.required }]}
					>
						<InputNumber />
					</Form.Item>
				)

			case 'host':
				return (
					<Form.Item
						key={data.key}
						label={data.label}
						name={'host'}
						disabled={data.disabled}
						rules={[{ required: data.required }]}
					>
						<Input />
					</Form.Item>
				)

			default:
				return <div>Unknown type name: {data.type}</div>
		}
	} catch (_) {
		return undefined
	}
}

function initDefaultFieldValue(data) {
	const values = {}
	data.fields.forEach((field) => {
		if (field.type === 'host') {
			values['host'] = field.defaultValue
		} else if (
			typeof field.key === 'string' &&
			field.defaultValue !== undefined
		) {
			values['_' + field.key] = field.defaultValue
		}
	})
	return values
}

export default function App({ data, onFinish }) {
	const [formValues, setFormValues] = React.useState(
		initDefaultFieldValue(data)
	)

	React.useEffect(() => {
		setFormValues(initDefaultFieldValue(data))
	}, [data])

	return (
		<Card>
			<Form
				initialValues={formValues}
				autoComplete="off"
				onFinish={(v) => {
					const metp = new Map()
					Object.entries(v).forEach(([key, value]) => {
						if (key === 'host') {
							metp.set('host', value)
						} else if (key.startsWith('_')) {
							metp.set(key.slice(1), value)
						}
					})
					Metp.metp_request_once(v.host, metp)
						.then((res) => {
							message.success('Request success: ')
							if (onFinish) {
								onFinish(res)
							}
						})
						.catch((err) => {
							message.error('Request failed: ')
							console.log(err)
						})
				}}
			>
				{data.fields.map((field) => DynamicComponent(field))}
				<Form.Item>
					<Button type="primary" htmlType="submit">
						Request
					</Button>
				</Form.Item>
			</Form>
		</Card>
	)
}

App.propTypes = {
	data: PropTypes.any,
	onFinish: PropTypes.func,
}
