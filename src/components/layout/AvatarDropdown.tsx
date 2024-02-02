import { Image } from '@/components/Image';
import { listUser, setCurrentUser } from '@/services/local';
import { User } from '@/services/typings';
import { useModel } from '@umijs/max';
import React from 'react';
import HeaderDropdown from './HeaderDropdown';

export type GlobalHeaderRightProps = {
  children?: React.ReactNode;
};

export const AvatarName = () => {
  const { initialState } = useModel('@@initialState');
  return (
    <span className="anticon">
      <Image
        img={initialState?.currentUser.meta.avatar}
        style={{ height: '1.5em', width: '1.5em', margin: '0 0.5em 0 0' }}
      />
      {initialState?.currentUser.meta.nickname.length === 0
        ? initialState?.currentUser.username
        : initialState?.currentUser.meta.nickname}
    </span>
  );
};

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ children }) => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const [menuItems, setMenuItems] = React.useState<
    {
      key: string;
      icon: React.ReactNode;
      label: string;
      user: User;
    }[]
  >([]);

  React.useEffect(() => {
    listUser().then((users) => {
      setMenuItems(
        users
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
          }),
      );
    });
  }, [initialState]);

  return (
    <HeaderDropdown
      menu={{
        onClick: (item) => {
          setCurrentUser(item.key);
          setInitialState({
            ...initialState,
            currentUser: menuItems.filter((i) => i.key === item.key)[0].user,
          });
        },
        items: menuItems,
      }}
    >
      {children}
    </HeaderDropdown>
  );
};
