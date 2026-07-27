/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import { type PrimaryBarView } from '../../../../types';
import { buildModuleCrumbMenu } from '../hooks';

const manageSection = { id: 'manage', label: 'Manage', position: 3 };
const servicesSection = { id: 'services', label: 'Services', position: 1 };

function makeView(overrides: Partial<PrimaryBarView> = {}): PrimaryBarView {
  return {
    id: overrides.id ?? 'storage',
    app: overrides.app ?? 'carbonio-admin-ui-storage',
    route: overrides.route ?? 'storage',
    component: 'CubeOutline',
    badge: { show: false, count: 0, showCount: false, color: 'primary' },
    position: overrides.position ?? 1,
    visible: overrides.visible ?? true,
    label: overrides.label ?? 'Storage',
    section: overrides.section ?? manageSection,
    path: overrides.path ?? 'manage/storage',
  };
}

describe('buildModuleCrumbMenu', () => {
  it('returns all visible modules across all sections', () => {
    const primaryBar: Array<PrimaryBarView> = [
      makeView({ id: 'domains', route: 'domains', path: 'manage/domains', label: 'Domains', position: 1 }),
      makeView({ id: 'storage', route: 'storage', path: 'manage/storage', label: 'Storage', position: 2 }),
      makeView({ id: 'backup', route: 'backup', path: 'services/backup', label: 'Backup', section: servicesSection, position: 3 }),
    ];

    const result = buildModuleCrumbMenu(primaryBar, '/manage/storage/servers_list');

    expect(result['/manage/storage']).toEqual([
      { path: '/manage/domains', label: 'Domains' },
      { path: '/manage/storage', label: 'Storage' },
      { path: '/services/backup', label: 'Backup' },
    ]);
  });

  it('returns an empty record when the pathname has no module segment', () => {
    const primaryBar: Array<PrimaryBarView> = [makeView()];
    expect(buildModuleCrumbMenu(primaryBar, '/dashboard')).toEqual({});
    expect(buildModuleCrumbMenu(primaryBar, '')).toEqual({});
  });

  it('returns an empty record when there are fewer than two visible modules', () => {
    const primaryBar: Array<PrimaryBarView> = [makeView()];
    expect(buildModuleCrumbMenu(primaryBar, '/manage/storage/servers_list')).toEqual({});
  });

  it('excludes items with visible=false', () => {
    const primaryBar: Array<PrimaryBarView> = [
      makeView({ id: 'domains', route: 'domains', path: 'manage/domains', label: 'Domains', position: 1 }),
      makeView({ id: 'storage', route: 'storage', path: 'manage/storage', label: 'Storage', position: 2 }),
      makeView({ id: 'hidden', route: 'hidden', path: 'manage/hidden', label: 'Hidden', visible: false, position: 3 }),
    ];

    const result = buildModuleCrumbMenu(primaryBar, '/manage/storage/servers_list');
    expect(result['/manage/storage']).toHaveLength(2);
    expect(result['/manage/storage']?.find((m) => m.label === 'Hidden')).toBeUndefined();
  });

  it('includes modules from different sections', () => {
    const primaryBar: Array<PrimaryBarView> = [
      makeView({ id: 'storage', route: 'storage', path: 'manage/storage', label: 'Storage', position: 2, section: manageSection }),
      makeView({ id: 'backup', route: 'backup', path: 'services/backup', label: 'Backup', position: 1, section: servicesSection }),
    ];

    const result = buildModuleCrumbMenu(primaryBar, '/manage/storage/servers_list');
    const labels = result['/manage/storage']?.map((m) => m.label);
    expect(labels).toContain('Storage');
    expect(labels).toContain('Backup');
  });

  it('sorts all modules by position', () => {
    const primaryBar: Array<PrimaryBarView> = [
      makeView({ id: 'cos', route: 'cos', path: 'manage/cos', label: 'COS', position: 5 }),
      makeView({ id: 'backup', route: 'backup', path: 'services/backup', label: 'Backup', position: 1, section: servicesSection }),
      makeView({ id: 'domains', route: 'domains', path: 'manage/domains', label: 'Domains', position: 3 }),
    ];

    const result = buildModuleCrumbMenu(primaryBar, '/manage/storage/servers_list');
    const labels = result['/manage/storage']?.map((m) => m.label);
    expect(labels).toEqual(['Backup', 'Domains', 'COS']);
  });

  it('shows the dropdown even when the current module is not in the primary bar', () => {
    const primaryBar: Array<PrimaryBarView> = [
      makeView({ id: 'domains', route: 'domains', path: 'manage/domains', label: 'Domains', position: 1 }),
      makeView({ id: 'storage', route: 'storage', path: 'manage/storage', label: 'Storage', position: 2 }),
    ];

    const result = buildModuleCrumbMenu(primaryBar, '/custom/unknown/sub_page');
    expect(result['/custom/unknown']).toEqual([
      { path: '/manage/domains', label: 'Domains' },
      { path: '/manage/storage', label: 'Storage' },
    ]);
  });
});
