import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import localforage from 'localforage'

import Metp from '../microlife/metp'
import App from './App.jsx'

class GlobalContextType {
  static k_menu = () => {
    return {
      dashboard: {
        metp_editor: '/dashboard/metp_editor',
        config: '/dashboard/config',
      },
    }
  }
  static k_url = () => {
    return {
      '/dashboard/metp_editor': {
        component: 'metp_editor',
        data: {
          host: 'http://localhost:6813',
          default: { '_.u': '/core/version' },
        },
      },
      '/dashboard/config': {
        component: 'config',
        data: {
          config: {
            menu: {},
            url: {},
          },
        },
      },
    }
  }

  constructor() {
    this.configUser = {
      menu: {},
      url: {},
      storageLocation: { type: 'localStorage' },
    }
    this.config = {
      menu: GlobalContextType.k_menu(),
      url: GlobalContextType.k_url(),
    }
  }

  async configUpdateMenu(menu, save = true) {
    this.configUser.menu = menu
    this.config.menu = {
      ...menu,
      ...GlobalContextType.k_menu(),
    }
    this.config.url['/dashboard/config'].data.config.menu = menu
    if (save === true) {
      await this.configSave()
    }
    this.flush()
  }

  async configUpdateUrl(url, save = true) {
    this.configUser.url = url
    this.config.url = {
      ...url,
      ...GlobalContextType.k_url(),
    }
    this.config.url['/dashboard/config'].data.config.url = url
    this.config.url['/dashboard/config'].data.config.menu = this.configUser.menu
    if (save === true) {
      await this.configSave()
    }
    this.flush()
  }

  async configUpdateStorageLocation(storageLocation, save = true) {
    this.configUser.storageLocation = storageLocation
    if (save === true) {
      await this.configSave()
    }
    this.flush()
  }

  async configSave() {
    await localforage.setItem(
      'microlife_dashboard_config_storage_location',
      this.configUser.storageLocation
    )
    switch (this.configUser.storageLocation.type) {
      case 'localStorage':
        await localforage.setItem(
          'microlife_dashboard_config_menu',
          this.configUser.menu
        )
        await localforage.setItem(
          'microlife_dashboard_config_url',
          this.configUser.url
        )
        break

      case 'microlife':
        await Metp.metp_request(
          this.configUser.storageLocation.data,
          new Map([
            ['menu', this.configUser.menu],
            ['url', this.configUser.url],
          ])
        )
        break

      default:
        throw new Error(
          'unknown storage location type: ' +
            this.configUser.storageLocation.type
        )
    }
  }

  async configLoad() {
    let value = await localforage.getItem(
      'microlife_dashboard_config_storage_location'
    )
    if (value && typeof value === 'object') {
      await this.configUpdateStorageLocation(value, false)
    }

    value = await localforage.getItem('microlife_dashboard_config_menu')
    if (value && typeof value === 'object') {
      await this.configUpdateMenu(value, false)
    } else {
      await this.configUpdateMenu(
        {
          example: {
            metp_editor: '/example/metp_editor',
          },
        },
        false
      )
    }

    value = await localforage.getItem('microlife_dashboard_config_url')
    if (value && typeof value === 'object') {
      await this.configUpdateUrl(value, false)
    } else {
      await this.configUpdateUrl(
        {
          '/example/metp_editor': {
            component: 'metp_editor',
            data: {
              host: 'http://example:6813',
              default: {
                '_.u': '/example',
                something: 'something value',
              },
            },
          },
        },
        false
      )
    }

    this.flush()
  }

  flush() {
    throw new Error('not implemented')
  }
}

export const GlobalContext = React.createContext()

function Root() {
  const [globalState, setGlobalState] = React.useState({
    global: new GlobalContextType(),
    _for_flush: 0,
  })

  React.useEffect(() => {
    globalState.global.flush = () =>
      setGlobalState((prevState) => ({
        ...prevState,
        _for_flush: prevState._for_flush + 1,
      }))
    globalState.global.configLoad()
  }, [])

  return (
    <GlobalContext.Provider value={{ globalState: globalState.global }}>
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
