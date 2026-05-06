// s@/Services/api.ts

import axios from 'axios'
import { antdHelper } from '../Utils/antdHelper'

// Axios tiplerini override et (çünkü interceptor'da direkt response.data dönüyoruz)
declare module 'axios' {
  export interface AxiosInstance {
    request<T = any, R = T, D = any>(config: AxiosRequestConfig<D>): Promise<R>;
    get<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    delete<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    head<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    options<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    post<T = any, R = T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
    put<T = any, R = T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
    patch<T = any, R = T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
  }
}

// API instance oluştur
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // Cookies handle the session (Sanctum)
  withXSRFToken: true,   // Modern axios needs this for CSRF headers
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  timeout: 30000,
})

// CSRF singleton promise — eşzamanlı POST isteklerinde tek bir CSRF isteği atılır
let csrfPromise: Promise<void> | null = null

// CSRF check helper
const ensureCsrf = async (configBaseURL: string) => {
  if (document.cookie.includes('XSRF-TOKEN')) return

  // Race condition önleme: zaten devam eden bir CSRF isteği varsa onu bekle
  if (!csrfPromise) {
    const baseUrl = configBaseURL || api.defaults.baseURL || '/api';
    const domain = baseUrl.startsWith('/') ? '' : new URL(baseUrl).origin;

    csrfPromise = axios
      .get(`${domain}/sanctum/csrf-cookie`, { withCredentials: true })
      .then(() => {})
      .catch((error) => {
        csrfPromise = null 
        throw error
      })
      .finally(() => {
        // Not: catch'ten sonra finally çalışır. 
        // Eğer başarılıysa null yaparız ki bir sonraki ihtiyaçta tekrar çalışsın.
        // Eğer başarısızsa catch içinde zaten null yaptık.
        csrfPromise = null
      })
  }

  return csrfPromise
}

// Request Interceptor
api.interceptors.request.use(
  async (config) => {
    const method = config.method?.toLowerCase()
    // CSRF protection for state-changing requests (except GET)
    if (method && method !== 'get') {
      try {
        await ensureCsrf(config.baseURL || api.defaults.baseURL || '')
      } catch (error) {
        // CSRF alınamazsa isteği durdur
        return Promise.reject(error)
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // Error handling
    if (error.response?.status === 401) {
      // /auth/me veya /login gibi auth endpoint'lerinde sessiz kal (zaten store yönetiyor)
      const url = error.config?.url || ''
      if (!url.includes('/auth/me') && !url.includes('/login') && !url.includes('/auth/logout')) {
        antdHelper.message?.error('Oturum süreniz doldu!')
        // Global event fırlat (App.tsx dinleyecek)
        window.dispatchEvent(new Event('auth:unauthorized'))
      }
    } else if (error.response?.status === 403) {
      const url = error.config?.url || ''
      // Sessiz: layout badge/polling endpoint'i yetkisiz kullanıcılar için spam üretmesin
      if (!url.includes('/stock-alerts/pending/count')) {
        antdHelper.message?.error('Bu işlemi yapmaya yetkiniz yok!')
      }
    } else if (error.response?.status === 404) {
      // ✅ 404 artık kullanıcıya warning olarak gösteriliyor
      const msg = error.response.data?.message || 'İstenen kayıt bulunamadı.'
      antdHelper.message?.warning(msg)
      console.warn('404 Error:', error.config?.url)
    } else if (error.response?.status === 419) {
      // 419 is often used for CSRF mismatch in Laravel
      antdHelper.message?.error('CSRF hatası, lütfen sayfayı yenileyin.')
    } else if (error.response?.status === 422) {
      const errors = error.response.data?.errors
      const backendMessage = error.response.data?.message

      if (errors && Object.keys(errors).length > 0) {
        // İlk hatayı bul ve göster
        const firstErrorKey = Object.keys(errors)[0];
        const firstErrorMessage = Array.isArray(errors[firstErrorKey]) 
          ? errors[firstErrorKey][0] 
          : errors[firstErrorKey];
          
        antdHelper.message?.error(firstErrorMessage || 'Girilen veriler geçerli değil.');
      } else if (backendMessage) {
        antdHelper.message?.error(backendMessage)
      } else {
        antdHelper.message?.error('Doğrulama hatası oluştu.')
      }
    } else if (error.response?.status >= 500) {
      // Sentry / LogRocket tarzı hata izleme sistemine loglama örneği
      console.error('[Error Tracking] API 500 Hatası:', {
        url: error.config?.url,
        message: error.message,
        response: error.response?.data
      })
      antdHelper.message?.error('Sunucu hatası! Backend çalışıyor mu kontrol edin.')
    } else {
      const msg = error.response?.data?.message || error.message || 'Bir hata oluştu!'
      antdHelper.message?.error(msg)
    }

    return Promise.reject(error)
  }
)

// Default export da ekleyelim
export default api