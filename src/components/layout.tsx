import { Image } from '@/components/Image';
import { typeInstantiation } from '@/types/utils';
import { QuestionCircleOutlined, UserOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import * as UmiMax from '@umijs/max';
import { Dropdown } from 'antd';
import { createStyles } from 'antd-style';
import type { DropDownProps } from 'antd/es/dropdown';
import classNames from 'classnames';
import React from 'react';

const useStyles = createStyles(({ token }) => {
  return {
    dropdown: {
      [`@media screen and (max-width: ${token.screenXS}px)`]: {
        width: '100%',
      },
    },
  };
});

function GuestIcon() {
  return <UserOutlined style={{ height: '1.5em', width: '1.5em', margin: '0 0.5em 0 0' }} />;
}

export type HeaderDropdownProps = {
  overlayClassName?: string;
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topCenter' | 'topRight' | 'bottomCenter';
} & Omit<DropDownProps, 'overlay'>;

export const HeaderDropdown: React.FC<HeaderDropdownProps> = ({
  overlayClassName: cls,
  ...restProps
}) => {
  const { styles } = useStyles();
  return <Dropdown overlayClassName={classNames(styles.dropdown, cls)} {...restProps} />;
};

export type GlobalHeaderRightProps = {
  children?: React.ReactNode;
};

export const AvatarName = () => {
  const { initialState } = UmiMax.useModel('@@initialState');
  return (
    <span className="anticon">
      {initialState?.currentUser.uuid === '' ? (
        <GuestIcon />
      ) : (
        <Image
          img={initialState?.currentUser.meta.avatar || { type: 'none', data: '' }}
          style={{ height: '1.5em', width: '1.5em', margin: '0 0.5em 0 0' }}
        />
      )}

      {initialState?.currentUser.meta.nickname.length === 0
        ? initialState?.currentUser.username
        : initialState?.currentUser.meta.nickname}
    </span>
  );
};

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ children }) => {
  const { initialState } = UmiMax.useModel('@@initialState');

  return (
    <HeaderDropdown
      menu={{
        onClick: (item) => {
          initialState?.action.setCurrentUser(item.key === '' ? undefined : item.key);
        },
        items: (() => {
          const items = initialState?.users
            .filter((user) => initialState?.currentUser.uuid !== user.uuid)
            .map((user) => {
              return {
                key: user.uuid,
                icon: (
                  <Image
                    img={user.meta.avatar}
                    style={{ height: '1.5em', width: '1.5em', margin: '0 0.5em' }}
                  />
                ),
                label: user.meta.nickname.length === 0 ? user.username : user.meta.nickname,
                user,
              };
            });
          if (initialState?.currentUser.uuid === '') {
            return items;
          }
          return items?.concat({
            key: '',
            icon: <GuestIcon />,
            label: 'guest',
            user: typeInstantiation.user,
          });
        })(),
      }}
    >
      {children}
    </HeaderDropdown>
  );
};

export const Footer: React.FC = () => {
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      //   links={[
      //     {
      //       key: 'Ant Design Pro',
      //       title: 'Ant Design Pro',
      //       href: 'https://pro.ant.design',
      //       blankTarget: true,
      //     },
      //     {
      //       key: 'github',
      //       title: <GithubOutlined />,
      //       href: 'https://github.com/ant-design/ant-design-pro',
      //       blankTarget: true,
      //     },
      //     {
      //       key: 'Ant Design',
      //       title: 'Ant Design',
      //       href: 'https://ant.design',
      //       blankTarget: true,
      //     },
      //   ]}
    />
  );
};

export type SiderTheme = 'light' | 'dark';

export const Question = () => {
  return (
    <div
      style={{
        display: 'flex',
        height: 26,
      }}
      onClick={() => {
        window.open('https://pro.ant.design/docs/getting-started');
      }}
    >
      <QuestionCircleOutlined />
    </div>
  );
};

export const SelectLang = () => {
  return (
    <UmiMax.SelectLang
      style={{
        padding: 4,
      }}
    />
  );
};
