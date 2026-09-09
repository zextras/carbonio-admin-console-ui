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
  /**
   * Manual-mode total row count (`rowCount ?? data.length`), published by
   * `DataTableRoot` on every prop change. Parts must read the count from
   * here, NOT from `table.options` via context: the React Compiler memoizes
   * the AppTable element (and prop-less children), so the context table's
   * options wrapper is a mount-time snapshot for the parts — the store
   * subscription is the propagation channel that stays live. `undefined`
   * means client-side mode: parts count the filtered row model instead.
   */
  resolvedRowCount: number | undefined;
  /**
   * A document-level modal (e.g. the bulk confirm dialog) is open. Other
   * parts with document-level keydown handlers (peek navigation, row
   * action menus) must bail out while this is true so Escape and arrows
   * do not act behind the modal.
   */
  modalOpen: boolean;
  /**
   * A row action menu is open (portal). Parts with document-level key
   * handlers that sit BELOW the menu layer (peek navigation) must bail
   * out while true so a single Escape closes only the topmost layer:
   * modal > row menu > peek.
   */
  rowMenuOpen: boolean;
  setDensity: (density: DataTableDensity) => void;
  setPeekRowId: (rowId: string | null) => void;
  setEditing: (editing: DataTableEditingTarget) => void;
  setSelectAllMatching: (value: boolean) => void;
  setOpenPanel: (panel: DataTableOpenPanel) => void;
  setUndoToast: (toast: DataTableUndoToastState) => void;
  announce: (message: string) => void;
  setScrollEdge: (edge: DataTableScrollEdge) => void;
  setResolvedRowCount: (count: number | undefined) => void;
  setModalOpen: (value: boolean) => void;
  setRowMenuOpen: (value: boolean) => void;
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
    resolvedRowCount: undefined,
    modalOpen: false,
    rowMenuOpen: false,
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
    setResolvedRowCount: (resolvedRowCount) => {
      set({ resolvedRowCount });
    },
    setModalOpen: (modalOpen) => {
      set({ modalOpen });
    },
    setRowMenuOpen: (rowMenuOpen) => {
      set({ rowMenuOpen });
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
    throw new Error('useTableUi/useTableUiStore must be used within TableUiProvider');
  }
  return store;
}

/**
 * Subscribe to a slice of the table UI store. Selectors must return stable
 * references (primitives or whole state slices); constructing a new object
 * per call (e.g. `(s) => ({ a: s.x, b: s.y })`) will re-render on every store
 * update.
 */
export function useTableUi<T>(selector: (state: DataTableUiState) => T): T {
  return useStore(useTableUiStore(), selector);
}
