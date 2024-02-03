import { ImageUpload } from '@/components/Image';
import { User } from '@/services/typings';
import {
  ProCard,
  ProForm,
  ProFormDependency,
  ProFormGroup,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import * as UmiMax from '@umijs/max';
import { Flex, message } from 'antd';
import React from 'react';

export function UserEditor(props: {
  defaultValue?: User;
  onFinish: (value: User) => Promise<void>;
  style?: React.CSSProperties;
}) {
  const intl = UmiMax.useIntl();
  const formRef = React.useRef<ProFormInstance>();

  return (
    <ProCard style={props.style}>
      <ProForm<User>
        layout="vertical"
        formRef={formRef}
        onFinish={async (value) => {
          await props.onFinish(value);
          message.success(intl.formatMessage({ id: 'global.message.submit.success' }));
        }}
        initialValues={props.defaultValue}
      >
        <ProFormGroup title={intl.formatMessage({ id: 'account.add.UserEditor.meta' })}>
          <Flex vertical>
            <ProFormText
              width="md"
              name={['meta', 'nickname']}
              label={intl.formatMessage({ id: 'account.add.UserEditor.nickname' })}
            />
            <ProForm.Item
              name={['meta', 'avatar']}
              label={intl.formatMessage({ id: 'account.add.UserEditor.avatar' })}
            >
              <ImageUpload
                defaultValue={props.defaultValue?.meta.avatar}
                onChange={(value) => {
                  formRef?.current?.setFieldValue('meta.avatar', value);
                }}
              />
            </ProForm.Item>
            <ProFormText
              width="md"
              name={['meta', 'description']}
              label={intl.formatMessage({ id: 'account.add.UserEditor.description' })}
            />
          </Flex>
        </ProFormGroup>
        <ProFormGroup title={intl.formatMessage({ id: 'account.add.UserEditor.host' })}>
          <Flex vertical>
            <ProFormText
              width="md"
              name="host"
              label={intl.formatMessage({ id: 'account.add.UserEditor.hostAddress' })}
              rules={[{ required: true }]}
            />
            <ProFormText
              width="md"
              name="username"
              label={intl.formatMessage({ id: 'account.add.UserEditor.username' })}
              rules={[{ required: true }]}
            />
            <ProFormSelect
              width="md"
              name="encryptType"
              label={intl.formatMessage({ id: 'account.add.UserEditor.encryptType' })}
              rules={[{ required: true }]}
              options={[
                {
                  value: 'aes',
                  label: 'aes',
                },
                {
                  value: 'unencrypted',
                  label: intl.formatMessage({
                    id: 'account.add.UserEditor.encryptType.unencrypted',
                  }),
                },
              ]}
            />
            <ProFormDependency key="encryptType" name={['encryptType']} ignoreFormListField>
              {({ encryptType }) => {
                if (encryptType === 'unencrypted') {
                  return undefined;
                } else if (encryptType === 'aes') {
                  return (
                    <ProFormText.Password
                      width="md"
                      name="encryptKey"
                      label={intl.formatMessage({ id: 'account.add.UserEditor.encryptKey' })}
                      rules={[{ required: true }]}
                    />
                  );
                } else {
                  return undefined;
                }
              }}
            </ProFormDependency>
          </Flex>
        </ProFormGroup>
      </ProForm>
    </ProCard>
  );
}

export default function App() {
  const { initialState } = UmiMax.useModel('@@initialState');

  return (
    <UserEditor
      onFinish={async (value) => {
        await initialState?.action.addUser(value);
      }}
    />
  );
}
