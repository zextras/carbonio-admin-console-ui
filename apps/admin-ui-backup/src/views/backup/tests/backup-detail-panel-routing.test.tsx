/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { Mock, vi } from 'vitest';

vi.mock('../actions/import-external-backup', () => ({
  ImportExternalBackup: vi.fn(),
}));

vi.mock('../configuration/backup-configuration', () => ({
  BackupConfiguration: vi.fn(),
}));

vi.mock('../default-setting/backup-advanced', () => ({
  BackupAdvanced: vi.fn(),
}));

vi.mock('../default-setting/backup-server-config', () => ({
  BackupServerConfig: vi.fn(),
}));

vi.mock('../default-setting/backup-servers-list', () => ({
  ServersList: vi.fn(),
}));

vi.mock('../server-advanced/server-advanced', () => ({
  ServerAdvanced: vi.fn(),
}));

import { ImportExternalBackup } from '../actions/import-external-backup';
import { BackupConfiguration } from '../configuration/backup-configuration';
import { BackupAdvanced } from '../default-setting/backup-advanced';
import { BackupServerConfig } from '../default-setting/backup-server-config';
import { ServersList } from '../default-setting/backup-servers-list';
import { ServerAdvanced } from '../server-advanced/server-advanced';

const mocks = {
  BackupServerConfig: BackupServerConfig as unknown as Mock,
  BackupAdvanced: BackupAdvanced as unknown as Mock,
  ServersList: ServersList as unknown as Mock,
  ImportExternalBackup: ImportExternalBackup as unknown as Mock,
  BackupConfiguration: BackupConfiguration as unknown as Mock,
  ServerAdvanced: ServerAdvanced as unknown as Mock,
};

const SERVER_NAME = 'mail.example.com';

beforeEach(() => {
  for (const m of Object.values(mocks)) {
    m.mockImplementation(() => null);
  }
});

function renderAtRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/server_config" element={<BackupServerConfig />} />
        <Route path="/advanced" element={<BackupAdvanced />} />
        <Route path="/servers_list" element={<ServersList />} />
        <Route path="/import_an_external_backup" element={<ImportExternalBackup />} />
        <Route path="/:server/configuration_lbl" element={<BackupConfiguration />} />
        <Route path="/:server/advanced_lbl" element={<ServerAdvanced />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('BackupDetailPanel routing', () => {
  describe('Routing', () => {
    it('should render BackupServerConfig for the server_config route', () => {
      renderAtRoute('/server_config');
      expect(mocks.BackupServerConfig).toHaveBeenCalled();
    });

    it('should render BackupAdvanced for the advanced route', () => {
      renderAtRoute('/advanced');
      expect(mocks.BackupAdvanced).toHaveBeenCalled();
    });

    it('should render ServersList for the servers_list route', () => {
      renderAtRoute('/servers_list');
      expect(mocks.ServersList).toHaveBeenCalled();
    });

    it('should render ImportExternalBackup for the import_an_external_backup route', () => {
      renderAtRoute('/import_an_external_backup');
      expect(mocks.ImportExternalBackup).toHaveBeenCalled();
    });

    it('should render BackupConfiguration for the :server/configuration_lbl route', () => {
      renderAtRoute(`/${SERVER_NAME}/configuration_lbl`);
      expect(mocks.BackupConfiguration).toHaveBeenCalled();
    });

    it('should render ServerAdvanced for the :server/advanced_lbl route', () => {
      renderAtRoute(`/${SERVER_NAME}/advanced_lbl`);
      expect(mocks.ServerAdvanced).toHaveBeenCalled();
    });
  });

  describe('Isolation', () => {
    it('should render only BackupServerConfig when the path is server_config', () => {
      renderAtRoute('/server_config');
      expect(mocks.BackupServerConfig).toHaveBeenCalled();
      expect(mocks.BackupAdvanced).not.toHaveBeenCalled();
      expect(mocks.ServersList).not.toHaveBeenCalled();
      expect(mocks.ImportExternalBackup).not.toHaveBeenCalled();
      expect(mocks.BackupConfiguration).not.toHaveBeenCalled();
      expect(mocks.ServerAdvanced).not.toHaveBeenCalled();
    });

    it('should render only BackupConfiguration when the path is :server/configuration_lbl', () => {
      renderAtRoute(`/${SERVER_NAME}/configuration_lbl`);
      expect(mocks.BackupConfiguration).toHaveBeenCalled();
      expect(mocks.BackupServerConfig).not.toHaveBeenCalled();
      expect(mocks.BackupAdvanced).not.toHaveBeenCalled();
      expect(mocks.ServerAdvanced).not.toHaveBeenCalled();
    });

    it('should render only ServerAdvanced when the path is :server/advanced_lbl', () => {
      renderAtRoute(`/${SERVER_NAME}/advanced_lbl`);
      expect(mocks.ServerAdvanced).toHaveBeenCalled();
      expect(mocks.BackupConfiguration).not.toHaveBeenCalled();
      expect(mocks.BackupServerConfig).not.toHaveBeenCalled();
    });
  });

  describe('Unmatched routes', () => {
    it('should not render any component for an unknown operation', () => {
      const { container } = renderAtRoute('/unknown_operation');
      expect(container.innerHTML).toBe('');
      for (const m of Object.values(mocks)) {
        expect(m).not.toHaveBeenCalled();
      }
    });

    it('should not render any component for an unknown server-specific operation', () => {
      const { container } = renderAtRoute(`/${SERVER_NAME}/unknown_operation`);
      expect(container.innerHTML).toBe('');
      for (const m of Object.values(mocks)) {
        expect(m).not.toHaveBeenCalled();
      }
    });

    it('should not render any component when there is no operation segment', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/server_config" element={<BackupServerConfig />} />
            <Route path="/advanced" element={<BackupAdvanced />} />
            <Route path="/servers_list" element={<ServersList />} />
            <Route path="/import_an_external_backup" element={<ImportExternalBackup />} />
            <Route path="/:server/configuration_lbl" element={<BackupConfiguration />} />
            <Route path="/:server/advanced_lbl" element={<ServerAdvanced />} />
          </Routes>
        </MemoryRouter>,
      );
      expect(container.innerHTML).toBe('');
      for (const m of Object.values(mocks)) {
        expect(m).not.toHaveBeenCalled();
      }
    });
  });
});
