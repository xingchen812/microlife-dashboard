import React from 'react'
import PropTypes from 'prop-types'
import { Avatar, List, Dropdown, Popover, Typography } from 'antd'

const items_menu = [
	{ key: '1', label: '右键选项 1' },
	{ key: '2', label: '右键选项 2' },
]

function ListItem({ item }) {
	// return (
	// 	<Dropdown
	// 		menu={{
	// 			items: items_menu,
	// 		}}
	// 		trigger={['contextMenu']}
	// 	>
	// 		<List.Item
	// 			actions={[
	// 				<a key="list-loadmore-edit">edit</a>,
	// 				<a key="list-loadmore-more">more</a>,
	// 			]}
	// 		>
	// 			<List.Item.Meta
	// 				// avatar={<Avatar src={item.picture.large} />}
	// 				title={item.name}
	// 				description={item.description}
	// 			/>
	// 		</List.Item>
	// 	</Dropdown>
	// )
	const [clicked, setClicked] = React.useState(false)
	const [hovered, setHovered] = React.useState(false)

	return (
		<Popover
			content={
				<>
					<Typography.Text type="secondary">我的世界启动器</Typography.Text>
				</>
			}
			title="PCL2"
			placement="topLeft"
			open={hovered}
			onOpenChange={setHovered}
			arrow
		>
			<Dropdown
				menu={{
					items: items_menu,
				}}
				trigger={['contextMenu']}
				open={clicked}
				onOpenChange={setClicked}
				arrow
			>
				<List.Item
					actions={[
						<a key="list-loadmore-edit">edit</a>,
						<a key="list-loadmore-more">more</a>,
					]}
					onContextMenu={() => {
						setHovered(false)
					}}
				>
					<List.Item.Meta
						// avatar={<Avatar src={item.picture.large} />}
						title={item.name}
						description={item.description}
					/>
				</List.Item>
			</Dropdown>
		</Popover>
	)
}

ListItem.propTypes = {
	item: PropTypes.any,
}

export default function App({ data }) {
	const [loading, setLoading] = React.useState(false)
	const [list, setList] = React.useState([])

	React.useEffect(() => {
		setLoading(true)
		setList([
			{
				name: 'hello',
				description: 'description',
			},
			{
				name: 'hi',
				description: 'good',
			},
		])
		setLoading(false)
	}, [data])

	return (
		<List
			className="demo-loadmore-list"
			loading={loading}
			dataSource={list}
			renderItem={(item) => <ListItem item={item} />}
		/>
	)
}

App.propTypes = {
	data: PropTypes.any,
}
