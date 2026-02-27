/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Row } from '@zextras/ui-components';
import { type FC, type ReactNode } from 'react';

type SectionFooterProps = {
	divider: boolean;
	footer: ReactNode;
};

export const SectionFooter: FC<SectionFooterProps> = ({ divider, footer }) => (
	<Row width="100%">
		<Row takeAvailableSpace>
			{divider && <divider-wc></divider-wc>}
			<Container height="fit" padding={{ all: 'large' }}>
				{footer}
			</Container>
		</Row>
	</Row>
);
