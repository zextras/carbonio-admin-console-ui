/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { IconName, ListRow } from '@zextras/ui-components';

import styles from './quick-access-item.module.css';

export type QuickAccessItemData = {
  upperText: string;
  operationText: string;
  bottomText: string;
  operationIcon: IconName;
  bottomIcon: IconName;
  bgColor: string;
  operation: string;
};

type QuickAccessItemProps = {
  item: QuickAccessItemData;
  onOpen: (operation: string) => void;
};

export const QuickAccessItem = ({ item, onOpen }: QuickAccessItemProps) => (
  <div className={styles.item}>
    <div className={styles.card} style={{ background: `var(--color-${item.bgColor})` }}>
      <ListRow crossAlignment="center">
        <div className={styles.cardHeader}>
          <ds-text as="span" color="gray6" overflow="break-word" weight="light" size="medium">
            {item.upperText}
          </ds-text>
          <div className={styles.operationText}>
            <ds-text as="strong" color="gray6" overflow="break-word" weight="bold" size="large">
              {item.operationText}
            </ds-text>
          </div>
        </div>
        <div className={styles.operationIcon}>
          <ds-icon color="gray6" icon={item.operationIcon} size="large" />
        </div>
      </ListRow>
      <ListRow>
        <div className={styles.divider}>
          <ds-divider />
        </div>
      </ListRow>
      <ListRow>
        <div
          className={styles.footer}
          role="button"
          tabIndex={0}
          onClick={() => onOpen(item.operation)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onOpen(item.operation);
            }
          }}
        >
          <ds-text as="span" color="gray6" overflow="break-word" weight="light" size="medium">
            {item.bottomText}
          </ds-text>
          <ds-icon color="gray6" icon={item.bottomIcon} size="medium" />
        </div>
      </ListRow>
    </div>
  </div>
);
