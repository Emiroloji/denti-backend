// src/modules/admin/Types/company.types.ts

export type SubscriptionPlan = 'basic' | 'standard' | 'premium';
export type CompanyStatus = 'active' | 'inactive';

export interface Company {
  id: number;
  name: string;
  domain: string;
  subscription_plan: SubscriptionPlan;
  max_users: number;
  status: CompanyStatus;
  created_at: string;
  updated_at: string;
}

export interface CompanyStorePayload {
  name: string;
  domain: string;
  subscription_plan: SubscriptionPlan;
  max_users: number;
  owner_name: string;
  owner_email: string;
}

export interface CompanyUpdatePayload extends Partial<Omit<CompanyStorePayload, 'owner_name' | 'owner_email'>> {
  status?: CompanyStatus;
}

export interface CompanyStoreResponse {
  success: boolean;
  message: string;
  data: {
    company: Company;
    user: {
      id: number;
      name: string;
      email: string;
    };
    password: string; // Plain-text password (to be shown once)
  };
}
