/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { flip, limitShift, offset, Placement, shift } from '@floating-ui/dom';
import clsx from 'clsx';
import React, {
  HTMLAttributes,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';

import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { KeyboardPresetObj, useKeyboard } from '../../hooks/useKeyboard';
import { setupFloating } from '../../utils/floating-ui';
import { Portal } from '../utilities/Portal';
import styles from './Popper.module.css';

type PopperProps = HTMLAttributes<HTMLDivElement> & {
  /** Whether the popper is open or not */
  open?: boolean;
  /** Ref to the DOM element triggering the popper */
  anchorEl: React.RefObject<HTMLElement | null>;
  /** Optional parameter to anchor the popper to a virtual element, defined by his x, y coordinates (ex. \{x: 2, y: 2\}) */
  placement?: Placement;
  /** Callback for closed Popper */
  onClose: () => void;
  /** Popper content */
  children: React.ReactNode | React.ReactNode[];
  ref?: React.Ref<HTMLDivElement>;
};

const Popper = ({
  open = false,
  anchorEl,
  placement = 'bottom-end',
  onClose,
  children,
  ref,
}: PopperProps) => {
  const popperRef = useCombinedRefs<HTMLDivElement>(ref);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const startSentinelRef = useRef<HTMLDivElement>(null);
  const endSentinelRef = useRef<HTMLDivElement>(null);

  const closePopper = useCallback(
    (e: Event) => {
      if (!popperRef.current?.contains(e.target as Node)) {
        onClose?.();
      }
    },
    [onClose, popperRef],
  );

  const keyboardClosePopper = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const onStartSentinelFocus = useCallback(() => {
    const nodeList =
      wrapperRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ) ?? [];
    nodeList.length > 0 && nodeList[nodeList.length - 1].focus();
  }, []);

  const onEndSentinelFocus = useCallback(() => {
    const node = wrapperRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    node?.focus();
  }, []);

  const escapeEvent = useMemo<KeyboardPresetObj[]>(
    () => [
      { type: 'keydown', callback: keyboardClosePopper, keys: [{ key: 'Escape', ctrlKey: false }] },
    ],
    [keyboardClosePopper],
  );

  useKeyboard(popperRef, escapeEvent);

  useLayoutEffect(() => {
    let cleanup: ReturnType<typeof setupFloating>;
    if (open) {
      const anchorElement = anchorEl.current;
      if (anchorElement) {
        if (popperRef.current) {
          cleanup = setupFloating(anchorElement, popperRef.current, {
            placement,
            middleware: [
              offset(8),
              flip({ fallbackPlacements: ['bottom'] }),
              shift({ limiter: limitShift() }),
            ],
          });
        }
      }
    }
    return (): void => {
      cleanup?.();
    };
  }, [open, placement, anchorEl, popperRef]);

  useEffect(() => {
    let listenerTimeout: ReturnType<typeof setTimeout>;
    if (open) {
      listenerTimeout = setTimeout(() => {
        window.document.addEventListener('click', closePopper);
      }, 1);
    }
    return (): void => {
      window.document.removeEventListener('click', closePopper);
      listenerTimeout && clearTimeout(listenerTimeout);
    };
  }, [open, closePopper]);

  useEffect(() => {
    const startSentinelRefSave = startSentinelRef.current;
    const endSentinelRefSave = endSentinelRef.current;
    if (open) {
      wrapperRef.current?.focus();
      startSentinelRefSave?.addEventListener('focus', onStartSentinelFocus);
      endSentinelRefSave?.addEventListener('focus', onEndSentinelFocus);
    }

    return (): void => {
      startSentinelRefSave?.removeEventListener('focus', onStartSentinelFocus);
      endSentinelRefSave?.removeEventListener('focus', onEndSentinelFocus);
    };
  }, [open, startSentinelRef, endSentinelRef, onStartSentinelFocus, onEndSentinelFocus]);

  const popperContainerClassName = clsx(styles.popperContainer, open && styles.open);

  return (
    <Portal show={open} disablePortal={false}>
      <div ref={popperRef} className={popperContainerClassName} data-testid="popper">
        <div tabIndex={0} ref={startSentinelRef} />
        <div ref={wrapperRef} tabIndex={-1} className={styles.popperWrapper}>
          {children}
        </div>
        <div tabIndex={0} ref={endSentinelRef} />
      </div>
    </Portal>
  );
};

export type { PopperProps };
export { Popper };
