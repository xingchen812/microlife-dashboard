import React from 'react'
import { PageContainer, ProLayout } from '@ant-design/pro-components'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { ProConfigProvider } from '@ant-design/pro-provider'

import { GlobalContext } from './main'
import MetpEditor from './MetpEditor'
import Config from './Config'
import Request from './Request'

function initConfig(config) {
  function checkItem(item, isSystem) {
    if (!Array.isArray(item.menu) || item.menu.length === 0) {
      item.menu = undefined
    }
    if (typeof item.path !== 'string') {
      if (item.menu !== undefined) {
        item.path = item.menu.join('/')
      } else {
        item.path = undefined
      }
    }

    if (!isSystem) {
      if (
        item.menu[0] === 'dashboard' ||
        (item.path !== undefined && item.path.trim().startsWith('/dashboard/'))
      ) {
        return undefined
      }
    }

    return item
  }

  const res = []
  config.user.forEach((item) => {
    item = checkItem(item, false)
    if (item !== undefined) {
      res.push(item)
    }
  })
  config.system.forEach((item) => {
    item = checkItem(item, true)
    if (item !== undefined) {
      res.push(item)
    }
  })
  return res
}

function generateMenuItemsFromConfig(config) {
  const res = {
    path: '/',
    routes: [],
  }

  function addToMenu(res, menu, path) {
    for (const item of res.routes) {
      if (item.name === menu[0]) {
        if (menu.length === 1) {
          item.path = path
        } else {
          addToMenu(item, menu.slice(1), path)
        }
        return
      }
    }
    const item = {
      name: menu[0],
      path: menu.length === 1 ? path : '/',
      routes: [],
    }
    res.routes.push(item)
    if (menu.length > 1) {
      addToMenu(item, menu.slice(1), path)
    }
  }

  config.forEach((item) => {
    if (item.menu === undefined) {
      return
    }
    addToMenu(res, item.menu, encodeURI(item.path))
  })
  return res
}

function DynamicComponent(data) {
  if (data.component === undefined) {
    return undefined
  }

  switch (data.component) {
    case 'metp_editor':
      return <MetpEditor defaultHost={data.host} defaultValue={data.fields} />

    case 'config':
      return <Config />

    case 'request':
      return <Request data={data} />

    default:
      return <div>Unknown component name: {data.component}</div>
  }
}

export default function App() {
  const { global } = React.useContext(GlobalContext)
  const location = useLocation()
  const [config, setConfig] = React.useState([])

  React.useEffect(() => {
    setConfig(initConfig(global.config))
  }, [global])

  return (
    <ProConfigProvider>
      <ProLayout
        title="Microlife"
        logo="./favicon.ico"
        route={generateMenuItemsFromConfig(config)}
        location={{ pathname: location.pathname }}
        menuItemRender={(item, dom) => <Link to={item.path}>{dom}</Link>}
      >
        <PageContainer>
          <Routes>
            {config.map((item) => {
              const element = DynamicComponent(item)
              if (element === undefined) {
                return undefined
              }
              return (
                <Route key={item.path} path={item.path} element={element} />
              )
            })}
          </Routes>
        </PageContainer>
      </ProLayout>
    </ProConfigProvider>
  )
}
