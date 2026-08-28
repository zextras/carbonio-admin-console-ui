/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useStore } from '@tanstack/react-form';
import {
	Button,
	Container,
	CustomHeaderFactory,
	DropDownInput,
	HoverableRowFactory,
	Input,
	ListRow,
	Padding,
	Row,
	Table,
	useSnackbar
} from '@zextras/ui-components';
import { uniq } from 'lodash';
import { type ChangeEvent, type FC, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import helmetLogo from '../../../../../assets/helmet_logo.svg';
import { ALL, EMAIL, GRP, PUB } from '../../../../../constants';
import { useTableFilter } from '../../edit-mailing-detail/hooks/use-table-filter';
import { resolveNewMembers } from '../members-tab/filter-members';
import type { EditDistributionListFormApi } from '../types';
import { useGalEmailSearch } from '../use-gal-email-search';
import { buildGrantEmailRow } from './grant-email-row';
import { GrantTypeSelect } from './grant-type-select';

type SendToTabProps = {
	form: EditDistributionListFormApi;
	searchUserLabelValue: string;
};

export const SendToTab: FC<SendToTabProps> = ({ form, searchUserLabelValue }) => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();

	const grantTypeValue = useStore(form.store, (state) => state.values.grantTypeValue);
	const grantEmails = useStore(form.store, (state) => state.values.grantEmails);
	const grantEmailsList: Array<string> = grantEmails.map((item: any) =>
		typeof item === 'string' ? item : (item?.name ?? '')
	);

	const grantTypeOptions: Array<any> = [
		{
			label: t('label.everyone', 'Everyone'),
			value: PUB
		},
		{
			label: t('label.members_only', 'Members only'),
			value: GRP
		},
		{
			label: t('label.internal_users_only', 'Internal Users only'),
			value: ALL
		},
		{
			label: t('label.only_there_users', 'Only these users'),
			value: EMAIL
		}
	];
	const grantType: any =
		grantTypeOptions.find((item: any) => item.value === grantTypeValue) ?? grantTypeOptions[0];

	const [isShowSenderToError, setIsShowSenderToError] = useState(false);
	const [grantEmailTableRows, setGrantEmailTableRows] = useState<Array<any>>([]);
	const [selectedGrantEmail, setSelectedGrantEmail] = useState<Array<any>>([]);
	const [senderToErrorMessage, setSenderToErrorMessage] = useState<string>('');

	const {
		filterValue: filterGrantEmail,
		filteredRows: filteredGrantEmailRows,
		handleFilterChange: handleInputChangeGrantEmail
	} = useTableFilter(grantEmailTableRows);

	const { searchValue: grantEmailItem, setSearchValue: setGrantEmailItem, items: grantItems } =
		useGalEmailSearch();

	const grantEmailHeaders: Array<any> = [
		{
			id: 'grantEmail',
			label: t('domain.distributionList.sendTo.account', 'Account'),
			width: '80%',
			bold: true
		},
		{
			id: 'actions',
			label: t('label.actions', 'Actions'),
			width: '20%',
			bold: true
		}
	];

	const onAddGrantEmail = useCallback(() => {
		const resolution = resolveNewMembers(grantEmailItem, grantEmailsList);
		switch (resolution.type) {
			case 'blank':
				setIsShowSenderToError(true);
				setSenderToErrorMessage(
					t('domain.distributionList.blankEmailErrorMsg', 'Please enter at least one email address')
				);
				return;
			case 'undefined':
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: `${t('label.invalid_email_address', 'Invalid email address')} ${grantEmailItem}`,
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				return;
			case 'invalid':
				setIsShowSenderToError(true);
				setSenderToErrorMessage(
					t(
						'domain.distributionList.invalidEmailErrorMsg',
						'The account does not exist. Please check the spelling and try again.'
					)
				);
				return;
			case 'alreadyInList':
				setIsShowSenderToError(true);
				setSenderToErrorMessage(
					t(
						'label.distribution_list_already_in_list_error',
						'The Distribution List / User is already in the list'
					)
				);
				return;
		}

		setGrantEmailItem('');
		setIsShowSenderToError(false);
		setSenderToErrorMessage('');
		form.setFieldValue('grantEmails', uniq(grantEmailsList.concat(resolution.members)));
	}, [grantEmailsList, createSnackbar, grantEmailItem, t, form, setGrantEmailItem]);

	useEffect(() => {
		if (grantEmailsList && grantEmailsList.length > 0) {
			const allRows = grantEmailsList.map((item: any) =>
				buildGrantEmailRow(item, {
					deleteLabel: t('label.delete', 'Delete'),
					onDelete: (email): void => {
						const updated = grantEmailsList.filter((g: any) => email !== g);
						form.setFieldValue('grantEmails', updated);
						setSelectedGrantEmail([]);
					},
					onSelect: (email): void => {
						setSelectedGrantEmail([email]);
					}
				})
			);
			setGrantEmailTableRows(allRows);
		} else {
			setGrantEmailTableRows([]);
		}
	}, [grantEmailsList, t, form]);

	return (
		<Container
			padding={{ left: 'large', right: 'large' }}
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			height="calc(100vh - 3.6rem)"
			background="white"
			width={'58.75rem'}
			style={{ overflow: 'auto' }}
		>
			<Row
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				orientation="vertical"
				padding={{ bottom: 'medium', top: 'medium' }}
			>
				<ds-text as="h3" size="medium" color="gray0" weight="bold">
					{t(`domain.distributionList.managePermission`, `Manage permissions`)}
				</ds-text>
				<ds-text
					as="p"
					size="small"
					color="gray0"
					style={{ marginTop: '0.5rem' }}
					overflow="break-word"
				>
					{t(
						'domain.distributionList.sendTo.managePermissionDescriptionMsg',
						'Control who can send emails to this distribution list'
					)}
				</ds-text>
			</Row>

			<ListRow>
				<GrantTypeSelect
					items={grantTypeOptions}
					selection={grantType}
					onChange={(v: any): void => {
						form.setFieldValue('grantTypeValue', v);
						if (v === ALL) {
							// the original cleared the senders list when switching to Internal Users only
							form.setFieldValue('grantEmails', []);
						}
					}}
				/>
			</ListRow>

			{grantTypeValue === EMAIL && (
				<Container padding={{ bottom: 'large' }} height={'auto'}>
					<ListRow>
						<Container orientation="vertical" mainAlignment="flex-start" background="gray6">
							<Row
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								width="100%"
								padding={{ top: 'large' }}
							>
								<DropDownInput
									items={grantItems}
									inputLabel={t(
										'domain.distributionList.sendTo.addSendersByEmail',
										'Add senders by email address'
									)}
									size="medium"
									onChange={(e: ChangeEvent<HTMLInputElement>): void => {
										setGrantEmailItem(e.target.value);
									}}
									inputValue={grantEmailItem}
									isCustomIcon={false}
									inputDisabled={grantTypeValue !== EMAIL}
									width="100%"
									hasError={isShowSenderToError}
								/>
							</Row>
							{isShowSenderToError && (
								<Row
									mainAlignment="flex-start"
									crossAlignment="flex-start"
									width="100%"
									padding={{ top: 'small' }}
								>
									<Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
										<Padding right={'0'}>
											<ds-text as="span" size="extrasmall" weight="regular" color="error">
												{senderToErrorMessage}
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
									label={t('domain.distributionList.sendAs.addAccount', 'ADD ACCOUNT')}
									color="primary"
									iconPlacement="left"
									onClick={onAddGrantEmail}
									size="medium"
								/>
							</Row>
						</Container>
					</ListRow>
					<Row width="100%">
						<ds-divider color="gray2" />
					</Row>
					<ListRow>
						<Container padding={{ bottom: 'large', top: 'large' }}>
							<Row
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								padding={{ bottom: 'large' }}
								width="100%"
							>
								<ds-text as="h4" weight="bold" color="gray0">
									{t(
										'domain.distributionList.sendTo.authorizedSendersToList',
										'Authorized senders to this distribution list'
									)}
								</ds-text>
							</Row>
							{grantEmailTableRows.length > 0 && (
								<ListRow>
									<Row width="100%" mainAlignment="flex-start" padding={{ bottom: 'large' }}>
										<Input
											label={t('domain.distributionList.sendTo.searchSenders', 'Search senders')}
											value={filterGrantEmail}
											backgroundColor="gray5"
											onChange={handleInputChangeGrantEmail}
											CustomIcon={(): any => (
												<ds-icon icon="FunnelOutline" size="large" color="primary"></ds-icon>
											)}
										/>
									</Row>
								</ListRow>
							)}
							<Table
								rows={filterGrantEmail ? filteredGrantEmailRows : grantEmailTableRows}
								headers={grantEmailHeaders}
								showCheckbox={false}
								selectedRows={selectedGrantEmail}
								RowFactory={HoverableRowFactory}
								HeaderFactory={CustomHeaderFactory}
							/>
						</Container>
					</ListRow>

					{grantEmailTableRows.length === 0 && (
						<ListRow padding={{ all: 'small' }}>
							<Container
								background="gray6"
								height="fit-content"
								mainAlignment="center"
								crossAlignment="center"
							>
								<Padding value="57px 0 0 0" width="100%">
									<Row mainAlignment="center" width="100%">
										<img src={helmetLogo} alt="logo" />
									</Row>
								</Padding>
								<Padding vertical="extralarge" width="100%">
									<Row mainAlignment="center" width="100%">
										<ds-text as="p" size="large" color="secondary" weight="regular">
											{t('label.there_are_not_member_here', "There aren't members here.")}
										</ds-text>
									</Row>
									<Row mainAlignment="center" width="100%">
										<ds-text as="p" size="large" color="secondary" weight="regular">
											{searchUserLabelValue}
										</ds-text>
									</Row>
								</Padding>
							</Container>
						</ListRow>
					)}
				</Container>
			)}
		</Container>
	);
};
