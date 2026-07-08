/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Modal } from '../feedback/Modal';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type Location, useLocation, useNavigate } from 'react-router';

type RouteLeavingGuardProps = {
  when?: boolean;
  onSave: () => void;
  children?: React.ReactNode;
};

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
    <>
      <Modal
        open={modalVisible}
        onClose={onClose}
        onConfirm={onConfirm}
        title={t('label.unsaved_changes', 'You have unsaved changes')}
        dismissLabel={t('label.leave_anyway', 'Leave anyway')}
        confirmLabel={t('label.save_and_leave', 'Save and leave')}
      >
        {children}
      </Modal>
    </>
  );
};
