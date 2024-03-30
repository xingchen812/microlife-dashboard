import React from 'react'
import { Button, Space, Select, Card, InputNumber, Input, Row, Col } from 'antd'
import AceEditor from 'react-ace'
import beautify from 'ace-builds/src-noconflict/ext-beautify'
import json5 from 'json5'

import Metp from '../microlife/metp'

import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/src-noconflict/ext-language_tools'

export default function App({ defaultHost, defaultValue }) {
  const [fontSize, setFontSize] = React.useState(22)
  const [langualge, setLanguage] = React.useState('json')
  const editorRef = React.useRef()
  const [code, setCode] = React.useState(Metp.to_json_stringify(defaultValue))
  const [host, setHost] = React.useState(defaultHost)
  const [response, setResponse] = React.useState('')

  React.useEffect(() => {
    setHost(defaultHost)
  }, [defaultHost])

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
      <Space wrap style={{ marginTop: 10, marginBottom: 10 }}>
        <Button
          type="primary"
          onClick={() => {
            setResponse('')
            Metp.metp_request(host, Metp.to_metp(json5.parse(code)))
              .then((response) => {
                setResponse(Metp.to_json_stringify(response))
              })
              .catch((error) => {
                setResponse(Metp.to_json_stringify(error.toString()))
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
        </Col>
        <Col span={12}>
          <AceEditor
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
              readOnly: true,
            }}
            width="100%"
            height="100%"
            value={response}
          />
        </Col>
      </Row>
    </Card>
  )
}
