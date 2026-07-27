/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import { type PrimarybarSection,type PrimaryBarView } from '../../../../types';
import { buildModuleCrumbMenu, buildPrimaryBarOrderedViews } from '../hooks';

const manageSection: PrimarybarSection = { id: 'manage', label: 'Management', position: 3 };
const servicesSection: PrimarybarSection = { id: 'services', label: 'Services', position: 4 };
const logQueuesSection: PrimarybarSection = { id: 'logandqueues', label: 'Log & Queues', position: 5 };

const ALL_SECTIONS = [manageSection, servicesSection, logQueuesSection];

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

const fullPrimaryBar: Array<PrimaryBarView> = [
  makeView({ id: 'dashboard', route: 'dashboard', path: 'dashboard', label: 'Dashboard', position: 1, section: undefined }),
  makeView({ id: 'domains', route: 'domains', path: 'manage/domains', label: 'Domains', position: 1 }),
  makeView({ id: 'cos', route: 'cos', path: 'manage/cos', label: 'COS', position: 2 }),
  makeView({ id: 'mta', route: 'mail_transfer_agent', path: 'manage/mail_transfer_agent', label: 'Mail Transfer Agent', position: 3 }),
  makeView({ id: 'storage', route: 'storage', path: 'manage/storage', label: 'Storage', position: 4 }),
  makeView({ id: 'subscriptions', route: 'subscriptions', path: 'manage/subscriptions', label: 'Subscriptions', position: 5 }),
  makeView({ id: 'privacy', route: 'privacy', path: 'manage/privacy', label: 'Privacy', position: 6 }),
  makeView({ id: 'backup', route: 'backup', path: 'services/backup', label: 'Backup', position: 1, section: servicesSection }),
  makeView({ id: 'legal_hold', route: 'legal_hold', path: 'services/legal_hold', label: 'Legal Hold', position: 2, section: servicesSection }),
  makeView({ id: 'notifications', route: 'notifications', path: 'logandqueues/notifications', label: 'Notifications', position: 1, section: logQueuesSection }),
  makeView({ id: 'operations', route: 'operations', path: 'logandqueues/operations', label: 'Operations', position: 2, section: logQueuesSection }),
];

describe('buildPrimaryBarOrderedViews', () => {
  it('groups items by section and sorts groups by section position', () => {
    const ordered = buildPrimaryBarOrderedViews(fullPrimaryBar, ALL_SECTIONS);
    const labels = ordered.map((v) => v.label);

    expect(labels).toEqual([
      'Dashboard',
      'Domains',
      'COS',
      'Mail Transfer Agent',
      'Storage',
      'Subscriptions',
      'Privacy',
      'Backup',
      'Legal Hold',
      'Notifications',
      'Operations',
    ]);
  });

  it('does not interleave items from different sections by their own position', () => {
    const ordered = buildPrimaryBarOrderedViews(fullPrimaryBar, ALL_SECTIONS);
    const backupIndex = ordered.findIndex((v) => v.id === 'backup');
    const domainsIndex = ordered.findIndex((v) => v.id === 'domains');
    expect(domainsIndex).toBeLessThan(backupIndex);
  });
});

describe('buildModuleCrumbMenu', () => {
  it('returns all modules in primary bar order with current module on top', () => {
    const menu = buildModuleCrumbMenu(fullPrimaryBar, ALL_SECTIONS, '/manage/storage/servers_list');

    expect(menu[0]).toEqual({ path: '/manage/storage', label: 'Storage' });

    const restLabels = menu.slice(1).map((m) => m.label);
    expect(restLabels).toEqual([
      'Dashboard',
      'Domains',
      'COS',
      'Mail Transfer Agent',
      'Subscriptions',
      'Privacy',
      'Backup',
      'Legal Hold',
      'Notifications',
      'Operations',
    ]);
  });

  it('includes dashboard on top when on the dashboard page', () => {
    const menu = buildModuleCrumbMenu(fullPrimaryBar, ALL_SECTIONS, '/dashboard');

    expect(menu[0]).toEqual({ path: '/dashboard', label: 'Dashboard' });
    expect(menu[1]).toEqual({ path: '/manage/domains', label: 'Domains' });
  });

  it('returns an empty array when there are fewer than two visible modules', () => {
    const single: Array<PrimaryBarView> = [makeView()];
    expect(buildModuleCrumbMenu(single, ALL_SECTIONS, '/manage/storage/servers_list')).toEqual([]);
  });

  it('excludes items with visible=false', () => {
    const primaryBar: Array<PrimaryBarView> = [
      makeView({ id: 'domains', route: 'domains', path: 'manage/domains', label: 'Domains', position: 1 }),
      makeView({ id: 'storage', route: 'storage', path: 'manage/storage', label: 'Storage', position: 2 }),
      makeView({ id: 'hidden', route: 'hidden', path: 'manage/hidden', label: 'Hidden', visible: false, position: 3 }),
    ];

    const menu = buildModuleCrumbMenu(primaryBar, [manageSection], '/manage/storage');
    expect(menu).toHaveLength(2);
    expect(menu.find((m) => m.label === 'Hidden')).toBeUndefined();
  });

  it('works when the current module is not in the primary bar', () => {
    const menu = buildModuleCrumbMenu(fullPrimaryBar, ALL_SECTIONS, '/custom/unknown');

    expect(menu[0]).toEqual({ path: '/dashboard', label: 'Dashboard' });
    expect(menu).toHaveLength(11);
  });

  it('includes modules from all sections', () => {
    const menu = buildModuleCrumbMenu(fullPrimaryBar, ALL_SECTIONS, '/manage/storage');

    const labels = menu.map((m) => m.label);
    expect(labels).toContain('Storage');
    expect(labels).toContain('Backup');
    expect(labels).toContain('Notifications');
  });
});
