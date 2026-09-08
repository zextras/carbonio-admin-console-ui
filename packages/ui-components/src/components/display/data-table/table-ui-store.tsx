/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createContext, type ReactNode, useContext, useState } from 'react';
import { createStore, useStore } from 'zustand';

export type DataTableDensity = 'comfortable' | 'compact';
export type DataTableOpenPanel = 'filters' | 'customize' | null;
export type DataTableEditingTarget = { rowId: string; columnId: string } | null;
export type DataTableUndoToastState = {
  id: number;
  message: string;
  onUndo: () => void;
} | null;

export type DataTableScrollEdge = { start: boolean; end: boolean };

export type DataTableUiState = {
  density: DataTableDensity;
  peekRowId: string | null;
  editing: DataTableEditingTarget;
  selectAllMatching: boolean;
  openPanel: DataTableOpenPanel;
  undoToast: DataTableUndoToastState;
  liveMessage: string;
  scrollEdge: DataTableScrollEdge;
  setDensity: (density: DataTableDensity) => void;
  setPeekRowId: (rowId: string | null) => void;
  setEditing: (editing: DataTableEditingTarget) => void;
  setSelectAllMatching: (value: boolean) => void;
  setOpenPanel: (panel: DataTableOpenPanel) => void;
  setUndoToast: (toast: DataTableUndoToastState) => void;
  announce: (message: string) => void;
  setScrollEdge: (edge: DataTableScrollEdge) => void;
};

export type DataTableUiStore = ReturnType<typeof createDataTableUiStore>;

export function createDataTableUiStore() {
  return createStore<DataTableUiState>()((set) => ({
    density: 'comfortable',
    peekRowId: null,
    editing: null,
    selectAllMatching: false,
    openPanel: null,
    undoToast: null,
    liveMessage: '',
    scrollEdge: { start: true, end: true },
    setDensity: (density) => {
      set({ density });
    },
    setPeekRowId: (peekRowId) => {
      set({ peekRowId });
    },
    setEditing: (editing) => {
      set({ editing });
    },
    setSelectAllMatching: (selectAllMatching) => {
      set({ selectAllMatching });
    },
    setOpenPanel: (openPanel) => {
      set({ openPanel });
    },
    setUndoToast: (undoToast) => {
      set({ undoToast });
    },
    announce: (liveMessage) => {
      set({ liveMessage });
    },
    setScrollEdge: (scrollEdge) => {
      set({ scrollEdge });
    },
  }));
}

const TableUiStoreContext = createContext<DataTableUiStore | null>(null);

export const TableUiProvider = ({ children }: { children: ReactNode }) => {
  const [store] = useState<DataTableUiStore>(() => createDataTableUiStore());
  return <TableUiStoreContext.Provider value={store}>{children}</TableUiStoreContext.Provider>;
};

export function useTableUiStore(): DataTableUiStore {
  const store = useContext(TableUiStoreContext);
  if (!store) {
    throw new Error('useTableUi must be used within DataTableRoot');
  }
  return store;
}

export function useTableUi<T>(selector: (state: DataTableUiState) => T): T {
  return useStore(useTableUiStore(), selector);
}
