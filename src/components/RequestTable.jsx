import React from 'react'
import PropTypes from 'prop-types'
import { Card, Table } from 'antd'

import RequestForm from './RequestForm'

export default function App({ data }) {
	const [columns, setColumns] = React.useState([])
	const [tableData, setTableData] = React.useState([])

	React.useEffect(() => {
		const columns = data.table.map((item) => {
			return {
				title: item.label,
				dataIndex: item.key,
				key: item.key,
			}
		})
		setColumns(columns)
	}, [data])

	return (
		<Card>
			<RequestForm
				data={data.request}
				onFinish={(values) => {
					console.log(values)
					setTableData(
						values.get('_.d').map((item, index) => {
							return { ...item, key: item.key ? item.key : index }
						})
					)
				}}
			/>
			<Table columns={columns} dataSource={tableData} />
		</Card>
	)
}

App.propTypes = {
	data: PropTypes.any,
}
