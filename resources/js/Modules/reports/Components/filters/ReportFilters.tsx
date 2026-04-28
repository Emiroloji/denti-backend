// src/modules/reports/Components/filters/ReportFilters.tsx

import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  Radio,
  Button,
  Space,
  Divider,
  Typography,
  Tag,
  Popover,
  Form,
  Input,
  message
} from 'antd'
import {
  CalendarOutlined,
  FilterOutlined,
  ClearOutlined,
  SaveOutlined,
  HistoryOutlined,
  SettingOutlined
} from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'
import type { ReportFilter } from '../../Types/reports.types'

const { RangePicker } = DatePicker
const { Title, Text } = Typography
const { Option } = Select

// Tarih aralığı preset'leri
interface DateRangePreset {
  label: string
  key: string
  startDate: string
  endDate: string
}

const DATE_PRESETS: DateRangePreset[] = [
  {
    label: 'Bugün',
    key: 'today',
    startDate: dayjs().startOf('day').format('YYYY-MM-DD'),
    endDate: dayjs().endOf('day').format('YYYY-MM-DD')
  },
  {
    label: 'Bu Hafta',
    key: 'thisWeek',
    startDate: dayjs().startOf('week').format('YYYY-MM-DD'),
    endDate: dayjs().endOf('week').format('YYYY-MM-DD')
  },
  {
    label: 'Bu Ay',
    key: 'thisMonth',
    startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs().endOf('month').format('YYYY-MM-DD')
  },
  {
    label: 'Geçen Ay',
    key: 'lastMonth',
    startDate: dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD')
  },
  {
    label: 'Son 30 Gün',
    key: 'last30Days',
    startDate: dayjs().subtract(30, 'days').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD')
  },
  {
    label: 'Son 3 Ay',
    key: 'last3Months',
    startDate: dayjs().subtract(3, 'months').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD')
  },
  {
    label: 'Bu Yıl',
    key: 'thisYear',
    startDate: dayjs().startOf('year').format('YYYY-MM-DD'),
    endDate: dayjs().endOf('year').format('YYYY-MM-DD')
  }
]

// Stok durumu seçenekleri
const STOCK_STATUS_OPTIONS = [
  { label: 'Tümü', value: 'all' },
  { label: 'Normal', value: 'normal' },
  { label: 'Düşük', value: 'low' },
  { label: 'Kritik', value: 'critical' },
  { label: 'Bitti', value: 'out_of_stock' }
]

// Mock data - Gerçek uygulamada API'den gelecek
const MOCK_CLINICS = [
  { id: 1, name: 'Ana Klinik' },
  { id: 2, name: 'Ortodonti Kliniği' },
  { id: 3, name: 'Pedodonti Kliniği' },
  { id: 4, name: 'Endodonti Kliniği' },
  { id: 5, name: 'Cerrahi Kliniği' }
]

const MOCK_SUPPLIERS = [
  { id: 1, name: 'MediCorp Sağlık' },
  { id: 2, name: 'Dental Tedarik A.Ş.' },
  { id: 3, name: 'ProDent Malzemeleri' },
  { id: 4, name: 'OrtoDent Sistemleri' },
  { id: 5, name: 'Endo Malzemeleri Ltd.' }
]

const MOCK_CATEGORIES = [
  'Dolgular',
  'Ortodonti',
  'Endodonti',
  'Periodoloji',
  'Cerrahi',
  'Anestezi',
  'Dezenfektan',
  'Genel Malzemeler'
]

interface ReportFiltersProps {
  filters: ReportFilter
  onFiltersChange: (filters: ReportFilter) => void
  loading?: boolean
  showAdvanced?: boolean
  compact?: boolean
  showPresets?: boolean
  showSaveFilter?: boolean
}

interface SavedFilter {
  id: string
  name: string
  filters: ReportFilter
  createdAt: string
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onFiltersChange,
  loading = false,
  showAdvanced = true,
  compact = false,
  showPresets = true,
  showSaveFilter = true
}) => {
  const [isAdvancedVisible, setIsAdvancedVisible] = useState(false)
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [saveFilterVisible, setSaveFilterVisible] = useState(false)
  const [filterName, setFilterName] = useState('')

  // Form instance
  const [form] = Form.useForm()

  // Local Storage'dan kayıtlı filtreleri yükle
  useEffect(() => {
    const saved = localStorage.getItem('denti-saved-filters')
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved))
      } catch (error) {
        console.error('Saved filters loading error:', error)
      }
    }
  }, [])

  // Tarih aralığı değişikliği
  const handleDateRangeChange = (
    dates: [Dayjs | null, Dayjs | null] | null
  ) => {
    if (dates && dates[0] && dates[1]) {
      onFiltersChange({
        ...filters,
        startDate: dates[0].format('YYYY-MM-DD'),
        endDate: dates[1].format('YYYY-MM-DD')
      })
    } else {
      onFiltersChange({
        ...filters,
        startDate: undefined,
        endDate: undefined
      })
    }
  }

  // Preset tarih seçimi
  const handlePresetSelect = (preset: DateRangePreset) => {
    onFiltersChange({
      ...filters,
      startDate: preset.startDate,
      endDate: preset.endDate
    })
  }

  // Klinik seçimi
  const handleClinicChange = (clinicIds: number[]) => {
    onFiltersChange({
      ...filters,
      clinicId: clinicIds.length === 1 ? clinicIds[0] : undefined,
      clinicIds: clinicIds.length > 1 ? clinicIds : undefined
    })
  }

  // Tedarikçi seçimi
  const handleSupplierChange = (supplierIds: number[]) => {
    onFiltersChange({
      ...filters,
      supplierId: supplierIds.length === 1 ? supplierIds[0] : undefined,
      supplierIds: supplierIds.length > 1 ? supplierIds : undefined
    })
  }

  // Kategori seçimi
  const handleCategoryChange = (categories: string[]) => {
    onFiltersChange({
      ...filters,
      category: categories.length === 1 ? categories[0] : undefined,
      categories: categories.length > 1 ? categories : undefined
    })
  }

  // Stok durumu seçimi
  const handleStockStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      stockStatus: status === 'all' ? undefined : status as ReportFilter['stockStatus']
    })
  }

  // Filtreleri temizle
  const handleClearFilters = () => {
    const clearedFilters: ReportFilter = {}
    onFiltersChange(clearedFilters)
  }

  // Filtre kaydet
  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      message.error('Filtre adı giriniz')
      return
    }

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName.trim(),
      filters,
      createdAt: new Date().toISOString()
    }

    const updatedFilters = [...savedFilters, newFilter]
    setSavedFilters(updatedFilters)
    localStorage.setItem('denti-saved-filters', JSON.stringify(updatedFilters))
    
    setFilterName('')
    setSaveFilterVisible(false)
    message.success('Filtre kaydedildi')
  }

  // Kayıtlı filtre yükle
  const handleLoadFilter = (savedFilter: SavedFilter) => {
    onFiltersChange(savedFilter.filters)
    message.success(`"${savedFilter.name}" filtresi yüklendi`)
  }

  // Kayıtlı filtre sil
  const handleDeleteFilter = (filterId: string) => {
    const updatedFilters = savedFilters.filter(f => f.id !== filterId)
    setSavedFilters(updatedFilters)
    localStorage.setItem('denti-saved-filters', JSON.stringify(updatedFilters))
    message.success('Filtre silindi')
  }

  // Aktif filtre sayısı
  const activeFilterCount = Object.values(filters).filter(value => 
    value !== undefined && value !== null && value !== ''
  ).length

  // Current date range values
  const dateRange: [Dayjs, Dayjs] | null = filters.startDate && filters.endDate
    ? [dayjs(filters.startDate), dayjs(filters.endDate)]
    : null

  return (
    <Card
      title={
        <Space>
          <FilterOutlined />
          <span>Rapor Filtreleri</span>
          {activeFilterCount > 0 && (
            <Tag color="blue">{activeFilterCount} aktif filtre</Tag>
          )}
        </Space>
      }
      size={compact ? 'small' : 'default'}
      extra={
        <Space>
          {showSaveFilter && activeFilterCount > 0 && (
            <Popover
              content={
                <Space direction="vertical">
                  <Input
                    placeholder="Filtre adı"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    onPressEnter={handleSaveFilter}
                  />
                  <Button 
                    type="primary" 
                    size="small" 
                    onClick={handleSaveFilter}
                    disabled={!filterName.trim()}
                  >
                    Kaydet
                  </Button>
                </Space>
              }
              title="Filtreyi Kaydet"
              trigger="click"
              open={saveFilterVisible}
              onOpenChange={setSaveFilterVisible}
            >
              <Button size="small" icon={<SaveOutlined />}>
                Kaydet
              </Button>
            </Popover>
          )}

          {savedFilters.length > 0 && (
            <Popover
              content={
                <div style={{ width: 280 }}>
                  <Title level={5}>Kayıtlı Filtreler</Title>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {savedFilters.map(savedFilter => (
                      <div key={savedFilter.id} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <Text strong>{savedFilter.name}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {dayjs(savedFilter.createdAt).format('DD.MM.YYYY HH:mm')}
                          </Text>
                        </div>
                        <Space>
                          <Button 
                            size="small" 
                            type="link"
                            onClick={() => handleLoadFilter(savedFilter)}
                          >
                            Yükle
                          </Button>
                          <Button 
                            size="small" 
                            type="link" 
                            danger
                            onClick={() => handleDeleteFilter(savedFilter.id)}
                          >
                            Sil
                          </Button>
                        </Space>
                      </div>
                    ))}
                  </Space>
                </div>
              }
              title="Kayıtlı Filtreler"
              trigger="click"
            >
              <Button size="small" icon={<HistoryOutlined />}>
                Kayıtlı
              </Button>
            </Popover>
          )}

          <Button 
            size="small" 
            icon={<ClearOutlined />} 
            onClick={handleClearFilters}
            disabled={activeFilterCount === 0}
          >
            Temizle
          </Button>

          {showAdvanced && (
            <Button
              size="small"
              icon={<SettingOutlined />}
              onClick={() => setIsAdvancedVisible(!isAdvancedVisible)}
            >
              {isAdvancedVisible ? 'Basit' : 'Gelişmiş'}
            </Button>
          )}
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Row gutter={[16, 16]}>
          {/* Tarih Aralığı */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Tarih Aralığı">
              <RangePicker
                style={{ width: '100%' }}
                value={dateRange}
                onChange={handleDateRangeChange}
                format="DD.MM.YYYY"
                placeholder={['Başlangıç', 'Bitiş']}
                disabled={loading}
              />
            </Form.Item>
          </Col>

          {/* Tarih Preset'leri */}
          {showPresets && (
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="Hızlı Seçim">
                <Select
                  placeholder="Tarih aralığı seçin"
                  allowClear
                  style={{ width: '100%' }}
                  disabled={loading}
                  onChange={(value) => {
                    if (value) {
                      const preset = DATE_PRESETS.find(p => p.key === value)
                      if (preset) handlePresetSelect(preset)
                    }
                  }}
                >
                  {DATE_PRESETS.map(preset => (
                    <Option key={preset.key} value={preset.key}>
                      <CalendarOutlined style={{ marginRight: 8 }} />
                      {preset.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          )}

          {/* Stok Durumu */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Stok Durumu">
              <Radio.Group
                value={filters.stockStatus || 'all'}
                onChange={(e) => handleStockStatusChange(e.target.value)}
                disabled={loading}
                size="small"
              >
                {STOCK_STATUS_OPTIONS.map(option => (
                  <Radio.Button key={option.value} value={option.value}>
                    {option.label}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Form.Item>
          </Col>

          {/* Gelişmiş Filtreler */}
          {(isAdvancedVisible || !showAdvanced) && (
            <>
              {/* Klinik Seçimi */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item label="Klinikler">
                  <Select
                    mode="multiple"
                    placeholder="Klinik seçin"
                    style={{ width: '100%' }}
                    value={filters.clinicId ? [filters.clinicId] : (filters.clinicIds || [])}
                    onChange={handleClinicChange}
                    disabled={loading}
                    allowClear
                  >
                    {MOCK_CLINICS.map(clinic => (
                      <Option key={clinic.id} value={clinic.id}>
                        {clinic.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* Tedarikçi Seçimi */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item label="Tedarikçiler">
                  <Select
                    mode="multiple"
                    placeholder="Tedarikçi seçin"
                    style={{ width: '100%' }}
                    value={filters.supplierId ? [filters.supplierId] : (filters.supplierIds || [])}
                    onChange={handleSupplierChange}
                    disabled={loading}
                    allowClear
                  >
                    {MOCK_SUPPLIERS.map(supplier => (
                      <Option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* Kategori Seçimi */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item label="Kategoriler">
                  <Select
                    mode="multiple"
                    placeholder="Kategori seçin"
                    style={{ width: '100%' }}
                    value={filters.category ? [filters.category] : (filters.categories || [])}
                    onChange={handleCategoryChange}
                    disabled={loading}
                    allowClear
                  >
                    {MOCK_CATEGORIES.map(category => (
                      <Option key={category} value={category}>
                        {category}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </>
          )}
        </Row>

        {/* Aktif Filtreler Özeti */}
        {activeFilterCount > 0 && (
          <>
            <Divider />
            <div>
              <Text strong>Aktif Filtreler:</Text>
              <div style={{ marginTop: 8 }}>
                <Space wrap>
                  {filters.startDate && filters.endDate && (
                    <Tag closable onClose={() => handleDateRangeChange(null)}>
                      📅 {dayjs(filters.startDate).format('DD.MM.YYYY')} - {dayjs(filters.endDate).format('DD.MM.YYYY')}
                    </Tag>
                  )}
                  {filters.stockStatus && (
                    <Tag closable onClose={() => handleStockStatusChange('all')}>
                      📦 {STOCK_STATUS_OPTIONS.find(o => o.value === filters.stockStatus)?.label}
                    </Tag>
                  )}
                  {(filters.clinicId || (filters.clinicIds && filters.clinicIds.length > 0)) && (
                    <Tag closable onClose={() => handleClinicChange([])}>
                      🏥 {filters.clinicId ? '1 klinik' : `${filters.clinicIds?.length} klinik`}
                    </Tag>
                  )}
                  {(filters.supplierId || (filters.supplierIds && filters.supplierIds.length > 0)) && (
                    <Tag closable onClose={() => handleSupplierChange([])}>
                      🏪 {filters.supplierId ? '1 tedarikçi' : `${filters.supplierIds?.length} tedarikçi`}
                    </Tag>
                  )}
                  {(filters.category || (filters.categories && filters.categories.length > 0)) && (
                    <Tag closable onClose={() => handleCategoryChange([])}>
                      📂 {filters.category ? '1 kategori' : `${filters.categories?.length} kategori`}
                    </Tag>
                  )}
                </Space>
              </div>
            </div>
          </>
        )}
      </Form>
    </Card>
  )
}

export default ReportFilters