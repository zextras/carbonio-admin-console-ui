/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type MobileDevice = {
  accountEmail: string;
  accountName: string;
  accountServer: string;
  deviceId: string;
  deviceType: string;
  firstSeen: number;
  hasMobilePassword: boolean;
  isOnline: boolean;
  lastCommandReceived: number;
  lastPingTimeoutSecs: number;
  lastSeen: number;
  protocolVersion: string;
  provisionable: boolean;
  status: number;
  userAgent: string;
};

export type MobileDeviceDetail = MobileDevice & {
  friendlyName?: string;
  imei?: string;
  lastPingTimeout?: number;
  model?: string;
  numBadItems?: number;
  numContacts?: number;
  numEmails?: number;
  numEvents?: number;
  numRemoteFolders?: number;
  numTasks?: number;
  os?: string;
  osLanguage?: string;
  phoneNumber?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function readSoapContent(res: unknown): unknown {
  if (!isRecord(res)) return undefined;
  const body = isRecord(res.Body) ? res.Body : undefined;
  const response = body && isRecord(body.response) ? body.response : undefined;
  const content = response ? asString(response.content) : undefined;
  if (!content) return undefined;
  try {
    return JSON.parse(content) as unknown;
  } catch {
    return undefined;
  }
}

function isMobileDevice(value: unknown): value is MobileDevice {
  if (!isRecord(value)) return false;
  return (
    typeof value.accountEmail === 'string' &&
    typeof value.accountName === 'string' &&
    typeof value.deviceId === 'string' &&
    typeof value.deviceType === 'string' &&
    typeof value.firstSeen === 'number' &&
    typeof value.status === 'number'
  );
}

export function parseAllDevices(res: unknown): Array<MobileDevice> {
  const parsed = readSoapContent(res);
  if (!isRecord(parsed) || !isRecord(parsed.response)) return [];

  const devices: Array<MobileDevice> = [];
  Object.values(parsed.response).forEach((entry) => {
    if (!isRecord(entry) || !isRecord(entry.response)) return;
    const list = entry.response.devices;
    if (!Array.isArray(list)) return;
    list.forEach((item) => {
      if (isMobileDevice(item)) devices.push(item);
    });
  });
  return devices;
}

export function parseDeviceStatistics(res: unknown): MobileDeviceDetail | null {
  const parsed = readSoapContent(res);
  if (!isRecord(parsed) || !isRecord(parsed.response)) return null;
  const first = Object.values(parsed.response).find((entry) => isRecord(entry));
  if (!isRecord(first) || !isRecord(first.response)) return null;
  return isMobileDevice(first.response) ? (first.response as MobileDeviceDetail) : null;
}

export function parseZextrasActionResult(res: unknown): { ok: boolean; message?: string } {
  const parsed = readSoapContent(res);
  if (!isRecord(parsed)) return { ok: false };

  if (parsed.ok === true) return { ok: true };

  const error = isRecord(parsed.error) ? asString(parsed.error.message) : undefined;
  const exception = isRecord(parsed.exception) ? asString(parsed.exception.message) : undefined;
  return { ok: false, message: error ?? exception };
}

export function soapErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (isRecord(error) && typeof error.error === 'string' && error.error) return error.error;
  return fallback;
}
