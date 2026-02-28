import { Timestamp } from 'firebase/firestore'

export type UserRole = 'SUPERADMIN' | 'MANAGER' | 'EMPLOYEE'
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED'
export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED'
export type AssetStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RETIRED'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  companyId: string
  departmentId?: string
  phone?: string
  status: 'active' | 'inactive' | 'pending'
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string // User ID of creator
}

export interface Company {
  id: string
  name: string
  industry?: string
  website?: string
  logo?: string
  address?: string
  country?: string
  status: 'active' | 'inactive'
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Department {
  id: string
  name: string
  companyId: string
  managerId?: string
  description?: string
  status: 'active' | 'inactive'
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Project {
  id: string
  name: string
  description?: string
  companyId: string
  status: ProjectStatus
  startDate: Timestamp
  endDate: Timestamp
  managerId: string
  teamMemberIds: string[]
  budget?: number
  kpiTarget?: number
  riskLevel: RiskLevel
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Task {
  id: string
  projectId: string
  title: string
  description?: string
  assignedTo: string // User ID
  status: TaskStatus
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate: Timestamp
  completedDate?: Timestamp
  estimatedHours?: number
  actualHours?: number
  dependencies: string[] // Task IDs
  attachments: string[] // File paths
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
}

export interface Asset {
  id: string
  name: string
  description?: string
  type: string
  companyId: string
  status: AssetStatus
  currentUser?: string // User ID if in use
  location?: string
  value?: number
  purchaseDate?: Timestamp
  expiryDate?: Timestamp
  serialNumber?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface ChatMessage {
  id: string
  projectId?: string
  senderId: string
  senderName: string
  message: string
  attachments?: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface KPIMetric {
  id: string
  projectId: string
  metricName: string
  targetValue: number
  currentValue: number
  unit: string
  lastUpdated: Timestamp
  createdAt: Timestamp
}

export interface RiskAssessment {
  id: string
  projectId: string
  riskName: string
  description?: string
  likelihood: number // 1-5
  impact: number // 1-5
  mitigation?: string
  owner: string // User ID
  status: 'OPEN' | 'MITIGATED' | 'CLOSED'
  createdAt: Timestamp
  updatedAt: Timestamp
}
