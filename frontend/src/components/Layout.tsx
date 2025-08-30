import React, { useState } from 'react';
import { Layout as ArcoLayout, Menu, Button } from '@arco-design/web-react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  IconDashboard,
  IconGift,
  IconFile,
  IconBarChart,
  IconMenu,
} from '@arco-design/web-react/icon';

const { Header, Sider, Content } = ArcoLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <IconDashboard />,
      title: 'Dashboard',
    },
    {
      key: '/bidding',
      icon: <IconGift />,
      title: 'Bidding',
    },
    {
      key: '/orders',
      icon: <IconFile />,
      title: 'Orders',
    },
    {
      key: '/pnl',
      icon: <IconBarChart />,
      title: 'PnL',
    },
  ];

  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  return (
    <ArcoLayout style={{ height: '100vh' }}>
      <Sider
        collapsed={collapsed}
        onCollapse={setCollapsed}
        collapsible
        trigger={null}
        style={{ background: '#001529' }}
      >
        <div style={{ height: 32, margin: 12, background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu
          defaultSelectedKeys={[location.pathname]}
          style={{ width: '100%', height: 'calc(100% - 48px)' }}
          theme="dark"
          mode="inline"
          onClickMenuItem={handleMenuClick}
        >
          {menuItems.map((item) => (
            <Menu.Item key={item.key} icon={item.icon}>
              {item.title}
            </Menu.Item>
          ))}
        </Menu>
      </Sider>
      <ArcoLayout>
        <Header style={{ padding: 0, background: '#fff' }}>
          <Button
            type="text"
            icon={collapsed ? <IconMenu /> : <IconMenu />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <span style={{ fontSize: '18px', fontWeight: 'bold', marginLeft: '16px' }}>
            Virtual Energy Trading Platform
          </span>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
          {children}
        </Content>
      </ArcoLayout>
    </ArcoLayout>
  );
};

export default Layout;
