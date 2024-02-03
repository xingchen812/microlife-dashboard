import component from './zh-CN/component';
import globalHeader from './zh-CN/globalHeader';
import pages from './zh-CN/pages';
import pwa from './zh-CN/pwa';
import settingDrawer from './zh-CN/settingDrawer';
import settings from './zh-CN/settings';

export default {
  'navBar.lang': '语言',
  'layout.user.link.help': '帮助',
  'layout.user.link.privacy': '隐私',
  'layout.user.link.terms': '条款',
  'app.preview.down.block': '下载此页面到本地项目',
  'app.welcome.link.fetch-blocks': '获取全部区块',
  'app.welcome.link.block-list': '基于 block 开发，快速构建标准页面',
  ...pages,
  ...globalHeader,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  // global
  'global.message.submit.success': '提交成功',
  'global.message.delete.success': '删除成功',
  'global.message.operate.fail': '操作失败',
  'global.components.action': '操作',
  'global.components.action.delete': '删除',
  'global.components.action.switch': '切换',
  'global.components.action.upload': '上传',
  // menu
  'menu.welcome': '欢迎',
  'menu.admin': '管理页',
  'menu.admin.sub-page': '二级管理页',
  'menu.list.table-list': '查询表格',
  'menu.account': '用户管理',
  'menu.account.list': '所有用户',
  'menu.account.add': '添加用户',
  // account
  'account.add.UserEditor.nickname': '昵称',
  'account.add.UserEditor.avatar': '头像',
  'account.add.UserEditor.description': '描述',
  'account.add.UserEditor.meta': '元信息',
  'account.add.UserEditor.host': '主机',
  'account.add.UserEditor.hostAddress': '主机地址',
  'account.add.UserEditor.username': '用户名',
  'account.add.UserEditor.encryptType': '加密方式',
  'account.add.UserEditor.encryptKey': '加密密钥',
  'account.add.UserEditor.encryptType.unencrypted': '不加密',
  'account.list.title': '用户列表',
};
