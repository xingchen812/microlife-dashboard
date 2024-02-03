import { User } from '@/types/utils';
import { ProCard } from '@ant-design/pro-components';
import * as UmiMax from '@umijs/max';
import { Button, Space, Table, message } from 'antd';
import { UserEditor } from '../add';

export default function App() {
  const intl = UmiMax.useIntl();
  const { initialState } = UmiMax.useModel('@@initialState');

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
        dataSource={(() => {
          return initialState?.users.map((item) => {
            return { ...item, key: item.uuid } as User;
          });
        })()}
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
