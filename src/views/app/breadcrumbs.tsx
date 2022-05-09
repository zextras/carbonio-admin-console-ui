/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/*
 * SPDX-FileCopyrightText: 2021 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC } from 'react';
import { Container, Text, Row } from '@zextras/carbonio-design-system';

const Breadcrumbs: FC<{ folderPath: any }> = ({ folderPath }) => (
	<Container mainAlignment="flex-start" crossAlignment="center" orientation="horizontal">
		<Row
			height="100%"
			width="fill"
			padding={{ all: 'small' }}
			mainAlignment="space-between"
			takeAvailableSpace
		>
			<Row
				mainAlignment="flex-start"
				takeAvailableSpace
				padding={{ all: 'small', right: 'medium' }}
			>
				<Text size="medium" data-testid="BreadcrumbPath">
					{folderPath?.split('/')?.join('/ ')}
				</Text>
			</Row>
		</Row>
	</Container>
);
export default Breadcrumbs;
