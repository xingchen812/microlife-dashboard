import React from 'react'
import PropTypes from 'prop-types'
import {
	Button,
	Card,
	Input,
	Row,
	Col,
	Flex,
	Segmented,
	Dropdown,
	Popover,
	Typography,
} from 'antd'
import * as Icons from '@ant-design/icons'

const items_menu = [
	{ key: '1', label: '右键选项 1' },
	{ key: '2', label: '右键选项 2' },
]

function Item({ data }) {
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
			placement="rightTop"
			arrow
			open={hovered}
			onOpenChange={setHovered}
		>
			<Dropdown
				menu={{
					items: items_menu,
				}}
				trigger={['contextMenu']}
				open={clicked}
				onOpenChange={setClicked}
			>
				<Button
					type="primary"
					size={'large'}
					icon={<Icons.DownloadOutlined />}
					onClick={(event) => {
						if (event.ctrlKey) {
							console.log('Ctrl+左击')
						} else if (event.shiftKey) {
							console.log('Shift+左击')
						} else {
							console.log('普通左击')
						}
					}}
					onContextMenu={() => {
						setHovered(false)
					}}
				></Button>
			</Dropdown>
		</Popover>
	)
}

export default function App({ data }) {
	return (
		<Row style={{ backgroundColor: 'white', padding: 8 }}>
			<Col span={1}>
				<Flex align="flex-start" gap="small" vertical>
					<Button
						type="primary"
						shape="circle"
						icon={<Icons.DownloadOutlined />}
					/>
					<Button
						type="primary"
						shape="circle"
						icon={<Icons.DownloadOutlined />}
					/>
					<Button
						type="primary"
						shape="circle"
						icon={<Icons.DownloadOutlined />}
					/>
					<Button
						type="primary"
						shape="circle"
						icon={<Icons.DownloadOutlined />}
					/>
				</Flex>
			</Col>
			<Col span={22}>
				<Row>
					<Segmented options={['A', 'B', 'C']} style={{ marginBottom: 8 }} />
				</Row>
				<Row>
					<Input addonBefore={<>MS池</>} style={{ marginBottom: 8 }} />
				</Row>
				<Row>
					<Card
						style={{
							height: '30vh',
							width: '100%',
							marginBottom: 8,
							backgroundColor: '#f5f5f5',
						}}
						onContextMenu={(event) => {
							event.preventDefault()
						}}
					>
						<Flex wrap="wrap" gap="small">
							{Array.from({ length: 24 }, (_, i) => (
								<Item key={i} />
							))}
						</Flex>
					</Card>
				</Row>
				<Row>
					<Segmented options={['A', 'B', 'C']} style={{ marginBottom: 8 }} />
				</Row>
				<Row>
					<Input addonBefore={<>缓冲区</>} style={{ marginBottom: 8 }} />
				</Row>
				<Row>
					<Card style={{ height: '30vh', width: '100%' }}></Card>
				</Row>
			</Col>
			<Col span={1}>
				<Flex align="flex-start" gap="small" vertical style={{ marginLeft: 8 }}>
					<Button
						type="primary"
						shape="circle"
						icon={<Icons.DownloadOutlined />}
					/>
					<Button
						type="primary"
						shape="circle"
						icon={<Icons.DownloadOutlined />}
					/>
					<Button
						type="primary"
						shape="circle"
						icon={<Icons.DownloadOutlined />}
					/>
					<Button
						type="primary"
						shape="circle"
						icon={<Icons.DownloadOutlined />}
					/>
				</Flex>
			</Col>
		</Row>
	)
}

App.propTypes = {
	data: PropTypes.any,
}
