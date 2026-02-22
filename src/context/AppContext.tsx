import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import visitorsInit from '../data/visitors.json';
import devicesInit from '../data/devices.json';
import scanLogsInit from '../data/scanLogs.json';
import delegationLogsInit from '../data/delegationLogs.json';
import policiesInit from '../data/policies.json';
import accessTemplatesInit from '../data/accessTemplates.json';
import locationsInit from '../data/locations.json';
import zonesInit from '../data/zones.json';
import usersInit from '../data/users.json';
import type {
  Visitor, Device, ScanLog, DelegationLog, Policy, AccessTemplate,
  Location, Zone, User, Notification
} from '../types';

interface AppContextValue {
  visitors: Visitor[];
  devices: Device[];
  scanLogs: ScanLog[];
  delegationLogs: DelegationLog[];
  policies: Policy[];
  accessTemplates: AccessTemplate[];
  locations: Location[];
  zones: Zone[];
  users: User[];
  notifications: Notification[];
  emergencyMode: boolean;
  
  setVisitors: (v: Visitor[]) => void;
  setDevices: (d: Device[]) => void;
  setScanLogs: (s: ScanLog[]) => void;
  setDelegationLogs: (d: DelegationLog[]) => void;
  setPolicies: (p: Policy[]) => void;
  setAccessTemplates: (a: AccessTemplate[]) => void;
  setLocations: (l: Location[]) => void;
  setZones: (z: Zone[]) => void;
  setEmergencyMode: (v: boolean) => void;
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

function loadOrInit<T>(key: string, init: T[]): T[] {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored) as T[];
  } catch { /* ignore */ }
  return init as T[];
}

function save<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [visitors, _setVisitors] = useState<Visitor[]>(() => loadOrInit('vms_visitors', visitorsInit as unknown as Visitor[]));
  const [devices, _setDevices] = useState<Device[]>(() => loadOrInit('vms_devices', devicesInit as unknown as Device[]));
  const [scanLogs, _setScanLogs] = useState<ScanLog[]>(() => loadOrInit('vms_scanLogs', scanLogsInit as unknown as ScanLog[]));
  const [delegationLogs, _setDelegationLogs] = useState<DelegationLog[]>(() => loadOrInit('vms_delegationLogs', delegationLogsInit as unknown as DelegationLog[]));
  const [policies, _setPolicies] = useState<Policy[]>(() => loadOrInit('vms_policies', policiesInit as unknown as Policy[]));
  const [accessTemplates, _setAccessTemplates] = useState<AccessTemplate[]>(() => loadOrInit('vms_accessTemplates', accessTemplatesInit as unknown as AccessTemplate[]));
  const [locations, _setLocations] = useState<Location[]>(() => loadOrInit('vms_locations', locationsInit as unknown as Location[]));
  const [zones] = useState<Zone[]>(() => loadOrInit('vms_zones', zonesInit as unknown as Zone[]));
  const [users] = useState<User[]>(() => usersInit as unknown as User[]);
  const [notifications, _setNotifications] = useState<Notification[]>(() => loadOrInit('vms_notifications', []));
  const [emergencyMode, _setEmergencyMode] = useState<boolean>(() => {
    return localStorage.getItem('vms_emergency') === 'true';
  });

  const setVisitors = useCallback((v: Visitor[]) => { _setVisitors(v); save('vms_visitors', v); }, []);
  const setDevices = useCallback((d: Device[]) => { _setDevices(d); save('vms_devices', d); }, []);
  const setScanLogs = useCallback((s: ScanLog[]) => { _setScanLogs(s); save('vms_scanLogs', s); }, []);
  const setDelegationLogs = useCallback((d: DelegationLog[]) => { _setDelegationLogs(d); save('vms_delegationLogs', d); }, []);
  const setPolicies = useCallback((p: Policy[]) => { _setPolicies(p); save('vms_policies', p); }, []);
  const setAccessTemplates = useCallback((a: AccessTemplate[]) => { _setAccessTemplates(a); save('vms_accessTemplates', a); }, []);
  const setLocations = useCallback((l: Location[]) => { _setLocations(l); save('vms_locations', l); }, []);
  const setZones = useCallback((_z: Zone[]) => { /* zones static */ }, []);
  const setEmergencyMode = useCallback((v: boolean) => { _setEmergencyMode(v); localStorage.setItem('vms_emergency', String(v)); }, []);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const notif: Notification = {
      ...n,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    _setNotifications(prev => {
      const updated = [notif, ...prev].slice(0, 50);
      save('vms_notifications', updated);
      return updated;
    });
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    _setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      save('vms_notifications', updated);
      return updated;
    });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    _setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      save('vms_notifications', updated);
      return updated;
    });
  }, []);

  const clearNotifications = useCallback(() => {
    _setNotifications([]);
    save('vms_notifications', []);
  }, []);

  // Seed initial notifications
  useEffect(() => {
    const existing = localStorage.getItem('vms_notifications');
    if (!existing || JSON.parse(existing).length === 0) {
      const seeds: Notification[] = [
        { id: 'n1', type: 'warning', title: 'Access Violation', message: 'Michael Torres attempted to access Executive Elevator — denied.', timestamp: '2026-02-22T09:25:00Z', read: false },
        { id: 'n2', type: 'info', title: 'New Visitor Request', message: 'Lisa Anderson has requested a visit on Feb 23.', timestamp: '2026-02-22T07:00:00Z', read: false },
        { id: 'n3', type: 'success', title: 'Visitor Arrived', message: 'David Chen has checked in successfully.', timestamp: '2026-02-22T10:05:00Z', read: true },
        { id: 'n4', type: 'error', title: 'Device Offline', message: 'Loading Dock Gate (dev008) has gone offline.', timestamp: '2026-02-22T07:30:00Z', read: false },
      ];
      _setNotifications(seeds);
      save('vms_notifications', seeds);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppContext.Provider value={{
      visitors, devices, scanLogs, delegationLogs, policies, accessTemplates, locations, zones, users,
      notifications, emergencyMode,
      setVisitors, setDevices, setScanLogs, setDelegationLogs, setPolicies, setAccessTemplates,
      setLocations, setZones, setEmergencyMode,
      addNotification, markNotificationRead, markAllNotificationsRead, clearNotifications,
    }}>
      {children}
    </AppContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
