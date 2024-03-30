import React from 'react'
import { PageContainer, ProLayout } from '@ant-design/pro-components'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { ProConfigProvider } from '@ant-design/pro-provider'

import MetpEditor from './MetpEditor'
import Config from './Config'
import { GlobalContext } from './main'

function generateMenuItemsFromConfig(config) {
  return Object.entries(config).map(([key, value]) => {
    if (typeof value === 'string') {
      return {
        name: key,
        path: value,
      }
    } else {
      return {
        name: key,
        path: '/',
        routes: generateMenuItemsFromConfig(value),
      }
    }
  })
}

function DynamicComponent({ componentName, data }) {
  switch (componentName) {
    case 'metp_editor':
      return <MetpEditor defaultHost={data.host} defaultValue={data.default} />

    case 'config':
      return <Config config={data.config} />

    default:
      return <div>Unknown component name: {componentName}</div>
  }
}

export default function App() {
  const { globalState } = React.useContext(GlobalContext)
  const location = useLocation()

  return (
    <ProConfigProvider>
      <ProLayout
        title="Microlife"
        logo="./favicon.ico"
        route={{
          routes: generateMenuItemsFromConfig(globalState.config.menu),
        }}
        location={{ pathname: location.pathname }}
        menuItemRender={(item, dom) => <Link to={item.path}>{dom}</Link>}
      >
        <PageContainer>
          <Routes>
            {Object.entries(globalState.config.url).map(
              ([path, { component, data }]) => {
                return (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <DynamicComponent componentName={component} data={data} />
                    }
                  />
                )
              }
            )}
          </Routes>
        </PageContainer>
      </ProLayout>
    </ProConfigProvider>
  )
}
