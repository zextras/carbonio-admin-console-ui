/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import { type PrimaryBarView } from '../../../../types';
import { buildModuleCrumbMenu } from '../hooks';

const manageSection = { id: 'manage', label: 'Manage', position: 3 };

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
  it('returns sibling modules for the current module section', () => {
    const primaryBar: Array<PrimaryBarView> = [
      makeView({ id: 'domains', route: 'domains', path: 'manage/domains', label: 'Domains', position: 1 }),
      makeView({ id: 'storage', route: 'storage', path: 'manage/storage', label: 'Storage', position: 2 }),
      makeView({ id: 'cos', route: 'cos', path: 'manage/cos', label: 'COS', position: 3 }),
    ];

    const result = buildModuleCrumbMenu(primaryBar, '/manage/storage/servers_list');

    expect(result['/manage/storage']).toEqual([
      { path: '/manage/domains', label: 'Domains' },
      { path: '/manage/storage', label: 'Storage' },
      { path: '/manage/cos', label: 'COS' },
    ]);
  });

  it('returns an empty record when the pathname has no module segment', () => {
    const primaryBar: Array<PrimaryBarView> = [makeView()];
    expect(buildModuleCrumbMenu(primaryBar, '/dashboard')).toEqual({});
    expect(buildModuleCrumbMenu(primaryBar, '')).toEqual({});
  });

  it('returns an empty record when the current module has no section', () => {
    const primaryBar: Array<PrimaryBarView> = [
      makeView({ section: undefined, path: 'storage' }),
    ];
    expect(buildModuleCrumbMenu(primaryBar, '/storage/servers_list')).toEqual({});
  });

  it('returns an empty record when there are fewer than two siblings', () => {
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

  it('excludes items from other sections', () => {
    const servicesSection = { id: 'services', label: 'Services', position: 1 };
    const primaryBar: Array<PrimaryBarView> = [
      makeView({ id: 'domains', route: 'domains', path: 'manage/domains', label: 'Domains', position: 1 }),
      makeView({ id: 'storage', route: 'storage', path: 'manage/storage', label: 'Storage', position: 2 }),
      makeView({ id: 'backup', route: 'backup', path: 'services/backup', label: 'Backup', section: servicesSection, position: 1 }),
    ];

    const result = buildModuleCrumbMenu(primaryBar, '/manage/storage/servers_list');
    expect(result['/manage/storage']).toHaveLength(2);
    expect(result['/manage/storage']?.find((m) => m.label === 'Backup')).toBeUndefined();
  });

  it('sorts siblings by position', () => {
    const primaryBar: Array<PrimaryBarView> = [
      makeView({ id: 'cos', route: 'cos', path: 'manage/cos', label: 'COS', position: 5 }),
      makeView({ id: 'domains', route: 'domains', path: 'manage/domains', label: 'Domains', position: 1 }),
      makeView({ id: 'storage', route: 'storage', path: 'manage/storage', label: 'Storage', position: 3 }),
    ];

    const result = buildModuleCrumbMenu(primaryBar, '/manage/storage/servers_list');
    const labels = result['/manage/storage']?.map((m) => m.label);
    expect(labels).toEqual(['Domains', 'Storage', 'COS']);
  });
});
