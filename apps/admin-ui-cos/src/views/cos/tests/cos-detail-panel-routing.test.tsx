/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { Mock, vi } from 'vitest';

vi.mock('../general-information/cos-general-information', () => ({
  CosGeneralInformation: vi.fn(),
}));

vi.mock('../cos-features/cos-features', () => ({
  CosFeatures: vi.fn(),
}));

vi.mock('../advanced/cos-advanced', () => ({
  CosAdvanced: vi.fn(),
}));

vi.mock('../cos-server-pools/cos-server-pools', () => ({
  CosServerPools: vi.fn(),
}));

vi.mock('../preferences/cos-preferences', () => ({
  COSPreferences: vi.fn(),
}));

vi.mock('../../../wsc/wsc-cos-settings', () => ({
  WscCosSettings: vi.fn(),
}));

vi.mock('../create-new-cos-legacy', () => ({
  CreateCosLegacy: vi.fn(),
}));

import { useIsAdvanced, useLicenseInfo, useLocalStorage } from '@zextras/ui-shared';

import { WscCosSettings } from '../../../wsc/wsc-cos-settings';
import { CosAdvanced } from '../advanced/cos-advanced';
import { CosDetailPanel } from '../cos-detail-panel';
import { CosFeatures } from '../cos-features/cos-features';
import { CosServerPools } from '../cos-server-pools/cos-server-pools';
import { CreateCosLegacy } from '../create-new-cos-legacy';
import { CosGeneralInformation } from '../general-information/cos-general-information';
import { COSPreferences } from '../preferences/cos-preferences';

const mocks = {
  CosGeneralInformation: CosGeneralInformation as unknown as Mock,
  CosFeatures: CosFeatures as unknown as Mock,
  CosAdvanced: CosAdvanced as unknown as Mock,
  CosServerPools: CosServerPools as unknown as Mock,
  COSPreferences: COSPreferences as unknown as Mock,
  WscCosSettings: WscCosSettings as unknown as Mock,
  CreateCosLegacy: CreateCosLegacy as unknown as Mock,
};

const useIsAdvancedMock = useIsAdvanced as unknown as Mock;
const useLocalStorageMock = useLocalStorage as unknown as Mock;
const useLicenseInfoMock = useLicenseInfo as unknown as Mock;

const COS_ID = 'cos-123';

beforeEach(() => {
  for (const m of Object.values(mocks)) {
    m.mockImplementation(() => null);
  }
  useIsAdvancedMock.mockReturnValue(false);
  useLocalStorageMock.mockReturnValue([false, vi.fn()]);
  useLicenseInfoMock.mockReturnValue({ data: null });
});

function renderCosDetailPanelAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/*" element={<CosDetailPanel />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('CosDetailPanel routing', () => {
  describe('Routing', () => {
    it('should render CosGeneralInformation for the general_information operation', () => {
      renderCosDetailPanelAt(`/${COS_ID}/general_information`);
      expect(mocks.CosGeneralInformation).toHaveBeenCalled();
    });

    it('should render CosFeatures for the features operation', () => {
      renderCosDetailPanelAt(`/${COS_ID}/features`);
      expect(mocks.CosFeatures).toHaveBeenCalled();
    });

    it('should render WscCosSettings for the wsc operation', () => {
      renderCosDetailPanelAt(`/${COS_ID}/wsc`);
      expect(mocks.WscCosSettings).toHaveBeenCalled();
    });

    it('should render COSPreferences for the preferences operation', () => {
      renderCosDetailPanelAt(`/${COS_ID}/preferences`);
      expect(mocks.COSPreferences).toHaveBeenCalled();
    });

    it('should render CosAdvanced for the advanced operation', () => {
      renderCosDetailPanelAt(`/${COS_ID}/advanced`);
      expect(mocks.CosAdvanced).toHaveBeenCalled();
    });

    it('should render CosServerPools for the server_pools operation', () => {
      renderCosDetailPanelAt(`/${COS_ID}/server_pools`);
      expect(mocks.CosServerPools).toHaveBeenCalled();
    });
  });

  describe('Isolation', () => {
    it('should render only CosAdvanced when the path is advanced', () => {
      renderCosDetailPanelAt(`/${COS_ID}/advanced`);
      expect(mocks.CosAdvanced).toHaveBeenCalled();
      expect(mocks.CosFeatures).not.toHaveBeenCalled();
      expect(mocks.CosGeneralInformation).not.toHaveBeenCalled();
      expect(mocks.COSPreferences).not.toHaveBeenCalled();
      expect(mocks.CosServerPools).not.toHaveBeenCalled();
      expect(mocks.WscCosSettings).not.toHaveBeenCalled();
    });

    it('should render only CosFeatures when the path is features', () => {
      renderCosDetailPanelAt(`/${COS_ID}/features`);
      expect(mocks.CosFeatures).toHaveBeenCalled();
      expect(mocks.CosAdvanced).not.toHaveBeenCalled();
      expect(mocks.CosGeneralInformation).not.toHaveBeenCalled();
    });
  });

  describe('Unmatched routes', () => {
    it('should not render any component for an unknown operation', () => {
      renderCosDetailPanelAt(`/${COS_ID}/unknown_operation`);
      for (const m of Object.values(mocks)) {
        expect(m).not.toHaveBeenCalled();
      }
    });

    it('should not render any component when there is no operation segment', () => {
      render(
        <MemoryRouter initialEntries={[`/${COS_ID}`]}>
          <Routes>
            <Route path="/*" element={<CosDetailPanel />} />
          </Routes>
        </MemoryRouter>,
      );
      for (const m of Object.values(mocks)) {
        expect(m).not.toHaveBeenCalled();
      }
    });

    it('should render CosAdvanced for an uppercased path since the operation is matched case-insensitively', () => {
      renderCosDetailPanelAt(`/${COS_ID}/ADVANCED`);
      expect(mocks.CosAdvanced).toHaveBeenCalled();
    });
  });

  describe('Create COS route', () => {
    it('should render CreateCosLegacy when featureFlag and isAdvanced are both false', () => {
      useLocalStorageMock.mockReturnValue([false, vi.fn()]);
      useIsAdvancedMock.mockReturnValue(false);

      renderCosDetailPanelAt(`/create-new-cos`);

      expect(mocks.CreateCosLegacy).toHaveBeenCalled();
    });

    it('should render CreateCosLegacy when featureFlag is true but isAdvanced is false', () => {
      useLocalStorageMock.mockReturnValue([true, vi.fn()]);
      useIsAdvancedMock.mockReturnValue(false);

      renderCosDetailPanelAt(`/create-new-cos`);

      expect(mocks.CreateCosLegacy).toHaveBeenCalled();
    });

    it('should not render CreateCosLegacy when featureFlag, isAdvanced, and subscription are all valid', () => {
      useLocalStorageMock.mockReturnValue([true, vi.fn()]);
      useIsAdvancedMock.mockReturnValue(true);
      useLicenseInfoMock.mockReturnValue({ data: { response: { type: 'Purchased' } } });

      renderCosDetailPanelAt(`/create-new-cos`);

      expect(mocks.CreateCosLegacy).not.toHaveBeenCalled();
    });

    it('should render CreateCosLegacy when featureFlag and isAdvanced are true but no valid subscription', () => {
      useLocalStorageMock.mockReturnValue([true, vi.fn()]);
      useIsAdvancedMock.mockReturnValue(true);
      useLicenseInfoMock.mockReturnValue({ data: null });

      renderCosDetailPanelAt(`/create-new-cos`);

      expect(mocks.CreateCosLegacy).toHaveBeenCalled();
    });
  });
});
