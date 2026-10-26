/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type IconName } from '../../../web-components/icon-registry';
import { Button } from '../../basic/button/Button';
import styles from './DashboardBanner.module.css';

export type DashboardBannerAction = {
  label: string;
  onClick: () => void;
};

export type DashboardBannerProps = {
  /** First paragraph: the short statement of the condition. */
  description: string;
  /** Optional second paragraph with further details or instructions. */
  detail?: string;
  /** Banner background: `error` for blocking conditions, `warning` (default) otherwise. */
  background?: 'warning' | 'error';
  /** ds-icon name shown on the left. */
  icon?: IconName;
  /** When provided, a ghost close button is rendered and calls this handler. */
  onClose?: () => void;
  /** Accessible name for the close button. */
  closeLabel?: string;
  /** Outlined action button rendered at the bottom right. */
  action?: DashboardBannerAction;
};

export const DashboardBanner = ({
  description,
  detail,
  background = 'warning',
  icon = 'AlertTriangleOutline',
  onClose,
  closeLabel = 'Close',
  action,
}: DashboardBannerProps) => (
  <div className={action ? styles.outer : styles.outerNoAction}>
    <div className={`${styles.banner} ${background === 'error' ? styles.error : styles.warning}`}>
      <div className={styles.contentRow}>
        <div className={styles.iconWrap}>
          <ds-icon icon={icon} color="text" size="large" />
        </div>
        <div className={styles.texts}>
          <ds-text as="p" color="text" overflow="break-word" style={{ whiteSpace: 'pre-line' }}>
            {description}
          </ds-text>
          {detail && (
            <ds-text as="p" color="text" overflow="break-word" style={{ whiteSpace: 'pre-line' }}>
              {detail}
            </ds-text>
          )}
        </div>
        {onClose && (
          <div>
            <Button
              type="ghost"
              aria-label={closeLabel}
              icon="CloseOutline"
              color="text"
              onClick={onClose}
            />
          </div>
        )}
      </div>
      {action && (
        <Button
          type="outlined"
          backgroundColor="transparent"
          color="text"
          label={action.label}
          onClick={action.onClick}
        />
      )}
    </div>
  </div>
);
