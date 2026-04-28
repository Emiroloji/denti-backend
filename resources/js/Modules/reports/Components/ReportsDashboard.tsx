// src/modules/reports/Components/ReportsDashboard.tsx

import React, { useState, useCallback, useMemo } from 'react'
import { 
  Row, 
  Col, 
  Card, 
  Tabs, 
  Statistic, 
  Space, 
  Button, 
  Alert,
  Badge,
  Tooltip,
  Divider,
  Skeleton,
  Typography
} from 'antd'

const { Text } = Typography
import { 
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  DashboardOutlined,
  ReloadOutlined,
  DownloadOutlined,
  SettingOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

// Import components
import DateRangeFilter from './filters/DateRangeFilter'
import ClinicFilter from './filters/ClinicFilter'
import CategoryChart from './charts/CategoryChart'
import TrendChart from './charts/TrendChart'
import { StockForecastCards } from './charts/StockForecastCards'

// Import hooks
import { useAllStockReports, useStockStatusSummary } from '../Hooks/useStockReports'
import { useSupplierSummaryStats } from '../Hooks/useSupplierReports'
import { useClinicSummaryStats } from '../Hooks/useClinicReports'

// Import types
import type { ReportFilter } from '../Types/reports.types'

// =============================================================================
// INTERFACES
// =============================================================================

interface ReportsDashboardProps {
  defaultFilters?: Partial<ReportFilter>
  showFilters?: boolean
  compactMode?: boolean
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ReportsDashboard: React.FC<ReportsDashboardProps> = ({
  defaultFilters,
  showFilters = true,
  compactMode = false
}) => {
  const [filters, setFilters] = useState<Partial<ReportFilter>>(() => ({
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    ...defaultFilters
  }))
  
  const [activeTab, setActiveTab] = useState('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // =============================================================================
  // DATA HOOKS
  // =============================================================================

  const { 
    summary: stockSummaryData,
    movements: stockMovements,
    levels: stockLevels,
    isLoading: stockLoading,
    error: stockError,
    refetch: refetchStock 
  } = useAllStockReports(filters)

  // Use the specific summary hook for quick stats if needed, or just use from all reports
  const { 
    data: stockSummary,
    isLoading: summaryLoading
  } = useStockStatusSummary(filters)

  const { 
    data: supplierStats, 
    isLoading: supplierLoading 
  } = useSupplierSummaryStats(filters)

  const { 
    data: clinicStats, 
    isLoading: clinicLoading 
  } = useClinicSummaryStats(filters)

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const dashboardStats = useMemo(() => {
    // Priority: stockSummary hook, then stockSummaryData from allReports, then defaults
    const summary = stockSummary || stockSummaryData
    
    if (!summary) return {
      totalStocks: 0,
      normalStocks: 0,
      lowStocks: 0,
      criticalStocks: 0,
      outOfStock: 0,
      healthPercentage: 0,
      totalValue: 0,
      totalBaseQuantity: 0
    }

    return {
      totalStocks: summary.total || 0,
      normalStocks: summary.normal || 0,
      lowStocks: summary.low || 0,
      criticalStocks: summary.critical || 0,
      outOfStock: summary.outOfStock || 0,
      healthPercentage: summary.total > 0 
        ? Math.round((summary.normal / summary.total) * 100) 
        : 0,
      totalValue: summary.total_value || 0,
      totalBaseQuantity: summary.total_base_quantity || 0
    }
  }, [stockSummary, stockSummaryData])

  const filterSummary = useMemo(() => {
    const startDate = filters.startDate ? dayjs(filters.startDate).format('DD.MM.YYYY') : ''
    const endDate = filters.endDate ? dayjs(filters.endDate).format('DD.MM.YYYY') : ''
    const dateRange = startDate && endDate ? `${startDate} - ${endDate}` : 'Tüm zamanlar'
    
    const clinicCount = filters.clinicIds?.length || 0
    const clinicText = clinicCount === 0 ? 'Tüm klinikler' : 
                     clinicCount === 1 ? '1 klinik' : 
                     `${clinicCount} klinik`

    return { dateRange, clinicText, clinicCount }
  }, [filters])

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleFilterChange = useCallback((newFilters: Partial<ReportFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const handleRefreshAll = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        refetchStock()
      ])
    } finally {
      setTimeout(() => setIsRefreshing(false), 1500)
    }
  }

  const handleExport = () => {
    // Export functionality will be implemented
    console.log('Export dashboard data')
  }

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderQuickStats = () => {
    const stats = [
      {
        title: 'Depo Değeri',
        value: dashboardStats.totalValue,
        suffix: '₺',
        color: '#722ed1',
        icon: <PieChartOutlined />,
        precision: 2
      },
      {
        title: 'Toplam Kapasite (Birim)',
        value: dashboardStats.totalBaseQuantity,
        suffix: 'birim',
        color: '#1890ff',
        icon: <BarChartOutlined />
      },
      {
        title: 'Stok Kalemi',
        value: dashboardStats.totalStocks,
        suffix: 'kalem',
        color: '#13c2c2',
        icon: <DashboardOutlined />
      },
      {
        title: 'Düşük/Kritik Stok',
        value: dashboardStats.lowStocks + dashboardStats.criticalStocks,
        suffix: 'uyarı',
        color: '#f5222d',
        icon: <Badge status="error" />
      }
    ]

    return (
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col xs={12} sm={6} key={index}>
            <Card size="small" className="premium-card" style={{ borderRadius: 12 }}>
              <Skeleton loading={summaryLoading} active avatar={false} paragraph={{ rows: 1 }}>
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.icon}
                  precision={stat.precision || 0}
                  valueStyle={{ color: stat.color, fontSize: compactMode ? '20px' : '24px', fontWeight: 'bold' }}
                />
              </Skeleton>
            </Card>
          </Col>
        ))}
      </Row>
    )
  }

  const renderFilterSection = () => {
    if (!showFilters) return null

    return (
      <Card 
        title="Filtreler" 
        size="small" 
        style={{ marginBottom: 24 }}
        extra={
          <Space>
            <Tooltip title="Tüm verileri yenile">
              <Button
                icon={<ReloadOutlined spin={isRefreshing} />}
                onClick={handleRefreshAll}
                loading={isRefreshing}
                size="small"
              >
                Yenile
              </Button>
            </Tooltip>
            <Tooltip title="Raporu dışa aktar">
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExport}
                size="small"
              >
                Dışa Aktar
              </Button>
            </Tooltip>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <DateRangeFilter
              value={filters}
              onChange={handleFilterChange}
              showPresets={true}
              maxDays={365}
            />
          </Col>
          <Col xs={24} lg={12}>
            <ClinicFilter
              value={filters}
              onChange={handleFilterChange}
              allowMultiple={true}
              groupBySpecialty={true}
              showStatistics={true}
            />
          </Col>
        </Row>

        {/* Filter Summary */}
        <Divider style={{ margin: '16px 0 8px 0' }} />
        <Skeleton loading={summaryLoading} active paragraph={{ rows: 1 }} title={false}>
          <Space split={<Divider type="vertical" />}>
            <span>
              <InfoCircleOutlined style={{ marginRight: 4 }} />
              <strong>Tarih:</strong> {filterSummary.dateRange}
            </span>
            <span>
              <strong>Klinik:</strong> {filterSummary.clinicText}
            </span>
            <span>
              <strong>Sağlık Oranı:</strong>{' '}
              <span style={{ 
                color: dashboardStats.healthPercentage > 80 ? '#52c41a' : 
                       dashboardStats.healthPercentage > 60 ? '#faad14' : '#f5222d' 
              }}>
                %{dashboardStats.healthPercentage}
              </span>
            </span>
          </Space>
        </Skeleton>
      </Card>
    )
  }

  const renderOverviewTab = () => (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <TrendChart 
            filters={filters} 
            height={300} 
          />
        </Col>
        <Col xs={24} lg={8}>
          <StockForecastCards />
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <CategoryChart
            height={350}
          />
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title="Hızlı İşlemler & Durum" 
            style={{ height: '100%', borderRadius: 12 }}
            className="premium-card"
          >
            <div style={{ padding: '20px 0' }}>
              <Statistic
                title="Sistem Sağlık Oranı"
                value={dashboardStats.healthPercentage}
                suffix="%"
                valueStyle={{ 
                  color: dashboardStats.healthPercentage > 80 ? '#52c41a' : 
                         dashboardStats.healthPercentage > 60 ? '#faad14' : '#f5222d',
                  fontSize: 48,
                  fontWeight: 'bold'
                }}
              />
              <Text type="secondary">
                Normal stok seviyesindeki ürünlerin toplam ürün sayısına oranı.
              </Text>
              <Divider />
              <Button type="primary" block icon={<LineChartOutlined />} onClick={() => setActiveTab('trend')}>
                Detaylı Analize Git
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </Space>
  )

  const renderStockTab = () => (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <TrendChart
          filters={filters}
          height={400}
        />
      </Col>
      <Col span={24}>
        <Card title="Stok Seviye Analizi" size="small" className="premium-card" style={{ borderRadius: 12 }}>
          <Skeleton loading={stockLoading} active paragraph={{ rows: 1 }}>
            {(dashboardStats || stockMovements) ? (
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Normal Seviye"
                    value={dashboardStats.normalStocks}
                    suffix="kalem"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Düşük Seviye"
                    value={dashboardStats.lowStocks}
                    suffix="kalem"
                    valueStyle={{ color: '#faad14' }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Kritik Seviye"
                    value={dashboardStats.criticalStocks}
                    suffix="kalem"
                    valueStyle={{ color: '#f5222d' }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Toplam Hareket"
                    value={stockMovements?.purchase?.count || 0}
                    suffix="alış"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
              </Row>
            ) : (
              <Alert message="Veri bulunamadı." type="info" />
            )}
          </Skeleton>
        </Card>
      </Col>
    </Row>
  )

  const renderCategoryTab = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={16}>
        <CategoryChart height={450} />
      </Col>
      <Col xs={24} lg={8}>
        <StockForecastCards />
      </Col>
    </Row>
  )

  const renderTrendTab = () => (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <TrendChart
          filters={filters}
          height={500}
        />
      </Col>
      <Col xs={24} lg={12}>
        <Card title="Tedarikçi Özeti" size="small">
          <Skeleton loading={supplierLoading} active paragraph={{ rows: 3 }}>
            {supplierStats && (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Statistic
                  title="Toplam Tedarikçi"
                  value={supplierStats.totalSuppliers || 0}
                  suffix="firma"
                />
                <Statistic
                  title="Ortalama Kalite"
                  value={supplierStats.avgQualityRating || 0}
                  suffix="/5"
                  precision={1}
                />
                <Statistic
                  title="Ortalama Teslimat"
                  value={supplierStats.avgDeliveryTime || 0}
                  suffix="gün"
                  precision={1}
                />
              </Space>
            )}
          </Skeleton>
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card title="Klinik Özeti" size="small">
          <Skeleton loading={clinicLoading} active paragraph={{ rows: 3 }}>
            {clinicStats && (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Statistic
                  title="Toplam Klinik"
                  value={clinicStats.totalClinics || 0}
                  suffix="klinik"
                />
                <Statistic
                  title="Toplam Tüketim"
                  value={clinicStats.totalConsumption || 0}
                  suffix="adet"
                />
                <Statistic
                  title="Ortalama Verimlilik"
                  value={clinicStats.avgEfficiency || 0}
                  suffix="%"
                  precision={1}
                />
              </Space>
            )}
          </Skeleton>
        </Card>
      </Col>
    </Row>
  )

  // =============================================================================
  // RENDER
  // =============================================================================

  // Error boundary handles errors now, but we keep this as secondary fallback
  if (stockError) {
    return (
      <Alert
        message="Dashboard verileri yüklenemedi"
        description={stockError.message}
        type="error"
        showIcon
        action={
          <Button onClick={handleRefreshAll}>
            Tekrar Dene
          </Button>
        }
      />
    )
  }

  return (
    <div style={{ padding: compactMode ? 16 : 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <DashboardOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <span style={{ fontSize: 20, fontWeight: 'bold' }}>
              Raporlar Dashboard
            </span>
          </Space>
          <Space>
            <Button
              icon={<SettingOutlined />}
              onClick={() => console.log('Settings')}
            >
              Ayarlar
            </Button>
          </Space>
        </Space>
      </div>

      {/* Quick Stats */}
      {renderQuickStats()}

      {/* Filters */}
      {renderFilterSection()}

      {/* Main Content */}
      <Card bodyStyle={{ padding: compactMode ? 16 : 24 }}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          type="card"
          size={compactMode ? 'small' : 'large'}
          items={[
            {
              key: 'overview',
              label: (
                <span>
                  <DashboardOutlined />
                  Genel Bakış
                </span>
              ),
              children: renderOverviewTab()
            },
            {
              key: 'stock',
              label: (
                <span>
                  <BarChartOutlined />
                  Stok Analizi
                </span>
              ),
              children: renderStockTab()
            },
            {
              key: 'category',
              label: (
                <span>
                  <PieChartOutlined />
                  Kategori Analizi
                </span>
              ),
              children: renderCategoryTab()
            },
            {
              key: 'trend',
              label: (
                <span>
                  <LineChartOutlined />
                  Trend Analizi
                </span>
              ),
              children: renderTrendTab()
            }
          ]}
        />
      </Card>
    </div>
  )
}

export default ReportsDashboard
