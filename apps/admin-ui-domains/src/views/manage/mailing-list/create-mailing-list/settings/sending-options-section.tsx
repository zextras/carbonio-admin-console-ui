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
	Select,
	Table,
	useSnackbar
} from '@zextras/ui-components';
import { sortedUniq, uniq } from 'lodash-es';
import {
	type ChangeEvent,
	type FC,
	useContext,
	useState
} from 'react';
import { useTranslation } from 'react-i18next';

import { ALL, EMAIL, GRP, PUB } from '../../../../../constants';
import { useGalEmailSearch } from '../../edit-distribution-list/use-gal-email-search';
import { HelmetEmptyState } from '../helmet-empty-state';
import { MailingListContext } from '../mailinglist-context';
import { parseEmailInput } from '../parse-email-input';

export const SendingOptionsSection: FC = () => {
	const { t } = useTranslation();
	const createSnackbar = useSnackbar();
	const { mailingListDetail, setMailingListDetail } = useContext(MailingListContext);
	const grantType = mailingListDetail?.ownerGrantEmailType;
	const [selectedGrantEmail, setSelectedGrantEmail] = useState<Array<any>>([]);
	const grantEmailsList = mailingListDetail?.ownerGrantEmails ?? [];

	const grantEmailHeaders: any[] = [
		{
			id: 'grantEmail',
			label: t('label.who_can_send_mails_to_list ', 'Who can send mails TO this list?'),
			width: '100%',
			bold: true
		}
	];

	const grantTypeOptions: any[] = [
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

	const onGrantTypeChange = (v: any): any => {
		const it = grantTypeOptions.find((item: any) => item.value === v);

		setMailingListDetail((prev: any) => ({
			...prev,
			ownerGrantEmailType: it
		}));
	};

	const { searchValue: grantEmailItem, setSearchValue: setGrantEmailItem, items: grantItems } =
		useGalEmailSearch();

	const onAddGrantEmail = (): void => {
		if (grantEmailItem === '') return;
		const parsed = parseEmailInput(grantEmailItem);
		if (parsed.type === 'undefined') {
			createSnackbar({
				key: 'error',
				severity: 'error',
				label: `${t('label.invalid_email_address', 'Invalid email address')} ${grantEmailItem}`,
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
		setGrantEmailItem('');
		const sortedList = sortedUniq(parsed.emails);
		setMailingListDetail((prev: any) => ({
			...prev,
			ownerGrantEmails: uniq((prev.ownerGrantEmails ?? []).concat(sortedList))
		}));
	};

	const onDeleteFromGrantEmail = (): void => {
		if (selectedGrantEmail.length > 0) {
			setMailingListDetail((prev: any) => ({
				...prev,
				ownerGrantEmails: (prev.ownerGrantEmails ?? []).filter(
					(item: any) => !selectedGrantEmail.includes(item)
				)
			}));
			setSelectedGrantEmail([]);
		}
	};

	const grantEmailTableRows: Array<any> = (grantEmailsList ?? []).map((item: any) => ({
		id: item,
		columns: [
			<ds-text
				as="span"
				size="medium"
				weight="light"
				key={item?.id}
				color="#828282"
				onClick={(): void => {
					setSelectedGrantEmail([item]);
				}}
			>
				{item}
			</ds-text>
		]
	}));

	return (
		<>
			<ListRow>
				<Container>
					<ds-divider />
				</Container>
			</ListRow>
			<Row padding={{ top: 'large' }}>
				<ds-text as="h3" size="small" weight="bold" color="gray0">
					{t('label.sending_options', 'Sending Options')}
				</ds-text>
			</Row>
			<ListRow>
				<Container padding={{ top: 'large' }}>
					<Select
						items={grantTypeOptions}
						background="gray5"
						label={t('label.who_can_send_mails_to_this_list', 'Who can send mails TO this list?')}
						showCheckbox={false}
						onChange={onGrantTypeChange}
						selection={grantType}
					/>
				</Container>
			</ListRow>
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
							items={grantItems}
							inputLabel={t(
								'label.type_an_account_add_senders_list',
								'Type an account to add it to the sender for the list'
							)}
							size="medium"
							onChange={(e: ChangeEvent<HTMLInputElement>): void => {
								setGrantEmailItem(e.target.value);
							}}
							inputValue={grantEmailItem}
							isCustomIcon={false}
							inputDisabled={grantType?.value !== EMAIL}
						/>
					</Row>
					<Row width="35%" mainAlignment="flex-start" crossAlignment="flex-start">
						<Padding left="large">
							<Button
								type="outlined"
								label={t('label.add', 'Add')}
								color="primary"
								size="extralarge"
								onClick={onAddGrantEmail}
								disabled={grantEmailItem === ''}
							/>
						</Padding>
						<Padding left="large">
							<Button
								type="outlined"
								label={t('label.delete', 'Delete')}
								color="error"
								size="extralarge"
								onClick={onDeleteFromGrantEmail}
								disabled={selectedGrantEmail?.length === 0}
							/>
						</Padding>
					</Row>
				</Container>
			</ListRow>

			<ListRow>
				<Container padding={{ top: 'large' }}>
					<Table
						rows={grantEmailTableRows}
						headers={grantEmailHeaders}
						showCheckbox={false}
						selectedRows={selectedGrantEmail}
						RowFactory={HoverableRowFactory}
						HeaderFactory={CustomHeaderFactory}
					/>
				</Container>
			</ListRow>
			{grantEmailTableRows.length === 0 && (
				<ListRow>
					<HelmetEmptyState
						topPadding="3.563rem 0 0 0"
						firstMessage={t('label.there_are_not_member_here', 'There aren’t members here.')}
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
