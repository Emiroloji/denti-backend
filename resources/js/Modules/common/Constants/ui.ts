// src/modules/common/Constants/ui.ts
// UI tutarlılığı için standart değerler

// 🎨 Renk paleti
export const colors = {
  // Ant Design varsayılan renkleri (referans için)
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#f5222d',
  info: '#1890ff',
  
  // Stok durum renkleri
  stock: {
    normal: '#52c41a',      // Yeşil - Stok yeterli
    low: '#faad14',         // Sarı - Düşük stok
    critical: '#f5222d',    // Kırmızı - Kritik stok
    expired: '#722ed1',     // Mor - Son kullanma geçmiş
    nearExpiry: '#fa8c16',  // Turuncu - Son kullanma yaklaşmış
    inactive: '#d9d9d9',    // Gri - Pasif
  },
  
  // Transfer durum renkleri
  transfer: {
    pending: '#faad14',      // Sarı - Beklemede
    approved: '#1890ff',   // Mavi - Onaylandı
    inTransit: '#13c2c2',  // Cyan - Transfer sürecinde
    completed: '#52c41a',  // Yeşil - Tamamlandı
    rejected: '#f5222d',   // Kırmızı - Reddedildi
    cancelled: '#8c8c8c',  // Gri - İptal edildi
  },
  
  // Alert seviye renkleri
  alert: {
    info: '#1890ff',
    warning: '#faad14',
    error: '#f5222d',
    success: '#52c41a',
  },
}

// 🏷️ Türkçe etiketler ve isimlendirmeler
export const labels = {
  // Buton isimlendirmeleri (Türkçe)
  buttons: {
    // CRUD
    create: 'Oluştur',
    add: 'Ekle',
    edit: 'Düzenle',
    delete: 'Sil',
    save: 'Kaydet',
    cancel: 'İptal',
    close: 'Kapat',
    
    // Stok işlemleri
    use: 'Stok Kullan',
    adjust: 'Düzeltme Yap',
    transfer: 'Transfer Et',
    receive: 'Stok Girişi',
    
    // Transfer işlemleri
    approve: 'Onayla',
    reject: 'Reddet',
    complete: 'Tamamla',
    
    // Diğer
    view: 'Görüntüle',
    details: 'Detaylar',
    filter: 'Filtrele',
    clear: 'Temizle',
    search: 'Ara',
    refresh: 'Yenile',
    export: 'Dışa Aktar',
    import: 'İçe Aktar',
    print: 'Yazdır',
    download: 'İndir',
    upload: 'Yükle',
    next: 'İleri',
    previous: 'Geri',
    back: 'Geri Dön',
    confirm: 'Onayla',
    submit: 'Gönder',
    apply: 'Uygula',
    reset: 'Sıfırla',
    
    // Gelişmiş işlemler
    advanced: 'Gelişmiş İşlemler',
    softDelete: 'Pasife Al',
    hardDelete: 'Kalıcı Sil',
    reactivate: 'Aktif Et',
  },
  
  // Durum etiketleri
  status: {
    // Stok
    active: 'Aktif',
    inactive: 'Pasif',
    deleted: 'Silindi',
    discontinued: 'Üretimden Kaldırıldı',
    
    // Transfer
    pending: 'Beklemede',
    approved: 'Onaylandı',
    inTransit: 'Transfer Sürecinde',
    completed: 'Tamamlandı',
    rejected: 'Reddedildi',
    cancelled: 'İptal Edildi',
    
    // Genel
    yes: 'Evet',
    no: 'Hayır',
    loading: 'Yükleniyor...',
    processing: 'İşleniyor...',
    success: 'Başarılı',
    error: 'Hata',
    warning: 'Uyarı',
    info: 'Bilgi',
  },
  
  // Form alan etiketleri
  form: {
    name: 'Ad',
    description: 'Açıklama',
    category: 'Kategori',
    brand: 'Marka',
    sku: 'SKU / Barkod',
    unit: 'Birim',
    quantity: 'Miktar',
    price: 'Fiyat',
    date: 'Tarih',
    notes: 'Notlar',
    status: 'Durum',
    clinic: 'Klinik',
    company: 'Şirket',
    supplier: 'Tedarikçi',
    expiryDate: 'Son Kullanma Tarihi',
    minStock: 'Minimum Stok',
    criticalStock: 'Kritik Stok',
    location: 'Konum / Raf',
  },
  
  // Tablo başlıkları
  table: {
    actions: 'İşlemler',
    createdAt: 'Oluşturulma',
    updatedAt: 'Güncellenme',
    createdBy: 'Oluşturan',
    updatedBy: 'Güncelleyen',
  },
}

// 📐 Boyut ve boşluk standartları
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

// ⏳ Zaman formatları
export const timeFormats = {
  date: 'DD.MM.YYYY',
  dateTime: 'DD.MM.YYYY HH:mm',
  dateTimeSeconds: 'DD.MM.YYYY HH:mm:ss',
  time: 'HH:mm',
  monthYear: 'MMMM YYYY',
  shortDate: 'DD.MM',
}

// 📊 Pagination standartları
export const pagination = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) => 
    `${range[0]}-${range[1]} / ${total} kayıt`,
}

// 🔤 Input validasyon mesajları
export const validationMessages = {
  required: '${label} zorunludur',
  min: '${label} en az ${min} olmalıdır',
  max: '${label} en fazla ${max} olabilir',
  minLength: '${label} en az ${min} karakter olmalıdır',
  maxLength: '${label} en fazla ${max} karakter olabilir',
  email: 'Geçerli bir e-posta adresi giriniz',
  number: '${label} sayı olmalıdır',
  integer: '${label} tam sayı olmalıdır',
  positive: '${label} pozitif olmalıdır',
  date: 'Geçerli bir tarih giriniz',
  url: 'Geçerli bir URL giriniz',
  pattern: '${label} formatı geçersiz',
}

// 🎯 Tooltip / Info metinleri
export const tooltips = {
  lowStock: 'Stok seviyesi minimum eşiğin altında',
  criticalStock: 'Acil sipariş gerektiren kritik seviye',
  expired: 'Son kullanma tarihi geçmiş - Kullanılamaz',
  nearExpiry: 'Son kullanma tarihi yaklaşıyor',
  pendingTransfer: 'Transfer onayı bekleniyor',
  inTransitTransfer: 'Transfer sürecinde',
  completedTransfer: 'Transfer tamamlandı',
}
