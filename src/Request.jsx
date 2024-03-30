import React from 'react'
import {
  Space,
  message,
  Form,
  Input,
  Card,
  Button,
  Select,
  InputNumber,
  Checkbox,
} from 'antd'
import AceEditor from 'react-ace'
import beautify from 'ace-builds/src-noconflict/ext-beautify'

import Metp from '../microlife/metp'

import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/src-noconflict/ext-language_tools'

function Editor({ value, onChange }) {
  const [fontSize, setFontSize] = React.useState(22)
  const [langualge, setLanguage] = React.useState('json')
  const editorRef = React.useRef()
  const [code, setCode] = React.useState(value)

  React.useEffect(() => {
    setCode(value)
    onChange(code)
  }, [value])

  return (
    <Card>
      <Space wrap>
        <Button
          type="primary"
          onClick={() => {
            beautify.beautify(editorRef.current.editor.session)
          }}
        >
          Format
        </Button>
        FontSize:
        <InputNumber
          min={1}
          max={200}
          keyboard
          changeOnWheel
          defaultValue={fontSize}
          onChange={(value) => {
            setFontSize(value)
          }}
        />
        Document:
        <Select
          defaultValue="json"
          style={{ width: 120 }}
          onChange={(value) => {
            setLanguage(value)
          }}
          options={[
            { label: 'json', value: 'json' },
            { label: 'yaml', value: 'yaml' },
            { label: 'xml', value: 'xml' },
            { label: 'lua', value: 'lua' },
            { label: 'javascript', value: 'javascript' },
            { label: 'python', value: 'python' },
            { label: 'java', value: 'java' },
            { label: 'c_cpp', value: 'c_cpp' },
          ]}
        />
      </Space>
      <AceEditor
        ref={editorRef}
        commands={beautify.commands}
        style={{ height: 500, marginTop: 10 }}
        mode={langualge}
        theme="github"
        editorProps={{ $blockScrolling: true }}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
          tabSize: 2,
          highlightActiveLine: true,
          fontSize: fontSize,
          showPrintMargin: false,
          wrap: true,
        }}
        width="100%"
        height="100%"
        value={code}
        onChange={(value) => {
          setCode(value)
          onChange(value)
        }}
      />
    </Card>
  )
}

function MyCheckBox({ value, onChange }) {
  return (
    <Checkbox
      checked={value}
      onChange={(e) => {
        onChange(e.target.checked)
      }}
    />
  )
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

export default function App({ data }) {
  const [formValues, setFormValues] = React.useState(
    initDefaultFieldValue(data)
  )

  React.useEffect(() => {
    setFormValues(initDefaultFieldValue(data))
  }, [data])

  return (
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
        Metp.metp_request(v.host, metp)
          .then((res) => {
            message.success('Request success: ', res)
          })
          .catch((err) => {
            message.error('Request failed: ', err)
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
  )
}
