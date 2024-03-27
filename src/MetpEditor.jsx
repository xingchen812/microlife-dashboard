import React from 'react'
import { Button, Space, Select, Card, InputNumber, Input, Row, Col } from 'antd'
import Metp from '../microlife/metp'
import AceEditor from 'react-ace'
import beautify from 'ace-builds/src-noconflict/ext-beautify'
import json5 from 'json5'

import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/mode-yaml'
import 'ace-builds/src-noconflict/mode-xml'
import 'ace-builds/src-noconflict/mode-lua'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-python'
import 'ace-builds/src-noconflict/mode-java'
import 'ace-builds/src-noconflict/mode-c_cpp'
import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/src-noconflict/ext-language_tools'

export default function App() {
  const [fontSize, setFontSize] = React.useState(22)
  const [langualge, setLanguage] = React.useState('json')
  const editorRef = React.useRef()
  const [code, setCode] = React.useState(
    format_json({ '_.u': '/core/version' })
  )
  const [host, setHost] = React.useState('http://localhost:6813')
  const [response, setResponse] = React.useState('')

  function format_json(j, deep = 0) {
    if (typeof j === 'number') {
      return j.toString()
    }
    if (typeof j === 'string') {
      return `"${j}"`
    }
    if (typeof j === 'boolean') {
      return j === true ? 'true' : 'false'
    }
    if (j === null || j === undefined) {
      return 'null'
    }
    if (Array.isArray(j)) {
      let str = '[\n'
      for (const value of j) {
        str += '\t'.repeat(deep + 1) + format_json(value, deep + 1) + ',\n'
      }
      str += ']'
      return str
    }
    if (j instanceof Map) {
      let str = '{\n'
      j.forEach((value, key) => {
        if (typeof key !== 'string') {
          throw new Error('key must be string')
        }
        str +=
          '\t'.repeat(deep + 1) + `"${key}": ${format_json(value, deep + 1)},\n`
      })
      str += '}'
      return str
    }
    if (typeof j === 'object') {
      let str = '{\n'
      for (const key in j) {
        str +=
          '\t'.repeat(deep + 1) +
          `"${key}": ${format_json(j[key], deep + 1)},\n`
      }
      str += '}'
      return str
    }
    throw new Error('unknown type')
  }

  function json_to_map(j) {
    const map = new Map()
    for (const key in j) {
      map.set(key, j[key])
    }
    return map
  }

  return (
    <Card>
      <Space wrap>
        <Button
          type="primary"
          onClick={() => {
            beautify.beautify(editorRef.current.editor.session)
          }}
        >
          格式化
        </Button>
        字体:
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
        语言:
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
            Metp.metp_request(host, json_to_map(json5.parse(code)))
              .then((response) => {
                setResponse(format_json(response))
              })
              .catch((error) => {
                console.error(error)
              })
          }}
        >
          发送请求
        </Button>
        Host:
        <Input
          defaultValue={host}
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
              tabSize: 4,
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
              tabSize: 4,
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
