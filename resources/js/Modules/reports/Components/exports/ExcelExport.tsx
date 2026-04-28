// src/modules/reports/Components/exports/ExcelExport.tsx

import React, { useState } from 'react'
import { 
  Button, 
  Modal, 
  Form, 
  Input, 
  Checkbox, 
  Space, 
  Typography, 
  Divider,
  Alert,
  Progress,
  message,
  Radio
} from 'antd'
import { 
  FileExcelOutlined, 
  DownloadOutlined, 
  SettingOutlined,
  LoadingOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { exportApi } from '../../Services/reportsApi'
import { ExportConfig, ReportFilter, ExportOptions } from '../../Types/reports.types'

const { Text } = Typography

interface ExcelExportProps {
  reportType: 'stock' | 'supplier' | 'clinic' | 'trend'
  reportData?: unknown
  filters?: Partial<ReportFilter>
  onExportComplete?: (filename: string) => void
  disabled?: boolean
}

export const ExcelExport: React.FC<ExcelExportProps> = ({
  reportType,
  filters,
  onExportComplete,
  disabled = false
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [form] = Form.useForm()

  // Default export configuration
  const defaultConfig: ExportConfig = {
    format: 'excel',
    fileName: `${reportType}_report_${dayjs().format('YYYY-MM-DD')}`,
    includeCharts: true,
    includeRawData: true,
    compression: false
  }

  // Report type options
  const reportTypeLabels = {
    stock: 'Stok Raporu',
    supplier: 'Tedarikçi Raporu',
    clinic: 'Klinik Raporu',
    trend: 'Trend Analizi'
  }

  // Available data sections based on report type
  const getDataSections = () => {
    switch (reportType) {
      case 'stock':
        return [
          { key: 'summary', label: 'Genel Özet', defaultChecked: true },
          { key: 'levels', label: 'Stok Seviyeleri', defaultChecked: true },
          { key: 'usage', label: 'Kullanım Verileri', defaultChecked: true },
          { key: 'movements', label: 'Stok Hareketleri', defaultChecked: false },
          { key: 'categories', label: 'Kategori Dağılımı', defaultChecked: true },
          { key: 'alerts', label: 'Uyarılar', defaultChecked: true }
        ]
      case 'supplier':
        return [
          { key: 'performance', label: 'Performans Verileri', defaultChecked: true },
          { key: 'comparison', label: 'Karşılaştırma', defaultChecked: true },
          { key: 'delivery', label: 'Teslimat Performansı', defaultChecked: true },
          { key: 'costs', label: 'Maliyet Analizi', defaultChecked: false }
        ]
      case 'clinic':
        return [
          { key: 'stock', label: 'Stok Verileri', defaultChecked: true },
          { key: 'efficiency', label: 'Verimlilik Metrikleri', defaultChecked: true },
          { key: 'costs', label: 'Maliyet Raporu', defaultChecked: false },
          { key: 'turnover', label: 'Stok Dönüş Oranı', defaultChecked: true }
        ]
      case 'trend':
        return [
          { key: 'overview', label: 'Genel Trendler', defaultChecked: true },
          { key: 'forecast', label: 'Tahminler', defaultChecked: true },
          { key: 'kpi', label: 'KPI Metrikleri', defaultChecked: true },
          { key: 'seasonal', label: 'Sezonsal Analiz', defaultChecked: false }
        ]
      default:
        return []
    }
  }

  // Handle export
  const handleExport = async (values: Record<string, unknown>) => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      const exportOptions: ExportOptions = {
        fileName: (values.fileName as string) || defaultConfig.fileName,
        includeCharts: (values.includeCharts as boolean) ?? true,
        includeRawData: (values.includeRawData as boolean) ?? true,
        compression: (values.compression as boolean) ?? false,
        password: values.password as string,
        format: (values.excelFormat as 'xlsx' | 'xls') || 'xlsx'
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Call export API
      const blob = await exportApi.exportToExcel(reportType, exportOptions)

      // Complete progress
      clearInterval(progressInterval)
      setExportProgress(100)

      // Download file
      const filename = `${exportOptions.fileName}.${exportOptions.format}`
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      // Success
      message.success('Excel dosyası başarıyla indirildi!')
      onExportComplete?.(filename)
      setIsModalVisible(false)

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Excel export işlemi başarısız!'
      message.error(errorMessage)
      console.error('Excel export error:', error)
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  // Show export modal
  const showExportModal = () => {
    form.setFieldsValue({
      fileName: defaultConfig.fileName,
      includeCharts: true,
      includeRawData: true,
      compression: false,
      dataSections: getDataSections().filter(s => s.defaultChecked).map(s => s.key)
    })
    setIsModalVisible(true)
  }

  return (
    <>
      {/* Export Button */}
      <Button
        icon={<FileExcelOutlined />}
        onClick={showExportModal}
        disabled={disabled}
        type="default"
      >
        Excel'e Aktar
      </Button>

      {/* Export Configuration Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileExcelOutlined style={{ color: '#52c41a' }} />
            <span>Excel Export Ayarları</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleExport}
          disabled={isExporting}
        >
          {/* Report Info */}
          <Alert
            message={`${reportTypeLabels[reportType]} dışa aktarılacak`}
            description={filters ? `Filtreler uygulanmış: ${
              filters.dateRange ? 
              `${dayjs(filters.dateRange.startDate).format('DD.MM.YYYY')} - ${dayjs(filters.dateRange.endDate).format('DD.MM.YYYY')}` : 
              'Tüm zamanlar'
            }` : 'Tüm veriler'}
            type="info"
            style={{ marginBottom: '16px' }}
          />

          {/* Filename */}
          <Form.Item
            label="Dosya Adı"
            name="fileName"
            rules={[
              { required: true, message: 'Dosya adı gereklidir!' },
              { min: 3, message: 'Dosya adı en az 3 karakter olmalıdır!' }
            ]}
          >
            <Input 
              placeholder="Dosya adını girin"
              suffix=".xlsx"
              maxLength={50}
            />
          </Form.Item>

          {/* Data Sections */}
          <Form.Item
            label="Dahil Edilecek Veriler"
            name="dataSections"
          >
            <Checkbox.Group style={{ width: '100%' }}>
              <div style={{ display: 'grid', gap: '8px' }}>
                {getDataSections().map(section => (
                  <Checkbox key={section.key} value={section.key}>
                    {section.label}
                  </Checkbox>
                ))}
              </div>
            </Checkbox.Group>
          </Form.Item>

          <Divider />

          {/* Advanced Options */}
          <Text strong>Gelişmiş Seçenekler</Text>

          <Form.Item
            name="includeCharts"
            valuePropName="checked"
            style={{ marginTop: '12px' }}
          >
            <Checkbox>Grafikleri dahil et (görsel olarak)</Checkbox>
          </Form.Item>

          <Form.Item
            name="includeRawData"
            valuePropName="checked"
          >
            <Checkbox>Ham veriyi ayrı sayfada ekle</Checkbox>
          </Form.Item>

          <Form.Item
            name="compression"
            valuePropName="checked"
          >
            <Checkbox>Dosyayı sıkıştır (daha küçük boyut)</Checkbox>
          </Form.Item>

          {/* Password Protection */}
          <Form.Item
            label="Şifre Koruması (İsteğe Bağlı)"
            name="password"
          >
            <Input.Password 
              placeholder="Excel dosyası için şifre"
              maxLength={20}
            />
          </Form.Item>

          {/* Export Format Options */}
          <Form.Item
            label="Excel Formatı"
            name="excelFormat"
            initialValue="xlsx"
          >
            <Radio.Group>
              <Radio value="xlsx">Modern Excel (.xlsx)</Radio>
              <Radio value="xls">Eski Excel (.xls)</Radio>
            </Radio.Group>
          </Form.Item>

          {/* Export Progress */}
          {isExporting && (
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Export İlerlemesi:</Text>
              <Progress 
                percent={exportProgress} 
                status={exportProgress === 100 ? 'success' : 'active'}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {exportProgress < 30 ? 'Veriler hazırlanıyor...' :
                 exportProgress < 60 ? 'Excel dosyası oluşturuluyor...' :
                 exportProgress < 90 ? 'Grafikler ekleniyor...' :
                 exportProgress === 100 ? 'Tamamlandı!' : 'İşleniyor...'}
              </Text>
            </div>
          )}

          {/* Action Buttons */}
          <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={isExporting ? <LoadingOutlined /> : <DownloadOutlined />}
                loading={isExporting}
                disabled={isExporting}
              >
                {isExporting ? 'Dışa Aktarılıyor...' : 'Excel\'e Aktar'}
              </Button>
              
              <Button 
                onClick={() => setIsModalVisible(false)}
                disabled={isExporting}
              >
                İptal
              </Button>

              <Button
                icon={<SettingOutlined />}
                onClick={() => {
                  form.setFieldsValue(defaultConfig)
                }}
                disabled={isExporting}
              >
                Varsayılan
              </Button>
            </Space>
          </Form.Item>

          {/* File Size Estimate */}
          <div style={{
            marginTop: '16px',
            padding: '8px 12px',
            backgroundColor: '#f6ffed',
            border: '1px solid #b7eb8f',
            borderRadius: '6px',
            fontSize: '12px'
          }}>
            <Text style={{ color: '#389e0d' }}>
              📊 Tahmini dosya boyutu: ~1-3 MB
            </Text>
            <br />
            <Text style={{ color: '#389e0d' }}>
              ⏱️ Tahmini süre: {isExporting ? `${Math.round(exportProgress/10)} saniye` : '10-30 saniye'}
            </Text>
          </div>
        </Form>
      </Modal>
    </>
  )
}

export default ExcelExport