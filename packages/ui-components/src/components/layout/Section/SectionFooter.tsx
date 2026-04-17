/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { type FC, type ReactNode } from 'react';

import { Container } from '../Container';
import { Row } from '../Row';

type SectionFooterProps = {
	divider: boolean;
	footer: ReactNode;
};

export const SectionFooter: FC<SectionFooterProps> = ({ divider, footer }) => (
	<Row width="100%">
		<Row takeAvailableSpace>
			{divider && <ds-divider></ds-divider>}
			<Container height="fit" padding={{ all: 'large' }}>
				{footer}
			</Container>
		</Row>
	</Row>
);
