/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSnackbar } from '@zextras/ui-components';
import { useActivateLicense, useLicenseInfo, useRemoveLicense } from '@zextras/ui-shared';
import { format } from 'date-fns';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DATE_FORMAT } from '../../constants';
import { ActivationError } from '../activation/activation-error';
import { ActivationProgress } from '../activation/activation-progress';
import { ChangeTokenModal } from '../modals/change-token-modal';
import { DeactivateTokenModal } from '../modals/deactivate-token-modal';
import styles from './sections.module.css';

export type ActivationTokenMenuOption = 'change-token' | 'renew-token' | 'deactivate-license';

type ActivationTokenSectionProps = {
  onMenuOptionSelect?: (option: ActivationTokenMenuOption) => void;
};

function formatDateValue(value?: number): string {
  if (!value) {
    return '-';
  }
  return format(value, DATE_FORMAT);
}

function maskToken(token?: string): string {
  if (!token) {
    return '-';
  }

  if (token.length <= 8) {
    return token;
  }

  const prefix = token.slice(0, 4);
  const suffix = token.slice(-5);
  return `${prefix}${'*'.repeat(Math.max(1, token.length - 9))}${suffix}`;
}

export const ActivationTokenSection = ({ onMenuOptionSelect }: ActivationTokenSectionProps) => {
  const { t } = useTranslation();
  const { data: licenseData } = useLicenseInfo();
  const activateLicenseMutation = useActivateLicense();
  const removeLicenseMutation = useRemoveLicense();
  const menuWrapperRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [changeTokenModalOpen, setChangeTokenModalOpen] = useState(false);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [showActivationResult, setShowActivationResult] = useState(false);
  const createSnackbar = useSnackbar();
  const response = licenseData?.response;
  const displayedToken = useMemo(() => {
    if (!response?.authenticationToken) {
      return '-';
    }

    return showToken ? response.authenticationToken : maskToken(response.authenticationToken);
  }, [response?.authenticationToken, showToken]);

  const toggleOpen = useCallback((): void => {
    setOpen((prevOpen) => {
      const nextOpen = !prevOpen;

      if (!nextOpen) {
        setShowToken(false);
        setMenuOpen(false);
      }

      return nextOpen;
    });
  }, []);

  const handleToggleToken = useCallback((): void => {
    setShowToken((prev) => !prev);
  }, []);

  const handleMenuOption = useCallback(
    (option: ActivationTokenMenuOption): void => {
      setMenuOpen(false);

      if (option === 'change-token') {
        if (onMenuOptionSelect) {
          onMenuOptionSelect(option);
        } else {
          setChangeTokenModalOpen(true);
        }
      } else if (option === 'deactivate-license') {
        if (onMenuOptionSelect) {
          onMenuOptionSelect(option);
        } else {
          setDeactivateModalOpen(true);
        }
      } else {
        onMenuOptionSelect?.(option);
        createSnackbar({
						key: 'info-snackbar',
						severity: 'info',
						label: 'Subscription renewal feature is in progress.',
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
      }
    },
    [onMenuOptionSelect, createSnackbar],
  );

  const handleDeactivateConfirm = useCallback((): void => {
    removeLicenseMutation.mutate(undefined);
    setDeactivateModalOpen(false);
  }, [removeLicenseMutation]);

  const handleChangeTokenConfirm = useCallback(
    (token: string): void => {
      setChangeTokenModalOpen(false);
      setShowActivationResult(false);
      activateLicenseMutation.mutate({ token, renewal: false });
    },
    [activateLicenseMutation],
  );

  const handleActivationProgressComplete = useCallback((): void => {
    setShowActivationResult(true);
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent): void {
      if (menuWrapperRef.current?.contains(event.target as Node)) {
        return;
      }
      setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className={`${styles.sectionWrapper} ${styles.detailsSection}`}>
      <div className={styles.activationHeaderRow}>
        <button
          type="button"
          className={styles.detailsToggle}
          onClick={toggleOpen}
        >
          <ds-icon icon={open ? 'ChevronUp' : 'ChevronDown'} size="1rem" />
          <ds-text weight="bold" color="gray0">
            {t('core.subscription.activationToken', 'Activation token')}
          </ds-text>
        </button>

        {open && (
          <div ref={menuWrapperRef} className={styles.activationMenuWrapper}>
            <button
              type="button"
              className={styles.menuTriggerButton}
              aria-label={t('label.moreOptions', 'More options')}
              onClick={(): void => setMenuOpen((prev) => !prev)}
            >
              <ds-icon icon="MoreVertical" size="1.5rem" />
            </button>
            {menuOpen && (
              <div className={styles.activationMenuList}>
                <button
                  type="button"
                  className={styles.activationMenuItem}
                  onClick={(): void => handleMenuOption('renew-token')}
                >
                  <ds-icon icon="Sync" size="large" />
                  <span>{t('core.subscription.renewSubscription', 'Renew subscription')}</span>
                </button>
                <button
                  type="button"
                  className={styles.activationMenuItem}
                  onClick={(): void => handleMenuOption('change-token')}
                >
                  <ds-icon icon="AwardOutline" size="large" />
                  <span>{t('core.subscription.changeToken', 'Change token')}</span>
                </button>
                <ds-divider></ds-divider>
                <button
                  type="button"
                  className={`${styles.activationMenuItem} ${styles.activationMenuDangerItem}`}
                  onClick={(): void => handleMenuOption('deactivate-license')}
                >
                  <ds-icon icon="DeletePermanentlyOutline" size="large" color="error" />
                  <span>{t('core.subscription.deactivateSubscription', 'Deactivate subscription')}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {open && (
        <div className={styles.activationDetailsGrid}>
          <div className={styles.detailItem}>
            <ds-text size="small" className={styles.detailLabel}>
              {t('core.subscription.token', 'Token')}
            </ds-text>
            <div className={styles.detailValueRow}>
              <ds-text className={styles.detailValue}>{displayedToken}</ds-text>
              {response?.authenticationToken && (
                <button
                  type="button"
                  className={styles.showTokenButton}
                  onClick={handleToggleToken}
                >
                  {showToken
                    ? t('core.subscription.hideToken', 'Hide token')
                    : t('core.subscription.showToken', 'Show token')}
                </button>
              )}
            </div>
          </div>

          <div className={styles.detailItem}>
            <ds-text size="small" className={styles.detailLabel}>
              {t('core.subscription.startDate', 'Start date')}
            </ds-text>
            <div className={styles.detailValueRow}>
              <ds-text className={styles.detailValue}>{formatDateValue(response?.dateStart)}</ds-text>
            </div>
          </div>

          {response?.type !== 'ISP' && (
            <>
              <div className={styles.detailItem}>
                <ds-text size="small" className={styles.detailLabel}>
                  {t('core.subscription.lastValidationCheck', 'Last validation check')}
                </ds-text>
                <div className={styles.detailValueRow}>
                  <ds-text className={styles.detailValue}>
                    {formatDateValue(response?.lastValidationCheck)}
                  </ds-text>
                </div>
              </div>

              <div className={styles.detailItem}>
                <ds-text size="small" className={styles.detailLabel}>
                  {t('core.subscription.nextValidationCheck', 'Next validation check')}
                </ds-text>
                <div className={styles.detailValueRow}>
                  <ds-text className={styles.detailValue}>
                    {formatDateValue(response?.nextValidationDeadline)}
                  </ds-text>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      <DeactivateTokenModal
        open={deactivateModalOpen}
        onClose={(): void => setDeactivateModalOpen(false)}
        onConfirm={handleDeactivateConfirm}
      />
      <ChangeTokenModal
        open={changeTokenModalOpen}
        onClose={(): void => setChangeTokenModalOpen(false)}
        onConfirm={handleChangeTokenConfirm}
      />
      <ActivationProgress
        isPending={activateLicenseMutation.isPending}
        onComplete={handleActivationProgressComplete}
      />
      <ActivationError isError={showActivationResult && activateLicenseMutation.isError} />
    </div>
  );
};
