import * as Api from '@/types/api';
import { ProCard } from '@ant-design/pro-components';
import * as UmiMax from '@umijs/max';
import { Button, Card, Flex, Form, Input, Modal, Space, Table, message } from 'antd';
import React from 'react';

interface User {
  prefix: string;
}

export default function App() {
  const intl = UmiMax.useIntl();
  const { initialState } = UmiMax.useModel('@@initialState');
  const [tableData, setTableData] = React.useState<User[]>([]);
  const [addModalVisible, setAddModalVisible] = React.useState(false);
  const [addModalData, setAddModalData] = React.useState<any>(undefined);

  const operateFlush = (user: Api.User, hint: boolean) => {
    Api.core_user_list(user).then((res) => {
      setTableData(res.map((item) => ({
        key: item.prefix,
        ...item,
      })));
      hint && message.success(intl.formatMessage({ id: 'global.message.status.loadSuccess' }));
    }).catch((e) => {
      console.error(e);
      hint && message.error(intl.formatMessage({ id: 'global.message.status.loadFail' }));
    })
  }

  const operateAddSubuser = (user: Api.User, prefix: string) => {
    Api.core_user_add(user, prefix).then(() => {
      operateFlush(user, false)
      message.success(intl.formatMessage({ id: 'global.message.status.operateSuccess' }));
    }).catch((e) => {
      console.error(e);
      message.error(intl.formatMessage({ id: 'global.message.status.operateFail' }));
    })
  }

  const operateRemoveSubuser = (user: Api.User, prefix: string) => {
    Api.core_user_remove(user, prefix).then(() => {
      operateFlush(user, false)
      message.success(intl.formatMessage({ id: 'global.message.status.operateSuccess' }));
    }).catch((e) => {
      console.error(e);
      message.error(intl.formatMessage({ id: 'global.message.status.operateFail' }));
    })
  }

  React.useEffect(() => {
    initialState && operateFlush(initialState.currentUser, true)
  }, [initialState?.currentUser]);

  return (
    <ProCard title={intl.formatMessage({ id: 'admin.subuser.title' })}>
      <Modal
        title={intl.formatMessage({ id: 'global.message.operate.add' })}
        open={addModalVisible}
        onOk={() => {
          setAddModalVisible(false);
          if (!addModalData.prefix) {
            message.error(intl.formatMessage({ id: 'global.message.operate.inputError' }));
            return;
          }
          initialState && operateAddSubuser(initialState.currentUser, addModalData.prefix)
        }}
        onCancel={() => setAddModalVisible(false)}
      >
        <Form autoComplete="off"  >
          <Form.Item
            label={intl.formatMessage({ id: 'admin.subuser.prefix' })}
            name="prefix"
            rules={[{ required: true }]}
          >
            <Input onChange={(text) => setAddModalData({ ...addModalData, prefix: text.target.value })}></Input>
          </Form.Item>
        </Form>
      </Modal>

      <Flex wrap="wrap" gap="small" style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setAddModalVisible(true)}>
          {intl.formatMessage({ id: 'global.message.operate.add' })}
        </Button>
        <Button type="primary" onClick={() => initialState && operateRemoveSubuser(initialState.currentUser, '123')}>
          {intl.formatMessage({ id: 'global.message.operate.remove' })}
        </Button>
        <Button type="primary">
          {intl.formatMessage({ id: 'global.message.operate.modify' })}
        </Button>
        <Button type="primary" onClick={() => initialState && operateFlush(initialState.currentUser, true)}>
          {intl.formatMessage({ id: 'global.message.operate.flush' })}
        </Button>
      </Flex>

      <Table
        columns={[
          {
            title: intl.formatMessage({ id: 'admin.subuser.prefix' }),
            dataIndex: 'prefix',
            key: 'prefix',
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
                    initialState && operateRemoveSubuser(initialState.currentUser, item.prefix)
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
  );
}
