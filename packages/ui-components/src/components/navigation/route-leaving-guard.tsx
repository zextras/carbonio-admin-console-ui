/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type ReactNode, useContext, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type Location,
  UNSAFE_DataRouterContext,
  useBlocker,
  useLocation,
  useNavigate,
} from 'react-router';

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
      <ds-text as="p">
        {t('label.unsaved_changes_line2', 'All your unsaved changes will be lost')}
      </ds-text>
    </>
  );
}

/**
 * Guards against leaving the current route when there are unsaved changes.
 *
 * Uses react-router's blocker API under a data router (createMemoryRouter /
 * createBrowserRouter + RouterProvider) and falls back to a location-revert
 * implementation under the plain routers (BrowserRouter / MemoryRouter +
 * Routes) the production shell renders, where useBlocker would throw.
 */
export const RouteLeavingGuard = (props: RouteLeavingGuardProps) => {
  const dataRouterContext = useContext(UNSAFE_DataRouterContext);
  if (dataRouterContext) {
    return <RouteLeavingGuardDataRouter {...props} />;
  }
  return <RouteLeavingGuardBrowserRouter {...props} />;
};

/**
 * On navigation it intercepts, and shows a modal offering "Save and leave"
 * (calls `onSave` then proceeds) or "Leave anyway" (discards).
 */
function RouteLeavingGuardDataRouter({ children, when, onSave }: RouteLeavingGuardProps) {
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
}

/**
 * On navigation it intercepts, reverts the navigation, and shows a modal offering
 * "Save and leave" (calls `onSave` then proceeds) or "Leave anyway" (discards).
 */
function RouteLeavingGuardBrowserRouter({ children, when, onSave }: RouteLeavingGuardProps) {
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

  const onConfirm = (): void => {
    setModalVisible(false);
    onSave();
    setConfirmedNavigation(true);
  };

  useLayoutEffect(() => {
    function handleBlockedNavigation(nextLocation: Location): boolean {
      if (
        !confirmedNavigation &&
        nextLocation.pathname !== (lastLocation?.pathname || lastLocationInitial.pathname)
      ) {
        setModalVisible(true);
        setLastLocation(nextLocation);
        return false;
      }
      return true;
    }
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

  useLayoutEffect(() => {
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
}
