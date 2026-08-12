/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserSoapAPIInterceptor,
  resetMockWorker,
  setupBrowserTest,
  worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { type Operation } from '../../../types/operations';
import { OperationStateDetailPanel } from '../operation-state-detail-panel';

function makeMockOperations(state: string): Array<Operation> {
  return [
    {
      id: 'op-1',
      name: 'doBackup',
      host: 'mailstore1.test.com',
      serverName: 'mailstore1.test.com',
      module: 'ZxBackup',
      state,
      type: '',
      startTime: 1742774400000,
      queuedTime: 1742774300000,
      humanStartTime: '2025-03-24 00:00:00',
      parameters: {
        requesterAddress: 'admin@test.com',
        additionalNotificationAddresses: [],
        createFakeBlob: false,
        isDeep: true,
      },
    },
    {
      id: 'op-2',
      name: 'doExport',
      host: 'mailstore2.test.com',
      serverName: 'mailstore2.test.com',
      module: 'ZxCore',
      state,
      type: '',
      startTime: 1742688000000,
      queuedTime: 1742687900000,
      humanStartTime: '2025-03-23 00:00:00',
      parameters: {
        requesterAddress: 'admin@test.com',
        additionalNotificationAddresses: [],
        createFakeBlob: false,
        isDeep: false,
      },
    },
  ];
}

const SERVER_NAME = 'mailstore1.test.com';

function setupGetAllServersInterceptor(serverName = SERVER_NAME): void {
  createBrowserSoapAPIInterceptor('GetAllServers', {
    server: [
      {
        id: 'server-1',
        name: serverName,
        a: [{ n: 'zimbraServiceHostname', _content: serverName }],
      },
    ],
  });
}

function setupGetAllOperationsInterceptor(
  operations: Array<Operation>,
  serverName = SERVER_NAME,
): void {
  worker.use(
    http.post('/service/admin/soap/zextras', async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      const zextrasBody = (body?.Body as Record<string, unknown>)?.zextras as
        | Record<string, unknown>
        | undefined;

      if (zextrasBody?.action === 'getAllOperations') {
        return HttpResponse.json({
          Body: {
            response: {
              content: JSON.stringify({
                response: {
                  [serverName]: {
                    ok: true,
                    response: {
                      operationList: operations,
                    },
                  },
                },
              }),
            },
          },
        });
      }

      return HttpResponse.json({ Body: {} });
    }),
  );
}

const PANEL_VARIANTS = [
  {
    name: 'Running',
    state: 'Started',
    headingKey: 'operations.running_panel_heading',
    headingDefault: 'Running Operations',
    expectedHeading: 'Running Operations',
    actionButton: 'STOP OPERATION',
    modalConfirmationText: 'You are stopping doBackup',
    stopSuccessI18nKey: 'label.stop_operation_success',
    stopSuccessDefault: 'The {{name}} operation has been stopped successfully',
  },
  {
    name: 'Queued',
    state: 'Queued',
    headingKey: 'operations.queued_panel_heading',
    headingDefault: 'Queued Operations',
    expectedHeading: 'Queued Operations',
    actionButton: 'CANCEL OPERATION',
    modalConfirmationText: 'You are cancelling doBackup',
    stopSuccessI18nKey: 'label.cancel_operation_success',
    stopSuccessDefault: 'The {{name}} operation has been canceled successfully',
  },
] as const;

describe.each(PANEL_VARIANTS)(
  'OperationStateDetailPanel - $name',
  (variant) => {
    const mockOps = makeMockOperations(variant.state);

    beforeEach(() => {
      vi.resetAllMocks();
    });

    afterEach(() => {
      resetMockWorker();
    });

    it('should render the panel heading', async () => {
      setupGetAllServersInterceptor();
      setupGetAllOperationsInterceptor(mockOps);
      await setupBrowserTest(
        <OperationStateDetailPanel
          state={variant.state}
          headingKey={variant.headingKey}
          headingDefault={variant.headingDefault}
          stopSuccessI18nKey={variant.stopSuccessI18nKey}
          stopSuccessDefault={variant.stopSuccessDefault}
        />,
      );
      await expect.element(page.getByText(variant.expectedHeading)).toBeVisible();
    });

    it('should render table headers', async () => {
      setupGetAllServersInterceptor();
      setupGetAllOperationsInterceptor(mockOps);
      await setupBrowserTest(
        <OperationStateDetailPanel
          state={variant.state}
          headingKey={variant.headingKey}
          headingDefault={variant.headingDefault}
          stopSuccessI18nKey={variant.stopSuccessI18nKey}
          stopSuccessDefault={variant.stopSuccessDefault}
        />,
      );
      await expect.element(page.getByText('Server')).toBeVisible();
      await expect
        .element(page.getByText('Operation', { exact: true }))
        .toBeVisible();
      await expect.element(page.getByText('Author')).toBeVisible();
      await expect.element(page.getByText('Submit date')).toBeVisible();
      await expect.element(page.getByText('Start date')).toBeVisible();
    });

    it('should render operation data in the table', async () => {
      setupGetAllServersInterceptor();
      setupGetAllOperationsInterceptor(mockOps);
      await setupBrowserTest(
        <OperationStateDetailPanel
          state={variant.state}
          headingKey={variant.headingKey}
          headingDefault={variant.headingDefault}
          stopSuccessI18nKey={variant.stopSuccessI18nKey}
          stopSuccessDefault={variant.stopSuccessDefault}
        />,
      );
      await expect.element(page.getByText('mailstore1.test.com')).toBeVisible();
      await expect.element(page.getByText('doBackup')).toBeVisible();
      await expect.element(page.getByText('mailstore2.test.com')).toBeVisible();
      await expect.element(page.getByText('doExport')).toBeVisible();
    });

    it(`should show Empty Table when no ${variant.name.toLowerCase()} operations`, async () => {
      setupGetAllServersInterceptor();
      setupGetAllOperationsInterceptor([]);
      await setupBrowserTest(
        <OperationStateDetailPanel
          state={variant.state}
          headingKey={variant.headingKey}
          headingDefault={variant.headingDefault}
          stopSuccessI18nKey={variant.stopSuccessI18nKey}
          stopSuccessDefault={variant.stopSuccessDefault}
        />,
      );
      await expect.element(page.getByText('Empty Table')).toBeVisible();
    });

    it('should show author in the table rows', async () => {
      setupGetAllServersInterceptor();
      setupGetAllOperationsInterceptor(mockOps);
      await setupBrowserTest(
        <OperationStateDetailPanel
          state={variant.state}
          headingKey={variant.headingKey}
          headingDefault={variant.headingDefault}
          stopSuccessI18nKey={variant.stopSuccessI18nKey}
          stopSuccessDefault={variant.stopSuccessDefault}
        />,
      );
      await expect.element(page.getByText('doBackup')).toBeVisible();
      const authorElements = page.getByText('admin@test.com');
      expect(authorElements.elements().length).toBeGreaterThanOrEqual(1);
    });

    it('should open wizard detail panel when a row is clicked', async () => {
      setupGetAllServersInterceptor();
      setupGetAllOperationsInterceptor(mockOps);
      await setupBrowserTest(
        <OperationStateDetailPanel
          state={variant.state}
          headingKey={variant.headingKey}
          headingDefault={variant.headingDefault}
          stopSuccessI18nKey={variant.stopSuccessI18nKey}
          stopSuccessDefault={variant.stopSuccessDefault}
        />,
      );
      await page.getByText('doBackup').click();
      await expect.element(page.getByText('Details')).toBeVisible();
      await expect.element(page.getByText('Operation Type')).toBeVisible();
    });

    it('should show operation name and server name in wizard header', async () => {
      setupGetAllServersInterceptor();
      setupGetAllOperationsInterceptor(mockOps);
      await setupBrowserTest(
        <OperationStateDetailPanel
          state={variant.state}
          headingKey={variant.headingKey}
          headingDefault={variant.headingDefault}
          stopSuccessI18nKey={variant.stopSuccessI18nKey}
          stopSuccessDefault={variant.stopSuccessDefault}
        />,
      );
      await page.getByText('doBackup').click();
      await expect
        .element(page.getByText('doBackup on mailstore1.test.com'))
        .toBeVisible();
    });

    it(`should show ${variant.actionButton} button`, async () => {
      setupGetAllServersInterceptor();
      setupGetAllOperationsInterceptor(mockOps);
      await setupBrowserTest(
        <OperationStateDetailPanel
          state={variant.state}
          headingKey={variant.headingKey}
          headingDefault={variant.headingDefault}
          stopSuccessI18nKey={variant.stopSuccessI18nKey}
          stopSuccessDefault={variant.stopSuccessDefault}
        />,
      );
      await page.getByText('doBackup').click();
      await expect.element(page.getByText(variant.actionButton)).toBeVisible();
    });

    it(`should open confirmation modal when ${variant.actionButton} is clicked`, async () => {
      setupGetAllServersInterceptor();
      setupGetAllOperationsInterceptor(mockOps);
      await setupBrowserTest(
        <OperationStateDetailPanel
          state={variant.state}
          headingKey={variant.headingKey}
          headingDefault={variant.headingDefault}
          stopSuccessI18nKey={variant.stopSuccessI18nKey}
          stopSuccessDefault={variant.stopSuccessDefault}
        />,
      );
      await page.getByText('doBackup').click();
      await page.getByText(variant.actionButton).click();
      await expect
        .element(page.getByText(variant.modalConfirmationText))
        .toBeVisible();
      await expect.element(page.getByText('LET IT RUN')).toBeVisible();
    });

    it('should close confirmation modal when LET IT RUN is clicked', async () => {
      setupGetAllServersInterceptor();
      setupGetAllOperationsInterceptor(mockOps);
      await setupBrowserTest(
        <OperationStateDetailPanel
          state={variant.state}
          headingKey={variant.headingKey}
          headingDefault={variant.headingDefault}
          stopSuccessI18nKey={variant.stopSuccessI18nKey}
          stopSuccessDefault={variant.stopSuccessDefault}
        />,
      );
      await page.getByText('doBackup').click();
      await page.getByText(variant.actionButton).click();
      await expect
        .element(page.getByText(variant.modalConfirmationText))
        .toBeVisible();
      await page.getByText('LET IT RUN').click();
      expect(page.getByText(variant.modalConfirmationText).elements()).toHaveLength(0);
    });

    it('should close wizard panel when close button is clicked', async () => {
      setupGetAllServersInterceptor();
      setupGetAllOperationsInterceptor(mockOps);
      await setupBrowserTest(
        <OperationStateDetailPanel
          state={variant.state}
          headingKey={variant.headingKey}
          headingDefault={variant.headingDefault}
          stopSuccessI18nKey={variant.stopSuccessI18nKey}
          stopSuccessDefault={variant.stopSuccessDefault}
        />,
      );
      await page.getByText('doBackup').click();
      await expect
        .element(page.getByText('doBackup on mailstore1.test.com'))
        .toBeVisible();
      await page.getByRole('button', { name: /close/i }).click();
      expect(
        page.getByText('doBackup on mailstore1.test.com').elements(),
      ).toHaveLength(0);
    });

    it('should show COPY button in wizard detail panel', async () => {
      setupGetAllServersInterceptor();
      setupGetAllOperationsInterceptor(mockOps);
      await setupBrowserTest(
        <OperationStateDetailPanel
          state={variant.state}
          headingKey={variant.headingKey}
          headingDefault={variant.headingDefault}
          stopSuccessI18nKey={variant.stopSuccessI18nKey}
          stopSuccessDefault={variant.stopSuccessDefault}
        />,
      );
      await page.getByText('doBackup').click();
      await expect.element(page.getByText('COPY')).toBeVisible();
    });

    it(`should execute the operation and refetch on success when ${variant.actionButton} is confirmed`, async () => {
      setupGetAllServersInterceptor();
      let stopCalledTimes = 0;
      worker.use(
        http.post('/service/admin/soap/zextras', async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          const zextrasBody = (body?.Body as Record<string, unknown>)
            ?.zextras as Record<string, unknown> | undefined;

          if (zextrasBody?.action === 'getAllOperations') {
            return HttpResponse.json({
              Body: {
                response: {
                  content: JSON.stringify({
                    response: {
                      [SERVER_NAME]: {
                        ok: true,
                        response: { operationList: mockOps },
                      },
                    },
                  }),
                },
              },
            });
          }
          if (zextrasBody?.action === 'doStopOperation') {
            stopCalledTimes += 1;
            return HttpResponse.json({
              Body: {
                response: {
                  content: JSON.stringify({
                    response: { [SERVER_NAME]: { ok: true } },
                  }),
                },
              },
            });
          }

          return HttpResponse.json({ Body: {} });
        }),
      );

      await setupBrowserTest(
        <OperationStateDetailPanel
          state={variant.state}
          headingKey={variant.headingKey}
          headingDefault={variant.headingDefault}
          stopSuccessI18nKey={variant.stopSuccessI18nKey}
          stopSuccessDefault={variant.stopSuccessDefault}
        />,
      );
      await page.getByText('doBackup').click();
      await page.getByRole('button', { name: variant.actionButton }).click();
      await expect
        .element(page.getByText(variant.modalConfirmationText))
        .toBeVisible();
      await page
        .getByRole('button', { name: variant.actionButton })
        .last()
        .click();

      await expect.poll(() => stopCalledTimes).toBe(1);
    });

    it('should show Empty Table when fetching operations fails', async () => {
      setupGetAllServersInterceptor();
      worker.use(
        http.post('/service/admin/soap/zextras', async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          const zextrasBody = (body?.Body as Record<string, unknown>)
            ?.zextras as Record<string, unknown> | undefined;

          if (zextrasBody?.action === 'getAllOperations') {
            return HttpResponse.json({ Body: {} }, { status: 500 });
          }

          return HttpResponse.json({ Body: {} });
        }),
      );

      await setupBrowserTest(
        <OperationStateDetailPanel
          state={variant.state}
          headingKey={variant.headingKey}
          headingDefault={variant.headingDefault}
          stopSuccessI18nKey={variant.stopSuccessI18nKey}
          stopSuccessDefault={variant.stopSuccessDefault}
        />,
      );
      await expect.element(page.getByText('Empty Table')).toBeVisible();
    });
  },
);
