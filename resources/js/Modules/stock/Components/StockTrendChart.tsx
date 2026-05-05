import React, { useState, useMemo } from 'react'
import { 
  Card, 
  DatePicker, 
  Select, 
  Space, 
  Button,
  Typography
} from 'antd'
import { 
  ReloadOutlined,
  LineChartOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import { 
  Area, 
  AreaChart, 
  Line, 
  LineChart,
  Bar, 
  BarChart,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  Legend, 
  ResponsiveContainer, 
  ComposedChart,
  Cell
} from 'recharts'
import dayjs from 'dayjs'
import { useStockTransactions } from '../Hooks/useStocks'

const { RangePicker } = DatePicker
const { Option } = Select
const { Text } = Typography

interface StockTrendChartProps {
  stockId: number
  productName?: string
  transactions?: any[] // Backward compatibility
}

export const StockTrendChart: React.FC<StockTrendChartProps> = ({ 
  stockId, 
  productName,
  transactions: propTransactions // For backward compatibility
}) => {
  const [filters, setFilters] = useState({
    date_from: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    date_to: dayjs().format('YYYY-MM-DD')
  })
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar' | 'composed'>('area')

  // Use prop transactions if provided, otherwise fetch from API
  const { 
    data: apiTransactions, 
    isLoading: isApiLoading, 
    refetch 
  } = useStockTransactions(stockId, stockId && propTransactions === undefined ? filters : {})
  
  const transactions = propTransactions !== undefined ? propTransactions : apiTransactions?.data
  const isLoading = propTransactions === undefined ? isApiLoading : false

  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return []

    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
    )

    // Her bir partinin (batch) o andaki seviyesini tutacak bir harita
    const batchLevels: { [key: number]: number } = {}
    const dailyData = new Map()

    // İlk işlemden hemen öncesi için bir başlangıç noktası
    if (sortedTransactions.length > 0) {
      dailyData.set('start', {
        date: dayjs(sortedTransactions[0].transaction_date).subtract(1, 'day').format('DD/MM'),
        stockLevel: 0,
        change: 0,
        transactionType: 'Başlangıç',
        transactionCount: 0
      })
    }

    sortedTransactions.forEach(transaction => {
      const date = dayjs(transaction.transaction_date).format('DD/MM')
      const batchId = transaction.stock_id
      
      const isPositive = ['purchase', 'adjustment_increase', 'transfer_in', 'returned', 'in'].includes(transaction.type)
      const change = isPositive ? transaction.quantity : -transaction.quantity
      
      // Bu partinin yeni seviyesini güncelle (Eğer new_stock varsa onu kullan, yoksa üzerine ekle)
      batchLevels[batchId] = transaction.new_stock !== undefined ? transaction.new_stock : ((batchLevels[batchId] || 0) + change)

      // Tüm partilerin o andaki toplamını hesapla
      const totalProductStock = Object.values(batchLevels).reduce((sum, val) => sum + val, 0)

      if (!dailyData.has(date)) {
        dailyData.set(date, {
          date,
          stockLevel: totalProductStock,
          change: change,
          transactionType: transaction.type_text || transaction.type,
          transactionCount: 1
        })
      } else {
        const existing = dailyData.get(date)
        dailyData.set(date, {
          ...existing,
          stockLevel: totalProductStock, // Gün sonundaki toplam seviye
          change: existing.change + change,
          transactionCount: existing.transactionCount + 1
        })
      }
    })

    const result = Array.from(dailyData.values())
    // Eğer sadece başlangıç ve tek gün varsa çizgiyi uzatmak için bugünü ekle
    if (result.length === 2) {
       result.push({ ...result[1], date: 'Bugün' })
    }
    return result
  }, [transactions])

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setFilters({
        date_from: dates[0].format('YYYY-MM-DD'),
        date_to: dates[1].format('YYYY-MM-DD')
      })
    }
  }

  const handleRefresh = () => {
    if (refetch) refetch()
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div style={{ 
          backgroundColor: 'white', 
          border: '1px solid #d9d9d9', 
          borderRadius: '6px',
          padding: '10px'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{`Tarih: ${label}`}</p>
          <p style={{ margin: 0, color: '#1890ff' }}>{`Stok Seviyesi: ${data.stockLevel}`}</p>
          <p style={{ margin: 0, color: data.change >= 0 ? '#52c41a' : '#ff4d4f' }}>
            {`Değişim: ${data.change >= 0 ? '+' : ''}${data.change}`}
          </p>
          <p style={{ margin: 0, color: '#666' }}>{`İşlem Sayısı: ${data.transactionCount}`}</p>
        </div>
      )
    }
    return null
  }

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    }

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="stockLevel" 
                stroke="#1890ff" 
                strokeWidth={2}
                name="Stok Seviyesi"
                dot={{ fill: '#1890ff', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="stockLevel" 
                fill="#1890ff" 
                name="Stok Seviyesi"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )
      
      case 'composed':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="change" 
                name="Stok Değişimi"
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.change >= 0 ? '#52c41a' : '#ff4d4f'} />
                ))}
              </Bar>
              <Line 
                type="monotone" 
                dataKey="stockLevel" 
                stroke="#1890ff" 
                strokeWidth={2}
                name="Stok Seviyesi"
                dot={{ fill: '#1890ff', r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )
      
      default: // area
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart {...commonProps}>
              <defs>
                <linearGradient id="colorStok" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1890ff" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#1890ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="stockLevel" 
                stroke="#1890ff" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorStok)" 
                name="Stok Seviyesi"
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )
    }
  }

  // Backward compatibility mode - no controls
  if (propTransactions !== undefined) {
    return (
      <div style={{ height: 350, width: '100%', marginTop: 24, position: 'relative' }}>
        {isLoading ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>Yükleniyor...</div>
        ) : chartData.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <Text type="secondary">Bu ürün için henüz işlem geçmişi bulunmuyor.</Text>
          </div>
        ) : (
          renderChart()
        )}
      </div>
    )
  }

  // Full featured mode with controls
  return (
    <Card 
      title={
        <Space>
          <LineChartOutlined />
          <span>Stok Değişim Trendi</span>
          {productName && <span style={{ color: '#666' }}>- {productName}</span>}
        </Space>
      }
      extra={
        <Space>
          <RangePicker 
            defaultValue={[
              dayjs().subtract(30, 'day'),
              dayjs()
            ]}
            onChange={handleDateRangeChange}
            style={{ width: 200 }}
          />
          <Select
            value={chartType}
            onChange={setChartType}
            style={{ width: 120 }}
          >
            <Option value="area">
              <Space>
                <LineChartOutlined />
                Alan
              </Space>
            </Option>
            <Option value="line">
              <Space>
                <LineChartOutlined />
                Çizgi
              </Space>
            </Option>
            <Option value="bar">
              <Space>
                <BarChartOutlined />
                Çubuk
              </Space>
            </Option>
            <Option value="composed">
              <Space>
                <LineChartOutlined />
                <BarChartOutlined />
                Kombine
              </Space>
            </Option>
          </Select>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={isLoading}
          >
            Yenile
          </Button>
        </Space>
      }
      size="small"
    >
      {chartData.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: '#666'
        }}>
          <LineChartOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
          <div>Bu tarih aralığında işlem geçmişi bulunamadı</div>
        </div>
      ) : (
        renderChart()
      )}
    </Card>
  )
}
