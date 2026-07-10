/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React, { act, ChangeEvent, type ReactNode,useEffect, useRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Connection from '../connection';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  const Wrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
}

const mockCreateS3Connector = vi.hoisted(() => vi.fn());
const mockListS3Regions = vi.hoisted(() => vi.fn());
const mockT = vi.hoisted(() => (key: string, fallback?: string) => fallback ?? key);

vi.mock('react-i18next', () => ({
  useTranslation: () => [mockT],
}));

vi.mock('@zextras/ui-components', () => ({
  Button: ({
    label,
    onClick,
    disabled,
  }: {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {label}
    </button>
  ),
  Container: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  getFieldErrorProps: (
    field: { state: { meta: { isBlurred: boolean; isValid: boolean; errors: Array<{ message?: string } | string> } } },
    isSubmitted: boolean,
    t: (key: string, fallback?: string) => string,
    messages?: Record<string, string>,
  ) => {
    const { meta } = field.state;
    const showError = (meta.isBlurred || isSubmitted) && !meta.isValid;
    if (!showError) return { hasError: false };
    const firstError = meta.errors[0];
    const key = typeof firstError === 'string' ? firstError : firstError?.message;
    return { hasError: true, description: key ? t(key, messages?.[key] ?? key) : undefined };
  },
  Input: ({
    label,
    value,
    onChange,
    hasError,
    description,
  }: {
    label: string;
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    hasError?: boolean;
    description?: string;
  }) => (
    <label>
      {label}
      <input aria-label={label} value={value} onChange={onChange} />
      {hasError && description && <span>{description}</span>}
    </label>
  ),
  Padding: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  PasswordInput: ({
    label,
    value,
    onChange,
    hasError,
    description,
  }: {
    label: string;
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    hasError?: boolean;
    description?: string;
  }) => (
    <label>
      {label}
      <input aria-label={label} value={value} onChange={onChange} />
      {hasError && description && <span>{description}</span>}
    </label>
  ),
  Row: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Select: ({
    label,
    selection,
    items,
    onChange,
  }: {
    label: string;
    selection: { value: string; label: string };
    items: Array<{ value: string; label: string }>;
    onChange: (value: string | null) => void;
  }) => (
    <label>
      {label}
      <select
        aria-label={label}
        value={selection?.value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      >
        {items.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  ),
  Switch: ({
    label,
    onClick,
  }: {
    label: string;
    onClick: () => void;
  }) => (
    <button type="button" aria-label={label} onClick={onClick}>
      {label}
    </button>
  ),
  Tooltip: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../../services/bucket-service', () => ({
  createS3Connector: mockCreateS3Connector,
  listS3Regions: mockListS3Regions,
}));

vi.mock('../parts/verify/verify-progress', () => ({
  VerifyProgress: ({
    isPending,
    onComplete,
  }: {
    isPending: boolean;
    onComplete?: () => void;
  }) => {
    const wasPending = useRef(isPending);

    useEffect(() => {
      if (wasPending.current && !isPending) {
        onComplete?.();
      }
      wasPending.current = isPending;
    }, [isPending, onComplete]);

    return <div>{isPending ? 'verify-pending' : 'verify-idle'}</div>;
  },
}));

vi.mock('../parts/verify/verify-success', () => ({
  VerifySuccess: ({ isSuccess }: { isSuccess: boolean }) =>
    isSuccess ? <div>verify-success</div> : null,
}));

vi.mock('../parts/verify/verify-error', () => ({
  VerifyError: ({
    isError,
    checkDetails,
    onRetry,
  }: {
    isError: boolean;
    checkDetails?: { connectionOk?: string };
    onRetry?: () => void;
  }) =>
    isError ? (
      <div>
        <span>verify-error</span>
        {checkDetails?.connectionOk && <span>connectionOk:{checkDetails.connectionOk}</span>}
        <button type="button" onClick={onRetry}>
          Retry
        </button>
      </div>
    ) : null,
}));

async function fillRequiredFields(): Promise<void> {
  await screen.findByRole('option', { name: /US East 1/i });

  await act(async () => {
    fireEvent.change(screen.getByLabelText('Descriptive name*'), {
      target: { value: 'Main bucket' },
    });
    fireEvent.change(screen.getByLabelText('Bucket name*'), {
      target: { value: 'main-bucket' },
    });
    fireEvent.change(screen.getByLabelText('Access Key ID*'), {
      target: { value: 'AKIA_TEST' },
    });
    fireEvent.change(screen.getByLabelText('Secret Access Key*'), {
      target: { value: 'SECRET_TEST' },
    });
    fireEvent.change(screen.getByLabelText('Region'), {
      target: { value: 'us-east-1' },
    });
  });
}

describe('Connection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListS3Regions.mockResolvedValue([
      { id: 'us-east-1', description: 'US East 1' },
      { id: 'eu-central-1', description: 'EU Central 1' },
    ]);
    mockCreateS3Connector.mockResolvedValue({ ok: true });
  });

  it('should validate required fields and not call verify when mandatory values are missing', async () => {
    render(<Connection onCancel={vi.fn()} />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByRole('button', { name: /verify & create connector/i }));

    await waitFor(() => {
      expect(screen.getByText('This field is mandatory')).toBeTruthy();
    });
    expect(mockCreateS3Connector).not.toHaveBeenCalled();
  });

  it('should call createS3Connector and show success on successful verify', async () => {
    render(<Connection onCancel={vi.fn()} />, { wrapper: createWrapper() });
    await fillRequiredFields();

    fireEvent.click(screen.getByRole('button', { name: /verify & create connector/i }));

    await waitFor(() => {
      expect(mockCreateS3Connector).toHaveBeenCalledTimes(1);
    });

    expect(mockCreateS3Connector).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'createS3Connector',
        label: 'Main bucket',
        bucketName: 'main-bucket',
        accessKey: 'AKIA_TEST',
        secret: 'SECRET_TEST',
        region: 'us-east-1',
        insecureHttps: false,
      }),
    );

    await waitFor(() => {
      expect(screen.getByText('verify-success')).toBeTruthy();
    });
  });

  it('should show verify error message when verify returns a failed response', async () => {
    mockCreateS3Connector.mockResolvedValue({
      ok: false,
      error: 'Connector verification failed',
    });

    render(<Connection onCancel={vi.fn()} />, { wrapper: createWrapper() });
    await fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /verify & create connector/i }));

    await waitFor(() => {
      expect(screen.getByText('verify-error')).toBeTruthy();
    });
  });

  it('should show fallback error message when verify request throws', async () => {
    mockCreateS3Connector.mockRejectedValue(new Error('network down'));

    render(<Connection onCancel={vi.fn()} />, { wrapper: createWrapper() });
    await fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /verify & create connector/i }));

    await waitFor(() => {
      expect(screen.getByText('verify-error')).toBeTruthy();
    });
  });

  it('should hide verify error when retry is clicked', async () => {
    mockCreateS3Connector.mockResolvedValue({
      ok: false,
      error: 'Connector verification failed',
    });

    render(<Connection onCancel={vi.fn()} />, { wrapper: createWrapper() });
    await fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /verify & create connector/i }));

    await waitFor(() => {
      expect(screen.getByText('verify-error')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() => {
      expect(screen.queryByText('verify-error')).toBeNull();
    });
  });

  it('should include trimmed endpoint URL and prefix in payload when provided', async () => {
    render(<Connection onCancel={vi.fn()} />, { wrapper: createWrapper() });
    await fillRequiredFields();

    fireEvent.change(screen.getByLabelText('Endpoint URL'), {
      target: { value: '  https://s3.example.test  ' },
    });
    fireEvent.change(screen.getByLabelText('Prefix'), {
      target: { value: '  team/folder  ' },
    });

    fireEvent.click(screen.getByRole('button', { name: /verify & create connector/i }));

    await waitFor(() => {
      expect(mockCreateS3Connector).toHaveBeenCalledTimes(1);
    });

    expect(mockCreateS3Connector).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://s3.example.test',
        destinationPath: 'team/folder',
      }),
    );
  });

  it('should require custom region and submit selected custom value', async () => {
    render(<Connection onCancel={vi.fn()} />, { wrapper: createWrapper() });
    await fillRequiredFields();

    fireEvent.change(screen.getByLabelText('Region'), {
      target: { value: 'SET_CUSTOM_REGION' },
    });

    fireEvent.click(screen.getByRole('button', { name: /verify & create connector/i }));

    expect(mockCreateS3Connector).not.toHaveBeenCalled();
    expect(
      screen.getByText("This field can't be blank or have white space"),
    ).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Custom region'), {
      target: { value: 'custom-region-1' },
    });
    fireEvent.change(screen.getByLabelText('Endpoint URL*'), {
      target: { value: 'https://custom-region-endpoint.test' },
    });

    fireEvent.click(screen.getByRole('button', { name: /verify & create connector/i }));

    await waitFor(() => {
      expect(mockCreateS3Connector).toHaveBeenCalledTimes(1);
    });

    expect(mockCreateS3Connector).toHaveBeenCalledWith(
      expect.objectContaining({ region: 'custom-region-1' }),
    );
  });

  it('should show message and details when verify returns error object', async () => {
    mockCreateS3Connector.mockResolvedValue({
      ok: false,
      error: {
        message: 'Detailed verification failed',
        details: {
          connectionOk: 'false',
        },
      },
    });

    render(<Connection onCancel={vi.fn()} />, { wrapper: createWrapper() });
    await fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /verify & create connector/i }));

    await waitFor(() => {
      expect(screen.getByText('verify-error')).toBeTruthy();
    });

    expect(screen.getByText('connectionOk:false')).toBeTruthy();
  });
});
