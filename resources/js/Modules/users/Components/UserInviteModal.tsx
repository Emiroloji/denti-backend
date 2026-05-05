// src/modules/users/Components/UserInviteModal.tsx

import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Alert, Checkbox, Spin, Row, Col } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { InviteUserPayload } from '../Types/user.types';
import { useRoles } from '../../roles/Hooks/useRoles';

interface UserInviteModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: InviteUserPayload) => void;
  loading: boolean;
}

export const UserInviteModal: React.FC<UserInviteModalProps> = ({
  open,
  onCancel,
  onSubmit,
  loading,
}) => {
  const [form] = Form.useForm();
  const { permissionGroups, isPermissionsLoading } = useRoles();

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  return (
    <Modal
      title="Yeni Personel Davet Et"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Davetiye Gönder"
      cancelText="İptal"
      destroyOnHidden
    >
      <Alert
        message="Bilgilendirme"
        description="Personel e-posta adresine bir davet linki gönderilecektir. Personel linke tıklayarak kendi şifresini belirleyebilir."
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
      >
        <Form.Item
          label="E-posta Adresi"
          name="email"
          rules={[
            { required: true, message: 'Lütfen geçerli bir e-posta adresi giriniz.' },
            { type: 'email', message: 'Hatalı e-posta formatı!' }
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Örn: ayse@klinik.com" />
        </Form.Item>

        <Form.Item
          label="Yetkiler"
          name="permissions"
        >
          {isPermissionsLoading ? (
            <Spin size="small" />
          ) : (
            <Checkbox.Group style={{ width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {permissionGroups?.map((group: any) => (
                  <div key={group.module}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1890ff' }}>{group.module}</div>
                    <Row gutter={[8, 8]}>
                      {group.permissions.map((p: any) => (
                        <Col span={12} key={p.name}>
                          <Checkbox value={p.name}>{p.name}</Checkbox>
                        </Col>
                      ))}
                    </Row>
                  </div>
                ))}
              </div>
            </Checkbox.Group>
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};
