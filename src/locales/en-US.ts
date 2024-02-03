import component from './en-US/component';
import globalHeader from './en-US/globalHeader';
import pages from './en-US/pages';
import pwa from './en-US/pwa';
import settingDrawer from './en-US/settingDrawer';
import settings from './en-US/settings';

export default {
  'navBar.lang': 'Languages',
  'layout.user.link.help': 'Help',
  'layout.user.link.privacy': 'Privacy',
  'layout.user.link.terms': 'Terms',
  'app.preview.down.block': 'Download this page to your local project',
  'app.welcome.link.fetch-blocks': 'Get all block',
  'app.welcome.link.block-list': 'Quickly build standard, pages based on `block` development',
  ...globalHeader,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...pages,
  // global
  'global.message.submit.success': 'Submit success',
  'global.message.delete.success': 'Delete success',
  'global.message.operate.fail': 'Operate fail',
  'global.components.action': 'Action',
  'global.components.action.delete': 'Delete',
  'global.components.action.switch': 'Switch',
  'global.components.action.upload': 'Upload',
  // menu
  'menu.welcome': 'Welcome',
  'menu.admin': 'Admin',
  'menu.admin.sub-page': 'Sub-Page',
  'menu.list.table-list': 'Search Table',
  'menu.account': 'Account',
  'menu.account.list': 'List',
  'menu.account.add': 'Add',
  // account
  'account.add.UserEditor.nickname': 'Nickname',
  'account.add.UserEditor.avatar': 'Avatar',
  'account.add.UserEditor.description': 'Description',
  'account.add.UserEditor.meta': 'Meta',
  'account.add.UserEditor.host': 'Host',
  'account.add.UserEditor.hostAddress': 'Host Address',
  'account.add.UserEditor.username': 'Username',
  'account.add.UserEditor.encryptType': 'Encrypt Type',
  'account.add.UserEditor.encryptKey': 'Encrypt Key',
  'account.add.UserEditor.encryptType.unencrypted': 'unencrypted',
  'account.list.title': 'User list',
};
