// src/Components/DebugInfo.tsx - Geçici debug component

import React from 'react'
import { Card, Typography } from 'antd'

const { Text } = Typography

import { useAuthStore } from '../stores/authStore'
import { usePermissions } from '../Hooks/usePermissions'

export const DebugInfo: React.FC = () => {
  const { user, permissions } = useAuth()
  const { isAdmin, isSuperAdmin, isCompanyOwner } = usePermissions()

  if (import.meta.env.MODE === 'production') return null;
  return (
    <Card title="Debug Info" style={{ margin: '16px 0' }}>
      <div>
        <Text strong>API URL: </Text>
        <Text code>{import.meta.env.VITE_API_URL || 'Not set'}</Text>
      </div>
      <div>
        <Text strong>User Roles: </Text>
        <Text code>{JSON.stringify(user?.roles || user?.role || 'No roles')}</Text>
      </div>
      <div>
        <Text strong>Permissions: </Text>
        <Text code>{JSON.stringify(permissions || [])}</Text>
      </div>
      <div>
        <Text strong>Flags: </Text>
        <Text code>isAdmin: {String(isAdmin)} | isSuperAdmin: {String(isSuperAdmin())} | isCompanyOwner: {String(isCompanyOwner())}</Text>
      </div>
    </Card>
  )
}