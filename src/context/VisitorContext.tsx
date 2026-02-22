import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useApp } from './AppContext';
import { useAuth } from './AuthContext';
import type { Visitor, User } from '../types';
import { generateBarcodeId } from '../utils/accessEngine';

interface VisitorContextValue {
  myVisits: Visitor[];
  activeVisit: Visitor | null;
  pendingVisits: Visitor[];
  upcomingVisits: Visitor[];
  pastVisits: Visitor[];
  visitorProfile: User | null;
  createVisit: (formData: Partial<Visitor> & { idProof?: string }) => Visitor;
  cancelVisit: (visitId: string) => void;
  rescheduleVisit: (visitId: string, newDate: string, newTime: string, newEndTime: string) => void;
  checkIn: (visitId: string) => { success: boolean; message: string };
  checkOut: (visitId: string) => void;
  updateProfile: (updates: Partial<User>) => void;
}

const VisitorContext = createContext<VisitorContextValue | undefined>(undefined);

export const VisitorProvider = ({ children }: { children: ReactNode }) => {
  const { visitors, setVisitors, scanLogs, setScanLogs, addNotification } = useApp();
  const { user, login } = useAuth();
  const [profileState, setProfileState] = useState<User | null>(user);

  const visitorProfile = user?.role === 'visitor' ? (profileState ?? user) : null;

  const myVisits: Visitor[] = visitors.filter(v => v.visitorUserId === user?.id);

  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();

  const activeVisit = myVisits.find(v => v.status === 'checked-in') ?? null;

  const pendingVisits = myVisits.filter(v => v.status === 'pending');

  const upcomingVisits = myVisits.filter(v =>
    (v.status === 'approved') && new Date(v.visitDate) >= new Date(today)
  );

  const pastVisits = myVisits.filter(v =>
    v.status === 'checked-out' || v.status === 'rejected' ||
    (v.status === 'approved' && new Date(v.visitDate) < new Date(today))
  ).sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());

  const createVisit = useCallback((formData: Partial<Visitor> & { idProof?: string }) => {
    const id = `vis${Date.now()}`;
    const newVisit: Visitor = {
      id,
      visitorUserId: user?.id || null,
      visitorName: user?.name || '',
      email: user?.email || '',
      phone: formData.phone || user?.phone || '',
      company: formData.company || user?.company || '',
      purpose: formData.purpose || '',
      hostId: formData.hostId || '',
      hostName: formData.hostName || '',
      locationId: formData.locationId || 'loc001',
      visitDate: formData.visitDate || today,
      visitTime: formData.visitTime || '09:00',
      endTime: formData.endTime || '10:00',
      status: 'pending',
      accessTemplateId: null,
      policyId: null,
      barcodeId: null,
      checkInTime: null,
      checkOutTime: null,
      isBlacklisted: false,
      notes: formData.notes || '',
      createdAt: new Date().toISOString(),
      approvedAt: null,
      approvedBy: null,
      category: formData.category || 'general',
      idProof: formData.idProof || null,
      violations: 0,
    };
    setVisitors([...visitors, newVisit]);
    addNotification({
      type: 'info',
      title: '📋 Visit Registered',
      message: `Your visit request for ${formData.visitDate} is pending approval.`,
    });
    return newVisit;
  }, [user, visitors, setVisitors, addNotification, today]);

  const cancelVisit = useCallback((visitId: string) => {
    setVisitors(visitors.map(v => v.id === visitId ? { ...v, status: 'rejected', notes: v.notes + ' [Cancelled by visitor]' } : v));
    addNotification({ type: 'warning', title: '❌ Visit Cancelled', message: 'Your visit request has been cancelled.' });
  }, [visitors, setVisitors, addNotification]);

  const rescheduleVisit = useCallback((visitId: string, newDate: string, newTime: string, newEndTime: string) => {
    setVisitors(visitors.map(v => v.id === visitId ? { ...v, visitDate: newDate, visitTime: newTime, endTime: newEndTime, status: 'pending', barcodeId: null, approvedAt: null } : v));
    addNotification({ type: 'info', title: '🔄 Visit Rescheduled', message: `Your visit has been rescheduled to ${newDate}.` });
  }, [visitors, setVisitors, addNotification]);

  const checkIn = useCallback((visitId: string): { success: boolean; message: string } => {
    const visit = visitors.find(v => v.id === visitId);
    if (!visit) return { success: false, message: 'Visit not found.' };
    if (visit.status !== 'approved') return { success: false, message: 'Visit is not approved.' };
    if (visit.status === 'checked-in') return { success: false, message: 'Already checked in.' };
    if (activeVisit) return { success: false, message: 'You are already inside. Check out first.' };

    const timeNow = now.toTimeString().slice(0, 5);
    if (timeNow < visit.visitTime && visit.visitDate === today) {
      // Allow check-in 15 min early
    }

    const newBarcode = visit.barcodeId || generateBarcodeId(visitId);
    setVisitors(visitors.map(v => v.id === visitId ? {
      ...v, status: 'checked-in', checkInTime: new Date().toISOString(), barcodeId: newBarcode,
    } : v));

    const newLog = {
      id: `scan${Date.now()}`,
      visitorId: visitId,
      visitorName: visit.visitorName,
      barcodeId: newBarcode,
      deviceId: 'dev001',
      deviceName: 'Main Gate Scanner',
      zoneId: 'zone001',
      zoneName: 'Main Lobby',
      accessResult: 'granted' as const,
      timestamp: new Date().toISOString(),
      reason: 'Valid approved visit — self check-in',
    };
    setScanLogs([newLog, ...scanLogs]);
    addNotification({ type: 'success', title: '✅ Checked In', message: `You are now inside the facility.` });
    return { success: true, message: 'Check-in successful!' };
  }, [visitors, setVisitors, scanLogs, setScanLogs, addNotification, activeVisit, today, now]);

  const checkOut = useCallback((visitId: string) => {
    setVisitors(visitors.map(v => v.id === visitId ? { ...v, status: 'checked-out', checkOutTime: new Date().toISOString() } : v));
    const newLog = {
      id: `scan${Date.now()}`,
      visitorId: visitId,
      visitorName: visitors.find(v => v.id === visitId)?.visitorName || '',
      barcodeId: visitors.find(v => v.id === visitId)?.barcodeId || '',
      deviceId: 'dev001',
      deviceName: 'Main Gate Scanner',
      zoneId: 'zone001',
      zoneName: 'Main Lobby',
      accessResult: 'granted' as const,
      timestamp: new Date().toISOString(),
      reason: 'Visitor self checkout',
    };
    setScanLogs([newLog, ...scanLogs]);
    addNotification({ type: 'info', title: '🚪 Checked Out', message: 'You have successfully checked out. Have a great day!' });
  }, [visitors, setVisitors, scanLogs, setScanLogs, addNotification]);

  const updateProfile = useCallback((updates: Partial<User>) => {
    const updated = { ...visitorProfile, ...updates } as User;
    setProfileState(updated);
    localStorage.setItem('vms_user', JSON.stringify(updated));
  }, [visitorProfile]);

  return (
    <VisitorContext.Provider value={{
      myVisits, activeVisit, pendingVisits, upcomingVisits, pastVisits,
      visitorProfile, createVisit, cancelVisit, rescheduleVisit,
      checkIn, checkOut, updateProfile,
    }}>
      {children}
    </VisitorContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useVisitor = (): VisitorContextValue => {
  const ctx = useContext(VisitorContext);
  if (!ctx) throw new Error('useVisitor must be used within VisitorProvider');
  return ctx;
};
