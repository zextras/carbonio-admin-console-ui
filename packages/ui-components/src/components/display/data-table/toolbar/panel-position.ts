/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type RefObject, useEffect, useState } from 'react';

export type ToolbarPanelPosition = {
  top: number;
  left: number;
};

/** Anchor the Filters panel below-left of its trigger (viewport-fixed). */
export function getFiltersPanelPosition(trigger: HTMLElement): ToolbarPanelPosition {
  const rect = trigger.getBoundingClientRect();
  return {
    top: rect.bottom - 4,
    left: Math.max(8, rect.left),
  };
}

/** Anchor the Customize panel below-right of its trigger (viewport-fixed). */
export function getCustomizePanelPosition(trigger: HTMLElement): ToolbarPanelPosition {
  const rect = trigger.getBoundingClientRect();
  // Prefer `left` over CSS `right`: native <dialog> UA styles pin
  // inset-inline-start, which fights an inline `right` and parks the panel
  // at the viewport's left edge. Pair with `translateX(-100%)` on the panel
  // so the right edge meets the trigger without hard-coding panel width.
  return {
    top: rect.bottom - 4,
    left: Math.max(8, rect.right),
  };
}

type AnchoredPanelPositionApi = {
  /** Null while closed; otherwise the last captured fixed coords. */
  position: ToolbarPanelPosition | null;
  /**
   * Capture trigger coords before opening so the portal mounts in the same
   * render as `open` (row-actions pattern — avoids waiting on rAF).
   */
  capturePosition: () => void;
};

/**
 * Keeps a portal panel aligned to its trigger while open. Call
 * `capturePosition()` when opening so the first paint has coords.
 */
export function useAnchoredPanelPosition(
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  getPosition: (trigger: HTMLElement) => ToolbarPanelPosition,
): AnchoredPanelPositionApi {
  const [position, setPosition] = useState<ToolbarPanelPosition | null>(null);

  function capturePosition(): void {
    if (!triggerRef.current) {
      return;
    }
    setPosition(getPosition(triggerRef.current));
  }

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function updatePosition(): void {
      if (!triggerRef.current) {
        return;
      }
      setPosition(getPosition(triggerRef.current));
    }

    // Refresh after open in case layout shifted; listeners keep the portal aligned.
    const frameId = globalThis.requestAnimationFrame(updatePosition);
    globalThis.addEventListener('resize', updatePosition);
    document.addEventListener('scroll', updatePosition, true);
    return () => {
      globalThis.cancelAnimationFrame(frameId);
      globalThis.removeEventListener('resize', updatePosition);
      document.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, triggerRef, getPosition]);

  return {
    position: open ? position : null,
    capturePosition,
  };
}
