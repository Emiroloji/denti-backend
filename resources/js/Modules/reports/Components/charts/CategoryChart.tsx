// src/modules/reports/Components/charts/CategoryChart.tsx

import React, { useMemo } from 'react'
import { Card, Space, Button, Statistic, Spin, Empty, Typography, Tooltip as AntTooltip } from 'antd'
import { 
  PieChartOutlined, 
  SyncOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { useCategoryDistribution } from '../../Hooks/useStockReports'

const { Text } = Typography

const COLORS = [
  '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
  '#13c2c2', '#eb2f96', '#fa541c'
]

interface CategoryChartProps {
  height?: number
}

export const CategoryChart: React.FC<CategoryChartProps> = ({
  height = 350
}) => {
  const { data: categories, isLoading, refetch } = useCategoryDistribution()

  const totalValue = useMemo(() => {
    return categories?.reduce((sum, item) => sum + item.total_value, 0) || 0
  }, [categories])

  const totalItems = useMemo(() => {
    return categories?.reduce((sum, item) => sum + item.item_count, 0) || 0
  }, [categories])

  return (
    <Card 
      title={
        <Space>
          <PieChartOutlined style={{ color: '#722ed1' }} />
          <span>Kategori Bazlı Finansal Dağılım</span>
        </Space>
      }
      extra={
        <Button 
          size="small" 
          type="text" 
          icon={<SyncOutlined spin={isLoading} />} 
          onClick={() => refetch()} 
        />
      }
      className="premium-card"
      style={{ borderRadius: 12, height: '100%' }}
    >
      {isLoading ? (
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin />
        </div>
      ) : categories && categories.length > 0 ? (
        <>
          <div style={{ marginBottom: 24, display: 'flex', gap: 32 }}>
            <Statistic
              title="Toplam Stok Değeri"
              value={totalValue}
              suffix="₺"
              precision={2}
              valueStyle={{ color: '#722ed1', fontSize: 24 }}
            />
            <Statistic
              title="Ürün Çeşitliliği"
              value={totalItems}
              suffix="kalem"
              valueStyle={{ fontSize: 20 }}
            />
          </div>

          <div style={{ width: '100%', height: height - 100 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="total_value"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                >
                  {categories.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number, name: string, props: any) => [
                    `${value.toLocaleString()} ₺`,
                    `${name} (${props.payload.item_count} kalem)`
                  ]}
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div style={{ marginTop: 16, background: '#f9f0ff', padding: '8px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <InfoCircleOutlined style={{ color: '#722ed1' }} />
            <Text style={{ fontSize: 12, color: '#531dab' }}>
              Değer dağılımı, stok miktarı ile birim fiyatın çarpımı ile hesaplanmaktadır.
            </Text>
          </div>
        </>
      ) : (
        <Empty description="Kategori verisi bulunamadı." />
      )}
    </Card>
  )
}

export default CategoryChart