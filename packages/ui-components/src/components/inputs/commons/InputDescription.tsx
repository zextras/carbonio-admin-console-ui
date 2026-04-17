/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { TextProps } from '../../../web-components';

type InputDescriptionProps = Omit<TextProps, 'overflow' | 'size' | 'textAlign'>;

export const InputDescription = ({ ...props }: InputDescriptionProps): React.JSX.Element => (
  <ds-text
    as="p"
    overflow="break-word"
    size="extrasmall"
    style={
      {
        lineHeight: '1.5',
        paddingTop: '0.25rem',
        minHeight: 'calc(var(--font-size-extrasmall) * 1.5)',
      } as React.CSSProperties
    }
    {...props}
  />
);
