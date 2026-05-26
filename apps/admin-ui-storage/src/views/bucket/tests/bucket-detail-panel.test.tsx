/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type ChangeEvent, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import BucketDetailPanel from '../bucket-detail-panel';

const mockListS3Connector = vi.hoisted(() => vi.fn());
const mockDeleteS3Connector = vi.hoisted(() => vi.fn());
const mockSnackbar = vi.hoisted(() => vi.fn());
const mockT = vi.hoisted(
  () =>
    (
      key: string,
      fallback?: string,
      options?: {
        name?: string;
        message?: string;
      },
    ) => options?.message ?? options?.name ?? fallback ?? key,
);

vi.mock('react-i18next', () => ({
  useTranslation: () => [mockT],
}));

vi.mock('../../../services/bucket-service', () => ({
  listS3Connector: mockListS3Connector,
  deleteS3Connector: mockDeleteS3Connector,
}));

vi.mock('@zextras/ui-components', () => ({
  Button: ({
    label,
    icon,
    onClick,
  }: {
    label?: string;
    icon?: string;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {label ?? icon ?? 'button'}
    </button>
  ),
  Container: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  CustomHeaderFactory: () => null,
  HoverableRowFactory: () => null,
  Input: ({
    label,
    disabled,
    onChange,
  }: {
    label: string;
    disabled?: boolean;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <label>
      {label}
      <input aria-label={label} disabled={disabled} onChange={onChange} />
    </label>
  ),
  ListRow: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  ModalOverlay: ({ children, open }: { children?: ReactNode; open: boolean }) =>
    open ? <div>{children}</div> : null,
  Padding: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Row: ({
    children,
    onClick,
    onDoubleClick,
  }: {
    children?: ReactNode;
    onClick?: () => void;
    onDoubleClick?: () => void;
  }) => (
    <div role="button" tabIndex={0} onClick={onClick} onDoubleClick={onDoubleClick}>
      {children}
    </div>
  ),
  Table: ({
    headers,
    rows,
    onSelectionChange,
  }: {
    headers: Array<{ id: string; label: string }>;
    rows: Array<{ id: string; columns: Array<ReactNode> }>;
    onSelectionChange: (selected: Array<string>) => void;
  }) => (
    <div>
      {headers.map((header) => (
        <div key={header.id}>{header.label}</div>
      ))}
      <button type="button" onClick={() => onSelectionChange(['0'])}>
        Select first
      </button>
      <button type="button" onClick={() => onSelectionChange(['not-a-number'])}>
        Select invalid
      </button>
      {rows.map((row, rowIndex) => (
        <div key={row.id} data-testid={`row-${rowIndex}`}>
          {row.columns.map((column, columnIndex) => (
            <div key={`${row.id}-${String(columnIndex)}`}>{column}</div>
          ))}
        </div>
      ))}
    </div>
  ),
  Tooltip: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  useSnackbar: () => mockSnackbar,
}));

vi.mock('../new-bucket', () => ({
  __esModule: true,
  default: ({
    setToggleWizardSection,
  }: {
    setToggleWizardSection: (value: boolean) => void;
  }) => (
    <div>
      <span>new-bucket-modal</span>
      <button type="button" onClick={() => setToggleWizardSection(false)}>
        Close new bucket modal
      </button>
    </div>
  ),
}));

vi.mock('../delete-bucket-model', () => ({
  __esModule: true,
  default: ({
    closeHandler,
    saveHandler,
  }: {
    closeHandler: () => void;
    saveHandler: () => void;
  }) => (
    <div>
      <span>delete-modal</span>
      <button type="button" onClick={saveHandler}>
        Confirm delete
      </button>
      <button type="button" onClick={closeHandler}>
        Cancel delete
      </button>
    </div>
  ),
}));

vi.mock('../edit-bucket-details-panel', () => ({
  __esModule: true,
  default: ({
    setOpen,
    setBucketDeleteName,
    bucketDetail,
  }: {
    setOpen: (open: boolean) => void;
    setBucketDeleteName: (bucket: {
      uuid: string;
      bucketName: string;
      label: string;
    }) => void;
    bucketDetail: {
      uuid: string;
      bucketName: string;
      label: string;
    };
  }) => (
    <div>
      <span>edit-panel</span>
      <button
        type="button"
        onClick={() => {
          setBucketDeleteName(bucketDetail);
          setOpen(true);
        }}
      >
        Open delete modal
      </button>
    </div>
  ),
}));

type Connector = {
  uuid: string;
  label: string;
  bucketName: string;
  region?: string;
  url?: string;
  accessKey?: string;
  prefix?: string;
  insecureHttps?: boolean;
  notes?: string;
  storeType?: string;
};

function connector(overrides: Partial<Connector> = {}): Connector {
  return {
    uuid: 'uuid-1',
    label: 'Main connector',
    bucketName: 'main-bucket',
    region: 'us-east-1',
    url: '',
    accessKey: '',
    prefix: '',
    insecureHttps: false,
    notes: '',
    storeType: 'S3',
    ...overrides,
  };
}

describe('BucketDetailPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListS3Connector.mockResolvedValue([
      connector(),
      connector({
        uuid: 'uuid-2',
        label: 'Backup connector',
        bucketName: 'backup-bucket',
      }),
    ]);
    mockDeleteS3Connector.mockResolvedValue({ ok: true });
  });

  it('should render fetched connectors and open edit view on row click', async () => {
    render(<BucketDetailPanel />);

    await waitFor(() => {
      expect(screen.getByText('Main connector')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Main connector'));

    expect(screen.getByText('edit-panel')).toBeTruthy();
  });

  it('should filter the list and restore full list when filter is cleared', async () => {
    render(<BucketDetailPanel />);

    const filterInput = await screen.findByLabelText('Filter S3 List');

    fireEvent.change(filterInput, { target: { value: 'backup' } });

    expect(screen.queryByText('Main connector')).toBeNull();
    expect(screen.getByText('Backup connector')).toBeTruthy();

    fireEvent.change(filterInput, { target: { value: '' } });

    expect(await screen.findByText('Main connector')).toBeTruthy();
    expect(screen.getByText('Backup connector')).toBeTruthy();
  });

  it('should handle invalid selection index without crashing', async () => {
    render(<BucketDetailPanel />);

    await waitFor(() => {
      expect(screen.getByText('Main connector')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Select invalid' }));

    expect(screen.getByText('Main connector')).toBeTruthy();
  });

  it('should open new bucket modal when create button is clicked', async () => {
    render(<BucketDetailPanel />);

    await waitFor(() => {
      expect(screen.getByText('Main connector')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('CREATE A NEW S3', { selector: 'button' }));

    expect(screen.getByText('new-bucket-modal')).toBeTruthy();
  });

  it('should show empty state and disable filter input when list call fails', async () => {
    mockListS3Connector.mockRejectedValueOnce(new Error('network failure'));

    render(<BucketDetailPanel />);

    await waitFor(() => {
      expect(screen.getByText(/haven't setup a bucket type/i)).toBeTruthy();
    });

    expect((screen.getByLabelText('Filter S3 List') as HTMLInputElement).disabled).toBe(true);
  });

  it('should delete connector successfully and show success snackbar', async () => {
    render(<BucketDetailPanel />);

    await waitFor(() => {
      expect(screen.getByText('Main connector')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Main connector'));
    fireEvent.click(screen.getByRole('button', { name: 'Open delete modal' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm delete' }));

    await waitFor(() => {
      expect(mockDeleteS3Connector).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'deleteS3Connector',
          uuid: 'uuid-1',
          iAmSure: true,
        }),
      );
    });

    expect(mockSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'success',
      }),
    );
    expect(mockListS3Connector).toHaveBeenCalledTimes(2);
  });

  it('should show error snackbar when delete returns failure', async () => {
    mockDeleteS3Connector.mockResolvedValueOnce({
      ok: false,
      error: { message: 'Delete denied' },
    });

    render(<BucketDetailPanel />);

    await waitFor(() => {
      expect(screen.getByText('Main connector')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Main connector'));
    fireEvent.click(screen.getByRole('button', { name: 'Open delete modal' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm delete' }));

    await waitFor(() => {
      expect(mockSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
          label: 'Delete denied',
        }),
      );
    });
  });
});
