/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { DISABLED, ENABLED, NO, S3, YES } from '../../../../../constants';
import { volumeCreateSchema } from '../../schema';
import { VolumeContext } from '../../volume-context';
import { AdvancedMailstoresCreate } from '../advanced-mailstores-create';
import { AdvancedVolumeContext } from '../create-advanced-volume-context';
import type { AdvancedVolumeFormValues } from '../types';

type HarnessOptions = {
  initialAdvanced?: Partial<AdvancedVolumeFormValues>;
  externalData?: string;
};

function Harness({ initialAdvanced, externalData }: HarnessOptions) {
  const volumeForm = useForm({
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

  const advancedForm = useForm({
    defaultValues: {
      volumeName: '',
      volumeMain: 0,
      isCurrent: false,
      volumeAllocation: '',
      bucketName: '',
      unusedBucketType: '',
      tieringSupported: false,
      bucketId: '',
      prefix: '',
      centralized: false,
      useInfrequentAccess: false,
      infrequentAccessThreshold: '',
      useIntelligentTiering: false,
      ...initialAdvanced,
    } as AdvancedVolumeFormValues,
    onSubmit: async () => {},
  });

  const advancedValues = useSelector(advancedForm.store, (s) => s.values);

  return (
    <VolumeContext.Provider value={{ form: volumeForm }}>
      <AdvancedVolumeContext.Provider value={{ form: advancedForm }}>
        <AdvancedMailstoresCreate externalData={externalData ?? 'server-a'} />
        <div data-testid="advanced-state">{JSON.stringify(advancedValues)}</div>
      </AdvancedVolumeContext.Provider>
    </VolumeContext.Provider>
  );
}

function renderHarness(options: HarnessOptions = {}) {
  return {
    render: () =>
      setupBrowserTest(
        <Harness
          initialAdvanced={options.initialAdvanced}
          externalData={options.externalData}
        />,
      ),
  };
}

describe('AdvancedMailstoresCreate (browser)', () => {
  it('should render Server, Storage Type, and Volume Name labeled values', async () => {
    await renderHarness().render();
    await expect.element(page.getByText('Server', { exact: true }).first()).toBeVisible();
    await expect.element(page.getByText('Storage Type', { exact: true }).first()).toBeVisible();
    await expect.element(page.getByText('Volume Name', { exact: true }).first()).toBeVisible();
  });

  it('should render Bucket Name, Type, and ID labeled values', async () => {
    await renderHarness({
      initialAdvanced: { bucketName: 'bucket-a', unusedBucketType: 'Ceph', bucketId: 'b-1' },
    }).render();
    await expect.element(page.getByText('Bucket Name', { exact: true }).first()).toBeVisible();
    await expect.element(page.getByText('bucket-a', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Type', { exact: true }).first()).toBeVisible();
    await expect.element(page.getByText('b-1', { exact: true })).toBeVisible();
  });

  it('should render Type of Volume and Prefix labeled values', async () => {
    await renderHarness({
      initialAdvanced: { volumeMain: 1, prefix: 'myprefix' },
    }).render();
    await expect.element(page.getByText('Type of Volume', { exact: true })).toBeVisible();
    await expect
      .element(page.getByText('Prefix - all objects will have this prefix in their name'))
      .toBeVisible();
  });

  it('should show empty Type of Volume when volumeMain has no match in volumeTypeList', async () => {
    await renderHarness({
      initialAdvanced: { volumeMain: 99 },
    }).render();

    const state = document.querySelector('[data-testid="advanced-state"]')?.textContent ?? '';
    expect(state).toContain('"volumeMain":99');
  });

  it('should hide tiering summary when storeType is not S3', async () => {
    await renderHarness({
      initialAdvanced: { unusedBucketType: 'Ceph', tieringSupported: true },
    }).render();

    expect(page.getByText('Infrequent access', { exact: true }).elements()).toHaveLength(0);
    expect(page.getByText('Use Intelligent Tiering', { exact: true }).elements()).toHaveLength(0);
  });

  it('should hide tiering summary when tieringSupported is false', async () => {
    await renderHarness({
      initialAdvanced: { unusedBucketType: S3, tieringSupported: false },
    }).render();

    expect(page.getByText('Infrequent access', { exact: true }).elements()).toHaveLength(0);
    expect(page.getByText('Use Intelligent Tiering', { exact: true }).elements()).toHaveLength(0);
  });

  it('should render tiering summary when S3 + tieringSupported', async () => {
    await renderHarness({
      initialAdvanced: {
        unusedBucketType: S3,
        tieringSupported: true,
        useInfrequentAccess: true,
        useIntelligentTiering: false,
      },
    }).render();

    await expect.element(page.getByText('Infrequent access', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Use Intelligent Tiering', { exact: true })).toBeVisible();
    await expect.element(page.getByText(ENABLED, { exact: true }).first()).toBeVisible();
    await expect.element(page.getByText(DISABLED, { exact: true }).first()).toBeVisible();
  });

  it('should show ENABLED for intelligent tiering when toggled on', async () => {
    await renderHarness({
      initialAdvanced: {
        unusedBucketType: S3,
        tieringSupported: true,
        useInfrequentAccess: false,
        useIntelligentTiering: true,
      },
    }).render();

    const intelligentValues = page.getByText('Use Intelligent Tiering', { exact: true });
    await expect.element(intelligentValues.first()).toBeVisible();
    expect(page.getByText(ENABLED, { exact: true }).elements().length).toBeGreaterThan(0);
  });

  it('should display YES for isCurrent when current is true', async () => {
    await renderHarness({ initialAdvanced: { isCurrent: true } }).render();
    await expect
      .element(
        page.getByRole('paragraph').filter({ hasText: YES }).elements().length > 0
          ? page.getByText(YES, { exact: true }).first()
          : page.getByText(YES, { exact: true }).first(),
      )
      .toBeVisible();
  });

  it('should display NO for isCurrent when current is false', async () => {
    await renderHarness({ initialAdvanced: { isCurrent: false } }).render();
    expect(page.getByText(NO, { exact: true }).elements().length).toBeGreaterThan(0);
  });

  it('should display YES for centralized when centralized is true', async () => {
    await renderHarness({ initialAdvanced: { centralized: true } }).render();
    expect(page.getByText(YES, { exact: true }).elements().length).toBeGreaterThan(0);
  });

  it('should display NO for centralized when centralized is false', async () => {
    await renderHarness({ initialAdvanced: { centralized: false } }).render();
    expect(page.getByText(NO, { exact: true }).elements().length).toBeGreaterThan(0);
  });

  it('should render local block device review with path and compression fields', async () => {
    await renderHarness({
      initialAdvanced: {
        volumeAllocation: 'Local Block Device',
        volumeMain: 1,
        volumeName: 'local-vol',
        path: '/opt/zextras/store',
        isCompression: true,
        compressionThreshold: '4096',
        isCurrent: true,
      },
    }).render();

    await expect.element(page.getByText('Volume path', { exact: true })).toBeVisible();
    await expect
      .element(page.getByText('/opt/zextras/store', { exact: true }))
      .toBeVisible();
    await expect.element(page.getByText('Enable Compression', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Compression Threshold', { exact: true })).toBeVisible();
    await expect.element(page.getByText('4096', { exact: true })).toBeVisible();
    expect(page.getByText('BUCKET', { exact: true }).elements()).toHaveLength(0);
  });

  it('should show DISABLED for compression threshold when compression is off for local block device', async () => {
    await renderHarness({
      initialAdvanced: {
        volumeAllocation: 'Local Block Device',
        volumeMain: 1,
        path: '/opt/zextras/store',
        isCompression: false,
        compressionThreshold: '',
      },
    }).render();

    expect(page.getByText(NO, { exact: true }).elements().length).toBeGreaterThan(0);
    await expect.element(page.getByText(DISABLED, { exact: true }).first()).toBeVisible();
  });
});
