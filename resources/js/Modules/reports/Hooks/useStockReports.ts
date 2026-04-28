// src/modules/reports/Hooks/useStockReports.ts

import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../Services/reportsApi'
import type { ReportFilter } from '../Types/reports.types'

const STALE_TIME = 300000 // 5 dakika

// =============================================================================
// DASHBOARD & SUMMARY HOOKS
// =============================================================================

// ReportsDashboard.tsx'in beklediği durum özeti hook'u
export const useStockStatusSummary = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['reports', 'summary', filters],
    queryFn: () => reportsApi.getSummary(filters),
    select: (res) => {
      const data = res.data
      if (!data) return null
      
      return {
        total: data.total_items || 0,
        normal: (data.total_items || 0) - (data.low_stock_items || 0) - (data.critical_stock_items || 0),
        low: data.low_stock_items || 0,
        critical: data.critical_stock_items || 0,
        outOfStock: data.out_of_stock_items || 0,
        total_value: data.total_value || 0,
        total_base_quantity: data.total_base_quantity || 0,
        expired: data.expired_items || 0,
        expiringSoon: data.expiring_soon_items || 0
      }
    },
    staleTime: STALE_TIME,
  })
}

// Dashboard ana hook'u
export const useAllStockReports = (filters?: ReportFilter) => {
  const summaryQuery = useStockStatusSummary(filters);
  
  const movementsQuery = useQuery({
    queryKey: ['reports', 'movements', filters],
    queryFn: () => reportsApi.getMovements(filters),
    select: (data) => data.data,
    staleTime: STALE_TIME,
  })

  return {
    summary: summaryQuery.data,
    movements: movementsQuery.data,
    isLoading: summaryQuery.isLoading || movementsQuery.isLoading,
    isError: summaryQuery.isError || movementsQuery.isError,
    error: summaryQuery.error || movementsQuery.error,
    refetch: () => {
      summaryQuery.refetch()
      movementsQuery.refetch()
    }
  }
}

// =============================================================================
// SPECIFIC ANALYSIS HOOKS
// =============================================================================

export const useStockChartsData = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['reports', 'charts', filters],
    queryFn: () => reportsApi.getCharts(filters),
    select: (data) => data.data,
    staleTime: STALE_TIME,
  })
}

export const useStockTrendAnalysis = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['reports', 'trend-analysis', filters],
    queryFn: () => reportsApi.getCharts(filters),
    select: (data) => data.data,
    staleTime: STALE_TIME,
  })
}

export const useStockLevels = (filters?: ReportFilter) => {
  return useStockStatusSummary(filters) // ✅ Redirect to summary since level data is consolidated
}

export const useExpiryAnalysis = (filters?: ReportFilter & { days?: number }) => {
  return useQuery({
    queryKey: ['reports', 'expiry', filters],
    queryFn: () => reportsApi.getExpiry(filters),
    select: (data) => data.data,
    staleTime: STALE_TIME,
  })
}

export const useTopUsedItems = (filters?: ReportFilter & { limit?: number }) => {
  return useQuery({
    queryKey: ['reports', 'top-used', filters],
    queryFn: () => reportsApi.getTopUsed(filters),
    select: (data) => data.data,
    staleTime: STALE_TIME,
  })
}

export const useSupplierPerformance = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['reports', 'supplier-performance', filters],
    queryFn: () => reportsApi.getSupplierPerformance(filters),
    select: (data) => data.data,
    staleTime: STALE_TIME,
  })
}

export const useClinicComparison = () => {
  return useQuery({
    queryKey: ['reports', 'clinic-comparison'],
    queryFn: () => reportsApi.getClinicComparison(),
    select: (data) => data.data,
    staleTime: STALE_TIME,
  })
}

export const useCustomReport = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['reports', 'custom', filters],
    queryFn: () => reportsApi.getCustomReport(filters),
    select: (data) => data.data,
    staleTime: STALE_TIME,
  })
}

// 📈 TRENDS & ANALYTICS
export const useStockTrends = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['reports', 'trends', filters],
    queryFn: () => reportsApi.getTrends(filters),
    select: (data) => data.data,
    staleTime: STALE_TIME,
  })
}

export const useCategoryDistribution = () => {
  return useQuery({
    queryKey: ['reports', 'categories'],
    queryFn: () => reportsApi.getCategories(),
    select: (data) => data.data,
    staleTime: STALE_TIME,
  })
}

export const useStockForecast = () => {
  return useQuery({
    queryKey: ['reports', 'forecast'],
    queryFn: () => reportsApi.getForecast(),
    select: (data) => data.data,
    staleTime: STALE_TIME,
  })
}

// Alias'lar ve Varsayılanlar
export const useStockReports = useAllStockReports;
export default useStockReports;
