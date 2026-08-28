/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	Button,
	Container,
	CustomHeaderFactory,
	DropDownInput,
	HoverableRowFactory,
	ListRow,
	Padding,
	Row,
	Table,
	useSnackbar
} from '@zextras/ui-components';
import { sortedUniq, uniq, uniqBy } from 'lodash-es';
import { type FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGalEmailSearch } from '../../edit-distribution-list/use-gal-email-search';
import { HelmetEmptyState } from '../helmet-empty-state';
import { MailingListContext } from '../mailinglist-context';
import { parseEmailInput } from '../parse-email-input';

export const OwnersSettingsSection: FC = () => {
	const { t } = useTranslation();
	const createSnackbar = useSnackbar();
	const { mailingListDetail, setMailingListDetail } = useContext(MailingListContext);
	const [ownersList, setOwnersList] = useState<Array<any>>(
		mailingListDetail?.owners ? mailingListDetail?.owners : []
	);
	const [selectedDistributionListOwner, setSelectedDistributionListOwner] = useState<Array<any>>(
		[]
	);

	const ownerHeaders: any[] = useMemo(
		() => [
			{
				id: 'members',
				label: t('label.accounts_that_are_owners', 'Accounts that are owners'),
				width: '100%',
				bold: true
			}
		],
		[t]
	);

	const { searchValue: member, setSearchValue: setMember, items, contactList } =
		useGalEmailSearch();

	useEffect(() => {
		if (contactList && contactList.length > 0) {
			setMailingListDetail((prev: any) => ({
				...prev,
				allOwnersList: uniqBy(prev.allOwnersList.concat(contactList), 'id')
			}));
		}
	}, [contactList, setMailingListDetail]);

	/* the wizard context tracks the owners so the summary step can show them */
	useEffect(() => {
		setMailingListDetail((prev: any) => ({ ...prev, owners: ownersList ?? [] }));
	}, [ownersList, setMailingListDetail]);

	const ownerTableRows: Array<any> = (ownersList ?? []).map((item: any) => ({
		id: item,
		columns: [
			<ds-text
				as="span"
				size="medium"
				weight="light"
				key={item?.id}
				color="#828282"
				onClick={(): void => {
					setSelectedDistributionListOwner([item]);
				}}
			>
				{item}
			</ds-text>
		]
	}));

	const onAdd = useCallback((): void => {
		if (member === '') return;
		const parsed = parseEmailInput(member);
		if (parsed.type === 'undefined') {
			createSnackbar({
				key: 'error',
				severity: 'error',
				label: `${t('label.invalid_email_address', 'Invalid email address')} ${member}`,
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
			return;
		}
		if (parsed.type === 'invalid') {
			createSnackbar({
				key: 'error',
				severity: 'error',
				label: `${t('label.invalid_email_address', 'Invalid email address')} ${
					parsed.firstInvalid
				}`,
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
			return;
		}
		setMember('');
		const sortedList = sortedUniq(parsed.emails);
		setOwnersList(uniq(ownersList.concat(sortedList)));
	}, [member, createSnackbar, ownersList, t, setMember]);

	const onDeleteFromList = useCallback((): void => {
		if (selectedDistributionListOwner.length > 0) {
			const _dlm = ownersList.filter(
				(item: any) => !selectedDistributionListOwner.includes(item)
			);
			setOwnersList(_dlm);
			setSelectedDistributionListOwner([]);
		}
	}, [ownersList, selectedDistributionListOwner]);

	return (
		<>
			<ListRow>
				<Container>
					<ds-divider />
				</Container>
			</ListRow>
			<Row padding={{ top: 'large' }}>
				<ds-text as="h3" size="small" weight="bold">
					{t('label.owners_settings_lbl', 'Owners’ Settings')}
				</ds-text>
			</Row>
			<Row padding={{ top: 'small', bottom: 'medium' }}>
				<ds-text as="p" size="small" weight="light" color="#828282" overflow="break-word">
					{t(
						'label.owners_description_msg_1',
						'Owners can add and remove members, change displayname and description, change list visibility (ie. to hide in gal), change the ownership, modify the subscription/unsubscription behaviour.'
					)}
				</ds-text>
			</Row>

			<ListRow>
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					orientation="horizontal"
					padding={{ top: 'large', right: 'small' }}
					width="100%"
				>
					<Row mainAlignment="flex-start" width="65%" crossAlignment="flex-start">
						<DropDownInput
							width="100%"
							items={items}
							inputLabel={t('label.type_an_account_dot', 'Type an account ...')}
							size="medium"
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								setMember(e.target.value);
							}}
							inputValue={member}
							isCustomIcon={false}
						/>
					</Row>
					<Row width="35%" mainAlignment="flex-start" crossAlignment="flex-start">
						<Padding left="large">
							<Button
								type="outlined"
								label={t('label.add', 'Add')}
								color="primary"
								size="extralarge"
								onClick={onAdd}
								disabled={member === ''}
							/>
						</Padding>
						<Padding left="large">
							<Button
								type="outlined"
								label={t('label.delete', 'Delete')}
								color="error"
								size="extralarge"
								onClick={onDeleteFromList}
								disabled={
									selectedDistributionListOwner && selectedDistributionListOwner.length === 0
								}
							/>
						</Padding>
					</Row>
				</Container>
			</ListRow>
			<ListRow>
				<Container padding={{ top: 'large' }}>
					<Table
						rows={ownerTableRows}
						headers={ownerHeaders}
						showCheckbox={false}
						selectedRows={selectedDistributionListOwner}
						RowFactory={HoverableRowFactory}
						HeaderFactory={CustomHeaderFactory}
					/>
				</Container>
			</ListRow>
			{ownerTableRows.length === 0 && (
				<ListRow>
					<HelmetEmptyState
						firstMessage={t('label.there_are_no_owners', 'There aren’t owners here.')}
						secondMessage={t(
							'label.search_for_user_and_clic_to_add',
							'Search for a user and click on the ADD button.'
						)}
					/>
				</ListRow>
			)}
		</>
	);
};
