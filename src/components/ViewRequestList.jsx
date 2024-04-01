import React from 'react'
import PropTypes from 'prop-types'
import { Card, Collapse, theme } from 'antd'
import { CaretRightOutlined } from '@ant-design/icons'

import ConfigComponent from './ConfigComponent'

export default function App({ data }) {
	function getItems(items) {
		const res = []
		for (let i = 0; i < items.length; i++) {
			const item = items[i]
			res.push({
				key: i.toString(),
				label: item.name,
				children: (
					<>
						<div style={{ marginLeft: 6, marginBottom: 10 }}>
							{item.description}
						</div>
						<ConfigComponent data={item} />
					</>
				),
				style: {
					marginBottom: 24,
					background: token.colorFillAlter,
					borderRadius: token.borderRadiusLG,
					border: 'none',
				},
			})
		}
		return res
	}

	const { token } = theme.useToken()

	return (
		<Card>
			<Collapse
				bordered={false}
				defaultActiveKey={[]}
				expandIcon={({ isActive }) => (
					<CaretRightOutlined rotate={isActive ? 90 : 0} />
				)}
				style={{ background: token.colorBgContainer }}
				items={getItems(data.list)}
			/>
		</Card>
	)
}

App.propTypes = {
	data: PropTypes.any,
}
