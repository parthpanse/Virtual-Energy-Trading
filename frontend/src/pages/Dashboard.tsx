import React from 'react';
import { Card, Row, Col, Statistic, Button, Space } from '@arco-design/web-react';
import { IconTrendingUp, IconTrendingDown, IconClockCircle } from '@arco-design/web-react/icon';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h2>Dashboard</h2>
      
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Bids Today"
              value={42}
              prefix={<IconGift />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Executed Contracts"
              value={18}
              prefix={<IconFile />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Current RT Price"
              value={45.67}
              prefix={<IconTrendingUp />}
              suffix="$/MWh"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Daily PnL"
              value={1250.50}
              prefix={<IconBarChart />}
              suffix="$"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={16}>
        <Col span={16}>
          <Card title="Real-Time Price Chart" style={{ marginBottom: 16 }}>
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
              <p>Real-time 5-minute price chart will be displayed here</p>
            </div>
          </Card>
          
          <Card title="Day-Ahead Market Prices">
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
              <p>24-hour day-ahead market price table will be displayed here</p>
            </div>
          </Card>
        </Col>
        
        <Col span={8}>
          <Card title="Quick Actions" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="primary" block>
                Trigger Clearing
              </Button>
              <Button block>
                View Orders
              </Button>
              <Button block>
                Check PnL
              </Button>
            </Space>
          </Card>
          
          <Card title="Market Status">
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <IconClockCircle style={{ fontSize: 48, color: '#52c41a' }} />
              <p style={{ marginTop: 16 }}>Market Open</p>
              <p>Next clearing: 11:00 AM</p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
