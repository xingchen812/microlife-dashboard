import { User } from '@/types/local';
import * as Api from '@/types/api';
import { ProCard } from '@ant-design/pro-components';
import * as UmiMax from '@umijs/max';
import { Badge, Button, Space, Table, message } from 'antd';
import { UserEditor } from '../add';
import React from 'react';

export default function App() {
  const intl = UmiMax.useIntl();
  const { initialState } = UmiMax.useModel('@@initialState');
  const [tableData, setTableData] = React.useState<User[]>([]);

  React.useEffect(() => {
    initialState?.users.map((item, index) => {
      const user = {
        ...item,
        key: item.uuid,
        _status_version: {
          status: 'processing',
          text: intl.formatMessage({ id: 'global.components.status.loading' }),
        },
      } as User;
      Api.core_version(item).then((res) => {
        if (res.name === "microlife") {
          (user as any)._status_version = {
            status: 'success',
            text: res.version,
          }
          setTableData([...tableData, user]);
        }
        else {
          (user as any)._status_version = {
            status: 'error',
            text: intl.formatMessage({ id: 'account.add.UserEditor.status.unknown' }),
          }
          setTableData([...tableData, user]);
        }
      }).catch((e) => {
        (user as any)._status_version = {
          status: 'error',
          text: intl.formatMessage({ id: 'account.add.UserEditor.status.stopped' }),
        }
        setTableData([...tableData, user]);
      })
    });
  }, [initialState?.users]);

  return (
    <ProCard title={intl.formatMessage({ id: 'account.list.title' })}>
      <Table
        columns={[
          {
            title: intl.formatMessage({ id: 'account.add.UserEditor.nickname' }),
            dataIndex: ['meta', 'nickname'],
            key: 'nickname',
          },
          {
            title: intl.formatMessage({ id: 'account.add.UserEditor.hostAddress' }),
            dataIndex: 'host',
            key: 'server',
          },
          {
            title: intl.formatMessage({ id: 'account.add.UserEditor.username' }),
            dataIndex: 'username',
            key: 'username',
          },
          {
            title: intl.formatMessage({ id: 'account.add.UserEditor.status' }),
            key: 'status',
            render: (_, item) => <Badge status={(item as any)._status_version.status} text={(item as any)._status_version.text} />,
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
                    initialState?.action
                      .deleteUser(item.uuid)
                      .then(() => {
                        message.success(
                          intl.formatMessage({ id: 'global.message.delete.success' }),
                        );
                      })
                      .catch((e) => {
                        message.error(intl.formatMessage({ id: 'global.message.operate.fail' }));
                        console.error(e);
                      });
                  }}
                  disabled={initialState?.currentUser.uuid === item.uuid}
                >
                  {intl.formatMessage({ id: 'global.components.action.delete' })}
                </Button>
                <Button
                  type="default"
                  size="small"
                  onClick={() => initialState?.action.setCurrentUser(item.uuid)}
                  disabled={initialState?.currentUser.uuid === item.uuid}
                >
                  {intl.formatMessage({ id: 'global.components.action.switch' })}
                </Button>
              </Space>
            ),
          },
        ]}
        dataSource={tableData}
        expandable={{
          expandedRowRender: (item) => (
            <UserEditor
              key={item.uuid}
              style={{ width: '100%' }}
              defaultValue={item}
              onFinish={async (value) => {
                value.uuid = item.uuid;
                await initialState?.action.setUser(item.uuid, value);
              }}
            />
          ),
        }}
      />
    </ProCard>
  );
}
