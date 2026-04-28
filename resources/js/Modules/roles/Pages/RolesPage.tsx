// src/modules/roles/Pages/RolesPage.tsx

import React, { useState } from 'react';
import { Card, Button, Typography, Space, Row, Col } from 'antd';
import { PlusOutlined, SafetyOutlined } from '@ant-design/icons';
import { useRoles } from '../Hooks/useRoles';
import { RoleTable } from '../Components/RoleTable';
import { RoleFormModal } from '../Components/RoleFormModal';
import { Role, RoleStorePayload } from '../Types/role.types';

const { Title, Text } = Typography;

export const RolesPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const {
    roles,
    isLoading,
    permissionGroups,
    isPermissionsLoading,
    createRole,
    updateRole,
    deleteRole,
    isProcessing,
  } = useRoles();

  const handleAdd = () => {
    setSelectedRole(null);
    setIsModalOpen(true);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: RoleStorePayload) => {
    try {
      if (selectedRole) {
        await updateRole({ id: selectedRole.id, data: values });
      } else {
        await createRole(values);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Space align="center">
            <SafetyOutlined style={{ fontSize: '28px', color: '#1890ff' }} />
            <div>
              <Title level={3} style={{ margin: 0 }}>Rol ve İzin Yönetimi</Title>
              <Text type="secondary">Kullanıcı rollerini ve modül bazlı yetkileri buradan yönetebilirsiniz.</Text>
            </div>
          </Space>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
            size="large"
          >
            Yeni Rol Oluştur
          </Button>
        </Col>
      </Row>

      <Card styles={{ body: { padding: 0 } }}>
        <RoleTable 
          roles={roles} 
          loading={isLoading} 
          onEdit={handleEdit} 
          onDelete={deleteRole} 
        />
      </Card>

      <RoleFormModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={selectedRole}
        permissionGroups={permissionGroups}
        isLoadingPermissions={isPermissionsLoading}
        isProcessing={isProcessing}
      />
    </div>
  );
};
