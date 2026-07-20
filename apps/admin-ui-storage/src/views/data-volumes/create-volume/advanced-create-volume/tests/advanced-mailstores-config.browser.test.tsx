/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { setupBrowserTest } from 'admin-ui-test-utils';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { S3 } from '../../../../../constants';
import { volumeCreateSchema } from '../../schema';
import { VolumeContext } from '../../volume-context';
import { AdvancedMailstoresConfig } from '../advanced-mailstores-config';
import { AdvancedVolumeContext } from '../create-advanced-volume-context';
import type { AdvancedVolumeFormValues } from '../types';

type HarnessOptions = {
  initialAdvanced?: Partial<AdvancedVolumeFormValues>;
  onSelection?: (data: Record<string, unknown>, flag: boolean) => void;
  setCompleteLoading?: (value: boolean) => void;
  externalData?: string;
};

function Harness({
  initialAdvanced,
  onSelection,
  setCompleteLoading,
  externalData,
}: HarnessOptions) {
  const volumeForm = useForm({
    defaultValues: {
      id: '',
      volumeName: 'primary-volume',
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

  const [isAllocationToggle, setIsAllocationToggle] = useState(false);

  const advancedForm = useForm({
    defaultValues: {
      volumeName: 'volume-a',
      volumeMain: 0,
      isCurrent: false,
      volumeAllocation: '',
      bucketName: 'bucket-a',
      unusedBucketType: '',
      tieringSupported: false,
      bucketId: 'bucket-1',
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
      <AdvancedVolumeContext.Provider
        value={{ form: advancedForm, isAllocationToggle, setIsAllocationToggle }}
      >
        <AdvancedMailstoresConfig
          externalData={externalData ?? 'server-a'}
          onSelection={onSelection ?? vi.fn()}
          setCompleteLoading={setCompleteLoading ?? vi.fn()}
        />
        <div data-testid="advanced-state">{JSON.stringify(advancedValues)}</div>
      </AdvancedVolumeContext.Provider>
    </VolumeContext.Provider>
  );
}

function renderHarness(options: HarnessOptions = {}) {
  const onSelection = options.onSelection ?? vi.fn();
  const setCompleteLoading = options.setCompleteLoading ?? vi.fn();
  return {
    onSelection,
    setCompleteLoading,
    render: () =>
      setupBrowserTest(
        <Harness
          initialAdvanced={options.initialAdvanced}
          onSelection={onSelection}
          setCompleteLoading={setCompleteLoading}
          externalData={options.externalData}
        />,
      ),
  };
}

describe('AdvancedMailstoresConfig (browser)', () => {
  it('should render Server, Storage Type, and Volume Name labeled values', async () => {
    await renderHarness().render();
    await expect.element(page.getByText('Server', { exact: true }).first()).toBeVisible();
    await expect.element(page.getByText('Storage Type', { exact: true }).first()).toBeVisible();
    await expect.element(page.getByText('Volume Name', { exact: true }).first()).toBeVisible();
  });

  it('should render Bucket Name, Type, and ID labeled values', async () => {
    await renderHarness().render();
    await expect.element(page.getByText('Bucket Name', { exact: true }).first()).toBeVisible();
    await expect.element(page.getByText('Type', { exact: true }).first()).toBeVisible();
    await expect.element(page.getByText('ID', { exact: true }).first()).toBeVisible();
    await expect.element(page.getByText('bucket-a', { exact: true })).toBeVisible();
    await expect.element(page.getByText('bucket-1', { exact: true })).toBeVisible();
  });

  it('should render Primary and Secondary radio buttons', async () => {
    await renderHarness().render();
    await expect.element(page.getByText('This is a Primary Volume', { exact: true })).toBeVisible();
    await expect
      .element(page.getByText('This is a Secondary Volume', { exact: true }))
      .toBeVisible();
  });

  it('should render the Prefix input', async () => {
    await renderHarness().render();
    await expect
      .element(page.getByPlaceholder('Prefix - all objects will have this prefix in their name'))
      .toBeVisible();
  });

  it('should call setCompleteLoading(false) on mount when volumeMain is 0', async () => {
    const setCompleteLoading = vi.fn();
    await renderHarness({ setCompleteLoading }).render();
    await vi.waitFor(() => {
      expect(setCompleteLoading).toHaveBeenCalledWith(false);
    });
  });

  it('should call setCompleteLoading(true) when Primary radio is selected', async () => {
    const setCompleteLoading = vi.fn();
    await renderHarness({ setCompleteLoading }).render();
    await vi.waitFor(() => {
      expect(setCompleteLoading).toHaveBeenCalledWith(false);
    });
    await page.getByText('This is a Primary Volume', { exact: true }).click();
    await vi.waitFor(() => {
      expect(setCompleteLoading).toHaveBeenCalledWith(true);
    });
  });

  it('should toggle Primary radio off when clicked twice (volumeMain back to 0)', async () => {
    const onSelection = vi.fn();
    await renderHarness({
      onSelection,
      initialAdvanced: { volumeMain: 1 },
    }).render();

    await page.getByText('This is a Primary Volume', { exact: true }).click();
    await vi.waitFor(() => {
      expect(onSelection).toHaveBeenCalledWith({ volumeMain: 0 }, true);
    });
  });

  it('should toggle Secondary radio on and call onSelection with SECONDARY_TYPE_VALUE', async () => {
    const onSelection = vi.fn();
    await renderHarness({ onSelection }).render();
    await page.getByText('This is a Secondary Volume', { exact: true }).click();
    await vi.waitFor(() => {
      expect(onSelection).toHaveBeenCalledWith({ volumeMain: 2 }, true);
    });
  });

  it('should hide tiering switches when unusedBucketType is not S3', async () => {
    await renderHarness({
      initialAdvanced: {
        unusedBucketType: 'Ceph',
        tieringSupported: true,
        volumeAllocation: 'Object Storage',
      },
    }).render();

    expect(page.getByText('Use infrequent access', { exact: true }).elements()).toHaveLength(0);
    expect(page.getByText('Use intelligent tiering', { exact: true }).elements()).toHaveLength(0);
  });

  it('should hide tiering switches when tieringSupported is false even with S3 storeType', async () => {
    await renderHarness({
      initialAdvanced: {
        unusedBucketType: S3,
        tieringSupported: false,
        volumeAllocation: 'Object Storage',
      },
    }).render();

    expect(page.getByText('Use infrequent access', { exact: true }).elements()).toHaveLength(0);
    expect(page.getByText('Use intelligent tiering', { exact: true }).elements()).toHaveLength(0);
  });

  it('should hide tiering switches for Local Block Device allocation even when tiering is supported', async () => {
    await renderHarness({
      initialAdvanced: {
        unusedBucketType: S3,
        tieringSupported: true,
        volumeAllocation: 'Local Block Device',
      },
    }).render();

    expect(page.getByText('Use infrequent access', { exact: true }).elements()).toHaveLength(0);
    expect(page.getByText('Use intelligent tiering', { exact: true }).elements()).toHaveLength(0);
  });

  it('should render tiering switches when S3 + tieringSupported + Object Storage', async () => {
    await renderHarness({
      initialAdvanced: {
        unusedBucketType: S3,
        tieringSupported: true,
        volumeAllocation: 'Object Storage',
      },
    }).render();

    await expect.element(page.getByText('Use infrequent access', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Use intelligent tiering', { exact: true })).toBeVisible();
  });

  it('should hide Storage centralized switch for Local Block Device allocation', async () => {
    await renderHarness({
      initialAdvanced: { volumeAllocation: 'Local Block Device' },
    }).render();

    expect(
      page.getByText('I want this Storage to be centralized', { exact: true }).elements(),
    ).toHaveLength(0);
  });

  it('should render Storage centralized switch for Object Storage allocation', async () => {
    await renderHarness({
      initialAdvanced: { volumeAllocation: 'Object Storage' },
    }).render();

    await expect
      .element(page.getByText('I want this Storage to be centralized', { exact: true }))
      .toBeVisible();
  });

  it('should always render the Set as Current switch', async () => {
    await renderHarness().render();
    await expect.element(page.getByText('Set as Current', { exact: true })).toBeVisible();
  });

  it('should reset tiering form fields via onSelection when tiering is not supported', async () => {
    const onSelection = vi.fn();
    await renderHarness({
      onSelection,
      initialAdvanced: {
        unusedBucketType: 'Ceph',
        tieringSupported: false,
        useInfrequentAccess: true,
        useIntelligentTiering: true,
        volumeAllocation: 'Object Storage',
      },
    }).render();

    await vi.waitFor(() => {
      expect(onSelection).toHaveBeenCalledWith({ useInfrequentAccess: false }, true);
      expect(onSelection).toHaveBeenCalledWith({ useIntelligentTiering: false }, true);
    });
  });

  it('should update form prefix when typing in the Prefix input', async () => {
    await renderHarness().render();
    await page
      .getByPlaceholder('Prefix - all objects will have this prefix in their name')
      .fill('myprefix');
    await vi.waitFor(() => {
      const state = document.querySelector('[data-testid="advanced-state"]')?.textContent ?? '';
      expect(state).toContain('"prefix":"myprefix"');
    });
  });

  it('should toggle isCurrent on Set as Current click', async () => {
    const onSelection = vi.fn();
    await renderHarness({ onSelection }).render();
    await page.getByText('Set as Current', { exact: true }).click();
    await vi.waitFor(() => {
      expect(onSelection).toHaveBeenCalledWith({ isCurrent: true }, true);
    });
  });

  it('should toggle centralized on Storage centralized click', async () => {
    const onSelection = vi.fn();
    await renderHarness({
      onSelection,
      initialAdvanced: { volumeAllocation: 'Object Storage' },
    }).render();
    await page.getByText('I want this Storage to be centralized', { exact: true }).click();
    await vi.waitFor(() => {
      expect(onSelection).toHaveBeenCalledWith({ centralized: true }, true);
    });
  });

  it('should clear infrequentAccessThreshold and disable Intelligent tiering when infrequent access is toggled off', async () => {
    const onSelection = vi.fn();
    await renderHarness({
      onSelection,
      initialAdvanced: {
        unusedBucketType: S3,
        tieringSupported: true,
        volumeAllocation: 'Object Storage',
        useInfrequentAccess: true,
        useIntelligentTiering: false,
        infrequentAccessThreshold: '4096',
      },
    }).render();

    // Click "Use infrequent access" switch to toggle it off
    await page.getByRole('switch', { name: 'Use infrequent access' }).click();

    await vi.waitFor(() => {
      expect(onSelection).toHaveBeenCalledWith({ useInfrequentAccess: false }, true);
      expect(onSelection).toHaveBeenCalledWith({ infrequentAccessThreshold: '' }, true);
    });
  });

  it('should disable Intelligent tiering when Infrequent access is toggled on', async () => {
    const onSelection = vi.fn();
    await renderHarness({
      onSelection,
      initialAdvanced: {
        unusedBucketType: S3,
        tieringSupported: true,
        volumeAllocation: 'Object Storage',
        useInfrequentAccess: false,
        useIntelligentTiering: false,
      },
    }).render();

    await page.getByRole('switch', { name: 'Use infrequent access' }).click();

    await vi.waitFor(() => {
      expect(onSelection).toHaveBeenCalledWith({ useInfrequentAccess: true }, true);
      expect(onSelection).toHaveBeenCalledWith({ useIntelligentTiering: false }, true);
    });
  });

  it('should disable Infrequent access when Intelligent tiering is toggled on', async () => {
    const onSelection = vi.fn();
    await renderHarness({
      onSelection,
      initialAdvanced: {
        unusedBucketType: S3,
        tieringSupported: true,
        volumeAllocation: 'Object Storage',
        useInfrequentAccess: false,
        useIntelligentTiering: false,
      },
    }).render();

    await page.getByRole('switch', { name: 'Use intelligent tiering' }).click();

    await vi.waitFor(() => {
      expect(onSelection).toHaveBeenCalledWith({ useIntelligentTiering: true }, true);
      expect(onSelection).toHaveBeenCalledWith({ useInfrequentAccess: false }, true);
    });
  });
});
