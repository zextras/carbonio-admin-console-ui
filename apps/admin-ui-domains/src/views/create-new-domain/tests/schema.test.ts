/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { CREATE_DOMAIN_DEFAULT_VALUES } from '../constants';
import { createDomainSchema } from '../schema';

describe('createDomainSchema', () => {
  it('accepts the default values once a domain name is provided', () => {
    const result = createDomainSchema.safeParse({
      ...CREATE_DOMAIN_DEFAULT_VALUES,
      domainName: 'example.com',
    });

    expect(result.success).toBe(true);
  });

  it('rejects the default values with an empty domain name', () => {
    const result = createDomainSchema.safeParse(CREATE_DOMAIN_DEFAULT_VALUES);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'domainName')).toBe(true);
    }
  });

  it('requires a non-blank domain name', () => {
    const result = createDomainSchema.safeParse({
      ...CREATE_DOMAIN_DEFAULT_VALUES,
      domainName: '   ',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path[0] === 'domainName'),
      ).toBe(true);
    }
  });

  it('rejects a domain name containing spaces', () => {
    const result = createDomainSchema.safeParse({
      ...CREATE_DOMAIN_DEFAULT_VALUES,
      domainName: 'my domain.com',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'domainName')).toBe(true);
    }
  });

  it('rejects a domain name containing an @', () => {
    const result = createDomainSchema.safeParse({
      ...CREATE_DOMAIN_DEFAULT_VALUES,
      domainName: 'user@example.com',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'domainName')).toBe(true);
    }
  });

  it('accepts an empty max accounts value', () => {
    const result = createDomainSchema.safeParse({
      ...CREATE_DOMAIN_DEFAULT_VALUES,
      domainName: 'example.com',
      zimbraDomainMaxAccounts: '',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a negative max accounts value', () => {
    const result = createDomainSchema.safeParse({
      ...CREATE_DOMAIN_DEFAULT_VALUES,
      domainName: 'example.com',
      zimbraDomainMaxAccounts: '-5',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path[0] === 'zimbraDomainMaxAccounts'),
      ).toBe(true);
    }
  });

  it('rejects a non-integer max accounts value', () => {
    const result = createDomainSchema.safeParse({
      ...CREATE_DOMAIN_DEFAULT_VALUES,
      domainName: 'example.com',
      zimbraDomainMaxAccounts: 'ten',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path[0] === 'zimbraDomainMaxAccounts'),
      ).toBe(true);
    }
  });

  it('rejects a decimal quota value', () => {
    const result = createDomainSchema.safeParse({
      ...CREATE_DOMAIN_DEFAULT_VALUES,
      domainName: 'example.com',
      domainQuotaGB: '1.5',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'domainQuotaGB')).toBe(true);
    }
  });

  it('accepts a valid notification sender email', () => {
    const result = createDomainSchema.safeParse({
      ...CREATE_DOMAIN_DEFAULT_VALUES,
      domainName: 'example.com',
      carbonioNotificationFrom: 'admin@example.com',
    });

    expect(result.success).toBe(true);
  });

  it('rejects an invalid notification sender email', () => {
    const result = createDomainSchema.safeParse({
      ...CREATE_DOMAIN_DEFAULT_VALUES,
      domainName: 'example.com',
      carbonioNotificationFrom: 'not-an-email',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path[0] === 'carbonioNotificationFrom'),
      ).toBe(true);
    }
  });

  it('rejects notification recipients with an invalid email label', () => {
    const result = createDomainSchema.safeParse({
      ...CREATE_DOMAIN_DEFAULT_VALUES,
      domainName: 'example.com',
      carbonioNotificationRecipients: [
        { label: 'alice@example.com' },
        { label: 'bob@invalid' },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path[0] === 'carbonioNotificationRecipients'),
      ).toBe(true);
    }
  });
});
