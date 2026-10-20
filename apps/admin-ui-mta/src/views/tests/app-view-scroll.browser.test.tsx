/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserSoapAPIInterceptor,
  getGetInfoResponseMock,
  getQueryClient,
  grantUserConfigRights,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { AppView } from '../app-view';

function getAllConfigResponse() {
  return {
    a: [
      { n: 'zimbraMtaBlockedExtension', _content: 'exe' },
      { n: 'zimbraMtaSmtpdRejectUnlistedSender', _content: 'yes' },
      { n: 'zimbraMtaSmtpdRejectUnlistedRecipient', _content: 'no' },
      { n: 'zimbraMtaRestriction', _content: 'reject_unknown_client_hostname' },
      { n: 'carbonioSendAnalytics', _content: 'FALSE' },
      { n: 'zimbraAmavisFinalSpamDestiny', _content: 'D_PASS' },
      { n: 'zimbraSpamSubjectTag', _content: 'SPAM' },
      { n: 'zimbraSpamTagPercent', _content: '33' },
      { n: 'zimbraSpamKillPercent', _content: '90' },
      { n: 'zimbraVirusDefinitionsUpdateFrequency', _content: '2h' },
    ],
  };
}

function setupInterceptors() {
  createBrowserSoapAPIInterceptor('GetInfo', getGetInfoResponseMock());
  createBrowserSoapAPIInterceptor('GetAllConfig', getAllConfigResponse());
  createBrowserSoapAPIInterceptor('GetAccount', {});
  createBrowserSoapAPIInterceptor('GetAllServers', {
    server: [
      {
        id: 'server-1',
        name: 'mail.test.com',
        a: [{ n: 'zimbraServiceHostname', _content: 'mail.test.com' }],
      },
    ],
  });
}

const SHELL_HEADER_HEIGHT = 60;
/** Realistic laptop viewport — the browser-test default viewport (2000px) fits the whole form. */
const SHELL_VIEWPORT_HEIGHT = 700;

/**
 * Replicates the production shell layout around the app view:
 * a fixed header plus the AppViewContainer scroll container
 * (flexGrow 1, flexBasis 0, maxHeight calc(100vh - 60px), overflowY auto).
 */
function ShellReplica({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: `${SHELL_VIEWPORT_HEIGHT}px`,
        width: '100%',
      }}
    >
      <div style={{ height: `${SHELL_HEADER_HEIGHT}px`, flexShrink: 0 }} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          flexGrow: 1,
          flexBasis: 0,
          minWidth: '1px',
          maxHeight: `${SHELL_VIEWPORT_HEIGHT - SHELL_HEADER_HEIGHT}px`,
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            height: '100%',
            width: '100%',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function findShellScroller(el: Element): HTMLElement | null {
  let node = el.parentElement;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (/(auto|scroll)/.test(overflowY) && node.clientHeight > 0) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

/** Scrolls every user-scrollable (overflow auto/scroll, not hidden) ancestor to the bottom. */
function scrollToBottomUserScrollable(el: Element): void {
  let node = el.parentElement;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (/(auto|scroll)/.test(overflowY)) {
      node.scrollTop = node.scrollHeight;
    }
    node = node.parentElement;
  }
}

describe('AppView scroll behavior within the shell', () => {
  let queryClient: ReturnType<typeof getQueryClient>;

  beforeEach(async () => {
    queryClient = getQueryClient();
    await grantUserConfigRights(queryClient);
  });

  afterEach(() => {
    resetMockWorker();
  });

  it('keeps the breadcrumb fixed and lets the user scroll to the bottom of the form', async () => {
    setupInterceptors();

    await setupBrowserTest(
      <ShellReplica>
        <AppView />
      </ShellReplica>,
      { initialRouterEntry: '/antivirus_and_antispam', queryClient },
    );

    const bottomControlText = 'Warn admins when something is quarantined';
    await expect.element(page.getByText(bottomControlText)).toBeVisible();

    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' }).element();
    const bottomControl = page.getByText(bottomControlText).element();
    const shellScroller = findShellScroller(breadcrumb);
    if (!shellScroller) throw new Error('No scrollable shell container found');

    // The breadcrumb must live inside the shell viewport, not scroll with the page:
    // the app view must not overflow the shell scroll container.
    const breadcrumbTopBefore = breadcrumb.getBoundingClientRect().top;
    shellScroller.scrollTop = shellScroller.scrollHeight;
    const breadcrumbTopAfter = breadcrumb.getBoundingClientRect().top;
    expect(shellScroller.scrollHeight).toBe(shellScroller.clientHeight);
    expect(breadcrumbTopAfter).toBe(breadcrumbTopBefore);

    // The very bottom of the form must be reachable by user scrolling.
    scrollToBottomUserScrollable(bottomControl);
    const controlBottom = bottomControl.getBoundingClientRect().bottom;
    const shellBottom = shellScroller.getBoundingClientRect().bottom;
    expect(controlBottom).toBeLessThanOrEqual(shellBottom);
  });
}, 20_000);
