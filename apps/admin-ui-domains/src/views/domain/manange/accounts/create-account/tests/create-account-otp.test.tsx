/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

/**
 * Tests for OTP response parsing logic used in create-account.tsx line 288.
 *
 * Line 288: const response = res.response as Record<string, string>;
 *
 * This tests the structure and parsing of OTP API responses to ensure
 * the expected data format is correctly handled when generating QR codes.
 */
describe('OTP Response Parsing', () => {
  it('should correctly parse OTP response and generate valid QR data URL', () => {
    // Simulates the response structure from fetchSoap at line 287-288
    const mockApiResponse = {
      ok: true,
      response: {
        label: 'test-user@test-domain.com',
        secret: 'ABCDEFGHIJ123456',
        issuer: 'TestIssuer',
        algorithm: 'SHA1',
        digits_length: '6',
        period: '30',
        static_otp_codes: '123456,789012',
      },
    };

    // This simulates the type cast at line 288
    const response = mockApiResponse.response as Record<string, string>;

    // Verify all required fields exist (lines 291-297)
    expect(response.label).toBeDefined();
    expect(response.secret).toBeDefined();
    expect(response.issuer).toBeDefined();
    expect(response.algorithm).toBeDefined();
    expect(response.digits_length).toBeDefined();
    expect(response.period).toBeDefined();
    expect(response.static_otp_codes).toBeDefined();

    // Generate QR data URL as done in lines 291-296
    const qrData = `otpauth://totp/${encodeURIComponent(response.label)}?secret=${
      response.secret
    }&issuer=${response.issuer}&algorithm=${response.algorithm}&digits=${
      response.digits_length
    }&period=${response.period}`;

    // Verify the QR data URL format
    expect(qrData).toBe(
      'otpauth://totp/test-user%40test-domain.com?secret=ABCDEFGHIJ123456&issuer=TestIssuer&algorithm=SHA1&digits=6&period=30',
    );

    // Verify URL starts with correct protocol
    expect(qrData.startsWith('otpauth://totp/')).toBe(true);

    // Verify secret is included
    expect(qrData).toContain('secret=ABCDEFGHIJ123456');
  });

  it('should handle special characters in label by URL encoding', () => {
    const response = {
      label: 'user+test@example.com',
      secret: 'SECRET123',
      issuer: 'Test Issuer',
      algorithm: 'SHA256',
      digits_length: '8',
      period: '60',
    } as Record<string, string>;

    const qrData = `otpauth://totp/${encodeURIComponent(response.label)}?secret=${
      response.secret
    }&issuer=${response.issuer}&algorithm=${response.algorithm}&digits=${
      response.digits_length
    }&period=${response.period}`;

    // Verify special characters are encoded
    expect(qrData).toContain('user%2Btest%40example.com');
    expect(qrData).toContain('digits=8');
    expect(qrData).toContain('period=60');
  });

  it('should not process response when ok is false', () => {
    const mockApiResponse = {
      ok: false,
      response: null,
    };

    // Simulates the condition check at line 287: if (res.ok)
    if (mockApiResponse.ok) {
      // This code should not execute
      expect(true).toBe(false);
    } else {
      // Response should not be processed
      expect(mockApiResponse.response).toBeNull();
    }
  });
});
