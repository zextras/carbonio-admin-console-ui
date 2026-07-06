/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBreakpoint, usePrimaryBarState } from '@zextras/ui-shared';
import { Route, Routes } from 'react-router';

import { CREATE_NEW_COS_ROUTE_ID } from '../constants';
import { Breadcrumb } from './breadcrumb/breadcrumb';
import { CosDetailPanel } from './cos/cos-detail-panel';
import { CosList } from './cos/cos-list/cos-list';
import { CosListPanel } from './cos/cos-list-panel';
import { CreateNewCos } from './cos/create-new-cos-new';

const baseStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxSizing: 'border-box',
} as const;

const detailPanelStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  overflowY: 'hidden',
  width: '100%',
  background: 'var(--color-gray6-regular)',
} as const;

function getMaxWidth(breakpoint: string, isSidebarOpen = false, sidePanelVisible: boolean): string {
  if (breakpoint === '2xl') return sidePanelVisible ? 'calc( 1400px - 265px)' : '1400px';
  if (breakpoint === 'xl') return sidePanelVisible ? 'calc( 1125px - 265px)' : '1125px';
  if (breakpoint === 'lg' && !isSidebarOpen)
    return sidePanelVisible ? 'calc( 1125px - 265px)' : '1125px';
  return sidePanelVisible ? 'calc( 981px - 265px)' : '981px';
}

function getContainerStyle(
  breakpoint: string,
  isSidebarOpen = false,
  cosListPanelVisible: boolean,
) {
  return {
    width: '100%',
    maxWidth: getMaxWidth(breakpoint, isSidebarOpen, cosListPanelVisible),
    transition: 'max-width 300ms',
    padding: '0 clamp(0.5rem, 2vw, 2rem)',
    boxSizing: 'border-box' as const,
  };
}

export const AppView = () => {
  const isPrimaryBarExpanded = usePrimaryBarState();
  const breakpoint = useBreakpoint();

  return (
    <div style={{ ...baseStyle, height: 'fit-content', width: '100%' }}>
      <Breadcrumb />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          height: 'calc(100vh - 105px)',
          width: '100%',
        }}
      >
        <Routes>
          <Route
            index
            element={
              <>
                <div style={{ maxWidth: '265px' }}>
                  <CosListPanel />
                </div>
                <div style={detailPanelStyle}>
                  <div style={getContainerStyle(breakpoint, isPrimaryBarExpanded, true)}>
                    <div
                      style={{ display: 'flex', flex: 1, minWidth: 0, justifyContent: 'center' }}
                    >
                      <CosList />
                    </div>
                  </div>
                </div>
              </>
            }
          />
          <Route
            path={'/:cosId/:operation'}
            element={
              <>
                <div style={{ maxWidth: '265px' }}>
                  <CosListPanel />
                </div>
                <div style={getContainerStyle(breakpoint, isPrimaryBarExpanded, true)}>
                  <CosDetailPanel />
                </div>
              </>
            }
          />
          <Route
            path={`/${CREATE_NEW_COS_ROUTE_ID}`}
            element={
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '0 2rem',
                }}
              >
                <div style={getContainerStyle(breakpoint, isPrimaryBarExpanded, false)}>
                  <CreateNewCos />
                </div>
              </div>
            }
          />
          <Route
            path={'/cos_list'}
            element={
              <>
                <div style={{ maxWidth: '265px' }}>
                  <CosListPanel />
                </div>
                <div style={detailPanelStyle}>
                  <div style={getContainerStyle(breakpoint, isPrimaryBarExpanded, true)}>
                    <div
                      style={{ display: 'flex', flex: 1, minWidth: 0, justifyContent: 'center' }}
                    >
                      <CosList />
                    </div>
                  </div>
                </div>
              </>
            }
          />
        </Routes>
      </div>
    </div>
  );
};
