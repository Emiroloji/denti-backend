// src/modules/reports/Components/charts/TrendChart.tsx

import React, { useState, useMemo } from 'react'
import { 
  Card, 
  Select, 
  Space, 
  Button, 
  Statistic, 
  Spin, 
  Empty,
  Typography
} from 'antd'
import { 
  AreaChartOutlined, 
  RiseOutlined,
  FallOutlined,
  SyncOutlined
} from '@ant-design/icons'
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts'
import { useStockTrends } from '../../Hooks/useStockReports'
import type { ReportFilter } from '../../Types/reports.types'
import dayjs from 'dayjs'

const { Option } = Select
const { Text } = Typography

interface TrendChartProps {
  filters?: ReportFilter
  height?: number
}

export const TrendChart: React.FC<TrendChartProps> = ({
  filters,
  height = 350
}) => {
  const [period, setPeriod] = useState<'day' | 'month'>('day')
  
  const { data: trends, isLoading, refetch } = useStockTrends({ ...filters, period })

  const stats = useMemo(() => {
    if (!trends || trends.length < 2) return null
    const latest = trends[trends.length - 1]
    const previous = trends[trends.length - 2]
    
    const diff = latest.total_quantity - previous.total_quantity
    const percent = previous.total_quantity > 0 ? (diff / previous.total_quantity) * 100 : 0
    
    return {
      latest: latest.total_quantity,
      count: latest.transaction_count,
      percent: percent.toFixed(1),
      isRise: diff >= 0
    }
  }, [trends])

  return (
    <Card 
      title={
        <Space>
          <AreaChartOutlined style={{ color: '#1890ff' }} />
          <span>Kullanım Trendleri</span>
        </Space>
      }
      extra={
        <Space>
          <Select value={period} onChange={setPeriod} size="small" style={{ width: 100 }}>
            <Option value="day">Günlük</Option>
            <Option value="month">Aylık</Option>
          </Select>
          <Button 
            size="small" 
            type="text" 
            icon={<SyncOutlined spin={isLoading} />} 
            onClick={() => refetch()} 
          />
        </Space>
      }
      className="premium-card"
      style={{ borderRadius: 12 }}
    >
      {stats && (
        <div style={{ marginBottom: 24, display: 'flex', gap: 48 }}>
          <Statistic
            title="Son Dönem Tüketim"
            value={stats.latest}
            suffix="birim"
            precision={0}
            valueStyle={{ color: '#1890ff', fontSize: 24 }}
          />
          <Statistic
            title="Değişim"
            value={Math.abs(Number(stats.percent))}
            prefix={stats.isRise ? <RiseOutlined /> : <FallOutlined />}
            suffix="%"
            valueStyle={{ color: stats.isRise ? '#52c41a' : '#ff4d4f' }}
          />
          <Statistic
            title="İşlem Sayısı"
            value={stats.count}
            valueStyle={{ fontSize: 20 }}
          />
        </div>
      )}

      <div style={{ width: '100%', height }}>
        {isLoading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spin />
          </div>
        ) : trends && trends.length > 0 ? (
          <ResponsiveContainer>
            <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorQty" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1890ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#1890ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="period" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#8c8c8c' }}
                tickFormatter={(val) => period === 'day' ? dayjs(val).format('DD MMM') : dayjs(val).format('MMM YYYY')}
              />
              <YAxis 
                hide 
              />
              <RechartsTooltip 
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: number, name: string) => [
                  value, 
                  name === 'total_quantity' ? 'Toplam Tüketim' : 'İşlem Sayısı'
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="total_quantity" 
                stroke="#1890ff" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorQty)" 
              />
              <Area 
                type="monotone" 
                dataKey="transaction_count" 
                stroke="#52c41a" 
                strokeWidth={2}
                fill="transparent"
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <Empty description="Bu döneme ait trend verisi bulunamadı." />
        )}
      </div>
    </Card>
  )
}

export default TrendChart