/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React, { SetStateAction, useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdvancedVolumeWizardDetail, VolumeWizardDetail } from '../../../../../../../types';
import { VolumeContext } from '../volume-context';
import AdvancedMailstoresDefinition from './advanced-mailstores-definition';
import { AdvancedVolumeContext } from './create-advanced-volume-context';

const mockListS3Connector = vi.hoisted(() => vi.fn());
const setIsAllocationToggleSpy = vi.hoisted(() => vi.fn());

const mockT = vi.hoisted(() => (key: string, fallback?: string) => fallback ?? key);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

vi.mock('@zextras/ui-components', () => ({
  Container: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Row: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Padding: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  LabeledValue: ({ label, value }: { label: string; value: string }) => (
    <div>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  ),
  Input: ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value?: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <label>
      {label}
      <input aria-label={label} value={value ?? ''} onChange={onChange} />
    </label>
  ),
  Select: ({
    label,
    items,
    onChange,
  }: {
    label: string;
    items: Array<{ label: string; value: number | string }>;
    onChange: (value: unknown) => void;
  }) => (
    <div>
      <div>{label}</div>
      {items.map((item) => (
        <button key={`${label}-${item.value}`} type="button" onClick={() => onChange(item.value)}>
          {item.label}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../../../../../../services/bucket-service', () => ({
  listS3Connector: mockListS3Connector,
}));

type HarnessProps = {
  setToggleNextBtn: (newValue: boolean) => void;
  setCompleteLoading: (newValue: boolean) => void;
  initialVolumeDetail?: VolumeWizardDetail;
  initialAdvancedVolumeDetail?: AdvancedVolumeWizardDetail;
};

function applyUpdate<T>(
  update: SetStateAction<T>,
  setState: React.Dispatch<SetStateAction<T>>,
): void {
  setState((prevState) =>
    typeof update === 'function' ? (update as (prev: T) => T)(prevState) : update,
  );
}

function TestHarness({
  setToggleNextBtn,
  setCompleteLoading,
  initialVolumeDetail,
  initialAdvancedVolumeDetail,
}: HarnessProps): React.JSX.Element {
  const [volumeDetail, setVolumeDetailState] = useState<VolumeWizardDetail>(
    initialVolumeDetail ?? {},
  );
  const [advancedVolumeDetail, setAdvancedVolumeDetailState] = useState<AdvancedVolumeWizardDetail>(
    initialAdvancedVolumeDetail ?? {},
  );

  function setVolumeDetail(update: SetStateAction<VolumeWizardDetail>): void {
    applyUpdate(update, setVolumeDetailState);
  }

  function setAdvancedVolumeDetail(update: SetStateAction<AdvancedVolumeWizardDetail>): void {
    applyUpdate(update, setAdvancedVolumeDetailState);
  }

  return (
    <VolumeContext.Provider value={{ volumeDetail, setVolumeDetail }}>
      <AdvancedVolumeContext.Provider value={{ advancedVolumeDetail, setAdvancedVolumeDetail, isAllocationToggle: false, setIsAllocationToggle: setIsAllocationToggleSpy }}>
        <AdvancedMailstoresDefinition
          externalData="server-a"
          setToggleNextBtn={setToggleNextBtn}
          setCompleteLoading={setCompleteLoading}
        />
        <div data-testid="advanced-state">{JSON.stringify(advancedVolumeDetail)}</div>
      </AdvancedVolumeContext.Provider>
    </VolumeContext.Provider>
  );
}

describe('AdvancedMailstoresDefinition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setIsAllocationToggleSpy.mockClear();

    mockListS3Connector.mockResolvedValue([
      {
        uuid: 'conn-unused',
        label: 'Unused connector',
        bucketName: 'unused-bucket',
        storeType: 'S3',
        notes: '',
        'usage in external backup': 'unused',
      },
      {
        uuid: 'conn-used',
        label: 'Used connector',
        bucketName: 'used-bucket',
        storeType: 'S3',
        notes: '',
        'usage in external backup': 'in-use',
      },
    ]);
  });

  it('should show and clear volume name validation message', async () => {
    const setToggleNextBtn = vi.fn();
    const setCompleteLoading = vi.fn();

    render(
      <TestHarness setToggleNextBtn={setToggleNextBtn} setCompleteLoading={setCompleteLoading} />,
    );

    fireEvent.change(screen.getByLabelText('Volume Name'), { target: { value: 'Volume A' } });
    expect(screen.queryByText('Volume name is required.')).toBeNull();

    fireEvent.change(screen.getByLabelText('Volume Name'), { target: { value: '' } });
    expect(screen.getByText('Volume name is required.')).toBeTruthy();

    await waitFor(() => {
      expect(setCompleteLoading).toHaveBeenCalledWith(false);
    });
  });

  it('should enable next and complete loading for local block device allocation', async () => {
    const setToggleNextBtn = vi.fn();
    const setCompleteLoading = vi.fn();

    render(
      <TestHarness
        setToggleNextBtn={setToggleNextBtn}
        setCompleteLoading={setCompleteLoading}
        initialVolumeDetail={{ volumeName: 'Volume A' }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Local Block Device' }));

    expect(setToggleNextBtn).toHaveBeenCalledWith(true);

    await waitFor(() => {
      expect(setCompleteLoading).toHaveBeenCalledWith(true);
      expect(setIsAllocationToggleSpy).toHaveBeenCalledWith(true);
    });
  });

  it('should initialize local allocation from default selection and enable next when volume name exists', async () => {
    const setToggleNextBtn = vi.fn();
    const setCompleteLoading = vi.fn();

    render(
      <TestHarness
        setToggleNextBtn={setToggleNextBtn}
        setCompleteLoading={setCompleteLoading}
        initialVolumeDetail={{ volumeName: 'Volume A' }}
      />,
    );

    await waitFor(() => {
      expect(setToggleNextBtn).toHaveBeenCalledWith(true);
      expect(setCompleteLoading).toHaveBeenCalledWith(true);
      expect(setIsAllocationToggleSpy).toHaveBeenCalledWith(true);
    });
  });

  it('should render external bucket selector and complete after choosing a bucket', async () => {
    const setToggleNextBtn = vi.fn();
    const setCompleteLoading = vi.fn();

    render(
      <TestHarness
        setToggleNextBtn={setToggleNextBtn}
        setCompleteLoading={setCompleteLoading}
        initialVolumeDetail={{ volumeName: 'Volume A' }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Object Storage' }));

    expect(setToggleNextBtn).toHaveBeenCalledWith(false);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'S3 | Unused connector' })).toBeTruthy();
    });

    await waitFor(() => {
      expect(setCompleteLoading).toHaveBeenCalledWith(true);
      expect(setIsAllocationToggleSpy).toHaveBeenCalledWith(false);
    });

    fireEvent.click(screen.getByRole('button', { name: 'S3 | Unused connector' }));

    expect(screen.getByTestId('advanced-state').textContent).toContain('unused-bucket');
    expect(screen.getByTestId('advanced-state').textContent).toContain('conn-unused');
  });

  it('should auto-select first available bucket for object storage and enable completion', async () => {
    const setToggleNextBtn = vi.fn();
    const setCompleteLoading = vi.fn();

    render(
      <TestHarness
        setToggleNextBtn={setToggleNextBtn}
        setCompleteLoading={setCompleteLoading}
        initialVolumeDetail={{ volumeName: 'Volume A' }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Object Storage' }));

    await waitFor(() => {
      expect(setToggleNextBtn).toHaveBeenCalledWith(false);
      expect(setCompleteLoading).toHaveBeenCalledWith(true);
      expect(setIsAllocationToggleSpy).toHaveBeenCalledWith(false);
    });

    expect(screen.getByTestId('advanced-state').textContent).toContain('unused-bucket');
    expect(screen.getByTestId('advanced-state').textContent).toContain('conn-unused');
  });
});