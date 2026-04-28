// src/modules/reports/Components/exports/PDFExport.tsx

import React, { useState } from 'react'
import { 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Checkbox, 
  Space, 
  Typography, 
  Divider,
  Alert,
  Progress,
  message,
  Radio,
  Card
} from 'antd'
import { 
  FilePdfOutlined, 
  DownloadOutlined, 
  SettingOutlined,
  LoadingOutlined,
  EyeOutlined,
  PrinterOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { exportApi } from '../../Services/reportsApi'
import { ExportConfig, ReportFilter, ExportOptions } from '../../Types/reports.types'

const { Option } = Select
const { Text } = Typography

interface PDFExportProps {
  reportType: 'stock' | 'supplier' | 'clinic' | 'trend'
  filters?: Partial<ReportFilter>
  onExportComplete?: (filename: string) => void
  disabled?: boolean
}

interface FormValues {
  fileName: string
  layout: 'executive' | 'detailed' | 'presentation' | 'dashboard'
  theme: 'professional' | 'medical' | 'modern' | 'minimal'
  includeCharts: boolean
  includeRawData: boolean
  compression: boolean
  chartQuality: 'standard' | 'high' | 'print'
  pageOrientation: 'portrait' | 'landscape'
  headerFooter: boolean
  includeWatermark: boolean
  sections: string[]
  password?: string
}

export const PDFExport: React.FC<PDFExportProps> = ({
  reportType,
  filters,
  onExportComplete,
  disabled = false
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [form] = Form.useForm<FormValues>()

  // Default export configuration
  const defaultConfig: ExportConfig = {
    format: 'pdf',
    fileName: `${reportType}_report_${dayjs().format('YYYY-MM-DD')}`,
    includeCharts: true,
    includeRawData: false, // PDF'de genelde sadece özet
    compression: true
  }

  // Report type options
  const reportTypeLabels = {
    stock: 'Stok Raporu',
    supplier: 'Tedarikçi Raporu', 
    clinic: 'Klinik Raporu',
    trend: 'Trend Analizi'
  }

  // PDF Layout options
  const layoutOptions = [
    { value: 'executive', label: 'Yönetici Özeti', description: 'Kısa ve öz rapor' },
    { value: 'detailed', label: 'Detaylı Rapor', description: 'Tüm veriler ve analizler' },
    { value: 'presentation', label: 'Sunum Formatı', description: 'Görsel ağırlıklı' },
    { value: 'dashboard', label: 'Dashboard Görünümü', description: 'KPI odaklı' }
  ]

  // PDF Themes
  const themeOptions = [
    { value: 'professional', label: 'Profesyonel', color: '#1890ff' },
    { value: 'medical', label: 'Medikal', color: '#52c41a' },
    { value: 'modern', label: 'Modern', color: '#722ed1' },
    { value: 'minimal', label: 'Minimal', color: '#8c8c8c' }
  ]

  // Available sections based on report type
  const getReportSections = () => {
    switch (reportType) {
      case 'stock':
        return [
          { key: 'summary', label: 'Yönetici Özeti', defaultChecked: true },
          { key: 'charts', label: 'Grafiksel Analiz', defaultChecked: true },
          { key: 'levels', label: 'Stok Seviye Tablosu', defaultChecked: true },
          { key: 'alerts', label: 'Uyarılar ve Öneriler', defaultChecked: true },
          { key: 'trends', label: 'Trend Analizi', defaultChecked: false },
          { key: 'appendix', label: 'Detay Tablolar (Ek)', defaultChecked: false }
        ]
      case 'supplier':
        return [
          { key: 'summary', label: 'Performans Özeti', defaultChecked: true },
          { key: 'comparison', label: 'Tedarikçi Karşılaştırması', defaultChecked: true },
          { key: 'ratings', label: 'Değerlendirme Kartları', defaultChecked: true },
          { key: 'recommendations', label: 'Stratejik Öneriler', defaultChecked: true },
          { key: 'contracts', label: 'Sözleşme Analizi', defaultChecked: false }
        ]
      case 'clinic':
        return [
          { key: 'overview', label: 'Klinik Genel Bakış', defaultChecked: true },
          { key: 'efficiency', label: 'Verimlilik Analizi', defaultChecked: true },
          { key: 'benchmarks', label: 'Kıyaslama Grafikleri', defaultChecked: true },
          { key: 'recommendations', label: 'İyileştirme Önerileri', defaultChecked: true },
          { key: 'detailed', label: 'Detaylı Metrikler', defaultChecked: false }
        ]
      case 'trend':
        return [
          { key: 'executive', label: 'Yönetici Özeti', defaultChecked: true },
          { key: 'trends', label: 'Trend Grafikleri', defaultChecked: true },
          { key: 'forecast', label: 'Tahmin Modelleri', defaultChecked: true },
          { key: 'insights', label: 'İş Zekası Öngörüleri', defaultChecked: true },
          { key: 'methodology', label: 'Metodoloji', defaultChecked: false }
        ]
      default:
        return []
    }
  }

  // Handle export
  const handleExport = async (values: FormValues) => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      const exportOptions: ExportOptions = {
        fileName: values.fileName || defaultConfig.fileName,
        includeCharts: values.includeCharts ?? true,
        includeRawData: values.includeRawData ?? false,
        compression: values.compression ?? true,
        password: values.password,
        format: 'pdf'
      }

      // Add PDF-specific options
      const pdfOptions = {
        layout: values.layout || 'detailed',
        theme: values.theme || 'professional',
        sections: values.sections || [],
        chartQuality: values.chartQuality || 'high',
        pageOrientation: values.pageOrientation || 'portrait',
        includeWatermark: values.includeWatermark ?? false,
        headerFooter: values.headerFooter ?? true
      }

      // Simulate progress with realistic stages
      const progressStages = [
        { progress: 20, message: 'Veri analizi yapılıyor...' },
        { progress: 40, message: 'Grafikler oluşturuluyor...' },
        { progress: 60, message: 'Sayfa düzeni hazırlanıyor...' },
        { progress: 80, message: 'PDF render ediliyor...' },
        { progress: 95, message: 'Son kontroller yapılıyor...' },
        { progress: 100, message: 'Tamamlandı!' }
      ]

      for (const stage of progressStages) {
        await new Promise(resolve => setTimeout(resolve, 500))
        setExportProgress(stage.progress)
      }

      // Call export API
      const blob = await exportApi.exportToPdf(reportType, { ...exportOptions, ...pdfOptions })

      // Download file
      const filename = `${exportOptions.fileName}.pdf`
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      // Success
      message.success('PDF dosyası başarıyla indirildi!')
      onExportComplete?.(filename)
      setIsModalVisible(false)

    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message || 'PDF export işlemi başarısız!'
        : 'PDF export işlemi başarısız!'
      message.error(errorMessage)
      console.error('PDF export error:', error)
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  // Show export modal
  const showExportModal = () => {
    form.setFieldsValue({
      fileName: defaultConfig.fileName,
      layout: 'detailed',
      theme: 'professional',
      includeCharts: true,
      includeRawData: false,
      compression: true,
      chartQuality: 'high',
      pageOrientation: 'portrait',
      headerFooter: true,
      sections: getReportSections().filter(s => s.defaultChecked).map(s => s.key)
    })
    setIsModalVisible(true)
  }

  return (
    <>
      {/* Export Button */}
      <Button
        icon={<FilePdfOutlined />}
        onClick={showExportModal}
        disabled={disabled}
        type="default"
      >
        PDF'e Aktar
      </Button>

      {/* Export Configuration Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FilePdfOutlined style={{ color: '#ff4d4f' }} />
            <span>PDF Export Ayarları</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
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
            message={`${reportTypeLabels[reportType]} PDF olarak dışa aktarılacak`}
            description={filters ? `Filtreler: ${
              filters.dateRange ? 
              `${dayjs(filters.dateRange.startDate).format('DD.MM.YYYY')} - ${dayjs(filters.dateRange.endDate).format('DD.MM.YYYY')}` : 
              'Tüm zamanlar'
            }` : 'Tüm veriler dahil'}
            type="info"
            style={{ marginBottom: '16px' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Left Column */}
            <div>
              {/* Filename */}
              <Form.Item
                label="Dosya Adı"
                name="fileName"
                rules={[{ required: true, message: 'Dosya adı gereklidir!' }]}
              >
                <Input 
                  placeholder="Dosya adını girin"
                  suffix=".pdf"
                  maxLength={50}
                />
              </Form.Item>

              {/* Layout */}
              <Form.Item
                label="Rapor Düzeni"
                name="layout"
              >
                <Select placeholder="Düzen seçin">
                  {layoutOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      <div>
                        <Text strong>{option.label}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {option.description}
                        </Text>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Theme */}
              <Form.Item
                label="Tema"
                name="theme"
              >
                <Radio.Group>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {themeOptions.map(theme => (
                      <Radio key={theme.value} value={theme.value}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: theme.color,
                            borderRadius: '2px'
                          }} />
                          {theme.label}
                        </div>
                      </Radio>
                    ))}
                  </div>
                </Radio.Group>
              </Form.Item>
            </div>

            {/* Right Column */}
            <div>
              {/* Page Settings */}
              <Form.Item
                label="Sayfa Yönü"
                name="pageOrientation"
              >
                <Radio.Group>
                  <Radio value="portrait">Dikey</Radio>
                  <Radio value="landscape">Yatay</Radio>
                </Radio.Group>
              </Form.Item>

              {/* Chart Quality */}
              <Form.Item
                label="Grafik Kalitesi"
                name="chartQuality"
              >
                <Select>
                  <Option value="standard">Standart</Option>
                  <Option value="high">Yüksek</Option>
                  <Option value="print">Baskı Kalitesi</Option>
                </Select>
              </Form.Item>

              {/* Advanced Options */}
              <Form.Item label="Ek Seçenekler">
                <div style={{ display: 'grid', gap: '8px' }}>
                  <Form.Item name="headerFooter" valuePropName="checked" style={{ margin: 0 }}>
                    <Checkbox>Başlık ve altbilgi ekle</Checkbox>
                  </Form.Item>
                  <Form.Item name="includeWatermark" valuePropName="checked" style={{ margin: 0 }}>
                    <Checkbox>Filigran ekle</Checkbox>
                  </Form.Item>
                  <Form.Item name="compression" valuePropName="checked" style={{ margin: 0 }}>
                    <Checkbox>PDF sıkıştırması</Checkbox>
                  </Form.Item>
                </div>
              </Form.Item>
            </div>
          </div>

          <Divider />

          {/* Report Sections */}
          <Form.Item
            label="Rapor İçeriği"
            name="sections"
          >
            <Checkbox.Group style={{ width: '100%' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {getReportSections().map(section => (
                  <Checkbox key={section.key} value={section.key}>
                    {section.label}
                  </Checkbox>
                ))}
              </div>
            </Checkbox.Group>
          </Form.Item>

          {/* Password Protection */}
          <Form.Item
            label="Şifre Koruması (İsteğe Bağlı)"
            name="password"
          >
            <Input.Password 
              placeholder="PDF için şifre belirleyin"
              maxLength={20}
            />
          </Form.Item>

          {/* Export Progress */}
          {isExporting && (
            <div style={{ marginBottom: '16px' }}>
              <Text strong>PDF Oluşturma İlerlemesi:</Text>
              <Progress 
                percent={exportProgress} 
                status={exportProgress === 100 ? 'success' : 'active'}
                strokeColor={{
                  '0%': '#ff4d4f',
                  '100%': '#52c41a',
                }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {exportProgress < 20 ? 'Veri analizi yapılıyor...' :
                 exportProgress < 40 ? 'Grafikler oluşturuluyor...' :
                 exportProgress < 60 ? 'Sayfa düzeni hazırlanıyor...' :
                 exportProgress < 80 ? 'PDF render ediliyor...' :
                 exportProgress < 95 ? 'Son kontroller yapılıyor...' :
                 'Tamamlandı!'}
              </Text>
            </div>
          )}

          {/* Preview Card */}
          <Card 
            title="Ön İzleme" 
            size="small" 
            style={{ marginBottom: '16px' }}
            extra={
              <Button 
                size="small" 
                icon={<EyeOutlined />}
                disabled={isExporting}
              >
                Önizle
              </Button>
            }
          >
            <div style={{
              padding: '16px',
              border: '2px dashed #d9d9d9',
              borderRadius: '6px',
              textAlign: 'center',
              backgroundColor: '#fafafa'
            }}>
              <FilePdfOutlined style={{ fontSize: '32px', color: '#ff4d4f', marginBottom: '8px' }} />
              <br />
              <Text strong>{reportTypeLabels[reportType]}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Sayfa sayısı: ~{getReportSections().filter(s => 
                  form.getFieldValue('sections')?.includes(s.key)
                ).length * 2} sayfa
              </Text>
            </div>
          </Card>

          {/* Action Buttons */}
          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={isExporting ? <LoadingOutlined /> : <DownloadOutlined />}
                  loading={isExporting}
                  disabled={isExporting}
                  size="large"
                >
                  {isExporting ? 'PDF Oluşturuluyor...' : 'PDF İndir'}
                </Button>
                
                <Button 
                  onClick={() => setIsModalVisible(false)}
                  disabled={isExporting}
                  size="large"
                >
                  İptal
                </Button>
              </Space>

              <Space>
                <Button
                  icon={<PrinterOutlined />}
                  disabled={isExporting}
                  onClick={() => message.info('Yazdırmak için önce PDF\'i indirin')}
                >
                  Yazdır
                </Button>

                <Button
                  icon={<SettingOutlined />}
                  onClick={() => {
                    form.resetFields()
                    const resetValues = {
                      fileName: defaultConfig.fileName,
                      layout: 'detailed' as const,
                      theme: 'professional' as const,
                      includeCharts: true,
                      includeRawData: false,
                      compression: true,
                      chartQuality: 'high' as const,
                      pageOrientation: 'portrait' as const,
                      headerFooter: true
                    }
                    form.setFieldsValue(resetValues)
                  }}
                  disabled={isExporting}
                >
                  Sıfırla
                </Button>
              </Space>
            </Space>
          </Form.Item>

          {/* Footer Info */}
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#fff2f0',
            border: '1px solid #ffccc7',
            borderRadius: '6px',
            fontSize: '12px'
          }}>
            <Space direction="vertical" size={4}>
              <Text style={{ color: '#cf1322' }}>
                📄 Tahmini dosya boyutu: ~{
                  form.getFieldValue('chartQuality') === 'print' ? '5-10' :
                  form.getFieldValue('chartQuality') === 'high' ? '3-7' : '1-4'
                } MB
              </Text>
              <Text style={{ color: '#cf1322' }}>
                ⏱️ Oluşturma süresi: {
                  form.getFieldValue('layout') === 'executive' ? '15-30' :
                  form.getFieldValue('layout') === 'detailed' ? '30-60' : '20-45'
                } saniye
              </Text>
              <Text style={{ color: '#cf1322' }}>
                🔒 {form.getFieldValue('password') ? 'Şifre korumalı' : 'Şifre koruması yok'}
              </Text>
            </Space>
          </div>
        </Form>
      </Modal>
    </>
  )
}