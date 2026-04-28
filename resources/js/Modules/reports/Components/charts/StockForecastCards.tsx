// src/modules/reports/Components/charts/StockForecastCards.tsx

import React from 'react'
import { Card, List, Badge, Typography, Space, Progress, Tooltip, Empty, Spin } from 'antd'
import { useStockForecast } from '../../Hooks/useStockReports'
import { ClockCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons'

const { Text, Title } = Typography

export const StockForecastCards: React.FC = () => {
  const { data: forecast, isLoading } = useStockForecast()

  if (isLoading) {
    return (
      <Card style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin tip="Tahminlemeler hesaplanıyor..." />
      </Card>
    )
  }

  // En kritik 5 tahmini alalım
  const criticalForecasts = (forecast || [])
    .sort((a, b) => a.estimated_days_left - b.estimated_days_left)
    .slice(0, 5)

  const getStatusColor = (days: number) => {
    if (days <= 0) return '#ff4d4f' // Kritik bitti
    if (days < 3) return '#ff4d4f' // Kritik az kaldı
    if (days < 7) return '#faad14' // Uyarı
    return '#52c41a' // Güvenli
  }

  return (
    <Card 
      title={
        <Space>
          <ClockCircleOutlined style={{ color: '#1890ff' }} />
          <span>Akıllı Stok Ömür Tahmini</span>
          <Tooltip title="Son 30 günlük ortalama tüketiminize göre stoklarınızın ne kadar yeteceği hesaplanmıştır.">
            <InfoCircleOutlined style={{ color: '#bfbfbf', fontSize: 13 }} />
          </Tooltip>
        </Space>
      }
      extra={<Text type="secondary" style={{ fontSize: 12 }}>Son 30 Gün Analizi</Text>}
      className="premium-card"
      style={{ height: '100%', borderRadius: 12 }}
    >
      {criticalForecasts.length > 0 ? (
        <List
          itemLayout="vertical"
          dataSource={criticalForecasts}
          renderItem={(item) => {
            const color = getStatusColor(item.estimated_days_left)
            const percent = Math.min(100, (item.estimated_days_left / 30) * 100)
            
            return (
              <List.Item style={{ padding: '12px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text strong>{item.name}</Text>
                  <Badge 
                    count={item.estimated_days_left <= 0 ? 'BİTTİ!' : `${item.estimated_days_left} gün`} 
                    style={{ backgroundColor: color }}
                  />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <Progress 
                      percent={percent} 
                      showInfo={false} 
                      strokeColor={color} 
                      size="small" 
                    />
                  </div>
                  <Tooltip title={`Günlük ortalama ${item.avg_daily_usage} adet tüketiliyor`}>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {item.avg_daily_usage.toFixed(2)} / gün
                    </Text>
                  </Tooltip>
                </div>
                
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Mevcut Stok: <Text strong style={{ fontSize: 11 }}>{item.current_stock}</Text> birim
                  </Text>
                </div>
              </List.Item>
            )
          }}
        />
      ) : (
        <Empty description="Tahminleme için yetersiz veri veya tüm stoklar güvenli seviyede." />
      )}
      
      {criticalForecasts.length > 0 && (
        <div style={{ marginTop: 16, background: '#f5f5f5', padding: 8, borderRadius: 6, display: 'flex', gap: 8, alignItems: 'start' }}>
          <ExclamationCircleOutlined style={{ color: '#faad14', marginTop: 2 }} />
          <Text style={{ fontSize: 11 }}>
            Yukarıdaki ürünlerin tüketim hızı stok giriş hızınızdan yüksek. 
            <Text strong style={{ fontSize: 11 }}> Kritik limitleri gözden geçirmeniz önerilir.</Text>
          </Text>
        </div>
      )}
    </Card>
  )
}
