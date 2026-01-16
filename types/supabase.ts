export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      farms: {
        Row: {
          id: string
          name: string
          cpf_cnpj: string
          state_registration: string | null
          area: number | null
          city: string
          state: string
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          cpf_cnpj: string
          state_registration?: string | null
          area?: number | null
          city: string
          state: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          cpf_cnpj?: string
          state_registration?: string | null
          area?: number | null
          city?: string
          state?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      operations: {
        Row: {
          id: string
          farm_id: string | null
          name: string
          type: string
          color: string | null
          icon: string | null
          budget: number
          spent: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          farm_id?: string | null
          name: string
          type: string
          color?: string | null
          icon?: string | null
          budget?: number
          spent?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          farm_id?: string | null
          name?: string
          type?: string
          color?: string | null
          icon?: string | null
          budget?: number
          spent?: number
          created_at?: string
          updated_at?: string
        }
      }
      suppliers: {
        Row: {
          id: string
          name: string
          cpf_cnpj: string
          category: string | null
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          cpf_cnpj: string
          category?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          cpf_cnpj?: string
          category?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          cpf_cnpj: string
          type: string
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          state_registration: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          cpf_cnpj: string
          type: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          state_registration?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          cpf_cnpj?: string
          type?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          state_registration?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          description: string
          supplier_id: string | null
          operation_id: string | null
          cost_center_id: string | null
          category: string
          subcategory: string | null
          negotiated_value: number
          invoice_value: number | null
          actual_value: number | null
          date: string
          due_date: string
          competence: string
          payment_method: string
          installments: number | null
          current_installment: number | null
          status: string
          notes: string | null
          tags: string[] | null
          service_confirmed: boolean
          service_confirmed_by: string | null
          service_confirmed_at: string | null
          created_by: string
          created_at: string
          approved_by: string | null
          approved_at: string | null
          paid_by: string | null
          paid_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          description: string
          supplier_id?: string | null
          operation_id?: string | null
          cost_center_id?: string | null
          category: string
          subcategory?: string | null
          negotiated_value: number
          invoice_value?: number | null
          actual_value?: number | null
          date: string
          due_date: string
          competence: string
          payment_method: string
          installments?: number | null
          current_installment?: number | null
          status?: string
          notes?: string | null
          tags?: string[] | null
          service_confirmed?: boolean
          service_confirmed_by?: string | null
          service_confirmed_at?: string | null
          created_by: string
          created_at?: string
          approved_by?: string | null
          approved_at?: string | null
          paid_by?: string | null
          paid_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          description?: string
          supplier_id?: string | null
          operation_id?: string | null
          cost_center_id?: string | null
          category?: string
          subcategory?: string | null
          negotiated_value?: number
          invoice_value?: number | null
          actual_value?: number | null
          date?: string
          due_date?: string
          competence?: string
          payment_method?: string
          installments?: number | null
          current_installment?: number | null
          status?: string
          notes?: string | null
          tags?: string[] | null
          service_confirmed?: boolean
          service_confirmed_by?: string | null
          service_confirmed_at?: string | null
          created_by?: string
          created_at?: string
          approved_by?: string | null
          approved_at?: string | null
          paid_by?: string | null
          paid_at?: string | null
          updated_at?: string
        }
      }
      contracts: {
        Row: {
          id: string
          type: string
          partner_id: string | null
          operation_id: string | null
          product: string
          quantity: number
          unit: string
          unit_price: number
          total_value: number
          start_date: string
          end_date: string
          status: string
          payment_terms: string | null
          delivery_terms: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          partner_id?: string | null
          operation_id?: string | null
          product: string
          quantity: number
          unit: string
          unit_price: number
          total_value: number
          start_date: string
          end_date: string
          status?: string
          payment_terms?: string | null
          delivery_terms?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          partner_id?: string | null
          operation_id?: string | null
          product?: string
          quantity?: number
          unit?: string
          unit_price?: number
          total_value?: number
          start_date?: string
          end_date?: string
          status?: string
          payment_terms?: string | null
          delivery_terms?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      purchase_orders: {
        Row: {
          id: string
          supplier_id: string | null
          operation_id: string | null
          total_value: number
          status: string
          requested_by: string
          approved_by: string | null
          request_date: string
          expected_delivery_date: string | null
          actual_delivery_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          supplier_id?: string | null
          operation_id?: string | null
          total_value: number
          status?: string
          requested_by: string
          approved_by?: string | null
          request_date: string
          expected_delivery_date?: string | null
          actual_delivery_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          supplier_id?: string | null
          operation_id?: string | null
          total_value?: number
          status?: string
          requested_by?: string
          approved_by?: string | null
          request_date?: string
          expected_delivery_date?: string | null
          actual_delivery_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          name: string
          email: string
          cpf: string | null
          phone: string | null
          role: string
          permissions: Json | null
          farm_ids: string[] | null
          operation_ids: string[] | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          cpf?: string | null
          phone?: string | null
          role: string
          permissions?: Json | null
          farm_ids?: string[] | null
          operation_ids?: string[] | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          cpf?: string | null
          phone?: string | null
          role?: string
          permissions?: Json | null
          farm_ids?: string[] | null
          operation_ids?: string[] | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      assets: {
        Row: {
          id: string
          name: string
          type: string
          operation_id: string | null
          purchase_date: string
          purchase_value: number
          current_value: number
          depreciation_rate: number | null
          brand: string | null
          model: string | null
          serial_number: string | null
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          operation_id?: string | null
          purchase_date: string
          purchase_value: number
          current_value: number
          depreciation_rate?: number | null
          brand?: string | null
          model?: string | null
          serial_number?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          operation_id?: string | null
          purchase_date?: string
          purchase_value?: number
          current_value?: number
          depreciation_rate?: number | null
          brand?: string | null
          model?: string | null
          serial_number?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      revenues: {
        Row: {
          id: string
          description: string
          client_id: string | null
          operation_id: string | null
          category: string
          value: number
          invoice_number: string | null
          date: string
          due_date: string
          received_date: string | null
          status: string
          payment_method: string
          contract_id: string | null
          notes: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          description: string
          client_id?: string | null
          operation_id?: string | null
          category: string
          value: number
          invoice_number?: string | null
          date: string
          due_date: string
          received_date?: string | null
          status?: string
          payment_method: string
          contract_id?: string | null
          notes?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          description?: string
          client_id?: string | null
          operation_id?: string | null
          category?: string
          value?: number
          invoice_number?: string | null
          date?: string
          due_date?: string
          received_date?: string | null
          status?: string
          payment_method?: string
          contract_id?: string | null
          notes?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
