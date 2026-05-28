/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React, { SetStateAction, useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { VolumeWizardDetail } from '../../../../../../types';
import MailstoresCreate from './mailstores-create';
import { VolumeContext } from './volume-context';

const mockAdvancedMode = vi.hoisted(() => ({ value: false }));
const mockT = vi.hoisted(() => (key: string, fallback?: string) => fallback ?? key);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

vi.mock('@zextras/ui-shared', () => ({
  useIsAdvanced: () => mockAdvancedMode.value,
}));

vi.mock('../../../../utility/utils', () => ({
  volumeTypeList: (_t: unknown, isAdvanced: boolean) =>
    isAdvanced
      ? []
      : [
          { label: 'Primary', value: 1 },
          { label: 'Index', value: 10 },
        ],
  volumeAllocationList: () => [
    { label: 'Internal', value: 'internal' },
    { label: 'External', value: 'external' },
  ],
}));

vi.mock('@zextras/ui-components', () => ({
  Container: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Row: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Padding: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  LabeledValue: ({ label, value }: { label: string; value?: string }) => (
    <div>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  ),
  Input: ({
    label,
    value,
    onChange,
    disabled,
  }: {
    label: string;
    value?: string | number;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
  }) => (
    <label>
      {label}
      <input aria-label={label} value={value ?? ''} onChange={onChange} disabled={disabled} />
    </label>
  ),
  Radio: ({ label, onClick }: { label: string; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {label}
    </button>
  ),
  Select: ({
    label,
    items,
    onChange,
  }: {
    label: string;
    items: Array<{ label: string; value: string | number }>;
    onChange?: (value: string | number) => void;
  }) => (
    <div>
      <span>{label}</span>
      {items.map((item) => (
        <button key={`${label}-${item.value}`} type="button" onClick={() => onChange?.(item.value)}>
          {item.label}
        </button>
      ))}
    </div>
  ),
  Switch: ({ label, onClick }: { label: string; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {label}
    </button>
  ),
}));

function applyUpdate<T>(
  update: SetStateAction<T>,
  setState: React.Dispatch<SetStateAction<T>>,
): void {
  setState((prevState) =>
    typeof update === 'function' ? (update as (prev: T) => T)(prevState) : update,
  );
}

function TestHarness({
  onSelection,
  setCompleteLoading,
  initialVolumeDetail,
}: {
  onSelection: ReturnType<typeof vi.fn>;
  setCompleteLoading: ReturnType<typeof vi.fn>;
  initialVolumeDetail?: VolumeWizardDetail;
}): React.JSX.Element {
  const [volumeDetail, setVolumeDetailState] = useState<VolumeWizardDetail>(
    initialVolumeDetail ?? {},
  );

  function setVolumeDetail(update: SetStateAction<VolumeWizardDetail>): void {
    applyUpdate(update, setVolumeDetailState);
  }

  return (
    <VolumeContext.Provider value={{ volumeDetail, setVolumeDetail }}>
      <MailstoresCreate
        onSelection={onSelection}
        externalData="mailstore1.example.com"
        setCompleteLoading={setCompleteLoading}
      />
    </VolumeContext.Provider>
  );
}

describe('MailstoresCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdvancedMode.value = false;
  });

  it('should enable completion in non-advanced mode when name and path are filled without compression', async () => {
    const onSelection = vi.fn();
    const setCompleteLoading = vi.fn();

    render(
      <TestHarness onSelection={onSelection} setCompleteLoading={setCompleteLoading} />,
    );

    fireEvent.change(screen.getByLabelText('Volume Name'), {
      target: { value: 'primary-volume' },
    });
    fireEvent.change(screen.getByLabelText('Volume path'), {
      target: { value: '/opt/zextras/store' },
    });

    await waitFor(() => {
      expect(setCompleteLoading).toHaveBeenCalledWith(true);
    });
  });

  it('should hide compression controls when index volume is selected in non-advanced mode', async () => {
    const onSelection = vi.fn();
    const setCompleteLoading = vi.fn();

    render(
      <TestHarness onSelection={onSelection} setCompleteLoading={setCompleteLoading} />,
    );

    expect(screen.getByText('Enable Compression')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Index' }));

    await waitFor(() => {
      expect(onSelection).toHaveBeenCalledWith({ volumeMain: 10 }, true);
    });

    expect(screen.queryByText('Enable Compression')).toBeNull();
    expect(screen.queryByLabelText('Compression Threshold')).toBeNull();
  });

  it('should keep completion disabled when compression is enabled without threshold', async () => {
    const onSelection = vi.fn();
    const setCompleteLoading = vi.fn();

    render(
      <TestHarness onSelection={onSelection} setCompleteLoading={setCompleteLoading} />,
    );

    fireEvent.change(screen.getByLabelText('Volume Name'), {
      target: { value: 'primary-volume' },
    });
    fireEvent.change(screen.getByLabelText('Volume path'), {
      target: { value: '/opt/zextras/store' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enable Compression' }));

    await waitFor(() => {
      expect(onSelection).toHaveBeenCalledWith({ isCompression: true }, true);
      expect(setCompleteLoading).toHaveBeenCalledWith(false);
    });
  });

  it('should select advanced volume type through radio buttons and enable completion', async () => {
    mockAdvancedMode.value = true;
    const onSelection = vi.fn();
    const setCompleteLoading = vi.fn();

    render(
      <TestHarness
        onSelection={onSelection}
        setCompleteLoading={setCompleteLoading}
        initialVolumeDetail={{ volumeAllocation: 'internal' }}
      />,
    );

    fireEvent.change(screen.getByLabelText('Volume Name'), {
      target: { value: 'secondary-volume' },
    });
    fireEvent.change(screen.getByLabelText('Volume path'), {
      target: { value: '/opt/zextras/secondary' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'This is a Secondary Volume' }));

    await waitFor(() => {
      expect(onSelection).toHaveBeenCalledWith({ volumeMain: 2 }, true);
      expect(setCompleteLoading).toHaveBeenCalledWith(true);
    });

    expect(screen.getByText('Allocation')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Enable Compression' })).toBeTruthy();
  });
});