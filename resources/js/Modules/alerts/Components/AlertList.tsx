// src/modules/alerts/Components/AlertList.tsx

import React, { useState, useMemo } from 'react'
import { 
  Card,
  Row, 
  Col, 
  Input, 
  Select, 
  Button,
  Space,
  Typography,
  DatePicker,
  Checkbox,
  Modal,
  Form,
  Badge,
  Affix,
  Table,
  Tag,
  Tooltip,
  Spin
} from 'antd'
import { 
  FilterOutlined,
  ReloadOutlined,
  BellOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { useAlerts, useAlertStats } from '../Hooks/useAlerts'
import { useClinics } from '@/Modules/clinics/Hooks/useClinics'
import { AlertDashboard } from './AlertDashboard'
import { AlertSeverityBadge } from './AlertSeverityBadge'
import { AlertFilters, AlertType, AlertSeverity, Alert } from '../Types/alert.types'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker
const { Title } = Typography
const { TextArea } = Input

interface AlertListProps {
  defaultClinicId?: number
  currentUser: string
  showDashboard?: boolean
}

export const AlertList: React.FC<AlertListProps> = ({ 
  defaultClinicId,
  currentUser,
  showDashboard = true 
}) => {
  const [filters, setFilters] = useState<AlertFilters>({
    clinic_id: defaultClinicId,
    is_resolved: false
  })
  const [selectedAlerts, setSelectedAlerts] = useState<number[]>([])
  const [bulkActionModalVisible, setBulkActionModalVisible] = useState(false)
  const [bulkActionType, setBulkActionType] = useState<'resolve' | 'dismiss' | 'delete'>('resolve')
  const [bulkModalKey, setBulkModalKey] = useState(0)

  const { 
    alerts, 
    isLoading, 
    refetch,
    bulkResolveAlerts,
    bulkDismissAlerts,
    isBulkProcessing,
    resolveAlert,
    dismissAlert,
    deleteAlert
  } = useAlerts(filters)
  
  const { data: stats } = useAlertStats(filters.clinic_id)
  const { clinics } = useClinics()

  const activeClinics = useMemo(() => {
    if (!clinics || clinics.length === 0) return []
    return clinics.filter((clinic) => clinic.is_active)
  }, [clinics])

  const handleFilterChange = (key: keyof AlertFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setSelectedAlerts([])
  }

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2 && dates[0] && dates[1]) {
      setFilters(prev => ({
        ...prev,
        date_from: dates[0].format('YYYY-MM-DD'),
        date_to: dates[1].format('YYYY-MM-DD')
      }))
    } else {
      setFilters(prev => ({ ...prev, date_from: undefined, date_to: undefined }))
    }
  }

  const clearFilters = () => {
    setFilters({ clinic_id: defaultClinicId, is_resolved: false })
    setSelectedAlerts([])
  }

  const handleBulkAction = (action: 'resolve' | 'dismiss' | 'delete') => {
    if (selectedAlerts.length === 0) return
    setBulkActionType(action)
    setBulkActionModalVisible(true)
  }

  const executeBulkAction = async (values?: { resolution_notes?: string }) => {
    try {
      if (bulkActionType === 'resolve') {
        await bulkResolveAlerts({
          ids: selectedAlerts,
          data: { resolved_by: currentUser, resolution_notes: values?.resolution_notes }
        })
      } else if (bulkActionType === 'dismiss') {
        await bulkDismissAlerts(selectedAlerts)
      }
      setBulkActionModalVisible(false)
      setSelectedAlerts([])
      setBulkModalKey(prev => prev + 1)
    } catch (error) {
      console.error('Bulk action error:', error)
    }
  }

  const alertTypeOptions: { value: AlertType; label: string }[] = [
    { value: 'low_stock', label: 'Düşük Stok' },
    { value: 'critical_stock', label: 'Kritik Stok' },
    { value: 'expired', label: 'Süresi Geçmiş' },
    { value: 'near_expiry', label: 'Son Kullanma Yaklaşıyor' },
    { value: 'out_of_stock', label: 'Stok Bitti' },
    { value: 'stock_request', label: 'Stok Talebi' },
    { value: 'stock_transfer', label: 'Stok Transferi' },
    { value: 'system', label: 'Sistem' }
  ]

  const severityOptions: { value: AlertSeverity; label: string }[] = [
    { value: 'low', label: 'Düşük' },
    { value: 'medium', label: 'Orta' },
    { value: 'high', label: 'Yüksek' },
    { value: 'critical', label: 'Kritik' }
  ]

  return (
    <div>
      {showDashboard && (
        <div style={{ marginBottom: 24 }}>
          <AlertDashboard clinicId={filters.clinic_id} />
        </div>
      )}

      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Search
              placeholder="Başlık veya mesaj ara..."
              allowClear
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              placeholder="Klinik"
              allowClear
              style={{ width: '100%' }}
              value={filters.clinic_id}
              onChange={(value) => handleFilterChange('clinic_id', value)}
            >
              {activeClinics.map((clinic) => (
                <Option key={clinic.id} value={clinic.id}>{clinic.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} md={4}>
            <Select
              placeholder="Tip"
              allowClear
              style={{ width: '100%' }}
              value={filters.type}
              onChange={(value) => handleFilterChange('type', value)}
            >
              {alertTypeOptions.map((opt) => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} md={4}>
            <Select
              placeholder="Önem"
              allowClear
              style={{ width: '100%' }}
              value={filters.severity}
              onChange={(value) => handleFilterChange('severity', value)}
            >
              {severityOptions.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  <AlertSeverityBadge severity={opt.value} size="small" />
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} md={4}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button 
                icon={<FilterOutlined />} 
                onClick={clearFilters}
              >
                Temizle
              </Button>
            </Space>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
          <Col xs={24} md={12}>
            <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" onChange={handleDateRangeChange} />
          </Col>
          <Col xs={24} md={12}>
            <Space>
              <Checkbox
                checked={filters.is_resolved === false}
                onChange={(e) => handleFilterChange('is_resolved', e.target.checked ? false : undefined)}
              >Sadece aktif</Checkbox>
              <Checkbox
                checked={filters.is_resolved === true}
                onChange={(e) => handleFilterChange('is_resolved', e.target.checked ? true : undefined)}
              >Sadece çözülmüş</Checkbox>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            <BellOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            Uyarılar
            {alerts && alerts.length > 0 && (
              <Badge count={alerts.length} style={{ marginLeft: 8 }} />
            )}
          </Title>
        </Col>
      </Row>

      {selectedAlerts.length > 0 && (
        <Affix offsetTop={10}>
          <Card size="small" style={{ marginBottom: 16, backgroundColor: '#e6f7ff', borderColor: '#91d5ff' }}>
            <Row justify="space-between" align="middle">
              <Col><span>{selectedAlerts.length} uyarı seçildi</span></Col>
              <Col>
                <Space>
                  <Button size="small" icon={<CheckOutlined />} onClick={() => handleBulkAction('resolve')} loading={isBulkProcessing}>Toplu Çözümle</Button>
                  <Button size="small" icon={<CloseOutlined />} onClick={() => handleBulkAction('dismiss')} loading={isBulkProcessing}>Toplu Yok Say</Button>
                  <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleBulkAction('delete')} loading={isBulkProcessing}>Toplu Sil</Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Affix>
      )}

      <Card bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={alerts || []}
          loading={isLoading}
          rowKey="id"
          rowSelection={{
            selectedRowKeys: selectedAlerts,
            onChange: (keys) => setSelectedAlerts(keys as number[])
          }}
          columns={[
            {
              title: 'Önem',
              dataIndex: 'severity',
              width: 100,
              render: (sev) => <AlertSeverityBadge severity={sev} />
            },
            {
              title: 'Ürün / Mesaj',
              render: (_, record) => (
                <div>
                  <div style={{ fontWeight: 'bold', color: '#1890ff' }}>{record.title}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{record.message}</div>
                </div>
              )
            },
            {
              title: 'Klinik',
              dataIndex: ['clinic', 'name'],
              render: (name) => <Tag color="blue">{name}</Tag>
            },
            {
              title: 'Tür',
              dataIndex: 'type',
              render: (type) => <Tag>{alertTypeOptions.find(o => o.value === type)?.label || type}</Tag>
            },
            {
              title: 'Tarih',
              dataIndex: 'created_at',
              render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
            },
            {
              title: 'İşlemler',
              width: 150,
              render: (_, record) => (
                <Space>
                  {!record.is_resolved && (
                    <Tooltip title="Çözümle">
                      <Button size="small" type="primary" ghost icon={<CheckOutlined />} 
                        onClick={() => Modal.confirm({
                          title: 'Uyarıyı Çözümle',
                          content: 'Bu uyarıyı çözüldü olarak işaretlemek istediğinize emin misiniz?',
                          onOk: () => resolveAlert({ id: record.id, data: { resolved_by: currentUser } })
                        })} 
                      />
                    </Tooltip>
                  )}
                  <Tooltip title="Sil">
                    <Button size="small" danger icon={<DeleteOutlined />} 
                      onClick={() => Modal.confirm({
                        title: 'Uyarıyı Sil',
                        content: 'Bu uyarıyı kalıcı olarak silmek istediğinize emin misiniz?',
                        onOk: () => deleteAlert(record.id)
                      })} 
                    />
                  </Tooltip>
                </Space>
              )
            }
          ]}
        />
      </Card>

      <Modal
        key={`bulk-modal-${bulkModalKey}`}
        title={`Toplu ${bulkActionType === 'resolve' ? 'Çözümleme' : bulkActionType === 'dismiss' ? 'Yok Sayma' : 'Silme'}`}
        open={bulkActionModalVisible}
        onCancel={() => setBulkActionModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form layout="vertical" onFinish={executeBulkAction}>
          <div style={{ marginBottom: 16 }}>
            <ExclamationCircleOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
            <span>{selectedAlerts.length} uyarı işlenecek. Devam edilsin mi?</span>
          </div>
          {bulkActionType === 'resolve' && (
            <Form.Item label="Notlar" name="resolution_notes"><TextArea rows={4} /></Form.Item>
          )}
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setBulkActionModalVisible(false)}>İptal</Button>
              <Button type="primary" htmlType="submit" loading={isBulkProcessing} danger={bulkActionType === 'delete'}>Onayla</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}