/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, PaddingObj } from '@zextras/carbonio-design-system';
import React from 'react';

import { SectionFooter } from './parts/section-footer';
import { SectionHeader } from './parts/section-header';

type SectionProps = {
	children: React.ReactNode;
	title: string;
	divider: boolean;
	footer?: React.ReactNode;
	padding?: PaddingObj | string | 0;
	showClose?: boolean;
	onClose: (e: React.MouseEvent<HTMLButtonElement> | KeyboardEvent) => void;
};

export const Section = ({
	children,
	title,
	divider,
	footer,
	padding = { all: 'large' },
	showClose,
	onClose
}: SectionProps): React.JSX.Element => (
	<Container background="gray6">
		<SectionHeader title={title} divider={divider} showClose={showClose} onClose={onClose} />
		<Container mainAlignment="flex-start" padding={padding} style={{ overflowY: 'auto' }}>
			{children}
		</Container>

		{footer && <SectionFooter divider={divider} footer={footer} />}
	</Container>
);
