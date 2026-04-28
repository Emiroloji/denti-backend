// src/modules/stock/Components/StockTable.tsx

import React from 'react'
import { Table, Tag, Tooltip, Space, Button, Dropdown, Modal, Typography, Avatar } from 'antd'

const { Text } = Typography
import { 
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  MinusOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  PauseOutlined,
  PlayCircleOutlined,
  StopOutlined,
  LineChartOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import { Stock } from '../Types/stock.types'
import { StockLevelBadge } from './StockLevelBadge'
import { formatStock } from '@/Utils/helpers'
import { useStockTableLogic } from '../Hooks/useStockTableLogic'

interface StockTableProps {
  stocks: Stock[]
  loading: boolean
  onEdit: (stock: Stock) => void
  onDelete: (id: number) => void
  onSoftDelete: (id: number) => void
  onHardDelete: (id: number) => void
  onReactivate: (id: number) => void
  onAdjust: (stock: Stock) => void
  onUse: (stock: Stock) => void
  onViewHistory: (stock: Stock) => void
}

export const StockTable: React.FC<StockTableProps> = ({
  stocks,
  loading,
  onEdit,
  onDelete,
  onSoftDelete,
  onHardDelete,
  onReactivate,
  onAdjust,
  onUse,
  onViewHistory,
}) => {
  const {
    advancedModalStock,
    setAdvancedModalStock,
    deleteStockId,
    setDeleteStockId,
    getStockStatus,
    handleDeleteConfirm,
    handleAdvancedDelete,
    handleStandardDelete,
    handleSoftDeleteAction,
    handleReactivateAction,
    handleHardDeleteAction
  } = useStockTableLogic({ onDelete, onSoftDelete, onHardDelete, onReactivate })

  const columns: ColumnsType<Stock> = [
    {
      title: '📦 Ürün',
      key: 'name',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <Space size={12}>
          <Avatar 
            shape="rounded"
            style={{ backgroundColor: '#e6f7ff', color: '#1890ff', fontWeight: 'bold' }}
          >
            {record.name.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Text strong style={{ fontSize: 13, display: 'block' }}>{record.name}</Text>
            {record.description && (
              <Text type="secondary" style={{ fontSize: 11 }} ellipsis={{ tooltip: record.description }}>
                {record.description}
              </Text>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: '🏷️ Marka',
      dataIndex: 'brand',
      key: 'brand',
      width: 120,
      render: (brand) => brand ? <Tag color="blue">{brand}</Tag> : <Text type="secondary">-</Text>
    },
    {
      title: '🗂️ Kategori',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (cat) => <Tag color="cyan">{cat}</Tag>
    },
    {
      title: '🔢 Mevcut Stok',
      key: 'current_stock',
      width: 180,
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>
            {formatStock(
              record.current_stock,
              record.unit,
              record.has_sub_unit,
              record.current_sub_stock,
              record.sub_unit_name
            )}
          </Text>
          {record.has_sub_unit && (
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
              Toplam: {record.total_base_units} {record.sub_unit_name}
            </div>
          )}
        </div>
      )
    },
    {
      title: '⚡ Durum',
      key: 'status',
      width: 120,
      align: 'center',
      render: (_, record) => <StockLevelBadge stock={record} />
    },
    {
      title: '📉 Min',
      dataIndex: 'min_stock_level',
      key: 'min_stock_level',
      width: 80,
      align: 'center',
    },
    {
      title: '⚠️ Kritik',
      dataIndex: 'critical_stock_level',
      key: 'critical_stock_level',
      width: 80,
      align: 'center',
      render: (val) => <Text type="danger" strong>{val}</Text>
    },
    {
      title: '💸 Birim Fiyat',
      dataIndex: 'purchase_price',
      key: 'purchase_price',
      width: 120,
      align: 'right',
      render: (val, record) => <Text style={{ color: '#52c41a' }}>{val} {record.currency || 'TRY'}</Text>
    },
    {
      title: '💰 Toplam Değer',
      key: 'total_value',
      width: 130,
      align: 'right',
      render: (_, record) => <Text strong>{(record.purchase_price * record.current_stock).toLocaleString()} {record.currency || 'TRY'}</Text>
    },
    {
      title: '📅 S.K.T',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      width: 120,
      align: 'center',
      render: (date, record) => {
        if (!date) return <Text type="secondary">-</Text>
        const days = dayjs(date).diff(dayjs(), 'day')
        let color = 'inherit'
        if (days < 0) color = '#cf1322' // Geçmiş
        else if (days <= (record.expiry_red_days || 15)) color = '#ff4d4f' // Kritik
        else if (days <= (record.expiry_yellow_days || 30)) color = '#faad14' // Uyarı

        return (
          <Tooltip title={`${days < 0 ? 'Geçti' : `${days} gün kaldı`}`}>
            <span style={{ color, fontWeight: days <= (record.expiry_yellow_days || 30) ? 'bold' : 'normal' }}>
              {dayjs(date).format('DD/MM/YYYY')}
            </span>
          </Tooltip>
        )
      }
    },
    {
      title: '🏪 Tedarikçi',
      key: 'supplier',
      width: 150,
      render: (_, record) => record.supplier?.name || <Text type="secondary">-</Text>
    },
    {
      title: '🏥 Klinik',
      key: 'clinic',
      width: 150,
      render: (_, record) => record.clinic?.name || <Text type="secondary">-</Text>
    },
    {
      title: '⚙️',
      key: 'actions',
      width: 60,
      fixed: 'right',
      align: 'center',
      render: (_, record) => {
        const status = getStockStatus(record)
        const isInactive = status.type === 'inactive'
        
        const menuItems: MenuProps['items'] = [
          {
            key: 'history',
            label: 'Rapor / Geçmiş',
            icon: <LineChartOutlined />,
            onClick: () => onViewHistory(record)
          },
          {
            type: 'divider'
          },
          {
            key: 'use',
            label: 'Stok Kullan',
            icon: <MinusOutlined />,
            onClick: () => onUse(record),
            disabled: isInactive || record.current_stock <= 0
          },
          {
            key: 'adjust',
            label: 'Stok Ayarla',
            icon: <PlusOutlined />,
            onClick: () => onAdjust(record),
            disabled: isInactive
          },
          {
            type: 'divider'
          },
          {
            key: 'edit',
            label: 'Düzenle',
            icon: <EditOutlined />,
            onClick: () => onEdit(record)
          },
          {
            key: 'delete-standard',
            label: 'Sil (Güvenli)',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleDeleteConfirm(record.id)
          },
          {
            key: 'delete-options',
            label: 'Gelişmiş Seçenekler',
            icon: <MoreOutlined />,
            onClick: () => handleAdvancedDelete(record)
          }
        ]

        return (
          <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow trigger={['click']}>
            <Button 
              type="text" 
              shape="circle" 
              icon={<MoreOutlined style={{ fontSize: 20 }} />} 
            />
          </Dropdown>
        )
      },
    },
  ]

  return (
    <>
    <Table
      columns={columns}
      scroll={{ x: 1800 }}
      dataSource={stocks}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Toplam ${total} ürün`,
      }}
      size="small"
      onRow={(record) => {
        const isInactive = record.is_active === false
        return {
          style: {
            backgroundColor: isInactive ? '#fafafa' : '#fff',
            cursor: 'pointer',
            borderLeft: isInactive ? '3px solid #faad14' : 'none'
          },
          onClick: () => onViewHistory(record)
        }
      }}
      className="premium-table"
      style={{ borderRadius: '8px', overflow: 'hidden' }}
    />

    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ExclamationCircleOutlined style={{ color: '#faad14' }} />
          <span>Gelişmiş Durum & Güvenlik İşlemleri</span>
        </div>
      }
      open={!!advancedModalStock}
      onCancel={() => setAdvancedModalStock(null)}
      footer={null}
      width={500}
      destroyOnHidden
    >
      {advancedModalStock && (
        <div>
          <p><strong>Stok:</strong> {advancedModalStock.name}</p>
          <p><strong>Mevcut Durum:</strong> {
             advancedModalStock.status === 'deleted' ? '🗑️ Silinmiş' : 
             advancedModalStock.is_active === false ? '⏸️ Pasif' : 
             '✅ Aktif'
          }</p>
          
          <div style={{ background: '#fff1f0', padding: 12, borderRadius: 6, margin: '16px 0' }}>
            <p style={{ margin: 0, fontSize: 13, color: '#cf1322' }}>
              <strong>⚠️ Zorla Silme (Force Delete):</strong><br/>
              İşlem geçmişi olan stokları bile zorla siler. Raporlarda tutarsızlığa neden olabilir.
            </p>
          </div>

          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setAdvancedModalStock(null)}>İptal</Button>
            
            {advancedModalStock.is_active !== false && advancedModalStock.status !== 'deleted' && (
              <Button 
                icon={<PauseOutlined />}
                onClick={handleSoftDeleteAction}
              >
                Pasife Al
              </Button>
            )}

            {advancedModalStock.is_active === false && advancedModalStock.status !== 'deleted' && (
              <Button 
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={handleReactivateAction}
              >
                Aktif Et
              </Button>
            )}

            {advancedModalStock.status !== 'deleted' && (
              <Button 
                type="primary" 
                danger 
                icon={<StopOutlined />}
                onClick={handleHardDeleteAction}
              >
                Zorla Sil
              </Button>
            )}
          </Space>
        </div>
      )}
    </Modal>

    <Modal
      title="Stoku Silmek İstediğinize Emin Misiniz?"
      open={!!deleteStockId}
      onCancel={() => setDeleteStockId(null)}
      okText="Evet, Sil"
      cancelText="İptal"
      okButtonProps={{ danger: true }}
      onOk={handleStandardDelete}
    >
      <p>Bu işlem, stok kullanım geçmişine göre ürünü ya tamamen siler ya da otomatik olarak pasife alır.</p>
    </Modal>
    </>
  )
}
