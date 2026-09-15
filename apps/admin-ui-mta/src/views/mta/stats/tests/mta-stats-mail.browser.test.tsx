/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserSoapAPIInterceptor,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { MTAStats } from '../mta-stats';

const SERVER_NAME = 'mail1.test.com';
const QUEUE_ITEM_ID = 'msg-queue-1';

function getAllServersWithMtaResponse() {
  return {
    server: [
      {
        id: 'server-1',
        name: SERVER_NAME,
        a: [{ n: 'zimbraServiceHostname', _content: SERVER_NAME }],
      },
    ],
  };
}

function getMailQueueInfoResponse() {
  return {
    server: [
      {
        name: SERVER_NAME,
        queue: [
          { name: 'active', n: '2' },
          { name: 'corrupt', n: '1' },
          { name: 'deferred', n: '3' },
          { name: 'hold', n: '0' },
          { name: 'incoming', n: '1' },
        ],
      },
    ],
  };
}

function getMailQueueResponse() {
  return {
    server: [
      {
        name: SERVER_NAME,
        queue: [
          {
            name: 'active',
            total: 1,
            qi: [
              {
                id: QUEUE_ITEM_ID,
                time: String(Date.UTC(2026, 0, 15, 10, 30)),
                size: '12',
                fromdomain: 'sender.test.com',
                todomain: 'recipient.test.com',
                from: 'user@sender.test.com',
                receiver: 'user@recipient.test.com',
                host: 'mail.origin.test.com',
                ip: '10.0.0.1',
                reason: 'deferred',
                filter: 'none',
                received: 'recv-1',
              },
            ],
          },
        ],
      },
    ],
  };
}

function getEmptyMailQueueResponse() {
  return {
    server: [
      {
        name: SERVER_NAME,
        queue: [
          {
            name: 'active',
            total: 0,
            qi: [],
          },
        ],
      },
    ],
  };
}

describe('MTAStatsMail', { timeout: 20_000 }, () => {
  afterEach(() => {
    resetMockWorker();
  });

  it('opens the mail queue drawer when a server row is clicked', async () => {
    createBrowserSoapAPIInterceptor('GetAllServers', getAllServersWithMtaResponse());
    createBrowserSoapAPIInterceptor('GetMailQueueInfo', getMailQueueInfoResponse());
    createBrowserSoapAPIInterceptor('GetMailQueue', getMailQueueResponse());

    await setupBrowserTest(<MTAStats />, { grantRights: 'config' });

    await expect.element(page.getByText(SERVER_NAME)).toBeVisible();
    await page.getByText(SERVER_NAME).click();

    await expect.element(page.getByRole('button', { name: 'Hold' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Release' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Requeue' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Delete' })).toBeVisible();
  });

  it('switches queue tabs in the drawer', async () => {
    createBrowserSoapAPIInterceptor('GetAllServers', getAllServersWithMtaResponse());
    createBrowserSoapAPIInterceptor('GetMailQueueInfo', getMailQueueInfoResponse());
    createBrowserSoapAPIInterceptor('GetMailQueue', getMailQueueResponse());
    createBrowserSoapAPIInterceptor('GetMailQueue', getMailQueueResponse());

    await setupBrowserTest(<MTAStats />, { grantRights: 'config' });

    await page.getByText(SERVER_NAME).click();
    await expect.element(page.getByText(/Queued \(/)).toBeVisible();

    await page.getByText(/Deferred \(/).click();
    await expect.element(page.getByText(/Deferred \(/)).toBeVisible();
  });

  it('submits a Batch MailQueueAction with urn:zimbraAdmin on Hold', async () => {
    createBrowserSoapAPIInterceptor('GetAllServers', getAllServersWithMtaResponse());
    createBrowserSoapAPIInterceptor('GetMailQueueInfo', getMailQueueInfoResponse());
    createBrowserSoapAPIInterceptor('GetMailQueue', getMailQueueResponse());
    const batchInterceptor = createBrowserSoapAPIInterceptor('Batch', {});
    createBrowserSoapAPIInterceptor('GetMailQueue', getMailQueueResponse());
    createBrowserSoapAPIInterceptor('GetMailQueueInfo', getMailQueueInfoResponse());

    await setupBrowserTest(<MTAStats />, { grantRights: 'config' });

    await page.getByText(SERVER_NAME).click();
    await expect.element(page.getByText(QUEUE_ITEM_ID)).toBeVisible();

    const queueRow = page.getByRole('row').filter({ hasText: QUEUE_ITEM_ID });
    const rowEl = queueRow.element();
    rowEl.closest('table')?.parentElement?.scrollTo({ left: 0 });
    rowEl.querySelector('td')?.scrollIntoView({ block: 'center', inline: 'start' });
    rowEl.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await expect.poll(() => rowEl.querySelector('[data-testid="checkbox"]')).toBeTruthy();
    const rowCheckbox = rowEl.querySelector('[data-testid="checkbox"]');
    expect(rowCheckbox).toBeTruthy();
    // Drawer and table can exceed the default browser viewport; use a DOM click to bypass bounds checks.
    (rowCheckbox as HTMLElement).click();

    const holdButton = page.getByRole('button', { name: 'Hold' });
    await expect.element(holdButton).toBeEnabled();
    await holdButton.click();

    const request = await batchInterceptor;
    expect(request).toMatchObject({
      _jsns: 'urn:zimbraAdmin',
      MailQueueActionRequest: expect.arrayContaining([
        expect.objectContaining({
          _jsns: 'urn:zimbraAdmin',
          server: expect.objectContaining({
            name: SERVER_NAME,
            queue: expect.objectContaining({
              name: 'active',
              action: expect.objectContaining({
                op: 'hold',
                by: 'id',
                _content: QUEUE_ITEM_ID,
              }),
            }),
          }),
        }),
      ]),
    });
  });

  it('keeps mail queue columns at their configured widths and scrolls horizontally', async () => {
    createBrowserSoapAPIInterceptor('GetAllServers', getAllServersWithMtaResponse());
    createBrowserSoapAPIInterceptor('GetMailQueueInfo', getMailQueueInfoResponse());
    createBrowserSoapAPIInterceptor('GetMailQueue', getMailQueueResponse());

    await setupBrowserTest(<MTAStats />, { grantRights: 'config' });

    await page.getByText(SERVER_NAME).click();
    await expect.element(page.getByText(QUEUE_ITEM_ID)).toBeVisible();

    const queueTable = page
      .getByRole('row')
      .filter({ hasText: QUEUE_ITEM_ID })
      .element()
      .closest('table');
    expect(queueTable).toBeTruthy();

    const idColumn = queueTable!.querySelectorAll('th')[1];
    expect(idColumn).toBeTruthy();
    const remInPx = Number.parseFloat(getComputedStyle(idColumn).fontSize);
    expect(idColumn.getBoundingClientRect().width).toBeGreaterThan(remInPx * 15);

    const scrollContainer = queueTable!.parentElement;
    expect(scrollContainer).toBeTruthy();
    expect(scrollContainer!.scrollWidth).toBeGreaterThan(scrollContainer!.clientWidth);

    await expect.element(page.getByText('user@sender.test.com')).toBeVisible();
    await expect.element(page.getByText('user@recipient.test.com')).toBeVisible();
    await expect.element(page.getByText('mail.origin.test.com')).toBeVisible();
  });

  it('sizes empty mail queue headers to the header labels', async () => {
    createBrowserSoapAPIInterceptor('GetAllServers', getAllServersWithMtaResponse());
    createBrowserSoapAPIInterceptor('GetMailQueueInfo', getMailQueueInfoResponse());
    createBrowserSoapAPIInterceptor('GetMailQueue', getEmptyMailQueueResponse());

    await setupBrowserTest(<MTAStats />, { grantRights: 'config' });

    await page.getByText(SERVER_NAME).click();
    await expect.element(page.getByText('This list is empty.')).toBeVisible();
    await expect.element(page.getByText('Arrival Time')).toBeVisible();

    const arrivalHeader = page.getByText('Arrival Time').element().closest('th');
    expect(arrivalHeader).toBeTruthy();
    const remInPx = Number.parseFloat(getComputedStyle(arrivalHeader!).fontSize);
    const headerWidth = arrivalHeader!.getBoundingClientRect().width;
    expect(headerWidth).toBeGreaterThan(0);
    expect(headerWidth).toBeLessThan(remInPx * 10);

    const queueTable = arrivalHeader!.closest('table');
    expect(queueTable).toBeTruthy();
    const scrollContainer = queueTable!.parentElement;
    expect(scrollContainer).toBeTruthy();
    expect(scrollContainer!.scrollWidth).toBeLessThanOrEqual(scrollContainer!.clientWidth + 1);
  });
});
