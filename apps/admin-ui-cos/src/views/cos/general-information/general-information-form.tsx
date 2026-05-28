/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm, useStore } from '@tanstack/react-form';
import {
	Button,
	Container,
	CustomHeaderFactory,
	CustomTextArea,
	HoverableRowFactory,
	Input,
	LabeledValue,
	ListRow,
	Modal,
	Padding,
	Paging,
	Row,
	Table,
	Tooltip,
	TrackNumberPerPage,
	type TRow,
	useSnackbar,
} from '@zextras/ui-components';
import { replaceHistory } from '@zextras/ui-shared';
import { ChangeEvent, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { Attribute } from '../../../../types/attribute';
import logo from '../../../assets/gardian.svg';
import { DEFAULT, RECORD_DISPLAY_LIMIT, ZIMBRA_ADMIN_URN } from '../../../constants';
import { useDebouncedValue } from '../../../hooks/use-debounced-value';
import { deleteCOS } from '../../../services/delete-cos-service';
import { ModifyCosBody } from '../../../services/modify-cos-service';
import { renameCos } from '../../../services/rename-cos-service';
import { useCosAccounts } from '../../../services/use-cos-accounts';
import { useCosDomains } from '../../../services/use-cos-domains';
import { useModifyCos } from '../../../services/use-modify-cos';
import { useTotalAccounts } from '../../../services/use-total-accounts';
import { useTotalDomains } from '../../../services/use-total-domains';
import { FormPageLayout } from '../../form-page-layout';
import { getDateFromStr, getFormatedDate } from '../../utility/utils';
import { FunnelSearchIcon } from '../funnel-search-icon';

type DirectoryItem = {
	a?: Array<Attribute>;
	id?: string;
	name?: string;
};

type GeneralInfoFormValues = {
	cn: string;
	description: string;
	zimbraNotes: string;
};

type GeneralInformationFormProps = {
	cosInformation: Array<Attribute> | undefined;
	readonlyCOS: boolean;
};

function processAttributes(
	attributes: Array<Attribute> | undefined,
	record: Record<string, unknown>,
	arrayFieldName: string,
): void {
	attributes?.forEach((ele) => {
		const attrName = ele?.n;
		if (!attrName) return;
		if (attrName === arrayFieldName) {
			const existing = record[attrName];
			if (Array.isArray(existing)) {
				existing.push(ele._content);
			} else {
				record[attrName] = [ele._content];
			}
		} else {
			record[attrName] = ele._content;
		}
	});
}

function getUserType(item: Record<string, string>): string {
	if (item.zimbraIsAdminAccount === 'TRUE') return 'Admin';
	if (item.zimbraIsDelegatedAdminAccount === 'TRUE') return 'DelegatedAdmin';
	if (item.zimbraIsExternalVirtualAccount === 'TRUE') return 'External';
	if (item.zimbraIsSystemAccount === 'TRUE') return 'System';
	return 'Normal';
}

function processAccountItem(
	item: DirectoryItem,
	statusColor: Record<string, { color: string; label: string }>,
): TRow {
	const acc = item as Record<string, unknown>;
	processAttributes(item.a, acc, 'mail');
	return {
		id: item.id ?? '',
		columns: [
			<ds-text as="span" size="small" key={item.id} color="gray0" weight="regular">
				{item.name || ' '}
			</ds-text>,
			<ds-text as="span" size="small" key={item.id} color="gray0" weight="light">
				{(acc.displayName as string) || <>&nbsp;</>}
			</ds-text>,
			<>
				{Array.isArray(acc.mail) && (acc.mail as Array<string>).length - 1 > 0 ? (
					<Tooltip
						key={item.id}
						placement="bottom"
						label={(acc.mail as Array<string>).slice(1).join(', ')}
						maxWidth="auto"
					>
						<ds-text as="span" size="small" weight="light" key={item.id} color="#828282">
							{(acc.mail as Array<string>).length - 1}
						</ds-text>
					</Tooltip>
				) : (
					<ds-text as="span" size="small" key={item.id} color="#828282" weight="light">
						0
					</ds-text>
				)}
			</>,
			<ds-text as="span" size="small" key={item.id} color="gray0" weight="light">
				{getUserType(acc as Record<string, string>)}
			</ds-text>,
			<ds-text
				as="span"
				size="small"
				weight="light"
				key={item.id}
				color={statusColor[acc.zimbraAccountStatus as string]?.color}
			>
				{statusColor[acc.zimbraAccountStatus as string]?.label}
			</ds-text>,
			<ds-text as="span" size="small" weight="light" key={item.id} color="gray0">
				{(acc.description as string) || <>&nbsp;</>}
			</ds-text>,
		],
		clickable: true,
	};
}

function processDomainItem(
	item: DirectoryItem,
	cosId: string | undefined,
	defaultCosLabel: string,
): TRow {
	const domainItem = item as Record<string, unknown>;
	processAttributes(item.a, domainItem, 'zimbraDomainCOSMaxAccounts');
	const cosMaxAccounts = domainItem.zimbraDomainCOSMaxAccounts;
	const maxAccountValue = Array.isArray(cosMaxAccounts)
		? (cosMaxAccounts as Array<string>).find((acc) => acc?.split(':')[0] === cosId)?.split(':')[1]
		: undefined;
	return {
		id: item.id ?? '',
		columns: [
			<ds-text as="span" size="small" key={item.id} color="gray0" weight="regular">
				{item.name || ' '}
			</ds-text>,
			<ds-text as="span" size="small" key={item.id} color="gray0" weight="light">
				{maxAccountValue || ' '}
			</ds-text>,
			<Container key={item.id}>
				{cosId === (domainItem.zimbraDomainDefaultCOSId as string) && (
					<Row>
						<Padding right="small">
							<ds-text as="span" size="small" weight="light" color="gray0">
								{defaultCosLabel}
							</ds-text>
						</Padding>
						<ds-icon icon="Star" color="primary"></ds-icon>
					</Row>
				)}
			</Container>,
		],
		clickable: true,
	};
}

function buildDefaultValues(cosInformation: Array<Attribute> | undefined): GeneralInfoFormValues {
	if (!cosInformation?.length) return { cn: '', description: '', zimbraNotes: '' };
	const fromServer: Partial<Record<string, string>> = {};
	cosInformation.forEach((item) => {
		if (item?.n) fromServer[item.n] = item._content;
	});
	return {
		cn: fromServer.cn ?? '',
		description: fromServer.description ?? '',
		zimbraNotes: fromServer.zimbraNotes ?? '',
	};
}

function buildCosDataMap(
	cosInformation: Array<Attribute> | undefined,
): Partial<Record<string, string>> {
	if (!cosInformation?.length) return {};
	const obj: Partial<Record<string, string>> = {};
	cosInformation.forEach((item) => {
		if (item?.n) obj[item.n] = item._content;
	});
	return obj;
}

export const GeneralInformationForm = ({
	cosInformation,
	readonlyCOS,
}: GeneralInformationFormProps) => {
	const [t] = useTranslation();
	const { cosId } = useParams();
	const createSnackbar = useSnackbar();
	const modifyCosMutation = useModifyCos(cosId);
	const { data: totalAccount = 0 } = useTotalAccounts(cosId);
	const { data: totalDomain = 0 } = useTotalDomains(cosId);

	const [openDeleteCOSConfirmDialog, setOpenDeleteCOSConfirmDialog] = useState<boolean>(false);
	const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);

	const [offset, setOffset] = useState<number>(0);
	const [accountLimit, setAccountLimit] = useState<number>(RECORD_DISPLAY_LIMIT);
	const [searchAccountString, setSearchAccountString] = useState<string>('');
	const debouncedAccountSearch = useDebouncedValue(searchAccountString, 700);

	const [limit, setLimit] = useState<number>(RECORD_DISPLAY_LIMIT);
	const [searchDomainString, setSearchDomainString] = useState<string>('');
	const [domainOffset, setDomainOffset] = useState<number>(0);
	const debouncedDomainSearch = useDebouncedValue(searchDomainString, 700);

	const STATUS_COLOR: Record<string, { color: string; label: string }> = {
		active: { color: '#8BC34A', label: t('label.active', 'Active') },
		maintenance: { color: '#2196D3', label: t('label.in_maintenance', 'In maintenance') },
		locked: { color: '#D74942', label: t('label.locked', 'Locked') },
		closed: { color: '#828282', label: t('label.closed', 'Closed') },
		pending: { color: '#828282', label: t('label.pending', 'Pending') },
		lockout: { color: '#D74942', label: t('label.lockout', 'Lockout') },
	};

	const {
		data: accountsData,
		isPending: isAccountRequestInProgress,
		isFetching: isAccountFetching,
		isPlaceholderData: isAccountPlaceholderData,
	} = useCosAccounts(cosId, debouncedAccountSearch, offset, accountLimit);

	const accountList = useMemo(() => {
		if (!accountsData?.accounts.length) return [];
		return accountsData.accounts.map((item) =>
			processAccountItem(item as DirectoryItem, STATUS_COLOR),
		);
	}, [accountsData?.accounts]);

	const totalAccounts = accountsData?.total ?? 0;

	const {
		data: domainsData,
		isPending: isDomainRequestInProgress,
		isFetching: isDomainFetching,
		isPlaceholderData: isDomainPlaceholderData,
	} = useCosDomains(cosId, debouncedDomainSearch, domainOffset, limit);

	const domainList = useMemo(() => {
		if (!domainsData?.domains.length) return [];
		return domainsData.domains.map((item) =>
			processDomainItem(item as DirectoryItem, cosId, t('label.default_cos', 'Default COS')),
		);
	}, [domainsData?.domains]);

	const totalDomains = domainsData?.total ?? 0;

	const cosData = buildCosDataMap(cosInformation);

	const form = useForm({
		defaultValues: buildDefaultValues(cosInformation),
		onSubmit: async ({ value }) => {
			const zimbraId = cosInformation?.find((a) => a.n === 'zimbraId')?._content;
			if (!zimbraId) return;

			const originalCn = cosData.cn ?? '';
			const attributes: Attribute[] = [
				{ n: 'zimbraNotes', _content: value.zimbraNotes },
				{ n: 'description', _content: value.description },
				{ n: 'cn', _content: value.cn, c: true },
			];
			const body: ModifyCosBody = {
				_jsns: ZIMBRA_ADMIN_URN,
				a: attributes,
				id: { _content: zimbraId },
			};

			if (originalCn !== value.cn) {
				const renameBody = {
					_jsns: ZIMBRA_ADMIN_URN,
					id: { _content: zimbraId },
					newName: { _content: value.cn },
				};
				try {
					await renameCos(renameBody);
					modifyCosMutation.mutate(body, {
						onSuccess: () => {
							form.reset(value, { keepDefaultValues: true });
						},
					});
				} catch (error) {
					createSnackbar({
						key: 'error',
						severity: 'error',
						label:
							(error as Error)?.message ||
							t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true,
					});
				}
			} else {
				modifyCosMutation.mutate(body, {
					onSuccess: () => {
						form.reset(value, { keepDefaultValues: true });
					},
				});
			}
		},
	});

	const isDirty = useStore(form.store, (state) => !state.isDefaultValue);

	const accountHeaders = [
		{ id: 'email', label: t('label.email', 'Email'), width: '25%', bold: true },
		{ id: 'name', label: t('label.person_name', 'Name'), width: '15%', bold: true },
		{ id: 'aliases', label: t('label.Aliases', 'Aliases'), width: '10%', bold: true },
		{ id: 'type', label: t('label.type', 'Type'), width: '10%', bold: true },
		{ id: 'status', label: t('label.status', 'Status'), width: '10%', bold: true },
		{ id: 'description', label: t('label.description', 'Description'), width: '40%', bold: true },
	];

	const domainHeaders = [
		{ id: 'domains', label: t('label.domains', 'Domains'), width: '35%', bold: true },
		{
			id: 'maximum_accounts',
			label: t('label.maximum_handled_accounts', 'Maximum Handled Accounts'),
			width: '45%',
			bold: true,
		},
		{ id: 'description', label: '', width: '20%', bold: true },
	];

	const cosCreationDate =
		!!cosData.zimbraCreateTimestamp && cosData.zimbraCreateTimestamp !== null
			? getFormatedDate(getDateFromStr(cosData.zimbraCreateTimestamp)) ?? ''
			: '';

	const canDeleteCOS = !!(form.state.values.cn === '' || form.state.values.cn === DEFAULT);

	const onDeleteCOS = (): void => {
		setIsRequestInProgress(true);
		deleteCOS(cosData.zimbraId ?? '')
			.then((data: unknown) => {
				setIsRequestInProgress(false);
				if (data) {
					createSnackbar({
						key: 'info',
						severity: 'info',
						label: t('label.delete_cos_succeess', {
							cosname: form.state.values.cn,
							defaultValue: 'The {{cosname}} has been deleted successfully',
						}),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true,
					});
					setOpenDeleteCOSConfirmDialog(false);
					replaceHistory(`/cos_list`);
				}
			})
			.catch((error: unknown) => {
				setIsRequestInProgress(false);
				createSnackbar({
					key: 'error',
					severity: 'error',
					label:
						(error as Error)?.message ||
						t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true,
				});
			});
	};

	return (
		<FormPageLayout
			title={t('cos.general_information', 'General Information')}
			onSave={() => form.handleSubmit()}
			onCancel={() => form.reset()}
			unsavedChanges={isDirty}
		>
			<Container
				orientation="column"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				style={{ overflow: 'auto' }}
				width="100%"
			>
				<Row mainAlignment="flex-start" width="100%">
					<Container height="fit" crossAlignment="flex-start" background="gray6">
						<ListRow>
							<Container padding={{ all: 'small' }}>
								<form.Field name="cn">
									{(field) => (
										<Input
											isRequired
											label={t('label.name', 'Name')}
											backgroundColor={canDeleteCOS ? 'gray6' : 'gray5'}
											value={field.state.value}
											onChange={(e: ChangeEvent<HTMLInputElement>): void => {
												field.handleChange(e.target.value);
											}}
											disabled={canDeleteCOS || readonlyCOS}
										/>
									)}
								</form.Field>
							</Container>
						</ListRow>
						<ListRow>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.id_lbl', 'ID')}
									backgroundColor="gray6"
									value={cosData.zimbraId}
									disabled
									onChange={(): void => {}}
								/>
							</Container>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.creation_date', 'Creation Date')}
									value={cosCreationDate}
									backgroundColor="gray6"
									disabled
									onChange={(): void => {}}
								/>
							</Container>
						</ListRow>
						<ListRow>
							<Container padding={{ all: 'small' }}>
								<LabeledValue
									label={t('label.accounts_that_use_this_cos', 'Accounts that use this CoS')}
									backgroundColor="gray6"
									value={totalAccount}
								/>
							</Container>
							<Container padding={{ all: 'small' }}>
								<LabeledValue
									label={t(
										'label.domains_that_use_this_cos_as_default',
										'Domains that use this CoS as default',
									)}
									value={totalDomain}
									backgroundColor="gray6"
								/>
							</Container>
						</ListRow>
						<ListRow>
							<Container padding={{ all: 'small' }}>
								<form.Field name="description">
									{(field) => (
										<Input
											label={t('label.description', 'Description')}
											backgroundColor="gray5"
											value={field.state.value}
											onChange={(e: ChangeEvent<HTMLInputElement>): void => {
												field.handleChange(e.target.value);
											}}
											disabled={readonlyCOS}
										/>
									)}
								</form.Field>
							</Container>
						</ListRow>
						<ListRow>
							<Container padding={{ all: 'small' }}>
								<form.Field name="zimbraNotes">
									{(field) => (
										<CustomTextArea
											label={t('label.notes', 'Notes')}
											backgroundColor="gray5"
											value={field.state.value}
											onChange={(e: ChangeEvent<HTMLTextAreaElement>): void => {
												field.handleChange(e.target.value);
											}}
											disabled={readonlyCOS}
										/>
									)}
								</form.Field>
							</Container>
						</ListRow>
					</Container>
				</Row>
				<Row width="100%" padding={{ vertical: 'large' }}>
					<Row mainAlignment="flex-start" width="100%" crossAlignment="flex-start">
						<ds-text as="strong" size="medium" weight="bold" color="gray0">
							{t('cos.domains_that_use_this_cos', 'Domains that use this COS')}
						</ds-text>
					</Row>
				</Row>
				<Row
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					width="fill"
				>
					<Container padding={{ all: 'small' }}>
						<Input
							label={t('label.search_for_a_domain', `Search for a domain`)}
							disabled={domainList.length === 0 && searchDomainString.length === 0}
							value={searchDomainString}
							backgroundColor="gray5"
							onChange={(e: ChangeEvent<HTMLInputElement>): void => {
								setSearchDomainString(e.target.value);
							}}
							CustomIcon={FunnelSearchIcon}
						/>
					</Container>
				</Row>
				<Row
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					width="fill"
					style={{
						height: 'calc(100vh - 21.25rem)',
						position: 'relative',
					}}
				>
					<Container padding={{ all: 'small' }}>
						<Table
							rows={isDomainRequestInProgress && !isDomainPlaceholderData ? [] : domainList}
							headers={domainHeaders}
							showCheckbox={false}
							multiSelect={false}
							style={{
								overflow: 'auto',
								height: '100%',
							}}
							RowFactory={HoverableRowFactory}
							HeaderFactory={CustomHeaderFactory}
						/>
						{isDomainFetching && !isDomainPlaceholderData && (
							<Container
								crossAlignment="center"
								mainAlignment="center"
								height="auto"
								padding={{ top: 'medium' }}
							>
								<ds-spinner></ds-spinner>
							</Container>
						)}
						{domainList.length === 0 && !isDomainFetching && (
							<Container
								orientation="column"
								crossAlignment="center"
								mainAlignment="center"
								style={{ marginTop: '1rem' }}
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
									<ds-text as="p" weight="light" color="#828282" size="large" overflow="break-word">
										{t('label.this_list_is_empty', 'This list is empty.')}
									</ds-text>
								</Row>
							</Container>
						)}
						{domainList.length !== 0 && (
							<Container
								orientation="horizontal"
								mainAlignment="space-between"
								width="100%"
								style={{ position: 'absolute', bottom: '-4rem' }}
								height="auto"
								padding={{ all: 'large' }}
							>
								<Container crossAlignment="flex-start" padding={{ all: 'small' }}>
									<Paging totalItem={totalDomains} setOffset={setDomainOffset} pageSize={limit} />
								</Container>
								<Container
									crossAlignment="flex-end"
									orientation="horizontal"
									mainAlignment="flex-end"
									padding={{ all: 'small' }}
								>
									<TrackNumberPerPage setPageSize={setLimit} />
								</Container>
							</Container>
						)}
					</Container>
				</Row>
				<Row
					width="100%"
					padding={{ vertical: 'large' }}
					style={{ marginTop: domainList.length > 0 ? '3rem' : '0rem' }}
				>
					<Row mainAlignment="flex-start" width="100%" crossAlignment="flex-start">
						<ds-text as="strong" size="medium" weight="bold" color="gray0">
							{t('cos.accounts_that_use_this_cos', 'Accounts that use this COS')}
						</ds-text>
					</Row>
				</Row>
				<Row
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					width="fill"
				>
					<Container padding={{ all: 'small' }}>
						<Input
							label={t('label.search_for_an_account', `Search for an account`)}
							disabled={accountList.length === 0 && searchAccountString.length === 0}
							value={searchAccountString}
							backgroundColor="gray5"
							onChange={(e: ChangeEvent<HTMLInputElement>): void => {
								setSearchAccountString(e.target.value);
							}}
							CustomIcon={FunnelSearchIcon}
						/>
					</Container>
				</Row>
				<Row
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					width="fill"
					style={{
						height: 'calc(100vh - 21.25rem)',
						position: 'relative',
					}}
					padding={{ bottom: 'large' }}
				>
					<Container padding={{ all: 'small' }}>
						<Table
							rows={isAccountRequestInProgress && !isAccountPlaceholderData ? [] : accountList}
							headers={accountHeaders}
							showCheckbox={false}
							multiSelect={false}
							style={{
								overflow: 'auto',
								height: '100%',
							}}
							RowFactory={HoverableRowFactory}
							HeaderFactory={CustomHeaderFactory}
						/>
						{isAccountFetching && !isAccountPlaceholderData && (
							<Container
								crossAlignment="center"
								mainAlignment="center"
								height="auto"
								padding={{ top: 'medium' }}
							>
								<ds-spinner></ds-spinner>
							</Container>
						)}
						{accountList.length === 0 && !isAccountFetching && (
							<Container
								orientation="column"
								crossAlignment="center"
								mainAlignment="center"
								style={{ marginTop: '1rem' }}
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
									<ds-text as="p" weight="light" color="#828282" size="large" overflow="break-word">
										{t('label.this_list_is_empty', 'This list is empty.')}
									</ds-text>
								</Row>
							</Container>
						)}
						{accountList.length !== 0 && (
							<Container
								orientation="horizontal"
								mainAlignment="space-between"
								width="100%"
								style={{ position: 'absolute', bottom: '-4rem' }}
								height="auto"
								padding={{ all: 'large' }}
							>
								<Container crossAlignment="flex-start" padding={{ all: 'small' }}>
									<Paging totalItem={totalAccounts} setOffset={setOffset} pageSize={accountLimit} />
								</Container>
								<Container
									crossAlignment="flex-end"
									orientation="horizontal"
									mainAlignment="flex-end"
									padding={{ all: 'small' }}
								>
									<TrackNumberPerPage setPageSize={setAccountLimit} />
								</Container>
							</Container>
						)}
					</Container>
				</Row>
			</Container>
			<Row
				width="100%"
				padding={{ top: 'small', right: 'large', bottom: 'large', left: 'large' }}
				style={{ display: 'block' }}
			>
				<Button
					type="outlined"
					label="DELETE"
					icon="Trash2Outline"
					color="error"
					size="large"
					width="fill"
					style={{ width: '100%' }}
					disabled={canDeleteCOS || readonlyCOS}
					onClick={() => setOpenDeleteCOSConfirmDialog(true)}
				/>
			</Row>
			<Modal
				title={
					<Trans
						i18nKey="label.deleting_cos_msg"
						defaults="Deleting <bold>{{cosname}}</bold>"
						components={{ bold: <strong /> }}
						values={{ cosname: form.state.values.cn }}
					/>
				}
				open={openDeleteCOSConfirmDialog}
				showCloseIcon
				onClose={(): void => {
					setOpenDeleteCOSConfirmDialog(false);
				}}
				size="medium"
				customFooter={
					<Container orientation="horizontal" mainAlignment="space-between">
						<Container orientation="horizontal" mainAlignment="flex-end" width="fit">
							<Padding all="small">
								<Button
									label={t('label.no_go_back', 'No, Go Back')}
									color="secondary"
									size="medium"
									onClick={(): void => {
										setOpenDeleteCOSConfirmDialog(false);
									}}
								/>
							</Padding>
							<Button
								label={t('label.yes_delete', 'Yes, Delete')}
								color="error"
								onClick={onDeleteCOS}
								disabled={isRequestInProgress}
							/>
						</Container>
					</Container>
				}
			>
				<Container>
					<Padding bottom="small" top="extralarge">
						<ds-text as="p" overflow="break-word" weight="regular">
							{t('label.you_are_deleting', {
								cosname: form.state.values.cn,
								defaultValue: 'You are deleting {{cosname}}',
							})}
						</ds-text>
					</Padding>
					<Padding bottom="small">
						<ds-text as="p" overflow="break-word" weight="regular">
							{t(
								'label.are_you_sure_deleting_cos',
								'Are you sure you want to delete this Class of Service?',
							)}
						</ds-text>
					</Padding>
					<Padding bottom="extralarge">
						<ds-text as="p" overflow="break-word" weight="regular">
							{t(
								'label.delete_cos_instruction_msg',
								'If you click YES, DELETE the DefaultCOS will be replace the deleted COS.',
							)}
						</ds-text>
					</Padding>
				</Container>
			</Modal>
		</FormPageLayout>
	);
};
