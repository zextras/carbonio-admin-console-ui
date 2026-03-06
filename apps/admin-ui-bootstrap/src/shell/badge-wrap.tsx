/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Text } from '@zextras/ui-components';
import type { BadgeInfo } from '@zextras/ui-shared';
import React from 'react';

type BadgeWrapProps = {
  badge: BadgeInfo;
  isExpanded: boolean;
  children?: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
};

function getBadgeStyle(badgeColor: string | undefined): React.CSSProperties {
  return {
    position: 'absolute',
    bottom: '25%',
    right: '25%',
    transform: 'translate(30%, 30%)',
    background: `var(--color-${badgeColor ?? 'primary'}-regular)`,
    minWidth: '12px',
    minHeight: '12px',
    lineHeight: '12px',
    borderRadius: '8px',
    userSelect: 'none',
    cursor: 'pointer',
    pointerEvents: 'none',
  };
}

const BadgeWrap = ({ badge, children, isExpanded, ref }: BadgeWrapProps) => (
  <Container
    width={48}
    height={48}
    style={{ position: 'relative', width: isExpanded ? '25%' : '100%' }}
    ref={ref}
  >
    {badge.show && (
      <Container height="fit" width="fit" style={getBadgeStyle(badge.color)}>
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
