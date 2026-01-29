/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Text } from '@zextras/ui-components';
import React from 'react';

import { BadgeInfo } from '../../types';
import styles from './badge-wrap.module.css';

type BadgeWrapProps = {
  badge: BadgeInfo;
  isExpanded: boolean;
  children?: React.ReactNode;
  ref?: React.Ref<Element>;
};

const BadgeWrap = ({ badge, children, isExpanded, ref }: BadgeWrapProps) => (
  <Container
    width={48}
    height={48}
    style={{ position: 'relative', width: isExpanded ? '25%' : '100%' }}
    ref={ref}
  >
    {badge.show && (
      <Container
        className={styles.miniBadge}
        height="fit"
        width="fit"
        style={{
          background: `var(--color-${badge?.color ?? 'primary'}-regular)`,
        }}
      >
        {badge.showCount ? (
          <Text size="extrasmall" style={{ padding: '2px 4px', fontSize: '10px' }} color="gray6">
            {badge.count ?? 0}
          </Text>
        ) : null}
      </Container>
    )}
    {children}
  </Container>
);

BadgeWrap.displayName = 'BadgeWrap';
export default BadgeWrap;
