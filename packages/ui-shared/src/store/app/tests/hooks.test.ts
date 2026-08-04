/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import { type PrimarybarSection, type PrimaryBarView } from '../../../../types';
import { buildModuleCrumbMenu } from '../hooks';

const manageSection: PrimarybarSection = { id: 'manage', label: 'Management', position: 3 };
const servicesSection: PrimarybarSection = { id: 'services', label: 'Services', position: 4 };
const logQueuesSection: PrimarybarSection = {
  id: 'logandqueues',
  label: 'Log & Queues',
  position: 5,
};

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
  makeView({
    id: 'dashboard',
    route: 'dashboard',
    path: 'dashboard',
    label: 'Dashboard',
    position: 1,
    section: undefined,
  }),
  makeView({
    id: 'domains',
    route: 'domains',
    path: 'manage/domains',
    label: 'Domains',
    position: 1,
  }),
  makeView({ id: 'cos', route: 'cos', path: 'manage/cos', label: 'COS', position: 2 }),
  makeView({
    id: 'mta',
    route: 'mail_transfer_agent',
    path: 'manage/mail_transfer_agent',
    label: 'Mail Transfer Agent',
    position: 3,
  }),
  makeView({
    id: 'storage',
    route: 'storage',
    path: 'manage/storage',
    label: 'Storage',
    position: 4,
  }),
  makeView({
    id: 'subscriptions',
    route: 'subscriptions',
    path: 'manage/subscriptions',
    label: 'Subscriptions',
    position: 5,
  }),
  makeView({
    id: 'privacy',
    route: 'privacy',
    path: 'manage/privacy',
    label: 'Privacy',
    position: 6,
  }),
  makeView({
    id: 'backup',
    route: 'backup',
    path: 'services/backup',
    label: 'Backup',
    position: 1,
    section: servicesSection,
  }),
  makeView({
    id: 'legal_hold',
    route: 'legal_hold',
    path: 'services/legal_hold',
    label: 'Legal Hold',
    position: 2,
    section: servicesSection,
  }),
  makeView({
    id: 'notifications',
    route: 'notifications',
    path: 'logandqueues/notifications',
    label: 'Notifications',
    position: 1,
    section: logQueuesSection,
  }),
  makeView({
    id: 'operations',
    route: 'operations',
    path: 'logandqueues/operations',
    label: 'Operations',
    position: 2,
    section: logQueuesSection,
  }),
];

describe('buildModuleCrumbMenu', () => {
  it('returns all modules in alphabetical order by label', () => {
    const menu = buildModuleCrumbMenu(fullPrimaryBar);

    expect(menu.map((m) => m.label)).toEqual([
      'Backup',
      'COS',
      'Dashboard',
      'Domains',
      'Legal Hold',
      'Mail Transfer Agent',
      'Notifications',
      'Operations',
      'Privacy',
      'Storage',
      'Subscriptions',
    ]);
  });

  it('places dashboard at its alphabetical position', () => {
    const menu = buildModuleCrumbMenu(fullPrimaryBar);

    expect(menu[2]).toEqual({ path: '/dashboard', label: 'Dashboard' });
  });

  it('returns an empty array when there are fewer than two visible modules', () => {
    const single: Array<PrimaryBarView> = [makeView()];
    expect(buildModuleCrumbMenu(single)).toEqual([]);
  });

  it('excludes items with visible=false', () => {
    const primaryBar: Array<PrimaryBarView> = [
      makeView({
        id: 'domains',
        route: 'domains',
        path: 'manage/domains',
        label: 'Domains',
        position: 1,
      }),
      makeView({
        id: 'storage',
        route: 'storage',
        path: 'manage/storage',
        label: 'Storage',
        position: 2,
      }),
      makeView({
        id: 'hidden',
        route: 'hidden',
        path: 'manage/hidden',
        label: 'Hidden',
        visible: false,
        position: 3,
      }),
    ];

    const menu = buildModuleCrumbMenu(primaryBar);
    expect(menu).toHaveLength(2);
    expect(menu.find((m) => m.label === 'Hidden')).toBeUndefined();
  });

  it('works when the current module is not in the primary bar', () => {
    const menu = buildModuleCrumbMenu(fullPrimaryBar);

    expect(menu[0]).toEqual({ path: '/services/backup', label: 'Backup' });
    expect(menu).toHaveLength(11);
  });

  it('includes modules from all sections', () => {
    const menu = buildModuleCrumbMenu(fullPrimaryBar);

    const labels = menu.map((m) => m.label);
    expect(labels).toContain('Storage');
    expect(labels).toContain('Backup');
    expect(labels).toContain('Notifications');
  });
});
