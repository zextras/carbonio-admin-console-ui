/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render } from '@testing-library/react';
import { type Mock, vi } from 'vitest';

vi.mock('react-router', () => ({
  useParams: vi.fn(),
}));

vi.mock('../cos-general-information', () => ({
  CosGeneralInformation: vi.fn(),
}));

vi.mock('../cos-features', () => ({
  CosFeatures: vi.fn(),
}));

vi.mock('../advanced/cos-advanced', () => ({
  CosAdvanced: vi.fn(),
}));

vi.mock('../cos-server-pools', () => ({
  CosServerPools: vi.fn(),
}));

vi.mock('../preferences/COSPreferences', () => ({
  COSPreferences: vi.fn(),
}));

vi.mock('../../../wsc/wsc-cos-settings', () => ({
  WscCosSettings: vi.fn(),
}));

import { useParams } from 'react-router';

import { WscCosSettings } from '../../../wsc/wsc-cos-settings';
import { CosAdvanced } from '../advanced/cos-advanced';
import { CosDetailOperation } from '../cos-detail-operation';
import { CosFeatures } from '../cos-features';
import { CosGeneralInformation } from '../cos-general-information';
import { CosServerPools } from '../cos-server-pools';
import { COSPreferences } from '../preferences/COSPreferences';

const mocks = {
  CosGeneralInformation: CosGeneralInformation as unknown as Mock,
  CosFeatures: CosFeatures as unknown as Mock,
  CosAdvanced: CosAdvanced as unknown as Mock,
  CosServerPools: CosServerPools as unknown as Mock,
  COSPreferences: COSPreferences as unknown as Mock,
  WscCosSettings: WscCosSettings as unknown as Mock,
};

function setOperation(operation: string | undefined): void {
  (useParams as unknown as Mock).mockReturnValue({ operation });
}

beforeEach(() => {
  for (const m of Object.values(mocks)) {
    m.mockImplementation(() => null);
  }
});

describe('CosDetailOperation', () => {
  describe('Routing', () => {
    it('should invoke CosGeneralInformation for the general_information operation', () => {
      setOperation('general_information');
      render(<CosDetailOperation />);
      expect(mocks.CosGeneralInformation).toHaveBeenCalled();
    });

    it('should invoke CosFeatures for the features operation', () => {
      setOperation('features');
      render(<CosDetailOperation />);
      expect(mocks.CosFeatures).toHaveBeenCalled();
    });

    it('should invoke WscCosSettings for the wsc operation', () => {
      setOperation('wsc');
      render(<CosDetailOperation />);
      expect(mocks.WscCosSettings).toHaveBeenCalled();
    });

    it('should invoke COSPreferences for the preferences operation', () => {
      setOperation('preferences');
      render(<CosDetailOperation />);
      expect(mocks.COSPreferences).toHaveBeenCalled();
    });

    it('should invoke CosAdvanced for the advanced operation', () => {
      setOperation('advanced');
      render(<CosDetailOperation />);
      expect(mocks.CosAdvanced).toHaveBeenCalled();
    });

    it('should invoke CosServerPools for the server_pools operation', () => {
      setOperation('server_pools');
      render(<CosDetailOperation />);
      expect(mocks.CosServerPools).toHaveBeenCalled();
    });
  });

  describe('Isolation', () => {
    it('should invoke only CosAdvanced when the operation is advanced', () => {
      setOperation('advanced');
      render(<CosDetailOperation />);
      expect(mocks.CosAdvanced).toHaveBeenCalled();
      expect(mocks.CosFeatures).not.toHaveBeenCalled();
      expect(mocks.CosGeneralInformation).not.toHaveBeenCalled();
      expect(mocks.COSPreferences).not.toHaveBeenCalled();
      expect(mocks.CosServerPools).not.toHaveBeenCalled();
      expect(mocks.WscCosSettings).not.toHaveBeenCalled();
    });

    it('should invoke only CosFeatures when the operation is features', () => {
      setOperation('features');
      render(<CosDetailOperation />);
      expect(mocks.CosFeatures).toHaveBeenCalled();
      expect(mocks.CosAdvanced).not.toHaveBeenCalled();
      expect(mocks.CosGeneralInformation).not.toHaveBeenCalled();
    });
  });

  describe('Default case', () => {
    it('should not invoke any component for an unknown operation', () => {
      setOperation('unknown_operation');
      const { container } = render(<CosDetailOperation />);
      expect(container.innerHTML).toBe('');
      for (const m of Object.values(mocks)) {
        expect(m).not.toHaveBeenCalled();
      }
    });

    it('should not invoke any component when operation is undefined', () => {
      setOperation(undefined);
      const { container } = render(<CosDetailOperation />);
      expect(container.innerHTML).toBe('');
      for (const m of Object.values(mocks)) {
        expect(m).not.toHaveBeenCalled();
      }
    });

    it('should be case-sensitive and not invoke CosAdvanced for an uppercased operation', () => {
      setOperation('ADVANCED');
      const { container } = render(<CosDetailOperation />);
      expect(container.innerHTML).toBe('');
      expect(mocks.CosAdvanced).not.toHaveBeenCalled();
    });

    it('should not invoke any component for an empty-string operation', () => {
      setOperation('');
      const { container } = render(<CosDetailOperation />);
      expect(container.innerHTML).toBe('');
      for (const m of Object.values(mocks)) {
        expect(m).not.toHaveBeenCalled();
      }
    });
  });
});
