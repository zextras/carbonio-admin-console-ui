/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type Location, useLocation, useNavigate } from 'react-router';

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
 * On navigation it intercepts, reverts the navigation, and shows a modal offering
 * "Save and leave" (calls `onSave` then proceeds) or "Leave anyway" (discards).
 */
export const RouteLeavingGuard = ({ children, when, onSave }: RouteLeavingGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const lastLocationInitial = useRef(location).current;
  const [modalVisible, setModalVisible] = useState(false);
  const [lastLocation, setLastLocation] = useState<Location>(lastLocationInitial);
  const [confirmedNavigation, setConfirmedNavigation] = useState(false);
  const [t] = useTranslation();

  const onClose = (): void => {
    setModalVisible(false);
    setConfirmedNavigation(true);
  };

  const handleBlockedNavigation = (nextLocation: Location): boolean => {
    if (
      !confirmedNavigation &&
      nextLocation.pathname !== (lastLocation?.pathname || lastLocationInitial.pathname)
    ) {
      setModalVisible(true);
      setLastLocation(nextLocation);
      return false;
    }
    return true;
  };

  const onConfirm = (): void => {
    setModalVisible(false);
    onSave();
    setConfirmedNavigation(true);
  };

  useEffect(() => {
    if (when && !confirmedNavigation) {
      if (
        location.pathname !== lastLocationInitial.pathname &&
        location.pathname !== lastLocation?.pathname
      ) {
        const shouldBlock = handleBlockedNavigation(location);
        if (!shouldBlock) {
          navigate(lastLocation?.pathname || lastLocationInitial.pathname, { replace: true });
        }
      }
    }
  }, [location, when, confirmedNavigation, lastLocation, lastLocationInitial, navigate]);

  useEffect(() => {
    if (confirmedNavigation && lastLocation) {
      navigate(lastLocation.pathname);
    }
  }, [confirmedNavigation, lastLocation, navigate]);

  return (
    <Modal
      open={modalVisible}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('label.unsaved_changes', 'You have unsaved changes')}
      dismissLabel={t('label.leave_anyway', 'Leave anyway')}
      confirmLabel={t('label.save_and_leave', 'Save and leave')}
    >
      {children ?? <DefaultUnsavedChangesBody />}
    </Modal>
  );
};
