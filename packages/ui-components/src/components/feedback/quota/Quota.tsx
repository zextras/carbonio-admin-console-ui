/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { AnyColor } from '../../../types/utils';
import { Container, ContainerProps } from '../../layout/Container';

type QuotaProps = ContainerProps & {
  /** Quota percentage */
  fill: number;
  /** Quota fill background color */
  fillBackground?: AnyColor;
};

const Quota = (
  { background = 'gray6', fill, fillBackground = 'info', height = '0.5rem', ...rest }: QuotaProps,
  ref?: React.Ref<HTMLDivElement>,
) => {
  return (
    <Container
      minWidth="4rem"
      ref={ref}
      background={background}
      crossAlignment="flex-start"
      height={height}
      data-testid={'quota'}
      {...rest}
    >
      <Container background={fillBackground} width={`${fill > 100 ? 100 : fill}%`} height="100%" />
    </Container>
  );
};

export { Quota };
