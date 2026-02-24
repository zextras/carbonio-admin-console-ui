/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo } from 'react';

import { getColor } from '../../theme/theme-utils';
import styles from './link.module.css';
import { TextProps } from './text/Text';

type LinkProps = {
  /** Whether link should be underlined */
  underlined?: boolean;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'color' | 'size' | 'weight'> &
  Pick<TextProps, 'color' | 'size' | 'weight'>;

const Link = ({ children, underlined = false, color = 'primary', style, ...rest }: LinkProps) => {
  const hoverColor = useMemo(() => getColor(`${color}.hover`, undefined as any), [color]);

  const linkStyle = {
    ...style,
    '--link-hover-color': hoverColor,
  } as any;

  return (
    <a
      className={styles.styledLink}
      tabIndex={0}
      data-underlined={underlined ? 'true' : undefined}
      style={linkStyle}
      {...rest}
    >
      {children}
    </a>
  );
};

export type { LinkProps };
export { Link };
