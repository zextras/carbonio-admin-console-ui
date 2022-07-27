/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Container, Row, Text, Input, Button, Table } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import ListRow from '../../../list/list-row';
import { isValidEmail } from '../../../utility/utils';
import { MailingListContext } from './mailinglist-context';

const MailingListMembersSection: FC<any> = () => {
	const { t } = useTranslation();
	const context = useContext(MailingListContext);
	const { mailingListDetail, setMailingListDetail } = context;
	const [dlm, setDlm] = useState<Array<any>>(mailingListDetail?.members);
	const [dlmTableRows, setDlmTableRows] = useState<Array<any>>([]);
	const [selectedDistributionListMember, setSelectedDistributionListMember] = useState<Array<any>>(
		[]
	);
	const [member, setMember] = useState<string>('');

	const memberHeaders: any[] = useMemo(
		() => [
			{
				id: 'members',
				label: t('label.accounts', 'Accounts'),
				width: '100%',
				bold: true
			}
		],
		[t]
	);

	useEffect(() => {
		if (dlm && dlm.length > 0) {
			setMailingListDetail((prev: any) => ({
				...prev,
				members: dlm
			}));
			const allRows = dlm.map((item: any) => ({
				id: item,
				columns: [
					<Text size="medium" weight="bold" key={item} color="#828282">
						{item}
					</Text>,
					''
				]
			}));
			setDlmTableRows(allRows);
		} else {
			setDlmTableRows([]);
			setMailingListDetail((prev: any) => ({
				...prev,
				members: dlm
			}));
		}
	}, [dlm, setMailingListDetail]);

	const onAdd = useCallback((): void => {
		if (member !== '' && isValidEmail(member)) {
			setDlm((prev: any) => [...prev, member]);
			setMember('');
		}
	}, [member]);

	const onDeleteFromList = useCallback((): void => {
		if (selectedDistributionListMember.length > 0) {
			const _dlm = dlm.filter((item: any) => !selectedDistributionListMember.includes(item));
			setDlm(_dlm);
			setSelectedDistributionListMember([]);
		}
	}, [dlm, selectedDistributionListMember]);

	return (
		<Container mainAlignment="flex-start">
			<Container
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 300px)"
				background="white"
				style={{ overflow: 'auto', padding: '16px' }}
			>
				<Row>
					<Text
						size="small"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						weight="bold"
					>
						{t('label.members', 'Members')}
					</Text>
				</Row>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large', right: 'small' }}
						width="65%"
					>
						<Input
							label={t('label.type_an_account_dot', 'Type an account ...')}
							backgroundColor="gray5"
							size="medium"
							value={member}
							onChange={(e: any): void => {
								setMember(e.target.value);
							}}
						/>
					</Container>
					<Container
						mainAlignment="flex-start"
						crossAlignment="center"
						orientation="horizontal"
						width="fit"
						padding={{ top: 'large', right: 'small' }}
					>
						<Button
							type="outlined"
							label={t('label.add', 'Add')}
							color="primary"
							icon="PlusOutline"
							iconPlacement="right"
							height={44}
							onClick={onAdd}
						/>
					</Container>
					<Container
						mainAlignment="flex-start"
						crossAlignment="center"
						orientation="horizontal"
						padding={{ top: 'large', right: 'small' }}
						width="fit"
					>
						<Button
							type="outlined"
							label={t('label.delete', 'Delete')}
							color="error"
							icon="PlusOutline"
							iconPlacement="right"
							height={44}
							onClick={onDeleteFromList}
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Container padding={{ top: 'large' }}>
						<Table
							rows={dlmTableRows}
							headers={memberHeaders}
							showCheckbox={false}
							selectedRows={selectedDistributionListMember}
							onSelectionChange={(selected: any): void =>
								setSelectedDistributionListMember(selected)
							}
						/>
					</Container>
				</ListRow>
			</Container>
		</Container>
	);
};

export default MailingListMembersSection;
