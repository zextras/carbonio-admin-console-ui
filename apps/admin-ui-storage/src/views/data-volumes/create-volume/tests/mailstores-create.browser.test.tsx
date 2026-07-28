/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { advancedSupportedApiForBrowser, setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { MailstoresCreate } from '../mailstores-create';
import { volumeCreateSchema } from '../schema';
import { VolumeContext } from '../volume-context';

function VolumeProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const form = useForm({
    defaultValues: {
      id: '',
      volumeName: '',
      volumeMain: 1,
      path: '',
      isCurrent: false,
      isCompression: false,
      compressionThreshold: '',
      volumeAllocation: 0,
    },
    validators: { onChange: volumeCreateSchema },
    onSubmit: async () => {},
  });

  return <VolumeContext.Provider value={{ form }}>{children}</VolumeContext.Provider>;
}

function renderMailstoresCreate(): React.ReactElement {
  return (
    <VolumeProvider>
      <MailstoresCreate externalData="mailstore1.example.com" />
    </VolumeProvider>
  );
}

describe('MailstoresCreate (browser)', () => {
  beforeEach(async () => {
    await advancedSupportedApiForBrowser.withAdvancedNotSupported();
  });

  it('should hide compression controls when index volume is selected', async () => {
    await setupBrowserTest(renderMailstoresCreate());

    await expect.element(page.getByText('Enable Compression', { exact: true })).toBeVisible();

    await page.getByText('Volume Type', { exact: true }).click();
    await page.getByText('Index', { exact: true }).click();

    await vi.waitFor(() => {
      expect(page.getByText('Enable Compression', { exact: true }).elements()).toHaveLength(0);
      expect(page.getByText('Compression Threshold', { exact: true }).elements()).toHaveLength(0);
    });
  });

  it('should show radio buttons in advanced mode', async () => {
    await advancedSupportedApiForBrowser.withAdvancedSupported();

    await setupBrowserTest(renderMailstoresCreate());

    await page.getByLabelText('Volume Name').fill('secondary-volume');
    await page.getByLabelText('Volume path').fill('/opt/zextras/secondary');

    await expect.element(page.getByText('Primary Volume', { exact: true })).toBeVisible();
    await page.getByText('Secondary Volume', { exact: true }).click();
  });
});
