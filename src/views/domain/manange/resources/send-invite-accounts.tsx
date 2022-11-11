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
	Padding,
	Dropdown
} from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';
import { debounce } from 'lodash';
import ListRow from '../../../list/list-row';
import logo from '../../../../assets/gardian.svg';
import { isValidEmail } from '../../../utility/utils';
import { searchDirectory } from '../../../../services/search-directory-service';
import { RECORD_DISPLAY_LIMIT } from '../../../../constants';

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
	const [searchMemberResult, setSearchMemberResult] = useState<Array<any>>([]);

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

	const getSearchMemberList = useCallback((mem) => {
		const attrs =
			'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus';
		const types = 'accounts,distributionlists,aliases';
		const query = `(&(!(zimbraAccountStatus=closed))(|(mail=*${mem}*)(cn=*${mem}*)(sn=*${mem}*)(gn=*${mem}*)(displayName=*${mem}*)(zimbraMailDeliveryAddress=*${mem}*)(zimbraMailAlias=*${mem}*)(uid=*${mem}*)(zimbraDomainName=*${mem}*)(uid=*${mem}*)))`;

		searchDirectory(attrs, types, '', query, 0, RECORD_DISPLAY_LIMIT, 'name').then((data) => {
			const result: any[] = [];
			const dl = data?.dl;
			const account = data?.account;
			const alias = data?.alias;
			if (dl) {
				dl.map((item: any) => result.push(item));
			}
			if (account) {
				account.map((item: any) => result.push(item));
			}
			if (alias) {
				alias.map((item: any) => result.push(item));
			}
			setSearchMemberResult(result);
		});
	}, []);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchMemberCall = useCallback(
		debounce((mem) => {
			getSearchMemberList(mem);
		}, 700),
		[debounce]
	);

	useEffect(() => {
		if (newSentInviteValue !== '') {
			searchMemberCall(newSentInviteValue);
		}
	}, [newSentInviteValue, searchMemberCall]);

	const searchMemberItems = searchMemberResult.map((item: any, index) => ({
		id: item.id,
		label: item.name,
		customComponent: (
			<Row
				top="9px"
				right="large"
				bottom="9px"
				left="large"
				style={{
					fontFamily: 'roboto',
					display: 'block',
					textAlign: 'left',
					height: 'inherit',
					padding: '3px',
					width: 'inherit'
				}}
				onClick={(): void => {
					setNewSentInviteValue(item?.name);
					if (isValidEmail(item?.name)) {
						setSendInviteAddBtnDisabled(false);
					} else {
						setSendInviteAddBtnDisabled(true);
					}
				}}
			>
				{item?.name}
			</Row>
		)
	}));

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
						<Dropdown
							items={searchMemberItems}
							placement="bottom-start"
							maxWidth="300px"
							disableAutoFocus
							width="300px"
							style={{
								width: '100%'
							}}
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
						</Dropdown>

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
								label={t('label.search_an_account', 'Search for an account')}
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
