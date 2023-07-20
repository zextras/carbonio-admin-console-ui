/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';
import { Row } from '@zextras/carbonio-design-system';

const ListRow: FC<{
	children?: any;
	wrap?: any;
	orientation?: string;
	crossAlignment?: string;
	padding?: string | object | number;
}> = ({
	children,
	wrap,
	orientation = 'horizontal',
	crossAlignment = 'flex-start',
	padding = 'unset'
}) => (
	<Row
		orientation={orientation}
		mainAlignment="space-between"
		crossAlignment={crossAlignment}
		width="fill"
		wrap={wrap || 'nowrap'}
		padding={padding}
	>
		{children}
	</Row>
);

export default ListRow;
