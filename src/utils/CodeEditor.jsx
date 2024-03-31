import React from 'react'
import PropTypes from 'prop-types'
import { Button, Space, Select, Card, InputNumber } from 'antd'

export default function App({
	defaultValue,
	defaultLanguage,
	onChange,
	editorStyle,
}) {
	const editorRef = React.useRef(null)

	const [fontSize, setFontSize] = React.useState(22)
	const [language, setLanguage] = React.useState(defaultLanguage || 'text')
	const [editor, setEditor] = React.useState(null)
	const [beautify, setBeautify] = React.useState(null)

	React.useEffect(() => {
		if (!editorRef.current) {
			return
		}
		setEditor(window.ace.edit(editorRef.current))
	}, [editorRef])

	React.useEffect(() => {
		if (!editor) {
			return
		}
		editor.setTheme('ace/theme/github')
		editor.setOptions({
			enableBasicAutocompletion: true,
			enableLiveAutocompletion: true,
		})
		editor.session.setTabSize(2)
		setBeautify(window.ace.require('ace/ext/beautify'))
		return () => {
			editor.destroy()
			editor.container.remove()
		}
	}, [editor])

	React.useEffect(() => {
		if (!editor) {
			return
		}
		editor.session.on('change', () => {
			if (onChange) {
				onChange(editor.getValue())
			}
		})
	}, [editor, onChange])

	React.useEffect(() => {
		if (!editor) {
			return
		}
		editorRef.current.style.fontSize = `${fontSize}px`
	}, [fontSize, editor])

	React.useEffect(() => {
		if (!editor) {
			return
		}
		if (language) {
			editor.session.setMode(`ace/mode/${language}`)
		} else {
			editor.session.setMode(`ace/mode/text`)
		}
	}, [language, editor])

	React.useEffect(() => {
		if (!editor) {
			return
		}
		editor.setValue(defaultValue || '')
	}, [defaultValue, editor])

	React.useEffect(() => {
		setLanguage(defaultLanguage)
	}, [defaultLanguage])

	return (
		<Card>
			<Space wrap style={{ marginBottom: 16 }}>
				<Button
					type="primary"
					onClick={() => {
						beautify.beautify(editor.session)
					}}
				>
					Format
				</Button>
				<span>Font Size:</span>
				<InputNumber
					min={1}
					max={200}
					keyboard
					changeOnWheel
					defaultValue={fontSize}
					onChange={setFontSize}
				/>
				<span>Language:</span>
				<Select
					defaultValue={language}
					onChange={setLanguage}
					options={[
						{ label: 'Text', value: 'text' },
						{ label: 'JSON', value: 'json' },
						{ label: 'JavaScript', value: 'javascript' },
						{ label: 'Lua', value: 'lua' },
					]}
				/>
			</Space>
			<div
				ref={editorRef}
				style={{ width: '100%', height: 200, ...editorStyle }}
			></div>
		</Card>
	)
}

App.propTypes = {
	defaultValue: PropTypes.string,
	defaultLanguage: PropTypes.string,
	onChange: PropTypes.func,
	editorStyle: PropTypes.object,
}
