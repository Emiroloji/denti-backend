import React from 'react'
import { Alert, Space, Tooltip } from 'antd'
import { Stock } from '../Types/stock.types'

interface StockAlertsProps {
  criticalStockItems: Stock[]
  lowStockItems: Stock[]
  criticalExpiringItems: Stock[]
  lowExpiringItems: Stock[]
}

export const StockAlerts: React.FC<StockAlertsProps> = ({
  criticalStockItems,
  lowStockItems,
  criticalExpiringItems,
  lowExpiringItems,
}) => {
  const hasAlerts = (criticalStockItems?.length > 0) || (lowStockItems?.length > 0) || (criticalExpiringItems?.length > 0) || (lowExpiringItems?.length > 0);

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
              message={`${criticalStockItems.length} Kritik Seviye Stok`}
              type="error"
              showIcon
              style={{ padding: '4px 12px', borderRadius: '20px' }}
            />
          </Tooltip>
        )}

        {criticalExpiringItems && criticalExpiringItems.length > 0 && (
          <Tooltip title={getProductList(criticalExpiringItems)}>
            <Alert
              message={`${criticalExpiringItems.length} Kritik Seviye Miyat`}
              type="error"
              showIcon
              style={{ padding: '4px 12px', borderRadius: '20px', border: '1px solid #ff4d4f' }}
            />
          </Tooltip>
        )}
        
        {lowStockItems && lowStockItems.length > 0 && (
          <Tooltip title={getProductList(lowStockItems)}>
            <Alert
              message={`${lowStockItems.length} Düşük Seviye Stok`}
              type="warning"
              showIcon
              style={{ padding: '4px 12px', borderRadius: '20px' }}
            />
          </Tooltip>
        )}

        {lowExpiringItems && lowExpiringItems.length > 0 && (
          <Tooltip title={getProductList(lowExpiringItems)}>
            <Alert
              message={`${lowExpiringItems.length} Düşük Seviye Miyat`}
              type="warning"
              showIcon
              style={{ padding: '4px 12px', borderRadius: '20px', border: '1px solid #faad14' }}
            />
          </Tooltip>
        )}
      </Space>
    </div>
  )
}