/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import {
  parseAllDevices,
  parseDeviceStatistics,
  parseZextrasActionResult,
  soapErrorMessage,
} from '../parse-active-sync';

const DEVICE = {
  accountEmail: 'alice@example.com',
  accountName: 'iPhone',
  accountServer: 'mail.example.com',
  deviceId: 'DEV-001',
  deviceType: 'iPhone',
  firstSeen: 1,
  hasMobilePassword: false,
  isOnline: true,
  lastCommandReceived: 1,
  lastPingTimeoutSecs: 300,
  lastSeen: 2,
  protocolVersion: '14.1',
  provisionable: true,
  status: 1,
  userAgent: 'Apple-iPhone/1',
};

function soap(content: unknown): unknown {
  return { Body: { response: { content: JSON.stringify(content) } } };
}

describe('parse-active-sync', () => {
  it('flattens grouped getAllDevices content into a device list', () => {
    const res = soap({
      response: {
        'alice@example.com': { response: { devices: [DEVICE] } },
        'bob@example.com': {
          response: {
            devices: [{ ...DEVICE, accountEmail: 'bob@example.com', deviceId: 'DEV-002' }],
          },
        },
      },
    });

    const devices = parseAllDevices(res);
    expect(devices).toHaveLength(2);
    expect(devices.map((d) => d.deviceId)).toEqual(['DEV-001', 'DEV-002']);
  });

  it('returns an empty list when the payload has no devices', () => {
    expect(parseAllDevices(soap({ response: {} }))).toEqual([]);
    expect(parseAllDevices({})).toEqual([]);
  });

  it('reads the first device statistics payload', () => {
    const stats = parseDeviceStatistics(
      soap({
        response: {
          'mail.example.com': { response: { ...DEVICE, friendlyName: 'Alice' } },
        },
      }),
    );
    expect(stats?.deviceId).toBe('DEV-001');
    expect(stats?.friendlyName).toBe('Alice');
  });

  it('parses ok and error action payloads', () => {
    expect(parseZextrasActionResult(soap({ ok: true }))).toEqual({ ok: true });
    expect(parseZextrasActionResult(soap({ error: { message: 'Remove failed' } }))).toEqual({
      ok: false,
      message: 'Remove failed',
    });
    expect(parseZextrasActionResult(soap({ exception: { message: 'Boom' } }))).toEqual({
      ok: false,
      message: 'Boom',
    });
  });

  it('extracts a SOAP-style error string', () => {
    expect(soapErrorMessage({ error: 'nope' }, 'fallback')).toBe('nope');
    expect(soapErrorMessage(new Error('boom'), 'fallback')).toBe('boom');
    expect(soapErrorMessage(undefined, 'fallback')).toBe('fallback');
  });
});
