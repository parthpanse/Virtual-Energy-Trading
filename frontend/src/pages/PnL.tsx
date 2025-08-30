import React from 'react';
import { Card, Table, Row, Col, Statistic, Tag, Space, Button } from '@arco-design/web-react';
import { IconDownload, IconBarChart, IconTrendingUp, IconTrendingDown } from '@arco-design/web-react/icon';

interface PnLRecord {
  id: string;
  hour: number;
  type: 'BUY' | 'SELL';
  quantity: number;
  daPrice: number;
  rtPrice: number;
  pnl: number;
  timestamp: string;
}

const PnL: React.FC = () => {
  // Mock data
  const mockPnL: PnLRecord[] = [
    {
      id: '1',
      hour: 10,
      type: 'BUY',
      quantity: 100,
      daPrice: 45.50,
      rtPrice: 47.25,
      pnl: -175.00,
      timestamp: '2024-01-15'
    },
    {
      id: '2',
      hour: 14,
      type: 'SELL',
      quantity: 50,
      daPrice: 48.75,
      rtPrice: 46.80,
      pnl: 97.50,
      timestamp: '2024-01-15'
    },
    {
      id: '3',
      hour: 16,
      type: 'BUY',
      quantity: 75,
      daPrice: 47.25,
      rtPrice: 48.10,
      pnl: -63.75,
      timestamp: '2024-01-15'
    },
    {
      id: '4',
      hour: 20,
      type: 'SELL',
      quantity: 120,
      daPrice: 49.00,
      rtPrice: 50.25,
      pnl: -150.00,
      timestamp: '2024-01-15'
    }
  ];

  const columns = [
    {
      title: 'Hour',
      dataIndex: 'hour',
      key: 'hour',
      width: 80,
      render: (hour: number) => `${hour}:00`
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => (
        <Tag color={type === 'BUY' ? 'green' : 'red'}>
          {type}
        </Tag>
      )
    },
    {
      title: 'Quantity (MWh)',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120
    },
    {
      title: 'DA Price ($/MWh)',
      dataIndex: 'daPrice',
      key: 'daPrice',
      width: 140,
      render: (price: number) => `$${price}`
    },
    {
      title: 'RT Price ($/MWh)',
      dataIndex: 'rtPrice',
      key: 'rtPrice',
      width: 140,
      render: (price: number) => `$${price}`
    },
    {
      title: 'PnL ($)',
      dataIndex: 'pnl',
      key: 'pnl',
      width: 120,
      render: (pnl: number) => (
        <Tag color={pnl >= 0 ? 'green' : 'red'}>
          {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
        </Tag>
      )
    },
    {
      title: 'Date',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 120
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: PnLRecord) => (
        <Space>
          <Button size="small" icon={<IconBarChart />} />
          <Button size="small" icon={<IconDownload />} />
        </Space>
      )
    }
  ];

  const calculateTotalPnL = () => {
    return mockPnL.reduce((total, record) => total + record.pnl, 0);
  };

  const getPnLBreakdown = () => {
    const buyPnL = mockPnL
      .filter(record => record.type === 'BUY')
      .reduce((total, record) => total + record.pnl, 0);
    
    const sellPnL = mockPnL
      .filter(record => record.type === 'SELL')
      .reduce((total, record) => total + record.pnl, 0);
    
    return { buyPnL, sellPnL };
  };

  const totalPnL = calculateTotalPnL();
  const { buyPnL, sellPnL } = getPnLBreakdown();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Profit & Loss (PnL)</h2>
        <Space>
          <Button icon={<IconDownload />}>Export Report</Button>
          <Button type="primary" icon={<IconBarChart />}>Generate Report</Button>
        </Space>
      </div>

      {/* PnL Summary */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total PnL"
              value={totalPnL}
              precision={2}
              prefix="$"
              valueStyle={{ color: totalPnL >= 0 ? '#3f8600' : '#cf1322' }}
              prefix={totalPnL >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Buy PnL"
              value={buyPnL}
              precision={2}
              prefix="$"
              valueStyle={{ color: buyPnL >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sell PnL"
              value={sellPnL}
              precision={2}
              prefix="$"
              valueStyle={{ color: sellPnL >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Contracts"
              value={mockPnL.length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="RT vs DA Price Comparison">
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
              <p>Real-time vs Day-ahead price chart will be displayed here</p>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Hourly PnL Distribution">
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
              <p>Hourly PnL distribution chart will be displayed here</p>
            </div>
          </Card>
        </Col>
      </Row>

      {/* PnL Table */}
      <Card title="Detailed PnL Analysis">
        <Table
          columns={columns}
          data={mockPnL}
          rowKey="id"
          pagination={{
            total: mockPnL.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} records`
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default PnL;
