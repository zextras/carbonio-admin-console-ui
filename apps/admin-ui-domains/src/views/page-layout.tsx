/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Padding } from '@zextras/ui-components';
import type { FC, ReactNode } from 'react';

export const SettingLayout: FC<{
	description: string;
	children: ReactNode;
	descriptionGap?: boolean;
}> = ({ description, children, descriptionGap }) => (
	<Container crossAlignment="flex-start">
		{children}
		{descriptionGap && <Padding top="small" />}
		<Container height="fit" crossAlignment="flex-start">
		<ds-text as="p" weight="light" color="gray1" size="small" overflow="break-word">
			{description}
		</ds-text>
		</Container>
	</Container>
);
