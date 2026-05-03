// src/modules/common/Components/EmptyState.tsx

import React from 'react'
import { Button, Space, Typography } from 'antd'

const { Title, Text } = Typography

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    type?: 'primary' | 'default' | 'dashed' | 'link' | 'text'
    icon?: React.ReactNode
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  size?: 'small' | 'medium' | 'large'
}

const sizeConfig = {
  small: {
    iconSize: 32,
    titleLevel: 5 as const,
    padding: '40px 20px',
  },
  medium: {
    iconSize: 64,
    titleLevel: 4 as const,
    padding: '60px 30px',
  },
  large: {
    iconSize: 96,
    titleLevel: 3 as const,
    padding: '80px 40px',
  },
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'medium',
}) => {
  const config = sizeConfig[size]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: config.padding,
        textAlign: 'center',
      }}
    >
      {icon && (
        <div
          style={{
            fontSize: config.iconSize,
            color: '#d9d9d9',
            marginBottom: 16,
          }}
        >
          {icon}
        </div>
      )}

      <Title
        level={config.titleLevel}
        style={{
          margin: '0 0 8px 0',
          color: '#262626',
        }}
      >
        {title}
      </Title>

      {description && (
        <Text
          type="secondary"
          style={{
            fontSize: size === 'small' ? 14 : 16,
            maxWidth: 400,
            marginBottom: 24,
          }}
        >
          {description}
        </Text>
      )}

      {(action || secondaryAction) && (
        <Space size="middle">
          {action && (
            <Button
              type={action.type || 'primary'}
              size={size === 'small' ? 'middle' : 'large'}
              icon={action.icon}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              type="link"
              size={size === 'small' ? 'middle' : 'large'}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </Space>
      )}
    </div>
  )
}

// Önceden tanımlanmış common empty states
export const EmptyStockList: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
  <EmptyState
    icon={<span style={{ fontSize: 64 }}>📦</span>}
    title="Henüz ürün yok"
    description="İlk ürününüzü ekleyerek stok takibine başlayın."
    action={{
      label: 'Ürün Ekle',
      onClick: onCreate,
      type: 'primary',
      icon: <span>+</span>,
    }}
  />
)

export const EmptyAlertList: React.FC = () => (
  <EmptyState
    icon={<span style={{ fontSize: 64 }}>🔔</span>}
    title="Aktif uyarı yok"
    description="Tüm stoklarınız yeterli seviyede. Harika!"
    size="medium"
  />
)

export const EmptyTransferList: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
  <EmptyState
    icon={<span style={{ fontSize: 64 }}>🚚</span>}
    title="Transfer bulunmuyor"
    description="Klinikler arası transfer başlatmak için yeni bir istek oluşturun."
    action={{
      label: 'Transfer Başlat',
      onClick: onCreate,
      type: 'primary',
    }}
  />
)

export const EmptySearchResults: React.FC<{ searchTerm: string; onClear: () => void }> = ({
  searchTerm,
  onClear,
}) => (
  <EmptyState
    icon={<span style={{ fontSize: 48 }}>🔍</span>}
    title="Sonuç bulunamadı"
    description={`"${searchTerm}" için herhangi bir sonuç bulunamadı.`}
    size="medium"
    action={{
      label: 'Aramayı Temizle',
      onClick: onClear,
      type: 'default',
    }}
  />
)

export const EmptyHistory: React.FC = () => (
  <EmptyState
    icon={<span style={{ fontSize: 48 }}>📜</span>}
    title="İşlem geçmişi boş"
    description="Henüz bu ürün için bir stok hareketi yapılmamış."
    size="small"
  />
)

export default EmptyState
