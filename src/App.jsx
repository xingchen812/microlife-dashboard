import { PageContainer, ProLayout } from '@ant-design/pro-components'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { ProConfigProvider } from '@ant-design/pro-provider'
import PropTypes from 'prop-types'

import MetpEditor from './MetpEditor'

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
  }
  throw new Error(`Unknown component name: ${componentName}`)
}

DynamicComponent.propTypes = {
  componentName: PropTypes.string.isRequired,
  data: PropTypes.any.isRequired,
}

function generateRouteItemsFromConfig(config) {
  return (
    <Routes>
      {Object.entries(config).map(([path, { component, data }]) => {
        return (
          <Route
            key={path}
            path={path}
            element={<DynamicComponent componentName={component} data={data} />}
          />
        )
      })}
    </Routes>
  )
}

export default function App({ menu_config, uri_config }) {
  const location = useLocation()

  return (
    <ProConfigProvider>
      <ProLayout
        title="Microlife"
        logo="/favicon.ico"
        route={{
          routes: generateMenuItemsFromConfig(menu_config),
        }}
        location={{
          pathname: location.pathname,
        }}
        menuItemRender={(item, dom) => <Link to={item.path}>{dom}</Link>}
      >
        <PageContainer>
          {generateRouteItemsFromConfig(uri_config)}
        </PageContainer>
      </ProLayout>
    </ProConfigProvider>
  )
}

App.propTypes = {
  menu_config: PropTypes.any.isRequired,
  uri_config: PropTypes.any.isRequired,
}
