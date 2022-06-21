/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC } from 'react';
import { Row } from '@zextras/carbonio-design-system';

export const ColumnFull: FC<{ width: string }> = ({ width, children }) => (
	<Row width={width} height="100%">
		{children}
	</Row>
);

export const ColumnLeft: FC<{ width: string; mainAlignment: string; crossAlignment: string }> = ({
	width,
	children,
	mainAlignment,
	crossAlignment
}) => (
	<Row
		width={width}
		height="100%"
		mainAlignment={mainAlignment}
		crossAlignment={crossAlignment}
		padding="0px "
	>
		{children}
	</Row>
);

export const ColumnRight: FC<{ width: string }> = ({ width, children }) => (
	<Row width={width} height="100%">
		{children}
	</Row>
);

export const Shell: FC<{ width: string }> = ({ children }) => (
	<Row width="100%" height="100%" crossAlignment="flex-start" wrap="nowrap">
		{children}
	</Row>
);
