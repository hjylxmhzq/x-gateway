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
import { Link, Outlet, useLocation } from 'react-router-dom';
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
  getItem(<Link to={'/'}>代理规则配置</Link>, 'conf', <CalendarOutlined />),
  getItem(<Link to={'/user'}>用户组管理</Link>, 'user', <CalendarOutlined />),
  getItem(<Link to={'/cert'}>SSL证书管理</Link>, 'cert', <CalendarOutlined />),
  getItem(<Link to={'/traffic'}>流量分析</Link>, 'traffic', <CalendarOutlined />),
  getItem(<Link to={'/log'}>日志</Link>, 'log', <CalendarOutlined />),
];

const Dashboard: React.FC = () => {

  const location = useLocation();
  return (
    <div className={style['page-container']}>
      <div className={style['page-top-background']}></div>
      <div className={style['nav-container']}>
        <Menu
          style={{ width: 256, height: '100%', borderRadius: 10, overflow: 'hidden', boxShadow: 'rgb(108 108 108 / 10%) 0px 0px 10px 2px' }}
          defaultSelectedKeys={[location.pathname.slice(1) || 'conf']}
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