/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo } from 'react';

import { Container, type ContainerProps } from './Container';
import styles from './Row.module.css';

type RowProps = ContainerProps & {
  display?: string;
  order?: 'unset' | number;
  takeAvailableSpace?: boolean;
  ref?: React.Ref<HTMLDivElement>;
};

const Row = ({
  display = 'flex',
  orientation = 'horizontal',
  borderRadius = 'none',
  height = 'auto',
  width = 'auto',
  wrap = 'wrap',
  flexBasis = 'unset',
  flexGrow = 'unset',
  flexShrink = 1,
  order = 'unset',
  takeAvailableSpace = false,
  maxWidth = '100%',
  children,
  className,
  style,
  ref,
  ...rest
}: RowProps) => {
  const rowStyle = useMemo(
    () => ({
      '--row-display': display,
      '--row-order': order,
      ...style,
    }),
    [display, order, style],
  );

  const rowClassName = useMemo(() => {
    const classes = [styles.row];
    if (takeAvailableSpace) {
      classes.push(styles.takeAvailableSpace);
    }
    if (className) {
      classes.push(className);
    }
    return classes.join(' ');
  }, [takeAvailableSpace, className]);

  return (
    <Container
      ref={ref}
      orientation={orientation}
      borderRadius={borderRadius}
      height={height}
      width={width}
      wrap={wrap}
      flexBasis={takeAvailableSpace ? '0' : flexBasis}
      flexGrow={takeAvailableSpace ? '1' : flexGrow}
      flexShrink={flexShrink}
      maxWidth={maxWidth}
      className={rowClassName}
      style={rowStyle}
      {...rest}
    >
      {children}
    </Container>
  );
};

export { Row };
export type { RowProps };
