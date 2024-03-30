import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import localforage from 'localforage'
import json5 from 'json5'

import Metp from '../microlife/metp'
import App from './App.jsx'

class ConfigType {
  static systemConfig() {
    return [
      {
        menu: ['dashboard', 'metp editor'],
        component: 'metp_editor',
        host: 'http://localhost:6813',
        fields: {
          '_.u': '/core/version',
        },
      },
      {
        menu: ['dashboard', 'config'],
        component: 'config',
      },
    ]
  }

  static defaultConfig() {
    return [
      {
        menu: ['example', 'metp editor'],
        component: 'metp_editor',
        host: 'http://example:6813',
        fields: {
          '_.u': '/example',
          something: 'something value',
        },
      },
      {
        menu: ['example', 'request NO.1'],
        path: '/example/request/no.1',
        component: 'request',
        fields: [
          {
            key: 'field_a', // for metp uri
            label: 'Field A', // for tip
            type: 'text', // text, select, radio, checkbox, textarea, editor, number
            typeData: '', // for select/ editor type
            required: true,
            disable: false,
            shown: true,
            defaultValue: '',
          },
        ],
      },
    ]
  }

  constructor() {
    this.user = []
    this.userStr = ''
    this.system = ConfigType.systemConfig()
    this.storage = { type: 'localStorage' }
  }

  // @user is string, @storage is object
  async update({ user, storage, _un_save, _un_flush }) {
    if (user !== undefined && user !== null) {
      if (typeof user !== 'string') {
        throw new Error('user must be an string', user)
      }
      this.userStr = user
      this.user = json5.parse(user)
    }
    if (storage !== undefined && storage !== null) {
      if (typeof storage !== 'object') {
        throw new Error('storage must be an object', storage)
      }
      this.storage = storage
    }
    if (_un_save !== true) {
      await this.save()
    }
    if (_un_flush !== true) {
      this.flush()
    }
  }

  async save() {
    await localforage.setItem(
      'microlife_dashboard_config_storage',
      this.storage
    )
    switch (this.storage.type) {
      case 'localStorage':
        await localforage.setItem(
          'microlife_dashboard_config_user',
          this.userStr
        )
        break

      case 'microlife':
        await Metp.metp_request(
          this.storage.data,
          new Map([
            ['_.u', '/config/dashboard/microlife_dashboard_config_user'],
            ['_.d', this.userStr],
          ])
        )
        break

      default:
        throw new Error('unknown storage location type: ' + this.storage.type)
    }
  }

  async load() {
    let storage = await localforage.getItem(
      'microlife_dashboard_config_storage'
    )
    if (
      storage === undefined ||
      storage === null ||
      typeof storage !== 'object'
    ) {
      storage = { type: 'localStorage' }
    }

    let value
    switch (storage.type) {
      case 'localStorage':
        value = await localforage.getItem('microlife_dashboard_config_user')
        break

      case 'microlife':
        const res = await Metp.metp_request(
          this.storage.data,
          new Map([
            ['_.u', '/config/dashboard/microlife_dashboard_config_user'],
            ['_.d', this.userStr],
          ])
        )
        value = res['_.d']
        break

      default:
        throw new Error('unknown storage location type: ' + storage.type)
    }

    if (value === undefined || value === null || typeof value !== 'string') {
      value = JSON.stringify(ConfigType.defaultConfig())
    }

    await this.update({
      user: value,
      storage: storage,
      _un_save: true,
      _un_flush: false,
    })
  }

  flush() {
    throw new Error('not implemented')
  }
}

export const GlobalContext = React.createContext()

function Root() {
  const [global, setGlobal] = React.useState({
    config: new ConfigType(),
    _for_flush: 0,
  })

  React.useEffect(() => {
    setGlobal((prev) => {
      prev.config.flush = () =>
        setGlobal((prevState) => ({
          ...prevState,
          _for_flush: prevState._for_flush + 1,
        }))
      return prev
    })
    global.config.load()
  }, [])

  return (
    <GlobalContext.Provider value={{ global, setGlobal }}>
      <App />
    </GlobalContext.Provider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Root />
    </HashRouter>
  </React.StrictMode>
)
