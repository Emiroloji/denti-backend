// src/modules/admin/Components/CompanyFormModal.tsx

import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, App, Typography } from 'antd';
import { Company, CompanyStoreResponse } from '../Types/company.types';
import { companyApi } from '../Services/companyApi';

interface Props {
  open: boolean;
  editingCompany: Company | null;
  onCancel: () => void;
  onSuccess: (data?: CompanyStoreResponse['data']) => void;
}

export const CompanyFormModal: React.FC<Props> = ({ open, editingCompany, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!editingCompany;

  useEffect(() => {
    if (open) {
      if (editingCompany) {
        form.setFieldsValue(editingCompany);
      } else {
        form.resetFields();
      }
    }
  }, [open, editingCompany, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (isEdit) {
        await companyApi.updateCompany(editingCompany!.id, values);
        message.success('Şirket bilgileri güncellendi.');
        onSuccess();
      } else {
        // 🛡️ Ensure default values are sent even if they are not in the form fields
        const payload = {
          status: 'active',
          subscription_plan: 'basic',
          max_users: 5,
          ...values
        };
        const response = await companyApi.createCompany(payload);
        message.success('Şirket başarıyla oluşturuldu.');
        onSuccess(response.data);
      }
    } catch (error: any) {
      console.error('Form submit error:', error);
      // Errors are mostly handled by axios interceptor
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Şirket Bilgilerini Düzenle" : "Yeni Şirket Kaydı"}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={submitting}
      width={650}
      okText={isEdit ? "Güncelle" : "Oluştur"}
      destroyOnHidden
    >
      <Form 
        form={form} 
        layout="vertical" 
        initialValues={{ 
          subscription_plan: 'basic', 
          max_users: 5, 
          status: 'active' 
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          <Form.Item 
            label="Şirket Adı" 
            name="name" 
            rules={[{ required: true, message: 'Lütfen şirket adını girin!' }]}
          >
            <Input placeholder="Örn: Akdent Diş Polikliniği" />
          </Form.Item>

          <Form.Item 
            label="Klinik Kodu (Giriş için)" 
            name="code" 
            rules={[
              { required: true, message: 'Lütfen klinik kodunu girin!' }
            ]}
            tooltip="Kullanıcıların giriş yaparken kullanacağı benzersiz kod (Örn: AKDENT01)"
            normalize={(value) => value?.toUpperCase().replace(/[^A-Z0-9]/g, '')}
          >
            <Input placeholder="AKDENT01" style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          
          <Form.Item 
            label="Domain Öneki" 
            name="domain" 
            rules={[{ required: true, message: 'Lütfen domain önekini girin!' }]}
            tooltip="akdent.denti.com şeklindeki adresin başındaki 'akdent' kısmı"
            normalize={(value) => value?.toLowerCase().replace(/[^a-z0-9-]/g, '')}
          >
            <Input addonAfter=".denti.com" disabled={isEdit} placeholder="akdent" />
          </Form.Item>

          <Form.Item label="Abonelik Planı" name="subscription_plan" rules={[{ required: true }]}>
            <Select options={[
              { label: 'Basic', value: 'basic' },
              { label: 'Standard', value: 'standard' },
              { label: 'Premium', value: 'premium' },
            ]} />
          </Form.Item>

          <Form.Item label="Maks. Kullanıcı Sayısı" name="max_users" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          {isEdit && (
            <Form.Item label="Durum" name="status" rules={[{ required: true }]}>
              <Select options={[
                { label: 'Aktif', value: 'active' },
                { label: 'Pasif', value: 'inactive' },
              ]} />
            </Form.Item>
          )}
        </div>

        {!isEdit && (
          <div style={{ 
            marginTop: 16, 
            padding: 16, 
            background: '#fafafa', 
            borderRadius: 8,
            border: '1px solid #f0f0f0'
          }}>
            <Typography.Text strong type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              Şirket Sahibi / Ana Yönetici Bilgileri
            </Typography.Text>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
              <Form.Item 
                label="Ad Soyad" 
                name="owner_name" 
                rules={[{ required: true, message: 'Lütfen yönetici adını girin!' }]}
              >
                <Input placeholder="Yönetici Adı" />
              </Form.Item>

              <Form.Item 
                label="Kullanıcı Adı" 
                name="owner_username" 
                rules={[{ required: true, message: 'Lütfen kullanıcı adını girin!' }]}
                normalize={(value) => value?.toLowerCase().replace(/[^a-z0-9._]/g, '')}
              >
                <Input placeholder="admin.akdent" />
              </Form.Item>
              
              <Form.Item 
                label="E-posta" 
                name="owner_email" 
                rules={[
                  { required: true, message: 'Lütfen e-posta adresini girin!' },
                  { type: 'email', message: 'Geçerli bir e-posta girin!' }
                ]}
              >
                <Input placeholder="admin@sirket.com" />
              </Form.Item>
            </div>
          </div>
        )}
      </Form>
    </Modal>
  );
};
