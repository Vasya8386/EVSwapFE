const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

export interface DashboardStats {
  totalTransactions: number
  transactionGrowth: number
  totalRevenue: number
  revenueGrowth: number
  totalBatteries: number
  damagedBatteries: number
}

export interface TransactionByDay {
  day: string
  count: number
}

export interface RevenueByDay {
  day: string
  revenue: number
}

export interface BatteryStatus {
  full: number
  charging: number
  maintenance: number
  damaged: number
}

export interface DashboardSummary {
  stats: DashboardStats
  transactionsByDay: TransactionByDay[]
  revenueByDay: RevenueByDay[]
  batteryStatus: BatteryStatus
}

export interface WeeklyComparison {
  currentWeek: {
    totalTransactions: number
    totalRevenue: number
  }
  lastWeek: {
    totalTransactions: number
    totalRevenue: number
  }
  growth: {
    transactionGrowth: number
    revenueGrowth: number
  }
}

class DashboardService {
  /**
   * Lấy toàn bộ dữ liệu dashboard (recommended - 1 request duy nhất)
   */
  async getDashboardSummary(): Promise<DashboardSummary> {
    const response = await fetch(`${API_BASE_URL}/transactions/dashboard/summary`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard summary: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Lấy thống kê tổng quan
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE_URL}/transactions/dashboard/stats`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard stats: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Lấy giao dịch theo ngày
   */
  async getTransactionsByDay(): Promise<TransactionByDay[]> {
    const response = await fetch(`${API_BASE_URL}/transactions/dashboard/by-day`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch transactions by day: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Lấy doanh thu theo ngày
   */
  async getRevenueByDay(): Promise<RevenueByDay[]> {
    const response = await fetch(`${API_BASE_URL}/transactions/dashboard/revenue-by-day`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch revenue by day: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Lấy trạng thái pin
   */
  async getBatteryStatus(): Promise<BatteryStatus> {
    const response = await fetch(`${API_BASE_URL}/transactions/dashboard/battery-status`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch battery status: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Lấy so sánh theo tuần
   */
  async getWeeklyComparison(): Promise<WeeklyComparison> {
    const response = await fetch(`${API_BASE_URL}/transactions/dashboard/weekly-comparison`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch weekly comparison: ${response.statusText}`)
    }
    
    return response.json()
  }
}

// Export singleton instance
export const dashboardService = new DashboardService()

// Export default
export default dashboardService