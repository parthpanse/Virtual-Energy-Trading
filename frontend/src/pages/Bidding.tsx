import React, { useState } from 'react';
import { Card, Button, Modal, Form, InputNumber, Select, Row, Col, Table, Tag, Space } from '@arco-design/web-react';
import { IconPlus, IconEdit, IconDelete } from '@arco-design/web-react/icon';

const { Option } = Select;

interface Bid {
  id: string;
  hour: number;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  status: 'PENDING' | 'EXECUTED' | 'REJECTED';
  timestamp: string;
}

const Bidding: React.FC = () => {
  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Mock data
  const mockBids: Bid[] = [
    {
      id: '1',
      hour: 10,
      type: 'BUY',
      quantity: 100,
      price: 45.50,
      status: 'PENDING',
      timestamp: '2024-01-15 09:30:00'
    },
    {
      id: '2',
      hour: 14,
      type: 'SELL',
      quantity: 50,
      price: 48.75,
      status: 'EXECUTED',
      timestamp: '2024-01-15 08:15:00'
    }
  ];

  const columns = [
    {
      title: 'Hour',
      dataIndex: 'hour',
      key: 'hour',
      render: (hour: number) => `${hour}:00`
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'BUY' ? 'green' : 'red'}>
          {type}
        </Tag>
      )
    },
    {
      title: 'Quantity (MWh)',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: 'Price ($/MWh)',
      dataIndex: 'price',
      key: 'price'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
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
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Bid) => (
        <Space>
          <Button size="small" icon={<IconEdit />} />
          <Button size="small" icon={<IconDelete />} status="danger" />
        </Space>
      )
    }
  ];

  const handleSubmit = (values: any) => {
    console.log('New bid:', values);
    setBidModalVisible(false);
    form.resetFields();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Bidding</h2>
        <Button type="primary" icon={<IconPlus />} onClick={() => setBidModalVisible(true)}>
          New Bid
        </Button>
      </div>

      {/* 24-Hour Grid */}
      <Card title="24-Hour Market Grid" style={{ marginBottom: 24 }}>
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
          <p>24-hour grid visualization will be displayed here</p>
        </div>
      </Card>

      {/* Bids Table */}
      <Card title="Your Bids">
        <Table
          columns={columns}
          data={mockBids}
          rowKey="id"
          pagination={false}
        />
      </Card>

      {/* New Bid Modal */}
      <Modal
        title="Place New Bid"
        visible={bidModalVisible}
        onCancel={() => setBidModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Hour"
            name="hour"
            rules={[{ required: true, message: 'Please select hour' }]}
          >
            <Select placeholder="Select hour">
              {Array.from({ length: 24 }, (_, i) => (
                <Option key={i} value={i}>{`${i}:00`}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Type"
            name="type"
            rules={[{ required: true, message: 'Please select type' }]}
          >
            <Select placeholder="Select type">
              <Option value="BUY">BUY</Option>
              <Option value="SELL">SELL</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Quantity (MWh)"
            name="quantity"
            rules={[{ required: true, message: 'Please enter quantity' }]}
          >
            <InputNumber
              min={1}
              max={1000}
              style={{ width: '100%' }}
              placeholder="Enter quantity"
            />
          </Form.Item>

          <Form.Item
            label="Price ($/MWh)"
            name="price"
            rules={[{ required: true, message: 'Please enter price' }]}
          >
            <InputNumber
              min={0.01}
              max={1000}
              precision={2}
              style={{ width: '100%' }}
              placeholder="Enter price"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Place Bid
              </Button>
              <Button onClick={() => setBidModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Bidding;
