/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render } from '@testing-library/react';
import { type Mock, vi } from 'vitest';

vi.mock('@zextras/ui-components', () => ({
  PrimaryBarTooltip: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="primary-bar-tooltip">{children}</div>
  ),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string, fallback?: string) => fallback || key, { i18n: {} }],
  Trans: ({ defaults }: { defaults: string }) => <>{defaults}</>,
}));

vi.mock('react-router', () => ({
  useNavigate: vi.fn(),
}));

vi.mock('../views/app-view', () => ({
  AppView: () => <div data-testid="app-view" />,
}));

import { addRoute, registerActions, removeRoute, useCurrentUserRights } from '@zextras/ui-shared';
import { useNavigate } from 'react-router';

import App from '../app';
import {
  APP_ID,
  COS_ROUTE_ID,
  CREATE_NEW_COS_ROUTE_ID,
  MANAGE,
  PRIMARY_BAR_COS,
} from '../constants';
import { CosTooltipView } from '../views/cos-tooltip-view';

const RIGHTS_WITH_COS_AND_CREATE = [
  {
    type: 'cos',
    all: [{ getAttrs: [{ all: true }] }],
  },
  {
    type: 'global',
    all: [{ getAttrs: [{ all: true }] }],
  },
];

const RIGHTS_WITH_COS_ONLY = [
  {
    type: 'cos',
    all: [{ getAttrs: [{ all: true }] }],
  },
  {
    type: 'global',
    all: [],
  },
];

const RIGHTS_WITHOUT_COS = [
  {
    type: 'account',
    all: [{ getAttrs: [{ all: true }] }],
  },
];

describe('App', () => {
  beforeEach(() => {
    (useCurrentUserRights as Mock).mockReturnValue({ data: RIGHTS_WITH_COS_AND_CREATE });
    (useNavigate as Mock).mockReturnValue(vi.fn());
  });

  it('should call addRoute with correct config when COS rights are present', () => {
    render(<App />);

    expect(addRoute).toHaveBeenCalledWith(
      expect.objectContaining({
        route: COS_ROUTE_ID,
        position: 2,
        visible: true,
        label: 'COS',
        primaryBar: 'SettingsModOutline',
        trackerLabel: PRIMARY_BAR_COS,
      }),
    );
  });

  it('should pass AppView and CosTooltipView to addRoute', () => {
    render(<App />);

    const callArgs = (addRoute as Mock).mock.calls[0][0];
    expect(callArgs.appView).toBeDefined();
    expect(callArgs.tooltip).toBe(CosTooltipView);
  });

  it('should pass management section to addRoute', () => {
    render(<App />);

    const callArgs = (addRoute as Mock).mock.calls[0][0];
    expect(callArgs.primarybarSection).toEqual({
      id: 'manage',
      label: 'Management',
      position: 3,
    });
  });

  it('should call removeRoute when COS rights are absent', () => {
    (useCurrentUserRights as Mock).mockReturnValue({ data: RIGHTS_WITHOUT_COS });

    render(<App />);

    expect(removeRoute).toHaveBeenCalledWith(COS_ROUTE_ID);
    expect(addRoute).not.toHaveBeenCalled();
  });

  it('should call removeRoute when rights data is undefined', () => {
    (useCurrentUserRights as Mock).mockReturnValue({ data: undefined });

    render(<App />);

    expect(removeRoute).toHaveBeenCalledWith(COS_ROUTE_ID);
    expect(addRoute).not.toHaveBeenCalled();
  });

  it('should register action with id new-cos and type new', () => {
    render(<App />);

    expect(registerActions).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'new-cos',
        type: 'new',
      }),
    );
  });

  it('should disable create COS action when createCosRight is false', () => {
    (useCurrentUserRights as Mock).mockReturnValue({ data: RIGHTS_WITH_COS_ONLY });

    render(<App />);

    const registeredCall = (registerActions as Mock).mock.calls[0][0];
    const action = registeredCall.action();
    expect(action.disabled).toBe(true);
  });

  it('should enable create COS action when createCosRight is true', () => {
    render(<App />);

    const registeredCall = (registerActions as Mock).mock.calls[0][0];
    const action = registeredCall.action();
    expect(action.disabled).toBe(false);
  });

  it('should navigate to create COS route on action onClick', () => {
    const mockNavigate = vi.fn();
    (useNavigate as Mock).mockReturnValue(mockNavigate);

    render(<App />);

    const registeredCall = (registerActions as Mock).mock.calls[0][0];
    const action = registeredCall.action();
    action.onClick();

    expect(mockNavigate).toHaveBeenCalledWith(
      `/${MANAGE}/${COS_ROUTE_ID}/${CREATE_NEW_COS_ROUTE_ID}`,
    );
  });

  it('should register action with correct group, label, icon, and primary', () => {
    render(<App />);

    const registeredCall = (registerActions as Mock).mock.calls[0][0];
    const action = registeredCall.action();
    expect(action.group).toBe(APP_ID);
    expect(action.id).toBe('new-cos');
    expect(action.label).toBe('Create New COS');
    expect(action.icon).toBe('');
    expect(action.primary).toBe(false);
  });

  it('should render null', () => {
    const { container } = render(<App />);
    expect(container.innerHTML).toBe('');
  });
});
