/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Text, TextProps } from '../../basic/text/Text';
import styles from './InputDescription.module.css';

type InputDescriptionProps = Omit<TextProps, 'overflow' | 'size'>;

export const InputDescription = ({ ...props }: InputDescriptionProps): React.JSX.Element => (
  <Text overflow="break-word" size="extrasmall" className={styles.inputDescription} {...props} />
);
