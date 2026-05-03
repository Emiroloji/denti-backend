// src/modules/admin/Components/ErrorLogList.tsx

import React, { useState } from 'react'
import { Table, Tag, Button, Space, Modal, Typography, Card, Badge } from 'antd'
import { ReloadOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { Text, Paragraph } = Typography

interface ErrorLog {
  id: string
  type: 'exception' | 'failed_request' | 'failed_job' | 'query'
  severity: 'error' | 'warning' | 'info'
  message: string
  file?: string
  line?: number
  url?: string
  method?: string
  user_id?: number
  user_name?: string
  created_at: string
  resolved: boolean
  stack_trace?: string
}

const mockErrorLogs: ErrorLog[] = [
  {
    id: '1',
    type: 'exception',
    severity: 'error',
    message: 'SQLSTATE[42S02]: Base table or view not found',
    file: 'app/Services/StockService.php',
    line: 45,
    url: '/api/stocks/123',
    method: 'GET',
    user_id: 1,
    user_name: 'Admin User',
    created_at: '2026-05-02 14:30:00',
    resolved: false,
    stack_trace: '#0 /vendor/laravel/framework/src/Illuminate/Database/Connection.php:123\n#1 ...'
  },
  {
    id: '2',
    type: 'failed_request',
    severity: 'warning',
    message: '422 Unprocessable Entity - Validation failed',
    url: '/api/products',
    method: 'POST',
    user_id: 2,
    user_name: 'Doctor User',
    created_at: '2026-05-02 12:15:00',
    resolved: true
  },
  {
    id: '3',
    type: 'exception',
    severity: 'error',
    message: 'Trying to access array offset on value of type null',
    file: 'app/Http/Controllers/Api/StockController.php',
    line: 88,
    url: '/api/stocks',
    method: 'GET',
    user_id: 3,
    user_name: 'Assistant User',
    created_at: '2026-05-02 10:45:00',
    resolved: false
  }
]

const ErrorLogList: React.FC = () => {
  const [logs, setLogs] = useState<ErrorLog[]>(mockErrorLogs)
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'error'
      case 'warning': return 'warning'
      case 'info': return 'processing'
      default: return 'default'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'exception': return 'Exception'
      case 'failed_request': return 'HTTP Hatası'
      case 'failed_job': return 'Job Hatası'
      case 'query': return 'Sorgu'
      default: return type
    }
  }

  const handleViewDetails = (log: ErrorLog) => {
    setSelectedLog(log)
    setIsModalOpen(true)
  }

  const handleResolve = (id: string) => {
    setLogs(prev => prev.map(log => 
      log.id === id ? { ...log, resolved: !log.resolved } : log
    ))
  }

  const handleDelete = (id: string) => {
    setLogs(prev => prev.filter(log => log.id !== id))
  }

  const columns = [
    {
      title: 'Durum',
      key: 'status',
      width: 80,
      render: (_: any, record: ErrorLog) => (
        <Badge 
          status={record.resolved ? 'success' : 'error'} 
          text={record.resolved ? 'Çözüldü' : 'Aktif'}
        />
      )
    },
    {
      title: 'Önem',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity: string) => (
        <Tag color={getSeverityColor(severity)}>{severity.toUpperCase()}</Tag>
      )
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => <Tag>{getTypeLabel(type)}</Tag>
    },
    {
      title: 'Mesaj',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (message: string) => (
        <Text type="secondary">{message}</Text>
      )
    },
    {
      title: 'Dosya',
      key: 'file',
      ellipsis: true,
      render: (_: any, record: ErrorLog) => (
        record.file ? (
          <Text code style={{ fontSize: '12px' }}>
            {record.file}:{record.line}
          </Text>
        ) : '-'
      )
    },
    {
      title: 'Kullanıcı',
      key: 'user',
      render: (_: any, record: ErrorLog) => (
        record.user_name ? (
          <Text>{record.user_name}</Text>
        ) : 'Sistem'
      )
    },
    {
      title: 'Zaman',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm')
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 180,
      render: (_: any, record: ErrorLog) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Detay
          </Button>
          <Button 
            size="small"
            type={record.resolved ? 'default' : 'primary'}
            onClick={() => handleResolve(record.id)}
          >
            {record.resolved ? 'Aç' : 'Çöz'}
          </Button>
          <Button 
            size="small" 
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Sil
          </Button>
        </Space>
      )
    }
  ]

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Badge count={logs.filter(l => !l.resolved).length}>
              <Text strong style={{ fontSize: '16px' }}>Hata Logları</Text>
            </Badge>
            <Tag color="blue">Toplam: {logs.length}</Tag>
            <Tag color="red">Aktif: {logs.filter(l => !l.resolved).length}</Tag>
          </Space>
          <Button icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
            Yenile
          </Button>
        </div>

        <Table 
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Space>

      <Modal
        title="Hata Detayları"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Kapat
          </Button>
        ]}
      >
        {selectedLog && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text strong>Tür: </Text>
              <Tag color={getSeverityColor(selectedLog.severity)}>
                {getTypeLabel(selectedLog.type)}
              </Tag>
            </div>
            
            <div>
              <Text strong>Mesaj:</Text>
              <Paragraph style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
                {selectedLog.message}
              </Paragraph>
            </div>

            {selectedLog.file && (
              <div>
                <Text strong>Dosya:</Text>
                <Paragraph code copyable>
                  {selectedLog.file}:{selectedLog.line}
                </Paragraph>
              </div>
            )}

            {selectedLog.url && (
              <div>
                <Text strong>URL:</Text>
                <Paragraph>
                  <Tag>{selectedLog.method}</Tag> {selectedLog.url}
                </Paragraph>
              </div>
            )}

            {selectedLog.user_name && (
              <div>
                <Text strong>Kullanıcı:</Text>
                <Paragraph>{selectedLog.user_name} (ID: {selectedLog.user_id})</Paragraph>
              </div>
            )}

            <div>
              <Text strong>Zaman:</Text>
              <Paragraph>{dayjs(selectedLog.created_at).format('DD.MM.YYYY HH:mm:ss')}</Paragraph>
            </div>

            {selectedLog.stack_trace && (
              <div>
                <Text strong>Stack Trace:</Text>
                <pre style={{ 
                  background: '#1e1e1e', 
                  color: '#d4d4d4', 
                  padding: '16px', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '300px',
                  fontSize: '12px'
                }}>
                  {selectedLog.stack_trace}
                </pre>
              </div>
            )}
          </Space>
        )}
      </Modal>
    </Card>
  )
}

export default ErrorLogList
