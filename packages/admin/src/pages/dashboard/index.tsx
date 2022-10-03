import {
  AppstoreOutlined,
  CalendarOutlined,
  LinkOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Button, Divider, Menu, Popover } from 'antd';
import style from './index.module.less';
import type { MenuProps } from 'antd/es/menu';
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import { GetUserInfoResponse } from '@x-gateway/interface/lib';
import { getUserInfo, logout } from '../../apis/user';

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

  const [userInfo, setUserInfo] = useState<GetUserInfoResponse>({ name: '', email: '' });
  const userInfoPopover = <div className={style['user-info-popover']}>
    <div>已登陆账户：<strong>{userInfo.name}</strong></div>
    <div>Email: {userInfo.email}</div>
    <Divider></Divider>
    <Button style={{width: '100%'}} onClick={async () => {
      await logout();
      window.location.href = '/login';
    }}>退出登陆</Button>
  </div>

  useEffect(() => {
    (async () => {
      const userInfo = await getUserInfo();
      setUserInfo(userInfo);
    })()
  }, []);

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
            <Popover arrowPointAtCenter placement="bottomRight" content={userInfoPopover} title="">
              <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
            </Popover>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;