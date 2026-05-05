// src/modules/stock/Components/StockStats.tsx

import React from 'react'
import { Card, Row, Col, Statistic } from 'antd'
import { 
  DatabaseOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  DollarOutlined
} from '@ant-design/icons'

interface StockStatsData {
  total_items: number
  low_stock_items: number
  critical_stock_items: number
  low_expiring_items: number
  critical_expiring_items: number
  total_value: number
}

interface StockStatsProps {
  stats: StockStatsData | null
}

export const StockStats: React.FC<StockStatsProps> = ({ stats }) => {
  if (!stats) return null

  return (
    <div style={{ marginBottom: 24 }}>
      <Row gutter={[16, 16]}>
        <Col xs={12} md={4}>
          <Card styles={{ body: { padding: '16px' } }}>
            <Statistic 
              title="Toplam Ürün" 
              value={stats.total_items}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        
        <Col xs={12} md={4}>
          <Card 
            styles={{ body: { padding: '16px' } }}
            style={stats.low_stock_items > 0 ? { 
              border: '1px solid #faad14', 
              boxShadow: '0 0 8px rgba(250, 173, 20, 0.1)' 
            } : {}}
          >
            <Statistic 
              title="Düşük Seviye Stok" 
              value={stats.low_stock_items}
              styles={{ content: { color: '#faad14' } }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>

        <Col xs={12} md={4}>
          <Card 
            styles={{ body: { padding: '16px' } }}
            style={stats.low_expiring_items > 0 ? { 
              border: '1px solid #faad14', 
              boxShadow: '0 0 8px rgba(250, 173, 20, 0.1)',
              background: '#fffbe6'
            } : {}}
          >
            <Statistic 
              title="Düşük Seviye Miyat" 
              value={stats.low_expiring_items}
              styles={{ content: { color: '#d48806' } }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        
        <Col xs={12} md={4}>
          <Card 
            styles={{ body: { padding: '16px' } }}
            style={stats.critical_stock_items > 0 ? { 
              border: '1px solid #ff4d4f', 
              boxShadow: '0 0 8px rgba(255, 77, 79, 0.1)' 
            } : {}}
          >
            <Statistic 
              title="Kritik Seviye Stok" 
              value={stats.critical_stock_items}
              styles={{ content: { color: '#ff4d4f' } }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>

        <Col xs={12} md={4}>
          <Card 
            styles={{ body: { padding: '16px' } }}
            style={stats.critical_expiring_items > 0 ? { 
              border: '1px solid #ff4d4f', 
              boxShadow: '0 0 8px rgba(255, 77, 79, 0.1)',
              background: '#fff1f0'
            } : {}}
          >
            <Statistic 
              title="Kritik Seviye Miyat" 
              value={stats.critical_expiring_items}
              styles={{ content: { color: '#cf1322' } }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        
        <Col xs={12} md={4}>
          <Card styles={{ body: { padding: '16px' } }}>
            <Statistic 
              title="Toplam Değer" 
              value={stats.total_value}
              precision={2}
              suffix="TL"
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}