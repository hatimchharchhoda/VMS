import type { Visitor, AccessTemplate, ScanLog, Zone, Device } from '../types';

export interface AccessDecision {
   granted: boolean;
   reason: string;
}

export function generateBarcodeId(visitorId: string): string {
   const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
   const random = Math.random().toString(36).substring(2, 8).toUpperCase();
   return `VMS-${dateStr}-${visitorId.toUpperCase()}-${random}`;
}

function isTimeAllowed(timeRestriction: { startTime: string; endTime: string; daysAllowed: string[] }): boolean {
   const now = new Date();
   const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
   const today = days[now.getDay()];

   if (!timeRestriction.daysAllowed.includes(today)) {
      return false;
   }

   const [startH, startM] = timeRestriction.startTime.split(':').map(Number);
   const [endH, endM] = timeRestriction.endTime.split(':').map(Number);
   const currentMinutes = now.getHours() * 60 + now.getMinutes();
   const startMinutes = startH * 60 + startM;
   const endMinutes = endH * 60 + endM;

   return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

export function evaluateAccess(
   visitor: Visitor,
   deviceId: string,
   template: AccessTemplate | null,
   allDevices: Device[],
   allZones: Zone[],
): AccessDecision {
   // Check blacklist
   if (visitor.isBlacklisted) {
      return { granted: false, reason: 'Visitor is blacklisted' };
   }

   // Check approval status
   if (visitor.status !== 'approved' && visitor.status !== 'checked-in') {
      return { granted: false, reason: `Visitor status is '${visitor.status}' — not approved` };
   }

   // Check pass expiry
   if (visitor.checkOutTime) {
      return { granted: false, reason: 'Visitor has already checked out — pass expired' };
   }

   // Check visit date
   const today = new Date().toISOString().slice(0, 10);
   if (visitor.visitDate !== today) {
      return { granted: false, reason: `Visit date is ${visitor.visitDate} — not today` };
   }

   // No template assigned
   if (!template) {
      return { granted: false, reason: 'No access template assigned to visitor' };
   }

   // Check device in template
   if (!template.allowedDevices.includes(deviceId)) {
      const device = allDevices.find(d => d.id === deviceId);
      const zone = allZones.find(z => z.id === device?.zoneId);
      return { granted: false, reason: `Zone '${zone?.name || deviceId}' not in access template` };
   }

   // Check time restriction
   if (!isTimeAllowed(template.timeRestrictions)) {
      return { granted: false, reason: `Access not allowed at this time. Allowed: ${template.timeRestrictions.startTime}–${template.timeRestrictions.endTime}` };
   }

   return { granted: true, reason: 'Valid pass — template verified' };
}

export function processScan(
   barcodeId: string,
   deviceId: string,
   visitors: Visitor[],
   accessTemplates: AccessTemplate[],
   allDevices: Device[],
   allZones: Zone[],
): { decision: AccessDecision; visitor: Visitor | null; device: Device | null } {
   const visitor = visitors.find(v => v.barcodeId === barcodeId) || null;
   const device = allDevices.find(d => d.id === deviceId) || null;

   if (!visitor) {
      return { decision: { granted: false, reason: 'Barcode not found in system' }, visitor: null, device };
   }

   if (!device) {
      return { decision: { granted: false, reason: 'Device not found' }, visitor, device: null };
   }

   if (device.status === 'offline') {
      return { decision: { granted: false, reason: 'Device is offline' }, visitor, device };
   }

   const template = visitor.accessTemplateId ? accessTemplates.find(t => t.id === visitor.accessTemplateId) || null : null;
   const decision = evaluateAccess(visitor, deviceId, template, allDevices, allZones);

   return { decision, visitor, device };
}
