// src/modules/users/Components/UserInviteModal.tsx

import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Alert } from 'antd';
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
  const { roles, isLoading: isRolesLoading } = useRoles();

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
      destroyOnClose
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
          label="Rol"
          name="role"
          rules={[{ required: true, message: 'Lütfen bir rol seçiniz.' }]}
        >
          <Select 
            placeholder="Rol seçin" 
            loading={isRolesLoading}
          >
            {roles.map(role => (
              <Select.Option key={role.id} value={role.name}>
                {role.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
