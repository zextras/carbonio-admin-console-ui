/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { resetMockWorker, setupBrowserTest } from 'admin-ui-test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

vi.mock('../antvirus-and-antispam/antivirus-and-antispam', () => ({
  default: () => <div>VIEW:antivirus-and-antispam</div>,
}));
vi.mock('../inbound-flow-security/inbound-flow-security', () => ({
  default: () => <div>VIEW:inbound-flow-security</div>,
}));
vi.mock('../mta-advanced/mta-advanced', () => ({
  default: () => <div>VIEW:advanced</div>,
}));
vi.mock('../outbound-flow/outbound-flow', () => ({
  default: () => <div>VIEW:outbound-flow</div>,
}));
vi.mock('../post-screen-tuning/post-screen-tuning', () => ({
  default: () => <div>VIEW:postscreen-tuning</div>,
}));
vi.mock('../server/general/mta-server-general', () => ({
  default: () => <div>VIEW:mta-server-general</div>,
}));
vi.mock('../stats/mta-stats', () => ({
  default: () => <div>VIEW:queue</div>,
}));

import { MTADetailPanel } from '../mta-detail-panel';

const globalOpRoutes: Array<[string, string]> = [
  ['general_lbl', 'VIEW:inbound-flow-security'],
  ['postscreen_tuning', 'VIEW:postscreen-tuning'],
  ['outbound_flow', 'VIEW:outbound-flow'],
  ['antivirus_and_antispam', 'VIEW:antivirus-and-antispam'],
  ['advanced', 'VIEW:advanced'],
  ['queue', 'VIEW:queue'],
];

const SERVER_ID = 'mail.test.com';

describe('MTADetailPanel routing', () => {
  afterEach(() => {
    resetMockWorker();
  });

  it('renders the empty state on the index route', async () => {
    await setupBrowserTest(<MTADetailPanel />, { initialRouterEntry: '/' });

    await expect
      .element(page.getByText(/Please select an option from the list/i))
      .toBeVisible();
  });

  describe('global MTA operation routes', () => {
    it.each(globalOpRoutes)('renders the right view for /%s', async (op, marker) => {
      await setupBrowserTest(<MTADetailPanel />, { initialRouterEntry: `/${op}` });

      await expect.element(page.getByText(marker)).toBeVisible();
    });
  });

  it(`renders MTAServerGeneral for /:server/mta_server_general`, async () => {
    await setupBrowserTest(<MTADetailPanel />, {
      initialRouterEntry: `/${SERVER_ID}/mta_server_general`,
    });

    await expect.element(page.getByText('VIEW:mta-server-general')).toBeVisible();
  });

  it('renders nothing for an unknown operation', async () => {
    await setupBrowserTest(<MTADetailPanel />, {
      initialRouterEntry: '/totally-unknown-op',
    });

    await expect
      .element(page.getByText('VIEW:inbound-flow-security'))
      .not.toBeInTheDocument();
    await expect.element(page.getByText(/Please select an option/i)).not.toBeInTheDocument();
  });
});
