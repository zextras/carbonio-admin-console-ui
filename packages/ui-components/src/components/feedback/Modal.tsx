/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../web-components/divider-wc';

import { noop } from 'lodash-es';
import React, { HTMLAttributes, useCallback, useRef } from 'react';

import { CustomModal, CustomModalProps } from './CustomModal';
import { ModalBody } from './modal-components/ModalBody';
import { ModalFooter, ModalFooterProps } from './modal-components/ModalFooter';
import { ModalHeader } from './modal-components/ModalHeader';

function copyToClipboard(node: HTMLDivElement | null, window: Window): void {
  const el = window.document.createElement('textarea');
  if (el && node?.textContent) {
    el.value = node.textContent;
    window.document.body.appendChild(el);
    el.select();
    window.document.execCommand('copy');
    window.document.body.removeChild(el);
  }
}

type ModalProps = CustomModalProps &
  Omit<ModalFooterProps, 'errorActionLabel' | 'onErrorAction'> & {
    /** Modal title */
    title?: string | React.ReactElement;
    /** Hide the footer completely */
    hideFooter?: boolean;
    /** Show icon to close Modal */
    showCloseIcon?: boolean;
    /** Label for copy button in the Error Modal */
    copyLabel?: ModalFooterProps['errorActionLabel'];
    /** Close icon tooltip label */
    closeIconTooltip?: string;
    ref?: React.Ref<HTMLDivElement>;
  } & Omit<HTMLAttributes<HTMLDivElement>, 'title'>;

const Modal = ({
  type = 'default',
  title: Title,
  centered = false,
  onConfirm,
  confirmLabel = 'OK',
  confirmDisabled,
  confirmTooltip,
  confirmColor = 'primary',
  onSecondaryAction,
  secondaryActionLabel,
  secondaryActionDisabled,
  secondaryActionTooltip,
  onClose = noop,
  dismissLabel,
  optionalFooter,
  customFooter,
  copyLabel = 'Copy',
  hideFooter = false,
  showCloseIcon = true,
  children,
  closeIconTooltip,
  ref,
  ...rest
}: ModalProps) => {
  const modalBodyRef = useRef<HTMLDivElement | null>(null);

  const onCopyClipboard = useCallback(() => copyToClipboard(modalBodyRef.current, window), []);

  return (
    <CustomModal onClose={onClose} ref={ref} {...rest}>
      <ModalHeader
        centered={centered}
        type={type}
        title={Title}
        showCloseIcon={showCloseIcon}
        onClose={onClose}
        closeIconTooltip={closeIconTooltip}
      />
      <divider-wc></divider-wc>
      <ModalBody centered={centered} ref={modalBodyRef}>
        {children}
      </ModalBody>
      {!hideFooter && (
        <>
          <divider-wc></divider-wc>
          <ModalFooter
            centered={centered}
            customFooter={customFooter}
            type={type}
            optionalFooter={optionalFooter}
            confirmLabel={confirmLabel}
            confirmDisabled={confirmDisabled}
            confirmColor={confirmColor}
            dismissLabel={dismissLabel}
            onConfirm={onConfirm}
            onClose={onClose}
            onSecondaryAction={onSecondaryAction}
            secondaryActionLabel={secondaryActionLabel}
            secondaryActionDisabled={secondaryActionDisabled}
            onErrorAction={onCopyClipboard}
            errorActionLabel={copyLabel}
            secondaryActionTooltip={secondaryActionTooltip}
            confirmTooltip={confirmTooltip}
          />
        </>
      )}
    </CustomModal>
  );
};

export type { ModalProps };
export { Modal };
