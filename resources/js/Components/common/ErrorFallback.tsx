// s@/Components/common/ErrorFallback.tsx

import React from 'react'
import { Result, Button, Typography } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'

const { Paragraph, Text } = Typography

interface ErrorFallbackProps {
  error?: Error
  resetErrorBoundary?: (...args: any[]) => void
  title?: string
  subTitle?: string
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary,
  title = "Veriler şu an yüklenemiyor",
  subTitle = "Sistemde geçici bir sorun oluştu. Lütfen tekrar deneyin."
}) => {
  return (
    <Result
      status="error"
      title={title}
      subTitle={subTitle}
      extra={[
        <Button 
          type="primary" 
          key="retry" 
          icon={<ReloadOutlined />}
          onClick={resetErrorBoundary}
        >
          Yenile ve Tekrar Dene
        </Button>
      ]}
    >
      {error && (
        <div className="desc">
          <Paragraph>
            <Text
              strong
              style={{
                fontSize: 16,
              }}
            >
              Hata Detayı:
            </Text>
          </Paragraph>
          <Paragraph copyable={{ text: error.message }}>
            <Text type="secondary">{error.message}</Text>
          </Paragraph>
        </div>
      )}
    </Result>
  )
}

export default ErrorFallback
