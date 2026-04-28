// src/modules/roles/Components/RoleTable.tsx

import React from 'react';
import { Table, Tag, Space, Button, Popconfirm, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Role } from '../Types/role.types';
import dayjs from 'dayjs';

interface RoleTableProps {
  roles: Role[];
  loading: boolean;
  onEdit: (role: Role) => void;
  onDelete: (id: number) => void;
}

export const RoleTable: React.FC<RoleTableProps> = ({ roles, loading, onEdit, onDelete }) => {
  const columns: ColumnsType<Role> = [
    {
      title: 'Rol Adı',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <SafetyCertificateOutlined style={{ color: '#1890ff' }} />
          <span style={{ fontWeight: 600 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Guard',
      dataIndex: 'guard_name',
      key: 'guard_name',
      render: (guard) => <Tag color="blue">{guard}</Tag>,
    },
    {
      title: 'İzin Sayısı',
      key: 'permissions_count',
      render: (_, record) => (
        <Tooltip title={record.permissions.map(p => p.display_name).join(', ')}>
          <Tag color="cyan">{record.permissions.length} İzin</Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Oluşturulma Tarihi',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => onEdit(record)}
          />
          <Popconfirm
            title="Rolü silmek istediğinize emin misiniz?"
            description="Bu işlem geri alınamaz."
            onConfirm={() => onDelete(record.id)}
            okText="Evet"
            cancelText="Hayır"
            okButtonProps={{ danger: true }}
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              disabled={record.name === 'Company Owner'} // Core rol koruması (UI tarafında da)
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={roles}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 10 }}
    />
  );
};
