/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, DropDownInput, Padding, Row } from '@zextras/ui-components';
import { type ChangeEvent, type FC } from 'react';
import { useTranslation } from 'react-i18next';

type AddMemberRowProps = {
	items: Array<any>;
	inputValue: string;
	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
	hasError: boolean;
	errorMessage: string | null;
	onAdd: () => void;
};

export const AddMemberRow: FC<AddMemberRowProps> = ({
	items,
	inputValue,
	onChange,
	hasError,
	errorMessage,
	onAdd
}) => {
	const [t] = useTranslation();

	return (
		<Container orientation="vertical" mainAlignment="flex-start" background="gray6">
			<Row
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				width="100%"
				padding={{ top: 'large' }}
			>
				<DropDownInput
					width="100%"
					items={items}
					inputLabel={t(
						'label.type_accounts_paste_them_here',
						'Type the Accounts or paste them here'
					)}
					onChange={onChange}
					inputValue={inputValue}
					isCustomIcon={false}
					hasError={hasError}
				/>
			</Row>
			{hasError && (
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					width="100%"
					padding={{ top: 'small' }}
				>
					<Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
						<Padding right={'0'}>
							<ds-text as="span" size="extrasmall" weight="regular" color="error">
								{errorMessage}
							</ds-text>
						</Padding>
					</Container>
				</Row>
			)}
			<Row
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				width="100%"
				padding={{ top: 'large', bottom: 'large' }}
			>
				<Button
					icon="Plus"
					key="add-members-button"
					label={t('domain.distributionList.members.addMembers', 'Add Members')}
					color="primary"
					iconPlacement="left"
					onClick={onAdd}
					size="medium"
				/>
			</Row>
		</Container>
	);
};
