/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';

import { Row, PaddingObj } from '@zextras/carbonio-design-system';

const ListRow: FC<{
	children?: any;
	wrap?: any;
	orientation?:
		| 'horizontal'
		| 'vertical'
		| 'row'
		| 'column'
		| 'row-reverse'
		| 'column-reverse'
		| undefined;
	crossAlignment?:
		| 'flex-start'
		| 'stretch'
		| 'center'
		| 'baseline'
		| 'flex-end'
		| 'unset'
		| undefined;
	padding?: string | 0 | PaddingObj | undefined;
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
