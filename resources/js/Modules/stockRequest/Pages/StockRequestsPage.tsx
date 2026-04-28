// src/modules/stockRequest/Pages/StockRequestsPage.tsx

import React from 'react'
import { StockRequestList } from '../Components/StockRequestList'

interface StockRequestsPageProps {
  currentUser?: string
}

export const StockRequestsPage: React.FC<StockRequestsPageProps> = ({ 
  currentUser = 'Sistem Kullanıcısı' 
}) => {
  return (
    <StockRequestList 
      currentUser={currentUser}
      showCreateForm={true}
    />
  )
}