import {
  AppstoreOutlined,
  CalendarOutlined,
  LinkOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import style from './index.module.less';
import type { MenuProps } from 'antd/es/menu';
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key?: React.Key | null,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem(<Link to={'/'}>代理规则配置</Link>, '1', <CalendarOutlined />),
  getItem('Navigation Two', '2', <CalendarOutlined />),
  getItem('Navigation Three', 'sub2', <SettingOutlined />, [
    getItem('Option 7', '7'),
    getItem('Option 8', '8'),
    getItem('Option 9', '9'),
    getItem('Option 10', '10'),
  ]),
  getItem(
    <a href="https://ant.design" target="_blank" rel="noopener noreferrer">
      Ant Design
    </a>,
    'link',
    <LinkOutlined />,
  ),
];

const Dashboard: React.FC = () => {

  return (
    <div className={style['page-container']}>
      <div className={style['page-top-background']}></div>
      <div className={style['nav-container']}>
        <Menu
          style={{ width: 256, height: '100%', borderRadius: 10, overflow: 'hidden', boxShadow: 'rgb(108 108 108 / 10%) 0px 0px 10px 2px' }}
          defaultSelectedKeys={['1']}
          defaultOpenKeys={['sub1']}
          theme={'light'}
          items={items}
        />
      </div>
      <div className={style['right-content']}>
        <div className={style['header']}>
          <div></div>
          <div>
            <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;