// =====================================================
// CROSS-APP INTEGRATION SERVICE
// Serviço para integrar dados entre os apps Rumo
// =====================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// URLs base dos outros apps (configurar conforme deploy)
const RUMO_OPERACIONAL_API = process.env.EXPO_PUBLIC_RUMO_OPERACIONAL_API || '';
const RUMO_MAQUINAS_API = process.env.EXPO_PUBLIC_RUMO_MAQUINAS_API || '';

// ==================== TYPES ====================
export interface MachineData {
  id: string;
  name: string;
  type: string; // tractor, harvester, sprayer, etc.
  brand: string;
  model: string;
  year: number;
  hourMeter: number;
  status: 'active' | 'maintenance' | 'inactive';
  lastMaintenance?: string;
  nextMaintenance?: string;
  fuelConsumption?: number; // L/h
  operationalCost?: number; // R$/h
  farm_id?: string;
}

export interface MachineOperation {
  id: string;
  machine_id: string;
  machine_name: string;
  operation_type: string;
  start_time: string;
  end_time?: string;
  hours_worked: number;
  fuel_used?: number;
  area_covered?: number; // hectares
  operator_name?: string;
  farm_id?: string;
  sector?: string;
  notes?: string;
}

export interface MachineMaintenanceLog {
  id: string;
  machine_id: string;
  machine_name: string;
  maintenance_type: 'preventive' | 'corrective' | 'routine';
  description: string;
  date: string;
  cost: number;
  parts_replaced?: string[];
  technician?: string;
  next_maintenance_date?: string;
  next_maintenance_hours?: number;
}

export interface OperationalCostData {
  id: string;
  date: string;
  sector_name: string;
  operation_name: string;
  expense_description: string;
  value: number;
  status: string;
}

// ==================== CACHE KEYS ====================
const CACHE_KEYS = {
  MACHINES: 'rumo_machines_cache',
  MACHINE_OPERATIONS: 'rumo_machine_operations_cache',
  OPERATIONAL_COSTS: 'rumo_operational_costs_cache',
  LAST_SYNC: 'rumo_last_sync',
};

// ==================== INTEGRATION SERVICE ====================
export const IntegrationService = {
  // ============ RUMO MÁQUINAS INTEGRATION ============

  /**
   * Fetch machines from Rumo Máquinas app
   * Uses external API or shared Supabase tables
   */
  async getMachines(): Promise<MachineData[]> {
    try {
      // Try to get from shared Supabase table first
      const { data, error } = await supabase.from('machines').select('*').order('name');

      if (!error && data) {
        // Cache the data
        await AsyncStorage.setItem(CACHE_KEYS.MACHINES, JSON.stringify(data));
        return data;
      }

      // Fallback to cached data
      const cached = await AsyncStorage.getItem(CACHE_KEYS.MACHINES);
      if (cached) {
        return JSON.parse(cached);
      }

      // If external API is configured, try that
      if (RUMO_MAQUINAS_API) {
        const response = await fetch(`${RUMO_MAQUINAS_API}/api/machines`);
        if (response.ok) {
          const machines = await response.json();
          await AsyncStorage.setItem(CACHE_KEYS.MACHINES, JSON.stringify(machines));
          return machines;
        }
      }

      return [];
    } catch (error) {
      console.error('Error fetching machines:', error);
      // Return cached data on error
      const cached = await AsyncStorage.getItem(CACHE_KEYS.MACHINES);
      return cached ? JSON.parse(cached) : [];
    }
  },

  /**
   * Fetch machine operations for cost integration
   */
  async getMachineOperations(startDate?: Date, endDate?: Date): Promise<MachineOperation[]> {
    try {
      let query = supabase
        .from('machine_operations')
        .select('*')
        .order('start_time', { ascending: false });

      if (startDate) {
        query = query.gte('start_time', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('start_time', endDate.toISOString());
      }

      const { data, error } = await query;

      if (!error && data) {
        await AsyncStorage.setItem(CACHE_KEYS.MACHINE_OPERATIONS, JSON.stringify(data));
        return data;
      }

      const cached = await AsyncStorage.getItem(CACHE_KEYS.MACHINE_OPERATIONS);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Error fetching machine operations:', error);
      return [];
    }
  },

  /**
   * Get machine maintenance costs for expense integration
   */
  async getMachineMaintenanceCosts(
    period: 'month' | 'quarter' | 'year' = 'month'
  ): Promise<MachineMaintenanceLog[]> {
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }

      const { data, error } = await supabase
        .from('machine_maintenance')
        .select('*')
        .gte('date', startDate.toISOString())
        .order('date', { ascending: false });

      if (!error && data) {
        return data;
      }

      return [];
    } catch (error) {
      console.error('Error fetching maintenance costs:', error);
      return [];
    }
  },

  // ============ AGROFINANCE OPERACIONAL INTEGRATION ============

  /**
   * Fetch operational costs from Agrofinance Operacional
   */
  async getOperationalCosts(): Promise<OperationalCostData[]> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select(
          `
          id,
          date,
          description,
          actual_value,
          status,
          sector:sectors(name),
          operation:operations(name)
        `
        )
        .order('date', { ascending: false });

      if (!error && data) {
        const mapped = data.map((item: any) => ({
          id: item.id,
          date: item.date,
          sector_name: item.sector?.name || 'Sem setor',
          operation_name: item.operation?.name || 'Sem operação',
          expense_description: item.description,
          value: item.actual_value || 0,
          status: item.status,
        }));
        await AsyncStorage.setItem(CACHE_KEYS.OPERATIONAL_COSTS, JSON.stringify(mapped));
        return mapped;
      }

      const cached = await AsyncStorage.getItem(CACHE_KEYS.OPERATIONAL_COSTS);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Error fetching operational costs:', error);
      return [];
    }
  },

  // ============ AGGREGATED ANALYTICS ============

  /**
   * Get total machine costs per hectare
   */
  async getMachineCostPerHectare(farmId?: string): Promise<{
    totalCost: number;
    fuelCost: number;
    maintenanceCost: number;
    operatorCost: number;
    costPerHectare: number;
    totalHectares: number;
  }> {
    try {
      // Get machine operations
      const operations = await this.getMachineOperations();
      const maintenance = await this.getMachineMaintenanceCosts('year');

      // Calculate fuel cost (assuming average R$ 6/L)
      const fuelCost = operations.reduce((sum, op) => sum + (op.fuel_used || 0) * 6, 0);

      // Calculate maintenance cost
      const maintenanceCost = maintenance.reduce((sum, m) => sum + m.cost, 0);

      // Calculate operator cost (assuming average R$ 50/h)
      const totalHours = operations.reduce((sum, op) => sum + op.hours_worked, 0);
      const operatorCost = totalHours * 50;

      // Total hectares covered
      const totalHectares = operations.reduce((sum, op) => sum + (op.area_covered || 0), 0);

      const totalCost = fuelCost + maintenanceCost + operatorCost;
      const costPerHectare = totalHectares > 0 ? totalCost / totalHectares : 0;

      return {
        totalCost,
        fuelCost,
        maintenanceCost,
        operatorCost,
        costPerHectare,
        totalHectares,
      };
    } catch (error) {
      console.error('Error calculating machine cost per hectare:', error);
      return {
        totalCost: 0,
        fuelCost: 0,
        maintenanceCost: 0,
        operatorCost: 0,
        costPerHectare: 0,
        totalHectares: 0,
      };
    }
  },

  /**
   * Get machine utilization statistics
   */
  async getMachineUtilization(): Promise<{
    totalMachines: number;
    activeMachines: number;
    inMaintenance: number;
    averageHoursPerDay: number;
    topMachines: { name: string; hours: number; efficiency: number }[];
  }> {
    try {
      const machines = await this.getMachines();
      const operations = await this.getMachineOperations();

      const totalMachines = machines.length;
      const activeMachines = machines.filter((m) => m.status === 'active').length;
      const inMaintenance = machines.filter((m) => m.status === 'maintenance').length;

      // Calculate average hours per day (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentOps = operations.filter((op) => new Date(op.start_time) >= thirtyDaysAgo);
      const totalHours = recentOps.reduce((sum, op) => sum + op.hours_worked, 0);
      const averageHoursPerDay = totalHours / 30;

      // Top machines by hours worked
      const machineHours: Record<string, { name: string; hours: number }> = {};
      recentOps.forEach((op) => {
        if (!machineHours[op.machine_id]) {
          machineHours[op.machine_id] = { name: op.machine_name, hours: 0 };
        }
        machineHours[op.machine_id].hours += op.hours_worked;
      });

      const topMachines = Object.values(machineHours)
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 5)
        .map((m) => ({
          name: m.name,
          hours: m.hours,
          efficiency: (m.hours / (30 * 10)) * 100, // Assuming 10h max per day
        }));

      return {
        totalMachines,
        activeMachines,
        inMaintenance,
        averageHoursPerDay,
        topMachines,
      };
    } catch (error) {
      console.error('Error calculating machine utilization:', error);
      return {
        totalMachines: 0,
        activeMachines: 0,
        inMaintenance: 0,
        averageHoursPerDay: 0,
        topMachines: [],
      };
    }
  },

  // ============ SYNC ============

  /**
   * Sync all data between apps
   */
  async syncAll(): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Sync machines
      await this.getMachines();
    } catch (e) {
      errors.push('Falha ao sincronizar máquinas');
    }

    try {
      // Sync machine operations
      await this.getMachineOperations();
    } catch (e) {
      errors.push('Falha ao sincronizar operações de máquinas');
    }

    try {
      // Sync operational costs
      await this.getOperationalCosts();
    } catch (e) {
      errors.push('Falha ao sincronizar custos operacionais');
    }

    // Update last sync time
    await AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());

    return {
      success: errors.length === 0,
      errors,
    };
  },

  /**
   * Get last sync time
   */
  async getLastSyncTime(): Promise<Date | null> {
    const lastSync = await AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC);
    return lastSync ? new Date(lastSync) : null;
  },

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    await AsyncStorage.multiRemove([
      CACHE_KEYS.MACHINES,
      CACHE_KEYS.MACHINE_OPERATIONS,
      CACHE_KEYS.OPERATIONAL_COSTS,
      CACHE_KEYS.LAST_SYNC,
    ]);
  },
};

export default IntegrationService;
