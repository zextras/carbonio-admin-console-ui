/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import type { BadgeInfo } from '@zextras/ui-shared';
import React from 'react';

type BadgeWrapProps = {
  readonly badge: BadgeInfo;
  readonly isExpanded: boolean;
  readonly children?: React.ReactNode;
  readonly ref?: React.Ref<HTMLDivElement>;
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

export function BadgeWrap({ badge, children, isExpanded, ref }: BadgeWrapProps) {
  return (
    <Container
      width={48}
      height={48}
      style={{ position: 'relative', width: isExpanded ? '25%' : '100%' }}
      ref={ref}
    >
      {badge.show && (
        <Container height="fit" width="fit" style={getBadgeStyle(badge.color)}>
          {badge.showCount ? (
            <ds-text
              as="span"
              size="extrasmall"
              color="gray6"
              style={{ padding: '2px 4px', fontSize: '10px' }}
            >
              {badge.count ?? 0}
            </ds-text>
          ) : null}
        </Container>
      )}
      {children}
    </Container>
  );
}
