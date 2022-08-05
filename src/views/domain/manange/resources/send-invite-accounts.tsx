/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import {
	Container,
	Input,
	Row,
	Text,
	Icon,
	Table,
	Button,
	Padding
} from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';
import ListRow from '../../../list/list-row';
import logo from '../../../../assets/gardian.svg';
import { isValidEmail } from '../../../utility/utils';

export const SendInviteAccounts: FC<any> = ({
	isEditable,
	sendInviteList,
	setSendInviteList,
	hideSearchBar,
	hideHeaderBar
}) => {
	const [t] = useTranslation();
	const [newSentInviteValue, setNewSentInviteValue] = useState<string>('');
	const [selectedSendInvite, setSelectedSendInvite] = useState<any>([]);
	const [sendInviteAddBtnDisabled, setSendInviteAddBtnDisabled] = useState(true);
	const [sendInviteDeleteBtnDisabled, setSendInviteDeleteBtnDisabled] = useState(true);
	const [searchAccountName, setSearchAccountName]: any = useState('');
	const [sendInviteRows, setSendInviteRows] = useState<any[]>([]);
	const [defaultSendInviteList, setDefaultSendInviteList] = useState<any[]>([]);
	const [isAssignDefaultList, setIsAssignDefaultList] = useState<boolean>(true);

	useEffect(() => {
		if (sendInviteList && sendInviteList.length > 0 && isAssignDefaultList) {
			setDefaultSendInviteList(sendInviteList);
			setIsAssignDefaultList(false);
		}
	}, [sendInviteList, isAssignDefaultList]);

	const sendInviteHeaders: any[] = useMemo(
		() => [
			{
				id: 'account',
				label: t('label.accounts', 'Accounts'),
				width: '100%',
				bold: true
			}
		],
		[t]
	);

	useEffect(() => {
		const sList: any[] = [];
		sendInviteList.forEach((item: any, index: number) => {
			sList.push({
				id: index?.toString(),
				columns: [
					<Text size="medium" weight="light" key={index} color="gray0">
						{item?._content}
					</Text>
				],
				item,
				label: item?._content,
				clickable: true
			});
		});
		setSendInviteRows(sList);
	}, [sendInviteList]);

	useEffect(() => {
		const filterList = defaultSendInviteList.filter((item: any) =>
			item?._content?.includes(searchAccountName)
		);
		setSendInviteList(filterList);
	}, [setSendInviteList, searchAccountName, defaultSendInviteList]);

	const addSendInviteAccount = useCallback((): void => {
		if (newSentInviteValue) {
			const lastId = sendInviteList.length > 0 ? sendInviteList[sendInviteList.length - 1].id : 0;
			const newId = +lastId + 1;
			const item = {
				id: newId.toString(),
				n: 'zimbraPrefCalendarForwardInvitesTo',
				_content: newSentInviteValue
			};
			setSendInviteList([...sendInviteList, item]);
			setDefaultSendInviteList([...sendInviteList, item]);
			setSendInviteAddBtnDisabled(true);
			setNewSentInviteValue('');
		}
	}, [newSentInviteValue, sendInviteList, setDefaultSendInviteList, setSendInviteList]);

	const deleteSendInviteAccount = useCallback((): void => {
		if (selectedSendInvite && selectedSendInvite.length > 0) {
			const filterItems = sendInviteList.filter(
				(item: any, index: any) => !selectedSendInvite.includes(index.toString())
			);
			setSendInviteList(filterItems);
			setDefaultSendInviteList(filterItems);
			setSendInviteDeleteBtnDisabled(true);
			setSelectedSendInvite([]);
		}
	}, [selectedSendInvite, sendInviteList, setDefaultSendInviteList, setSendInviteList]);

	return (
		<>
			{!hideHeaderBar && (
				<Row padding={{ top: 'extralarge' }}>
					<Text
						size="small"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						weight="bold"
					>
						{t('label.send_invite_to', 'Send Invite To')}
					</Text>
				</Row>
			)}
			{isEditable && (
				<ListRow>
					<Row
						takeAvwidth="fill"
						mainAlignment="flex-start"
						width="100%"
						wrap="nowrap"
						padding={{ top: 'large' }}
					>
						<Input
							label={t('label.enter_email_address', 'Enter E-mail address')}
							background="gray5"
							value={newSentInviteValue}
							onChange={(e: any): any => {
								setNewSentInviteValue(e.target.value);
								if (isValidEmail(e.target.value)) {
									setSendInviteAddBtnDisabled(false);
								} else {
									setSendInviteAddBtnDisabled(true);
								}
							}}
						/>

						<Padding left="large">
							<Button
								type="outlined"
								label={t('label.add', 'Add')}
								icon="Plus"
								color="primary"
								height="44px"
								disabled={sendInviteAddBtnDisabled}
								onClick={addSendInviteAccount}
							/>
						</Padding>
						<Padding left="large">
							<Button
								type="outlined"
								label={t('label.delete', 'Delete')}
								icon="Close"
								color="error"
								height="44px"
								disabled={sendInviteDeleteBtnDisabled}
								onClick={deleteSendInviteAccount}
							/>
						</Padding>
					</Row>
				</ListRow>
			)}
			{!hideSearchBar && (
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row width="100%">
							<Input
								label={t('label.search_an_account', 'Search an account')}
								backgroundColor="gray5"
								value={searchAccountName}
								size="medium"
								CustomIcon={(): any => <Icon icon="FunnelOutline" size="large" color="secondary" />}
								onChange={(e: any): any => {
									setSearchAccountName(e.target.value);
								}}
							/>
						</Row>
					</Container>
				</ListRow>
			)}
			<ListRow>
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					orientation="horizontal"
					padding={{ top: 'large' }}
				>
					<Table
						rows={sendInviteRows}
						headers={sendInviteHeaders}
						showCheckbox={!!isEditable}
						style={{ overflow: 'auto', height: '100%' }}
						selectedRows={selectedSendInvite}
						onSelectionChange={(selected: any): any => {
							setSelectedSendInvite(selected);
							if (selected && selected.length > 0) {
								setSendInviteDeleteBtnDisabled(false);
							} else {
								setSendInviteDeleteBtnDisabled(true);
							}
						}}
					/>
				</Container>
			</ListRow>
			{sendInviteRows?.length === 0 && (
				<ListRow>
					<Container
						orientation="column"
						crossAlignment="center"
						mainAlignment="center"
						padding={{ top: 'extralarge' }}
					>
						<Row>
							<img src={logo} alt="logo" />
						</Row>
						<Row
							padding={{ top: 'extralarge' }}
							orientation="vertical"
							crossAlignment="center"
							style={{ textAlign: 'center' }}
						>
							<Text weight="light" color="#828282" size="large" overflow="break-word">
								{t('label.this_list_is_empty', 'This list is empty.')}
							</Text>
						</Row>
						<Row
							orientation="vertical"
							crossAlignment="center"
							style={{ textAlign: 'center' }}
							padding={{ top: 'small' }}
							width="53%"
						>
							<Text weight="light" color="#828282" size="large" overflow="break-word">
								<Trans
									i18nKey="label.do_you_need_more_information"
									defaults="Do you need more information?"
								/>
							</Text>
						</Row>
						<Row
							orientation="vertical"
							crossAlignment="center"
							style={{ textAlign: 'center' }}
							padding={{ top: 'small' }}
							width="53%"
						>
							<Text weight="light" color="primary">
								{t('label.click_here', 'Click here')}
							</Text>
						</Row>
					</Container>
				</ListRow>
			)}
		</>
	);
};
