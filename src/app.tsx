import { AvatarDropdown, AvatarName, SelectLang } from '@/components';
import { PageLoading, type Settings as LayoutSettings } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { currentUser } from './services/local';
import { User } from './services/typings';

// https://umijs.org/zh-CN/plugins/plugin-initial-state
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  loading?: boolean;
  currentUser: User;
}> {
  return {
    settings: defaultSettings as Partial<LayoutSettings>,
    loading: false,
    currentUser: await currentUser(),
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
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
      if (initialState?.loading) return <PageLoading />;
      return <>{children}</>;
    },
    ...initialState?.settings,
  };
};
