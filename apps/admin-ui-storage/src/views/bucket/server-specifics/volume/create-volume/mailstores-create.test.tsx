/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import MailstoresCreate from './mailstores-create';
import { volumeCreateSchema } from './schema';
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
  getFieldErrorProps: () => ({ hasError: false }),
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

function TestHarness({
  setCompleteLoading,
  initialFormValues,
}: {
  setCompleteLoading: ReturnType<typeof vi.fn>;
  initialFormValues?: Record<string, unknown>;
}): React.JSX.Element {
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
      ...initialFormValues,
    },
    validators: { onChange: volumeCreateSchema },
    onSubmit: async () => {},
  });

  return (
    <VolumeContext.Provider value={{ form }}>
      <MailstoresCreate
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
    const setCompleteLoading = vi.fn();

    render(<TestHarness setCompleteLoading={setCompleteLoading} />);

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
    const setCompleteLoading = vi.fn();

    render(<TestHarness setCompleteLoading={setCompleteLoading} />);

    expect(screen.getByText('Enable Compression')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Index' }));

    await waitFor(() => {
      expect(screen.queryByText('Enable Compression')).toBeNull();
      expect(screen.queryByLabelText('Compression Threshold')).toBeNull();
    });
  });

  it('should keep completion disabled when compression is enabled without threshold', async () => {
    const setCompleteLoading = vi.fn();

    render(<TestHarness setCompleteLoading={setCompleteLoading} />);

    fireEvent.change(screen.getByLabelText('Volume Name'), {
      target: { value: 'primary-volume' },
    });
    fireEvent.change(screen.getByLabelText('Volume path'), {
      target: { value: '/opt/zextras/store' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enable Compression' }));

    await waitFor(() => {
      expect(setCompleteLoading).toHaveBeenCalledWith(false);
    });
  });

  it('should select advanced volume type through radio buttons and enable completion', async () => {
    mockAdvancedMode.value = true;
    const setCompleteLoading = vi.fn();

    render(
      <TestHarness
        setCompleteLoading={setCompleteLoading}
        initialFormValues={{ volumeAllocation: 'internal' }}
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
      expect(setCompleteLoading).toHaveBeenCalledWith(true);
    });

    expect(screen.getByText('Allocation')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Enable Compression' })).toBeTruthy();
  });
});