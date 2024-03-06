import * as Api from '@/types/api'
import { ProCard } from '@ant-design/pro-components'
import * as UmiMax from '@umijs/max'
import { Button, Flex, Form, Input, Modal, Space, Table, message } from 'antd'
import React from 'react'

interface User {
  mgid: string
}

async function addUser(user: Api.User) {
  const mgid = await Api.core_mgid_next(user)
  await Api.core_user_set(user, mgid, '2024-cus-microli-usrroot', undefined, undefined, undefined)
}

export default function App() {
  const intl = UmiMax.useIntl()
  const { initialState } = UmiMax.useModel('@@initialState')
  const [tableData, setTableData] = React.useState<User[]>([])
  const [addModalVisible, setAddModalVisible] = React.useState(false)
  const [addModalData, setAddModalData] = React.useState<any>(undefined)

  const operateFlush = (user: Api.User, hint: boolean) => {
    Api.core_user_childs(user, '2024-cus-microli-usrroot', 0, 1000).then((res) => {
      setTableData(res.value.map((item) => ({
        key: item,
        mgid: item,
      })))
      if (hint) void message.success(intl.formatMessage({ id: 'global.message.status.loadSuccess' }))
    }).catch((e) => {
      console.error(e)
      if (hint) void message.error(intl.formatMessage({ id: 'global.message.status.loadFail' }))
    })
  }

  const operateAddSubuser = (user: Api.User) => {
    addUser(user).then(() => {
      operateFlush(user, false)
      void message.success(intl.formatMessage({ id: 'global.message.status.operateSuccess' }))
    }).catch((e) => {
      console.error(e)
      void message.error(intl.formatMessage({ id: 'global.message.status.operateFail' }))
    })
  }

  const operateRemoveSubuser = (user: Api.User, mgid: string) => {
    Api.core_user_remove(user, mgid).then(() => {
      operateFlush(user, false)
      void message.success(intl.formatMessage({ id: 'global.message.status.operateSuccess' }))
    }).catch((e) => {
      console.error(e)
      void message.error(intl.formatMessage({ id: 'global.message.status.operateFail' }))
    })
  }

  React.useEffect(() => {
    initialState && operateFlush(initialState.currentUser, true)
  }, [initialState])

  return (
    <ProCard title={intl.formatMessage({ id: 'admin.subuser.title' })}>
      <Modal
        title={intl.formatMessage({ id: 'global.message.operate.add' })}
        open={addModalVisible}
        onOk={() => {
          setAddModalVisible(false)
          if (!addModalData.mgid) {
            void message.error(intl.formatMessage({ id: 'global.message.operate.inputError' }))
            return
          }
          initialState && operateAddSubuser(initialState.currentUser)
        }}
        onCancel={() => { setAddModalVisible(false) }}
      >
        <Form autoComplete="off">
          <Form.Item
            label={intl.formatMessage({ id: 'admin.subuser.mgid' })}
            name="mgid"
            rules={[{ required: true }]}
          >
            <Input onChange={(text) => { setAddModalData({ ...addModalData, mgid: text.target.value }) }}></Input>
          </Form.Item>
        </Form>
      </Modal>

      <Flex wrap="wrap" gap="small" style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => { setAddModalVisible(true) }}>
          {intl.formatMessage({ id: 'global.message.operate.add' })}
        </Button>
        <Button type="primary" onClick={() => { initialState && operateRemoveSubuser(initialState.currentUser, '123') }}>
          {intl.formatMessage({ id: 'global.message.operate.remove' })}
        </Button>
        <Button type="primary">
          {intl.formatMessage({ id: 'global.message.operate.modify' })}
        </Button>
        <Button type="primary" onClick={() => { initialState && operateFlush(initialState.currentUser, true) }}>
          {intl.formatMessage({ id: 'global.message.operate.flush' })}
        </Button>
      </Flex>

      <Table
        columns={[
          {
            title: intl.formatMessage({ id: 'admin.subuser.mgid' }),
            dataIndex: 'mgid',
            key: 'mgid',
          },
          {
            title: intl.formatMessage({ id: 'global.components.action' }),
            key: 'action',
            render: (_, item) => (
              <Space size="small">
                <Button
                  type="default"
                  size="small"
                  onClick={() => {
                    initialState && operateRemoveSubuser(initialState.currentUser, item.mgid)
                  }}
                >
                  {intl.formatMessage({ id: 'global.components.action.delete' })}
                </Button>
              </Space>
            ),
          },
        ]}
        dataSource={tableData}
      // expandable={{
      //   expandedRowRender: (item) => (
      //     <UserEditor
      //       key={item.uuid}
      //       style={{ width: '100%' }}
      //       defaultValue={item}
      //       onFinish={async (value) => {
      //         value.uuid = item.uuid;
      //         await initialState?.action.setUser(item.uuid, value);
      //       }}
      //     />
      //   ),
      // }}
      />
    </ProCard>
  )
}
