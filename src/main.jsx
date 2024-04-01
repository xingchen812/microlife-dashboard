import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, useLocation, Routes, Route, Link } from 'react-router-dom'
import localforage from 'localforage'
import json5 from 'json5'
import {
	ProConfigProvider,
	ProLayout,
	PageContainer,
} from '@ant-design/pro-components'
import { message } from 'antd'

import Metp from './utils/metp.js'
import ConfigComponent from './components/ConfigComponent.jsx'

class DashboardConfig {
	static systemConfig() {
		return [
			{
				menu: ['dashboard', 'request editor'],
				component: 'request_editor',
				host: 'http://localhost:6813',
				fields: {
					'_.u': '/core/version',
				},
			},
			{
				menu: ['dashboard', 'config'],
				component: 'dashboard_config',
			},
		]
	}

	static defaultConfig() {
		return [
			{
				menu: ['example', 'request editor'],
				component: 'request_editor',
				host: 'http://example:6813',
				fields: {
					'_.u': '/example',
					something: 'something value',
				},
			},
			{
				menu: ['example', 'request form'],
				path: '/example/request form',
				component: 'request_form',
				fields: [
					{
						key: 'field_a',
						label: 'Field text',
						type: 'text',
						required: true,
					},
					{
						key: 'field_b',
						label: 'Field select',
						type: 'select',
						typeData: ['a', 'b', 'c', 'd'],
						defaultValue: 'a',
						required: true,
					},
					{
						key: 'field_c',
						label: 'Field checkbox',
						type: 'checkbox',
						defaultValue: 'true',
						shown: true,
					},
					{
						key: 'field_d',
						label: 'Field textarea',
						type: 'textarea',
					},
					{
						key: 'field_e',
						label: 'Field editor',
						type: 'editor',
						defaultValue: 'default editor value',
					},
					{
						key: 'field_f',
						label: 'Field number',
						type: 'number',
					},
					{
						key: 'field_g',
						label: 'Field host',
						type: 'host',
						defaultValue: 'http://localhost:6813',
					},
					{
						key: 'field_unshown',
						label: 'Field unshown',
						type: 'text',
						defaultValue: 'text unshown',
						shown: false,
					},
				],
			},
			{
				menu: ['example', 'request table'],
				component: 'request_table',
				request: {
					component: 'request_form',
					fields: [
						{
							key: 'host',
							label: 'host',
							type: 'host',
							defaultValue: 'http://localhost:6813',
							required: true,
							shown: false,
						},
						{
							key: '_.u',
							label: 'uri',
							type: 'text',
							defaultValue: '/example',
							required: true,
						},
						{
							key: 'data',
							label: 'data',
							type: 'text',
							required: false,
						},
					],
				},
				table: [
					{
						key: 'field_a',
						label: 'Field a',
					},
					{
						key: 'field_b',
						label: 'Field b',
					},
				],
			},
			{
				menu: ['example', 'view request list'],
				component: 'view_request_list',
				list: [
					{
						name: 'request list a',
						description: 'request list example.',
						component: 'request_form',
						fields: [
							{
								key: 'field_a',
								label: 'Field text',
								type: 'text',
								required: true,
							},
							{
								key: 'field_b',
								label: 'Field select',
								type: 'select',
								typeData: ['a', 'b', 'c', 'd'],
								defaultValue: 'a',
								required: true,
							},
						],
					},
					{
						name: 'request list b',
						description: 'request list example.',
						component: 'request_form',
						fields: [
							{
								key: 'field_a',
								label: 'Field text',
								type: 'text',
								required: false,
							},
							{
								key: 'field_b',
								label: 'Field select',
								type: 'select',
								typeData: ['1', '2', '3', '4'],
								defaultValue: '3',
								required: true,
							},
						],
					},
				],
			},
		]
	}

	constructor() {
		this.user = []
		this.userStr = ''
		this.system = DashboardConfig.systemConfig()
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

			case 'microlife': {
				const res = await Metp.metp_request(
					this.storage.data,
					new Map([
						['_.u', '/config/dashboard/microlife_dashboard_config_user'],
						['_.d', this.userStr],
					])
				)
				value = res['_.d']
				break
			}

			default:
				throw new Error('unknown storage location type: ' + storage.type)
		}

		if (value === undefined || value === null || typeof value !== 'string') {
			value = JSON.stringify(DashboardConfig.defaultConfig(), null, 2)
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

	toConfig() {
		let id = 1234
		function checkItem(item) {
			if (typeof item.component !== 'string') {
				return undefined
			}

			let path = item.path
			if (typeof path !== 'string') {
				if (Array.isArray(item.menu)) {
					path = item.menu.join('/')
				} else {
					path = '/_/microlife/dashboard/' + id.toString()
					id++
				}
			}

			return { ...item, path: path }
		}

		return [
			...this.user.map((item) => checkItem(item, false)),
			...this.system.map((item) => checkItem(item, true)),
		]
	}

	// menu -> path, data
	toMenu() {
		function checkItem(item, isSystem) {
			let path = item.path
			if (!Array.isArray(item.menu) || item.menu.length === 0) {
				return undefined
			}
			if (typeof path !== 'string') {
				path = item.menu.join('/')
			}

			if (!isSystem) {
				if (
					item.menu[0] === 'dashboard' ||
					(path !== undefined && path.trim().startsWith('/dashboard/'))
				) {
					return undefined
				}
			}

			return { menu: item.menu, path }
		}

		return [
			...this.user.map((item) => checkItem(item, false)),
			...this.system.map((item) => checkItem(item, true)),
		]
	}
}

export const GlobalContext = React.createContext()
let GlobalUniqueId = 0

function App() {
	const { global } = React.useContext(GlobalContext)
	const location = useLocation()

	return (
		<ProConfigProvider>
			<ProLayout
				title="Microlife"
				logo="./favicon.ico"
				route={((config) => {
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

					const res = { path: '/', routes: [] }
					config.forEach((item) =>
						addToMenu(res, item.menu, encodeURI(item.path))
					)
					return res
				})(global.config.toMenu())}
				location={{ pathname: location.pathname }}
				menuItemRender={(item, dom) => <Link to={item.path}>{dom}</Link>}
			>
				<PageContainer>
					<Routes>
						{global.config.toConfig().map((item) => (
							<Route
								key={item.path}
								path={item.path}
								element={<ConfigComponent data={item} />}
							/>
						))}
					</Routes>
				</PageContainer>
			</ProLayout>
		</ProConfigProvider>
	)
}

function generateRandomString(length) {
	const characters =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	let result = ''
	const charactersLength = characters.length
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength))
	}
	return result
}

function Root() {
	const [messageApi, contextHolder] = message.useMessage()
	const [global, setGlobal] = React.useState({
		config: new DashboardConfig(),
		messageApi,
		getUniqueId: () => {
			GlobalUniqueId++
			return generateRandomString(8) + '-' + GlobalUniqueId.toString()
		},
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
			{contextHolder}
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
