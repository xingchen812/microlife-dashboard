import React from 'react'
import { Button, Space, Select, Card, InputNumber } from 'antd'
import AceEditor from 'react-ace'
import beautify from 'ace-builds/src-noconflict/ext-beautify'

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

export default function App({ defaultValue, defaultLanguage, onChange }) {
  const [fontSize, setFontSize] = React.useState(22)
  const [langualge, setLanguage] = React.useState(defaultLanguage)
  const editorRef = React.useRef()
  const [code, setCode] = React.useState(defaultValue)

  React.useEffect(() => {
    setCode(defaultValue)
    onChange(defaultValue)
  }, [defaultValue])

  React.useEffect(() => {
    setLanguage(defaultLanguage)
  }, [defaultLanguage])

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
        style={{ height: 500, marginTop: 16 }}
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
          onChange(value)
        }}
      />
    </Card>
  )
}
