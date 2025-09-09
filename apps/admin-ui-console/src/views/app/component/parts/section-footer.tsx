/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Divider, Row } from '@zextras/carbonio-design-system';
import { ReactNode } from 'react';

export const SectionFooter = ({
	divider,
	footer
}: {
	divider: boolean;
	footer: ReactNode;
}): React.JSX.Element => (
	<Row width="100%">
		<Row takeAvailableSpace>
			{divider && <Divider />}
			<Container height="fit" padding={{ all: 'large' }}>
				{footer}
			</Container>
		</Row>
	</Row>
);
