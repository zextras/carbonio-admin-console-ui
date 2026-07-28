/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { buildSectionMenu, getSegmentAfterBase } from '../breadcrumb-utils';

const mockT = vi.fn((key: string, defaultValue?: string) => defaultValue ?? key) as never;

describe('buildSectionMenu', () => {
  it('maps section configs to crumb menu items with correct paths', () => {
    const sections = [
      { id: 'general', labelKey: 'label.general', labelDefault: 'General' },
      { id: 'features', labelKey: 'label.features', labelDefault: 'Features' },
    ];

    const result = buildSectionMenu('/manage/cos', sections, mockT);

    expect(result).toEqual([
      { path: '/manage/cos/general', label: 'General' },
      { path: '/manage/cos/features', label: 'Features' },
    ]);
  });

  it('excludes entries with empty id (parent/base route)', () => {
    const sections = [
      { id: '', labelKey: 'label.global', labelDefault: 'Global' },
      { id: 'domains', labelKey: 'label.domains', labelDefault: 'Domains' },
    ];

    const result = buildSectionMenu('/manage/domains/global', sections, mockT);

    expect(result).toEqual([
      { path: '/manage/domains/global/domains', label: 'Domains' },
    ]);
  });

  it('passes labelKey and labelDefault to the translation function', () => {
    const sections = [
      { id: 'settings', labelKey: 'label.settings', labelDefault: 'Settings' },
    ];

    buildSectionMenu('/base', sections, mockT);

    expect(mockT).toHaveBeenCalledWith('label.settings', 'Settings');
  });

  it('returns an empty array for empty sections input', () => {
    const result = buildSectionMenu('/base', [], mockT);
    expect(result).toEqual([]);
  });

  it('handles server-prefixed base paths correctly', () => {
    const sections = [
      { id: 'data_volumes', labelKey: 'label.data_volumes', labelDefault: 'Data Volumes' },
      { id: 'hsm_settings', labelKey: 'label.hsm_settings', labelDefault: 'HSM Settings' },
    ];

    const result = buildSectionMenu('/manage/storage/mail.example.com', sections, mockT);

    expect(result).toEqual([
      { path: '/manage/storage/mail.example.com/data_volumes', label: 'Data Volumes' },
      { path: '/manage/storage/mail.example.com/hsm_settings', label: 'HSM Settings' },
    ]);
  });
});

describe('getSegmentAfterBase', () => {
  it('extracts the first segment after the base path', () => {
    const result = getSegmentAfterBase('/manage/storage/server1/data_volumes', '/manage/storage');
    expect(result).toBe('server1');
  });

  it('returns undefined when pathname does not start with basePath', () => {
    const result = getSegmentAfterBase('/manage/cos/cos_list', '/manage/storage');
    expect(result).toBeUndefined();
  });

  it('returns undefined when pathname equals basePath exactly', () => {
    const result = getSegmentAfterBase('/manage/storage', '/manage/storage');
    expect(result).toBeUndefined();
  });

  it('returns undefined when pathname is the base path with trailing slash', () => {
    const result = getSegmentAfterBase('/manage/storage/', '/manage/storage');
    expect(result).toBe('');
  });

  it('handles UUID segment after base', () => {
    const result = getSegmentAfterBase(
      '/manage/domains/cb671926-996b-4adc-95a5-6d4956dff68c/accounts',
      '/manage/domains',
    );
    expect(result).toBe('cb671926-996b-4adc-95a5-6d4956dff68c');
  });

  it('handles services section base path', () => {
    const result = getSegmentAfterBase(
      '/services/backup/mail.example.com/configuration_lbl',
      '/services/backup',
    );
    expect(result).toBe('mail.example.com');
  });

  it('returns only the first segment even with deeper paths', () => {
    const result = getSegmentAfterBase('/a/b/c/d/e', '/a');
    expect(result).toBe('b');
  });

  it('returns undefined for empty pathname', () => {
    const result = getSegmentAfterBase('', '/manage/storage');
    expect(result).toBeUndefined();
  });
});
