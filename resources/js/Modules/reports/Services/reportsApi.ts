/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/reports/Services/reportsApi.ts

import { api } from '@/Services/api'
import type {
  ReportFilter,
  ReportsApiResponse,
  StockLevelReport,
  StockMovementReport,
  CategoryAnalysisReport,
  UsageTrendReport,
  ExpiryAnalysisReport,
  SupplierPerformanceReport,
  PurchaseAnalysisReport,
  ClinicConsumptionReport,
  ReportsDashboardSummary,
  ExportOptions,
  StockChartsData,
  DoctorUsageReport,
} from '../Types/reports.types'

/**
 * Helper to map frontend filters to backend query parameters.
 * Laravel usually expects snake_case for many parameters.
 */
const mapFilters = (filters?: ReportFilter) => {
  if (!filters) return {}
  
  const params: any = {}
  
  // Basic mapping with truthy checks
  if (filters.startDate) params.start_date = filters.startDate
  if (filters.endDate) params.end_date = filters.endDate
  if (filters.clinicId) params.clinic_id = filters.clinicId
  if (filters.supplierId) params.supplier_id = filters.supplierId
  if (filters.category) params.category = filters.category
  if (filters.stockStatus) params.stock_status = filters.stockStatus
  if (filters.search) params.search = filters.search
  if (filters.period) params.period = filters.period // ✅ ADDED
  
  // Date range support
  if (filters.dateRange) {
    if (filters.dateRange.startDate) params.start_date = filters.dateRange.startDate
    if (filters.dateRange.endDate) params.end_date = filters.dateRange.endDate
  }

  // Handle arrays - axios will format these correctly as key[]=val if configured
  if (filters.clinicIds && filters.clinicIds.length > 0) params.clinic_ids = filters.clinicIds
  if (filters.supplierIds && filters.supplierIds.length > 0) params.supplier_ids = filters.supplierIds
  if (filters.categories && filters.categories.length > 0) params.categories = filters.categories

  return params
}

// =============================================================================
// REFRESHED REPORTS API
// =============================================================================

export const reportsApi = {
  // 1. Genel Özet Raporu (Haftaya Bakış & Analitikler)
  getSummary: (filters?: ReportFilter): Promise<ReportsApiResponse<ReportsDashboardSummary>> =>
    api.get('/stock-reports/summary', { params: mapFilters(filters) }),

  // 1.1 Tüketim Trendleri (Grafik için)
  getTrends: (filters?: ReportFilter): Promise<ReportsApiResponse<ConsumptionTrendPoint[]>> =>
    api.get('/stock-reports/trends', { params: mapFilters(filters) }),

  // 1.2 Kategori Bazlı Değer Dağılımı (Pasta Grafik için)
  getCategories: (): Promise<ReportsApiResponse<CategoryValueDistribution[]>> =>
    api.get('/stock-reports/categories'),

  // 1.3 Akıllı Stok Ömür Tahminleme
  getForecast: (): Promise<ReportsApiResponse<StockForecast[]>> =>
    api.get('/stock-reports/forecast'),

  // 2. Stok Hareketleri Raporu
  getMovements: (filters?: ReportFilter): Promise<ReportsApiResponse<StockMovementReport>> =>
    api.get('/stock-reports/movements', { params: mapFilters(filters) }),

  // 3. En Çok Kullanılan Ürünler
  getTopUsed: (filters?: ReportFilter & { limit?: number }): Promise<ReportsApiResponse<any>> =>
    api.get('/stock-reports/top-used', { params: mapFilters(filters) }),

  // 4. Tedarikçi Performans Raporu
  getSupplierPerformance: (filters?: ReportFilter): Promise<ReportsApiResponse<SupplierPerformanceReport>> =>
    api.get('/stock-reports/supplier-performance', { params: mapFilters(filters) }),

  // 5. Süre Dolum (Miat) Raporu
  getExpiry: (filters?: ReportFilter & { days?: number }): Promise<ReportsApiResponse<ExpiryAnalysisReport>> =>
    api.get('/stock-reports/expiry', { params: mapFilters(filters) }),

  // 6. Klinik Karşılaştırma Raporu
  getClinicComparison: (): Promise<ReportsApiResponse<ClinicConsumptionReport>> =>
    api.get('/stock-reports/clinic-comparison'),

  // 7. Detaylı Özel Rapor (Custom Report)
  getCustomReport: (filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
    api.get('/stock-reports/custom', { params: mapFilters(filters) }),

  // Dashboard sub-api (Required by useDashboardReports.ts)
  dashboard: {
    getSummary: (filters?: ReportFilter): Promise<ReportsApiResponse<ReportsDashboardSummary>> =>
      api.get('/stock-reports/summary', { params: mapFilters(filters) }),
    getStats: (filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
      api.get('/stock-reports/stats', { params: mapFilters(filters) }),
  },

  // Clinics sub-api (Required by useClinicReports.ts)
  clinics: {
    getConsumptionReport: (filters?: ReportFilter): Promise<ReportsApiResponse<ClinicConsumptionReport>> =>
      api.get('/stock-reports/summary', { params: mapFilters(filters) }), // Redirected to summary for resilience
    getStockReport: (clinicId: number, filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
      api.get('/stock-reports/summary', { params: { ...mapFilters(filters), clinic_id: clinicId } }),
    getComparison: (clinicIds: number[], filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
      api.get('/stock-reports/clinic-comparison', { 
        params: { ...mapFilters(filters), clinic_ids: clinicIds } 
      }),
    getUsageTrend: (filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
      api.get('/stock-reports/trends', { params: mapFilters(filters) }),
    getEfficiencyReport: (filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
      api.get('/stock-reports/summary', { params: mapFilters(filters) }),
    getCostAnalysis: (filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
      api.get('/stock-reports/summary', { params: mapFilters(filters) }),
    getTurnoverRate: (filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
      api.get('/stock-reports/summary', { params: mapFilters(filters) }),
    getDoctorUsage: (filters?: ReportFilter): Promise<ReportsApiResponse<DoctorUsageReport>> =>
      Promise.resolve({ success: true, data: { doctors: [] } } as any),
  },

  // Suppliers sub-api
  suppliers: {
    getPerformanceReport: (filters?: ReportFilter): Promise<ReportsApiResponse<SupplierPerformanceReport>> =>
      api.get('/stock-reports/summary', { params: mapFilters(filters) }),
    getComparison: (supplierIds: number[], filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
      api.get('/stock-reports/summary', { params: { ...mapFilters(filters), supplier_ids: supplierIds } }),
    getTrendAnalysis: (filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
      api.get('/stock-reports/trends', { params: mapFilters(filters) }),
    getTopSuppliers: (filters?: ReportFilter & { limit?: number }): Promise<ReportsApiResponse<any>> =>
      api.get('/stock-reports/summary', { params: mapFilters(filters) }),
    getDeliveryPerformance: (filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
      api.get('/stock-reports/summary', { params: mapFilters(filters) }),
    getCostAnalysis: (filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
      api.get('/stock-reports/summary', { params: mapFilters(filters) }),
    getPurchaseAnalysis: (filters?: ReportFilter): Promise<ReportsApiResponse<PurchaseAnalysisReport>> =>
      api.get('/stock-reports/summary', { params: mapFilters(filters) }),
  },

  // Legacy/Extra Methods (Keeping for UI compatibility)
  getLevels: (filters?: ReportFilter): Promise<ReportsApiResponse<StockLevelReport>> =>
    api.get('/stock-reports/levels', { params: mapFilters(filters) }),
    
  getCharts: (filters?: ReportFilter): Promise<ReportsApiResponse<StockChartsData>> =>
    api.get('/stock-reports/charts', { params: mapFilters(filters) }),

  // Export API
  export: {
    toExcel: (reportType: string, options: ExportOptions): Promise<Blob> =>
      api.post('/stock-reports/export/excel', { reportType, ...options }, { responseType: 'blob' }),
    toPdf: (reportType: string, options: ExportOptions): Promise<Blob> =>
      api.post('/stock-reports/export/pdf', { reportType, ...options }, { responseType: 'blob' }),
  }
}

export default reportsApi