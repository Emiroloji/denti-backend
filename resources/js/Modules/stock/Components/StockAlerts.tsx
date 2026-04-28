import React from 'react'
import { Alert, Space, Tooltip } from 'antd'
import { Stock } from '../Types/stock.types'

interface StockAlertsProps {
  criticalStockItems: Stock[]
  lowStockItems: Stock[]
  expiringItems: Stock[]
}

export const StockAlerts: React.FC<StockAlertsProps> = ({
  criticalStockItems,
  lowStockItems,
  expiringItems,
}) => {
  const hasAlerts = (criticalStockItems?.length > 0) || (lowStockItems?.length > 0) || (expiringItems?.length > 0);

  if (!hasAlerts) return null;

  const getProductList = (items: Stock[]) => {
    return items.map(item => item.name).join(', ');
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <Space size={[8, 8]} wrap>
        {criticalStockItems && criticalStockItems.length > 0 && (
          <Tooltip title={getProductList(criticalStockItems)}>
            <Alert
              message={`${criticalStockItems.length} Kritik Seviye`}
              type="error"
              showIcon
              style={{ padding: '4px 12px', borderRadius: '20px' }}
            />
          </Tooltip>
        )}
        
        {lowStockItems && lowStockItems.length > 0 && (
          <Tooltip title={getProductList(lowStockItems)}>
            <Alert
              message={`${lowStockItems.length} Düşük Seviye`}
              type="warning"
              showIcon
              style={{ padding: '4px 12px', borderRadius: '20px' }}
            />
          </Tooltip>
        )}

        {expiringItems && expiringItems.length > 0 && (
          <Tooltip title={getProductList(expiringItems)}>
            <Alert
              message={`${expiringItems.length} Ürün SKT Yakın`}
              type="info"
              showIcon
              style={{ padding: '4px 12px', borderRadius: '20px' }}
            />
          </Tooltip>
        )}
      </Space>
    </div>
  )
}