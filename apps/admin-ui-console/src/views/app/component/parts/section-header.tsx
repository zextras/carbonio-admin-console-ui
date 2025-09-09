/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Divider, Text, Row, Button } from '@zextras/carbonio-design-system';

type SectionHeaderProps = {
	title: string;
	divider?: boolean;
	onClose: (e: React.MouseEvent<HTMLButtonElement> | KeyboardEvent) => void;
	showClose?: boolean;
};

export const SectionHeader = ({
	title,
	divider,
	onClose,
	showClose
}: SectionHeaderProps): React.JSX.Element => (
	<>
		<Row mainAlignment="flex-start" crossAlignment="center" width="100%" height="auto">
			<Row mainAlignment="flex-start" padding={{ all: 'large' }} takeAvailableSpace>
				<Text size="extralarge" weight="bold">
					{title}
				</Text>
			</Row>
			{showClose && (
				<Row padding={{ horizontal: 'small' }}>
					<Button
						type="ghost"
						color={'text'}
						data-testid="close-button"
						icon="CloseOutline"
						onClick={onClose}
						size="large"
					/>
				</Row>
			)}
		</Row>
		{divider && <Divider />}
	</>
);
