/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { HTMLAttributes, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { KeyboardPresetObj, useKeyboard } from '../../hooks/useKeyboard';
import { AnyColor } from '../../types/utils';
import { TIMERS } from '../constants';
import { Portal } from '../utilities/Portal';
import { Transition } from '../utilities/Transition';
import {
  getScrollbarSize,
  isBodyOverflowing,
  ModalContainer,
  ModalContent,
  ModalWrapper,
} from './modal-components/ModalComponents';

type BareModalProps = {
  /** Modal background */
  background?: AnyColor;
  /** Modal size */
  size?: 'extrasmall' | 'small' | 'medium' | 'large';
  /** Boolean to show the modal */
  open?: boolean;
  /** Css property to handle the stack order of multiple modals */
  zIndex?: number;
  /** min height of the modal */
  minHeight?: string;
  /** max height of the modal */
  maxHeight?: string;
  /** Flag to disable the Portal implementation */
  disablePortal?: boolean;
  /** Content of the modal */
  children?: React.ReactNode | React.ReactNode[];
  /** Callback to close the Modal */
  onClose?: (event: React.MouseEvent | KeyboardEvent) => void;
  ref?: React.Ref<HTMLDivElement>;
};

type CustomModalProps = BareModalProps &
  Omit<HTMLAttributes<HTMLDivElement>, keyof BareModalProps | 'title'>;

const CustomModal = ({
  size = 'small',
  open = false,
  onClose,
  children,
  disablePortal = false,
  zIndex = 999,
  onClick,
  ref,
  ...rest
}: CustomModalProps) => {
  const [delayedOpen, setDelayedOpen] = useState(false);

  const modalRef = useCombinedRefs<HTMLDivElement>(ref);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const startSentinelRef = useRef<HTMLDivElement>(null);
  const endSentinelRef = useRef<HTMLDivElement>(null);

  const onBackdropClick = useCallback(
    (e: KeyboardEvent | React.MouseEvent<HTMLDivElement>) => {
      if (e) {
        e.stopPropagation();
      }
      if (
        !e.defaultPrevented &&
        modalContentRef.current &&
        onClose &&
        e.target instanceof Node &&
        !modalContentRef.current.contains(e.target)
      ) {
        onClose(e);
      }
    },
    [onClose],
  );

  const onStartSentinelFocus = useCallback(() => {
    if (modalContentRef.current) {
      const nodeList = modalContentRef.current.querySelectorAll<HTMLElement>('[tabindex]');
      nodeList[nodeList.length - 1].focus();
    }
  }, []);

  const onEndSentinelFocus = useCallback(() => {
    if (modalContentRef.current) {
      const nodeEl = modalContentRef.current.querySelector<HTMLElement>('[tabindex]');
      nodeEl?.focus();
    }
  }, []);

  const escapeEvent = useMemo<KeyboardPresetObj[]>(
    () =>
      (onClose && [
        { type: 'keydown', callback: onClose, keys: [{ key: 'Escape', ctrlKey: false }] },
      ]) ||
      [],
    [onClose],
  );
  useKeyboard(modalRef, escapeEvent);

  useEffect(() => {
    if (open) {
      const defaultOverflowY = window.document.body.style.overflowY;
      const defaultPaddingRight = window.document.body.style.paddingRight;

      window.document.body.style.overflowY = 'hidden';
      isBodyOverflowing(modalRef, window) &&
        (window.document.body.style.paddingRight = `${getScrollbarSize(window)}px`);

      return (): void => {
        window.document.body.style.overflowY = defaultOverflowY;
        window.document.body.style.paddingRight = defaultPaddingRight;
      };
    }
    return (): void => undefined;
  }, [modalRef, open]);

  useEffect(() => {
    const focusedElement = window.document.activeElement as HTMLElement;
    const startSentinelRefSave = startSentinelRef.current;
    const endSentinelRefSave = endSentinelRef.current;

    if (open) {
      modalContentRef.current && modalContentRef.current.focus();
      startSentinelRefSave && startSentinelRefSave.addEventListener('focus', onStartSentinelFocus);
      endSentinelRefSave && endSentinelRefSave.addEventListener('focus', onEndSentinelFocus);
    }

    return (): void => {
      startSentinelRefSave &&
        startSentinelRefSave.removeEventListener('focus', onStartSentinelFocus);
      endSentinelRefSave && endSentinelRefSave.removeEventListener('focus', onEndSentinelFocus);
      open && focusedElement && focusedElement.focus();
    };
  }, [open, onStartSentinelFocus, onEndSentinelFocus]);

  useEffect(() => {
    // delay the open of the modal after the show of the portal
    // in order to make the transition visible
    const timeout = setTimeout(() => setDelayedOpen(open), TIMERS.MODAL.DELAY_OPEN);
    return (): void => {
      clearTimeout(timeout);
    };
  }, [open]);

  return (
    <Portal show={open} disablePortal={disablePortal} container={window.document.body}>
      <ModalContainer
        $open={delayedOpen}
        $mounted={open}
        onClick={onBackdropClick}
        $zIndex={zIndex}
        data-testid="modal"
        {...rest}
      >
        <div tabIndex={0} ref={startSentinelRef} />
        <Transition type="scale-in" apply={delayedOpen}>
          <ModalWrapper>
            <ModalContent $size={size} onClick={onClick}>
              {children}
            </ModalContent>
          </ModalWrapper>
        </Transition>
        <div tabIndex={0} ref={endSentinelRef} />
      </ModalContainer>
    </Portal>
  );
};

export type { CustomModalProps };
export { CustomModal };
