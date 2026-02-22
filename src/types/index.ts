export type Role = 'admin' | 'host' | 'visitor';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  department: string;
  phone: string;
  avatar: string;
  createdAt: string;
  // Visitor-specific fields
  company?: string;
  reputationScore?: number;
  riskScore?: number;
  totalVisits?: number;
}

export type VisitorStatus = 'pending' | 'approved' | 'rejected' | 'checked-in' | 'checked-out';
export type AccessResult = 'granted' | 'denied';

export interface Visitor {
  id: string;
  visitorName: string;
  email: string;
  phone: string;
  company: string;
  purpose: string;
  hostId: string;
  hostName: string;
  locationId: string;
  visitDate: string;
  visitTime: string;
  endTime: string;
  status: VisitorStatus;
  accessTemplateId: string | null;
  policyId: string | null;
  barcodeId: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  isBlacklisted: boolean;
  notes: string;
  createdAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  category: string;
  // Extended visitor-portal fields
  visitorUserId?: string | null;
  idProof?: string | null;
  violations?: number;
}

export interface Device {
  id: string;
  name: string;
  type: 'main-gate' | 'floor-door' | 'restricted-room' | 'server-room';
  zoneId: string;
  locationId: string;
  status: 'active' | 'offline';
  model: string;
  ip: string;
  batteryLevel: number;
  lastPing: string;
  totalScans: number;
  installedAt: string;
}

export interface Zone {
  id: string;
  name: string;
  code: string;
  locationId: string;
  building: string;
  floor: string;
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface Location {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  buildings: string[];
  active: boolean;
  adminNotes: string;
}

export interface TimeRestriction {
  startTime: string;
  endTime: string;
  daysAllowed: string[];
}

export interface AccessTemplate {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
  allowedZones: string[];
  allowedDevices: string[];
  timeRestrictions: TimeRestriction;
  maxDuration: number;
  autoExpiry: boolean;
  visitorCategory: string;
  requiresEscort: boolean;
  createdAt: string;
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  allowedTimeWindow: { start: string; end: string };
  maxVisitDuration: number;
  antiPassback: boolean;
  autoExpiry: boolean;
  reEntryAllowed: boolean;
  blacklistCheck: boolean;
  escortRequired: boolean;
  applicableZones: string[];
  createdAt: string;
  active: boolean;
}

export interface ScanLog {
  id: string;
  visitorId: string;
  visitorName: string;
  barcodeId: string;
  deviceId: string;
  deviceName: string;
  zoneId: string;
  zoneName: string;
  accessResult: AccessResult;
  timestamp: string;
  reason: string;
}

export interface DelegationLog {
  id: string;
  visitorId: string;
  visitorName: string;
  originalHostId: string;
  originalHostName: string;
  delegatedToHostId: string;
  delegatedToHostName: string;
  reason: string;
  status: 'active' | 'completed';
  approvedByAdmin: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
