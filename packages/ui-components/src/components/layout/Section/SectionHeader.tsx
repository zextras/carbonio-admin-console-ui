/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { type FC } from 'react';

import { Button } from '../../basic/button/Button';
import { Row } from '../Row';

type SectionHeaderProps = {
	title: string;
	divider?: boolean;
	onClose: (e: React.MouseEvent<HTMLButtonElement> | KeyboardEvent) => void;
	showClose?: boolean;
};

export const SectionHeader: FC<SectionHeaderProps> = ({
	title,
	divider,
	onClose,
	showClose,
}) => (
	<>
		<Row mainAlignment="flex-start" crossAlignment="center" width="100%" height="auto">
			<Row mainAlignment="flex-start" padding={{ all: 'large' }} takeAvailableSpace>
				<ds-text as="h2" weight="bold">
					{title}
				</ds-text>
			</Row>
			{showClose && (
				<Row padding={{ horizontal: 'small' }}>
					<Button
						type="ghost"
						color="text"
						data-testid="close-button"
						icon="CloseOutline"
						onClick={onClose}
						size="large"
					/>
				</Row>
			)}
		</Row>
		{divider && <ds-divider></ds-divider>}
	</>
);
