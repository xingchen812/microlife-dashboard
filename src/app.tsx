import { AvatarDropdown, AvatarName, SelectLang } from "@/components";
import {
  User,
  configDelete,
  configGet,
  configSet,
  convertType,
  deserialize,
  serialize,
  typeInstantiation,
  valuesGet,
} from "@/types/local";
import {
  PageLoading,
  type Settings as LayoutSettings,
} from "@ant-design/pro-components";
import type { RunTimeLayoutConfig } from "@umijs/max";
import { v4 as uuidv4 } from "uuid";
import defaultSettings from "../config/defaultSettings";

// https://umijs.org/zh-CN/plugins/plugin-initial-state
export async function getInitialState(): Promise<{
  settings: Partial<LayoutSettings>;
  action: {
    listUser: () => Promise<User[]>;
    addUser: (user: User) => Promise<void>;
    setUser: (uuid: string, user: User) => Promise<void>;
    getUser: (uuid: string) => Promise<User>;
    deleteUser: (uuid: string) => Promise<void>;
    currentUser: () => Promise<User>;
    setCurrentUser: (uuid: string | undefined) => Promise<void>;
  };
  currentUser: User;
  users: User[];
  loading: number; // 仅用于首次初始化; 0: 未初始化, 1: 初始化中, 2: 初始化完成
}> {
  return {
    settings: defaultSettings as Partial<LayoutSettings>,
    action: {
      listUser: async () => [],
      addUser: async () => { },
      setUser: async () => { },
      getUser: async () => typeInstantiation.user,
      deleteUser: async () => { },
      currentUser: async () => typeInstantiation.user,
      setCurrentUser: async () => { },
    },
    currentUser: typeInstantiation.user,
    users: [],
    loading: 0,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const layout: RunTimeLayoutConfig = ({
  initialState,
  setInitialState,
}) => {
  (async () => {
    if (initialState === undefined) {
      return;
    }

    if (initialState.loading !== 0) {
      return;
    }

    setInitialState({
      ...initialState,
      loading: 1,
    });

    const getUser = async (uuid: string) => {
      const config = await configGet("dashboard_listUser", uuid);
      if (config.length === 0) {
        return typeInstantiation.user;
      }
      const { value } = deserialize(config, typeInstantiation.user);
      return value;
    };

    const listUser = async () => {
      const config = await valuesGet("dashboard_listUser");
      if (config.length === 0) {
        return [];
      }
      return config.map(({ key, value }) => {
        const { value: user } = deserialize(value, typeInstantiation.user);
        user.uuid = key;
        return user;
      });
    };

    const currentUser = async () => {
      const config = await configGet("dashboard", "userCurrent");
      const guestUser: User = {
        ...typeInstantiation.user,
        username: "guest",
      };
      if (config.length === 0) {
        return guestUser;
      }
      const { value } = deserialize(config, typeInstantiation.string);
      const getedUser = await getUser(value);
      return getedUser.uuid === "" ? guestUser : getedUser;
    };

    setInitialState({
      ...initialState,
      currentUser: await currentUser(),
      users: await listUser(),
      loading: 2,
      action: {
        ...initialState.action,
        async addUser(user: User) {
          user.uuid = uuidv4();
          await configSet(
            "dashboard_listUser",
            user.uuid,
            serialize(convertType(typeInstantiation.user, user))
          );
          setInitialState({
            ...initialState,
            users: [...initialState.users, user],
          });
        },
        async setUser(uuid: string, user: User) {
          user.uuid = uuid;
          await configSet(
            "dashboard_listUser",
            uuid,
            serialize(convertType(typeInstantiation.user, user))
          );
          setInitialState({
            ...initialState,
            users: initialState.users.map((u) => {
              if (u.uuid === uuid) {
                return user;
              }
              return u;
            }),
          });
        },
        async deleteUser(uuid: string) {
          await configDelete("dashboard_listUser", uuid);
          setInitialState({
            ...initialState,
            users: initialState.users.filter((u) => u.uuid !== uuid),
          });
        },
        async setCurrentUser(uuid: string | undefined) {
          if (uuid === undefined) {
            await configDelete("dashboard", "userCurrent");
          } else {
            await configSet("dashboard", "userCurrent", serialize(uuid));
          }
          const user = await currentUser();
          setInitialState({
            ...initialState,
            currentUser: user,
          });
        },
      },
    });
  })();

  return {
    actionsRender: () => [
      // <Question key="doc" />,
      <SelectLang key="SelectLang" />,
    ],
    avatarProps: {
      // src: ,
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    // footerRender: () => <Footer />,
    childrenRender: (children) => {
      if (initialState?.loading !== 2) return <PageLoading />;
      return <>{children}</>;
    },
    ...initialState?.settings,
  };
};
