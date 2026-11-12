/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useBlocker } from 'react-router';

import { Modal } from '../feedback/Modal';

type RouteLeavingGuardProps = {
  /** When true, navigation away is blocked until the user confirms. */
  when?: boolean;
  /** Called when the user chooses "Save and leave". */
  onSave: () => void;
  /**
   * Optional custom modal body. When omitted, the standard "unsaved changes"
   * copy is rendered.
   */
  children?: ReactNode;
};

/**
 * Standard body copy shown when no custom children are provided.
 */
function DefaultUnsavedChangesBody() {
  const [t] = useTranslation();
  return (
    <>
      <ds-text as="p">
        {t(
          'label.unsaved_changes_line1',
          'Are you sure you want to leave this page without saving?',
        )}
      </ds-text>
      <ds-text as="p">{t('label.unsaved_changes_line2', 'All your unsaved changes will be lost')}</ds-text>
    </>
  );
}

/**
 * Guards against leaving the current route when there are unsaved changes.
 *
 * On navigation it intercepts, and shows a modal offering "Save and leave"
 * (calls `onSave` then proceeds) or "Leave anyway" (discards).
 */
export const RouteLeavingGuard = ({ children, when, onSave }: RouteLeavingGuardProps) => {
  const [t] = useTranslation();
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      when === true && currentLocation.pathname !== nextLocation.pathname,
  );

  const onLeave = (): void => {
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }
  };

  const onSaveAndLeave = (): void => {
    onSave();
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }
  };

  return (
    <Modal
      open={blocker.state === 'blocked'}
      onClose={onLeave}
      onConfirm={onSaveAndLeave}
      title={t('label.unsaved_changes', 'You have unsaved changes')}
      dismissLabel={t('label.leave_anyway', 'Leave anyway')}
      confirmLabel={t('label.save_and_leave', 'Save and leave')}
    >
      {children ?? <DefaultUnsavedChangesBody />}
    </Modal>
  );
};
