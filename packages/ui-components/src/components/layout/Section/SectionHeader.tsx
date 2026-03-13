/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Row, Text } from '@zextras/ui-components';
import React, { type FC } from 'react';

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
				<Text  weight="bold">
					{title}
				</Text>
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
		{divider && <divider-wc></divider-wc>}
	</>
);
