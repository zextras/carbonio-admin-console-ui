/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type PaddingObj, Row } from '@zextras/ui-components';
import type { FC } from 'react';

type ListRowProps = {
	children?: React.ReactNode;
	wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
	orientation?: 'horizontal' | 'vertical' | 'row' | 'column' | 'row-reverse' | 'column-reverse';
	crossAlignment?: 'flex-start' | 'stretch' | 'center' | 'baseline' | 'flex-end' | 'unset';
	padding?: string | 0 | PaddingObj;
};

const ListRow: FC<ListRowProps> = ({
	children,
	wrap,
	orientation = 'horizontal',
	crossAlignment = 'flex-start',
	padding = 'unset',
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

export { ListRow, type ListRowProps };
