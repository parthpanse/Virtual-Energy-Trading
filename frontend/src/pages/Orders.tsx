import React from 'react';
import { Card, Table, Tag, Space, Button, Row, Col, Statistic } from '@arco-design/web-react';
import { IconDownload, IconEye } from '@arco-design/web-react/icon';

interface Order {
  id: string;
  hour: number;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  status: 'PENDING' | 'EXECUTED' | 'REJECTED';
  timestamp: string;
  executionPrice?: number;
  executionTime?: string;
}

const Orders: React.FC = () => {
  // Mock data
  const mockOrders: Order[] = [
    {
      id: '1',
      hour: 10,
      type: 'BUY',
      quantity: 100,
      price: 45.50,
      status: 'EXECUTED',
      timestamp: '2024-01-15 09:30:00',
      executionPrice: 45.50,
      executionTime: '2024-01-15 11:00:00'
    },
    {
      id: '2',
      hour: 14,
      type: 'SELL',
      quantity: 50,
      price: 48.75,
      status: 'EXECUTED',
      timestamp: '2024-01-15 08:15:00',
      executionPrice: 48.75,
      executionTime: '2024-01-15 11:00:00'
    },
    {
      id: '3',
      hour: 16,
      type: 'BUY',
      quantity: 75,
      price: 47.25,
      status: 'PENDING',
      timestamp: '2024-01-15 10:45:00'
    },
    {
      id: '4',
      hour: 20,
      type: 'SELL',
      quantity: 120,
      price: 49.00,
      status: 'REJECTED',
      timestamp: '2024-01-15 09:20:00'
    }
  ];

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      width: 100
    },
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
      title: 'Bid Price ($/MWh)',
      dataIndex: 'price',
      key: 'price',
      width: 140
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colors = {
          'PENDING': 'orange',
          'EXECUTED': 'green',
          'REJECTED': 'red'
        };
        return <Tag color={colors[status as keyof typeof colors]}>{status}</Tag>;
      }
    },
    {
      title: 'Execution Price ($/MWh)',
      dataIndex: 'executionPrice',
      key: 'executionPrice',
      width: 160,
      render: (price: number | undefined) => price ? `$${price}` : '-'
    },
    {
      title: 'Bid Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150
    },
    {
      title: 'Execution Time',
      dataIndex: 'executionTime',
      key: 'executionTime',
      width: 150,
      render: (time: string | undefined) => time || '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: Order) => (
        <Space>
          <Button size="small" icon={<IconEye />} />
          <Button size="small" icon={<IconDownload />} />
        </Space>
      )
    }
  ];

  const getStatusCounts = () => {
    const counts = { PENDING: 0, EXECUTED: 0, REJECTED: 0 };
    mockOrders.forEach(order => {
      counts[order.status as keyof typeof counts]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div>
      <h2>Orders & Contracts</h2>
      
      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={mockOrders.length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending"
              value={statusCounts.PENDING}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Executed"
              value={statusCounts.EXECUTED}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Rejected"
              value={statusCounts.REJECTED}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Orders Table */}
      <Card title="Order History">
        <Table
          columns={columns}
          data={mockOrders}
          rowKey="id"
          pagination={{
            total: mockOrders.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} orders`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default Orders;
