import { deleteUser, listUser, setCurrentUser, setUser } from '@/services/local';
import { User } from '@/services/typings';
import { ProCard } from '@ant-design/pro-components';
import { useIntl, useModel } from '@umijs/max';
import { Button, Space, Table, message } from 'antd';
import React from 'react';
import { UserEditor } from '../add';

export default function App() {
  const intl = useIntl();
  const { initialState, setInitialState } = useModel('@@initialState');
  const [data, setData] = React.useState<User[]>([]);
  const [flush, setFlush] = React.useState(true);

  React.useEffect(() => {
    listUser().then((data) => {
      setData(
        data.map((item) => {
          return { ...item, key: item.uuid } as User;
        }),
      );
    });
  }, [flush]);

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
          // {
          //   title: 'server version',
          //   key: 'action',
          //   render: (_, render) => <a>{render.serverVersion}</a>,
          // },
          {
            title: intl.formatMessage({ id: 'global.components.action' }),
            key: 'action',
            render: (_, item) => (
              <Space size="small">
                <Button
                  type="default"
                  size="small"
                  onClick={() => {
                    deleteUser(item.uuid)
                      .then(() => {
                        message.success('delete success');
                        setFlush(!flush);
                      })
                      .catch((e) => {
                        message.error('delete failed');
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
                  onClick={() => {
                    setCurrentUser(item.uuid);
                    setInitialState({
                      ...initialState,
                      currentUser: item,
                    });
                  }}
                  disabled={initialState?.currentUser.uuid === item.uuid}
                >
                  {intl.formatMessage({ id: 'global.components.action.switch' })}
                </Button>
              </Space>
            ),
          },
        ]}
        dataSource={data}
        expandable={{
          expandedRowRender: (item) => (
            <UserEditor
              key={item.uuid}
              style={{ width: '100%' }}
              defaultValue={item}
              onFinish={async (value) => {
                value.uuid = item.uuid;
                await setUser(item.uuid, value);
              }}
            />
          ),
        }}
      />
    </ProCard>
  );
}
