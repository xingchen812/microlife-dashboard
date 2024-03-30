import React from 'react'
import {
  Space,
  message,
  Form,
  Radio,
  Input,
  Card,
  Button,
  Select,
  InputNumber,
} from 'antd'
import AceEditor from 'react-ace'
import beautify from 'ace-builds/src-noconflict/ext-beautify'

import Metp from '../microlife/metp'
import { GlobalContext } from './main'

import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/src-noconflict/ext-language_tools'

function Editor({ defaultValue, onSave }) {
  const [fontSize, setFontSize] = React.useState(22)
  const [langualge, setLanguage] = React.useState('json')
  const editorRef = React.useRef()
  const [code, setCode] = React.useState(Metp.to_json_stringify(defaultValue))

  React.useEffect(() => {
    setCode(Metp.to_json_stringify(defaultValue))
  }, [defaultValue])

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
          disabled
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
      <br />
      <Space style={{ marginTop: 10, marginBottom: 10 }}>
        <Button
          type="primary"
          onClick={() => {
            onSave(code)
          }}
        >
          Save
        </Button>
      </Space>
      <AceEditor
        ref={editorRef}
        commands={beautify.commands}
        style={{ height: 500 }}
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
        }}
      />
    </Card>
  )
}

function ConfigEditor() {
  const { global } = React.useContext(GlobalContext)

  return (
    <Editor
      defaultValue={global.config.user}
      onSave={(value) => {
        global.config
          .update({ user: value })
          .then(() => {
            message.success('save success')
          })
          .catch((e) => {
            message.error('save failed: ' + e)
          })
      }}
    ></Editor>
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
