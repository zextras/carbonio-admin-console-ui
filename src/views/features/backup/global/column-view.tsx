/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';
import { Row } from '@zextras/carbonio-design-system';

export const ColumnFull = ({
	children,
	mainAlignment,
	takeAvailableSpace
}: {
	children: any;
	mainAlignment: string;
	takeAvailableSpace: any;
}): ReactElement => (
	<Row width="100%" height="100%" mainAlignment={mainAlignment} takeAvailableSpace>
		{children}
	</Row>
);
export const ColumnLeft = ({
	width,
	children,
	padding
}: {
	width: string;
	children: any;
	padding: any;
}): ReactElement => (
	<Row width={width} height="100%" padding={padding}>
		{children}
	</Row>
);

// export function ColumnRight({ width = '40%', children, ...rest }) {
// 	return (
// 		<ShellRightWrapper width={width} height="100%" {...rest}>
// 			{children}
// 		</ShellRightWrapper>
// 	);
// }

export const ShellBody = ({ children }: { children: any }): ReactElement => (
	<Row width="100%" height="100%" mainAlignment="space-between" crossAlignment="flex-start">
		{children}
	</Row>
);
