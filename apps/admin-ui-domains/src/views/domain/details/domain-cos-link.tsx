/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useQueryClient } from '@tanstack/react-query';
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
import {
	domainByIdKey,
	flushCache,
	getCosList,
	postSoapFetchRequest,
	useUserSettings
} from '@zextras/ui-shared';
import { debounce } from 'lodash-es';
import React, { FC, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Attribute } from '../../../../types/attribute';
import { Cos } from '../../../../types/cos';
import { CosMaxAccountValues } from '../../../../types/domain';
import { HELPDESK_ADMINS, MAX_COS_DISPLAY, TRUE, ZIMBRA_ADMIN_URN } from '../../../constants';
import { copyCos } from '../../../services/copy-cos-service';
import { modifyDomain } from '../../../services/modify-domain-service';
import { generateSnackbarFromError } from '../../error/generate-snackbar-error';

type CosSearchResponse = {
	searchTotal: number;
	cos: Cos[];
};

type ModifyDomainResponse = {
	domain?: Array<{ id: string; name: string; [key: string]: unknown }>;
};

type ModifyDomainBody = {
	id: string;
	_jsns: string;
	a: Array<{ n: string; _content: string }>;
};

type TableHeader = {
	id: string;
	label: string;
	width: string;
	bold: boolean;
};

type DomainCosLinkProps = {
	cosMaxAccountList: Array<CosMaxAccountValues>;
	defaultCosId: string;
	domainId: string;
	domainName: string;
};

const DomainCosLink: FC<DomainCosLinkProps> = ({
	cosMaxAccountList,
	defaultCosId,
	domainId,
	domainName
}) => {
	const [t] = useTranslation();
	const queryClient = useQueryClient();
	const createSnackbar = useSnackbar();
	const userSetting = useUserSettings();

	const isGlobalAdmin = userSetting?.attrs?.zimbraIsAdminAccount === TRUE;

	const [isCosSelect, setIsCosSelect] = useState(false);
	const [cosList, setCosList] = useState<Array<Cos>>([]);
	const [isCosListExpand, setIsCosListExpand] = useState(false);
	const [searchCosName, setSearchCosName] = useState('');
	const [cosId, setCosId] = useState('');
	const [maxAccountValue, setMaxAccountValue] = useState('');

	const showSuccessSnackbar = (): void => {
		createSnackbar({
			key: 'success',
			severity: 'success',
			label: t('label.change_save_success_msg', 'The change has been saved successfully'),
			autoHideTimeout: 3000,
			hideButton: true,
			replace: true
		});
	};

	const showErrorSnackbar = (error: unknown): void => {
		const message =
			error instanceof Error
				? error.message
				: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.');
		createSnackbar({
			key: 'error',
			severity: 'error',
			label: message,
			autoHideTimeout: 3000,
			hideButton: true,
			replace: true
		});
	};

	const updateDomainCache = (data: ModifyDomainResponse): void => {
		if (isGlobalAdmin) {
			flushCache('domain', 'id', domainId);
		}
		const domain = data?.domain?.[0];
		if (domain) {
			queryClient.setQueryData(domainByIdKey(domainId, 1), domain);
		}
	};

	const getCosLists = (cos: string): void => {
		getCosList(cos, 0)
			.then((data) => {
				const searchResponse = data as CosSearchResponse;
				if (searchResponse?.searchTotal > 0) {
					setCosList(searchResponse.cos);
				} else {
					setCosList([]);
				}
			})
			.catch((error) => {
				const snackbarConfig = generateSnackbarFromError(error, t);
				createSnackbar(snackbarConfig);
			});
	};

	const debouncedSearch = useMemo(
		() =>
			debounce((cos: string) => {
				getCosLists(cos);
			}, 700),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	// Cleanup debounce on unmount
	useEffect(() => {
		return () => {
			debouncedSearch.cancel();
		};
	}, [debouncedSearch]);

	useEffect(() => {
		if (!isCosSelect) {
			debouncedSearch(searchCosName);
		}
	}, [searchCosName, isCosSelect, debouncedSearch]);

	const selectedCos = (cos: Cos): void => {
		setIsCosSelect(true);
		setSearchCosName(cos?.name ?? '');
		setIsCosListExpand(false);
		setCosId(cos?.id ?? '');
	};

	const grantCosRights = (cId: string): void => {
		const target = {
			_content: cId,
			type: 'cos',
			by: 'id'
		};
		const grantee = {
			by: 'name',
			type: 'grp',
			_content: `${HELPDESK_ADMINS}@${domainName}`
		};

		postSoapFetchRequest(
			'/service/admin/soap/GrantRightRequest',
			{
				_jsns: ZIMBRA_ADMIN_URN,
				target,
				grantee,
				right: { _content: 'getCos' }
			},
			'GrantRightRequest'
		)
			.then(() =>
				postSoapFetchRequest(
					'/service/admin/soap/GrantRightRequest',
					{
						_jsns: ZIMBRA_ADMIN_URN,
						target,
						grantee,
						right: { _content: 'listCos' }
					},
					'GrantRightRequest'
				)
			)
			.then(() =>
				postSoapFetchRequest(
					'/service/admin/soap/GrantRightRequest',
					{
						_jsns: ZIMBRA_ADMIN_URN,
						target,
						grantee,
						right: { _content: 'assignCos' }
					},
					'GrantRightRequest'
				)
			);
	};

	const revokeCosRights = (cId: string): void => {
		const target = {
			_content: cId,
			type: 'cos',
			by: 'id'
		};
		const grantee = {
			by: 'name',
			type: 'grp',
			_content: `${HELPDESK_ADMINS}@${domainName}`
		};

		postSoapFetchRequest(
			'/service/admin/soap/RevokeRightRequest',
			{
				_jsns: ZIMBRA_ADMIN_URN,
				target,
				grantee,
				right: { _content: 'getCos' }
			},
			'RevokeRightRequest'
		)
			.then(() =>
				postSoapFetchRequest(
					'/service/admin/soap/RevokeRightRequest',
					{
						_jsns: ZIMBRA_ADMIN_URN,
						target,
						grantee,
						right: { _content: 'listCos' }
					},
					'RevokeRightRequest'
				)
			)
			.then(() =>
				postSoapFetchRequest(
					'/service/admin/soap/RevokeRightRequest',
					{
						_jsns: ZIMBRA_ADMIN_URN,
						target,
						grantee,
						right: { _content: 'assignCos' }
					},
					'RevokeRightRequest'
				)
			);
	};

	const onSaveCosLinkToDomainRef = useRef<(cId: string, cosMaxAccValue: string) => void>(undefined);

	const onSaveCosLinkToDomain = (cId: string, cosMaxAccValue: string): void => {
		if (!cId || !cosMaxAccValue) {
			return;
		}

		const attributes: Attribute[] = [];
		const isOverride = cosMaxAccountList.some((item) => item.id === cId);

		if (isOverride) {
			cosMaxAccountList.forEach((item) => {
				if (item.id !== cId) {
					attributes.push({
						n: 'zimbraDomainCOSMaxAccounts',
						_content: `${item.id}:${item.value}`
					});
				}
			});
			attributes.push({
				n: 'zimbraDomainCOSMaxAccounts',
				_content: `${cId}:${cosMaxAccValue}`
			});
		} else {
			attributes.push({
				n: '+zimbraDomainCOSMaxAccounts',
				_content: `${cId}:${cosMaxAccValue}`
			});
		}

		const body: ModifyDomainBody = {
			id: domainId,
			_jsns: ZIMBRA_ADMIN_URN,
			a: attributes
		};

		modifyDomain(body)
			.then((data) => {
				showSuccessSnackbar();
				updateDomainCache(data);
				setMaxAccountValue('');
			})
			.catch(showErrorSnackbar);

		if (!isOverride) {
			grantCosRights(cId);
		}
	};

	onSaveCosLinkToDomainRef.current = onSaveCosLinkToDomain;

	const onDuplicate = (cId: string, cosMaxAccValue: string, cosName: string): void => {
		if (!cId || !cosMaxAccValue) {
			return;
		}
		const newName = `${cosName}.${domainName}`;
		copyCos(newName, cId)
			.then((data) => {
				const cosDetail = data?.cos?.[0];
				getCosLists('');
				setTimeout(() => {
					onSaveCosLinkToDomainRef.current?.(cosDetail?.id ?? '', cosMaxAccValue);
				}, 1500);
			})
			.catch(showErrorSnackbar);
	};

	const onRemoveCosLinkToDomain = (cId: string, cosMaxAccValue: string): void => {
		if (!cId || !cosMaxAccValue) {
			return;
		}

		const body: ModifyDomainBody = {
			id: domainId,
			_jsns: ZIMBRA_ADMIN_URN,
			a: [
				{
					n: '-zimbraDomainCOSMaxAccounts',
					_content: `${cId}:${cosMaxAccValue}`
				}
			]
		};

		modifyDomain(body)
			.then((data) => {
				showSuccessSnackbar();
				updateDomainCache(data);
				setMaxAccountValue('');
			})
			.catch(showErrorSnackbar);

		revokeCosRights(cId);
	};

	const markAsDefaultCos = (cId: string): void => {
		if (!cId) {
			return;
		}

		const body: ModifyDomainBody = {
			id: domainId,
			_jsns: ZIMBRA_ADMIN_URN,
			a: [
				{
					n: 'zimbraDomainDefaultCOSId',
					_content: cId
				}
			]
		};

		modifyDomain(body)
			.then((data) => {
				showSuccessSnackbar();
				updateDomainCache(data);
			})
			.catch(showErrorSnackbar);
	};

	// Derive domainCosMaxAccountList from props and cosList
	const domainCosMaxAccountList: CosMaxAccountValues[] = cosMaxAccountList.map((item) => ({
		id: item.id,
		name: cosList.find((c) => c.id === item.id)?.name,
		value: item.value
	}));

	// Generate table rows
	const cosMaxAccountListRow = domainCosMaxAccountList.map((item, index) => ({
		id: index.toString(),
		columns: [
			<Container crossAlignment="flex-start" mainAlignment="center" key={`name-${item.id}`}>
				<ds-text as="span" size="medium" weight="light" color="gray0">
					{item?.name}
				</ds-text>
			</Container>,
			<Container crossAlignment="flex-start" mainAlignment="center" key={`value-${item.id}`}>
				<ds-text as="span" size="medium" weight="light" color="gray0">
					{item?.value}
				</ds-text>
			</Container>,
			<Container key={`default-${item.id}`}>
				{defaultCosId === item.id && (
					<Row>
						<Padding right="small">
							<ds-text as="span" size="medium" weight="light" color="gray0">
								{t('label.default_cos', 'Default COS')}
							</ds-text>
						</Padding>
						<ds-icon icon="Star" color="primary"></ds-icon>
					</Row>
				)}
			</Container>
		],
		hoverContent:
			defaultCosId !== item.id && isGlobalAdmin ? (
				<Container>
					<Row>
						<Padding right="small">
							<ds-text as="span">{t('label.set_as_default', 'Set as Default')}</ds-text>
						</Padding>
						<Padding right="small">
							<ds-icon
								icon="StarOutline"
								color="primary"
								onClick={(event: { stopPropagation: () => void }): void => {
									event.stopPropagation();
									markAsDefaultCos(item.id);
								}}
							></ds-icon>
						</Padding>
						<ds-icon
							icon="Close"
							color="primary"
							onClick={(event: { stopPropagation: () => void }): void => {
								event.stopPropagation();
								onRemoveCosLinkToDomain(item.id, item.value);
							}}
						></ds-icon>
					</Row>
				</Container>
			) : (
				''
			)
	}));

	const headers: TableHeader[] = [
		{
			id: 'cos_list',
			label: t('label.cos_list', 'Cos List'),
			width: '35%',
			bold: true
		},
		{
			id: 'accounts',
			label: t('label.how_many_accounts_handled', 'How many accounts are handled? (-1 if unlimited)'),
			width: '45%',
			bold: true
		},
		{
			id: 'description',
			label: '',
			width: '20%',
			bold: true
		}
	];

	const customIconDetail = {
		icon: isCosListExpand ? ('ArrowIosUpward' as const) : ('ArrowIosDownwardOutline' as const),
		onClick: (): void => {
			setIsCosListExpand(!isCosListExpand);
		},
		style: {
			width: '1.25rem',
			height: '1.25rem'
		}
	};

	const items =
		cosList.length > MAX_COS_DISPLAY
			? [
					{
						customComponent: (
							<>
								<Row mainAlignment="flex-start">
									<Padding horizontal="small">
										<ds-icon
											icon="InfoOutline"
											style={{ width: '1.25rem', height: '1.25rem' }}
										></ds-icon>
									</Padding>
								</Row>
								<Row
									mainAlignment="flex-start"
									width="100%"
									padding={{
										all: 'small'
									}}
								>
									<ds-text as="p" overflow="break-word">
										{t(
											'many_cos_info_msg',
											'So many COSes! Which one would you like to see? Start typing to filter.'
										)}
									</ds-text>
								</Row>
							</>
						)
					}
				]
			: cosList.map((cos) => ({
					id: cos.id,
					label: cos.name,
					customComponent: (
						<Row
							style={{
								display: 'block',
								textAlign: 'left',
								height: 'inherit',
								padding: '0.188rem',
								width: 'inherit'
							}}
							onClick={(): void => {
								selectedCos(cos);
							}}
						>
							{cos?.name}
						</Row>
					)
				}));

	return (
		<Container height="fit" crossAlignment="flex-start" background="gray6">
			<Row
				orientation="horizontal"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				width="100%"
				padding={{ top: 'large', bottom: 'large' }}
			>
				<ds-text as="h3" size="medium" weight="bold" color="gray0">
					{t('label.class_of_service', 'Class of Service (cos)')}
				</ds-text>
			</Row>
			{isGlobalAdmin && (
				<ListRow>
					<Container padding={{ all: 'small' }}>
						<DropDownInput
							items={items}
							inputLabel={t(
								'cos.select_cos_to_include_in_domain',
								'Select a COS to include in this domain'
							)}
							onChange={(ev: React.ChangeEvent<HTMLInputElement>): void => {
								setIsCosSelect(false);
								setSearchCosName(ev.target.value);
							}}
							inputValue={searchCosName}
							isCustomIcon
							customIconDetail={customIconDetail}
						/>
					</Container>

					<Container padding={{ all: 'small' }}>
						<Input
							label={t('label.handle_accounts', 'Handle Accounts (-1 if unlimited)')}
							value={maxAccountValue}
							backgroundColor="gray6"
							type="number"
							onKeyDown={(e: KeyboardEvent<HTMLInputElement>): void => {
								if (
									![
										'Backspace',
										'Delete',
										'ArrowLeft',
										'ArrowRight',
										'0',
										'1',
										'2',
										'3',
										'4',
										'5',
										'6',
										'7',
										'8',
										'9',
										'-'
									].includes(e.key)
								) {
									e.preventDefault();
								}
							}}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								const value = Number.parseInt(e.target.value, 10);
								if (value < -1) {
									setMaxAccountValue('-1');
								} else {
									setMaxAccountValue(e.target.value);
								}
							}}
						/>
					</Container>
					<Container
						crossAlignment="flex-end"
						padding={{ all: 'small' }}
						width="17%"
						minWidth="11.5rem"
					>
						<Row>
							<Padding right="large">
								<Button
									type="outlined"
									label={t('label.duplicate', 'Duplicate')}
									color="primary"
									onClick={(event: { stopPropagation: () => void }): void => {
										event.stopPropagation();
										onDuplicate(cosId, maxAccountValue, searchCosName);
									}}
								/>
							</Padding>
							<Button
								type="outlined"
								label={t('label.link', 'Link')}
								color="primary"
								onClick={(event: { stopPropagation: () => void }): void => {
									event.stopPropagation();
									onSaveCosLinkToDomain(cosId, maxAccountValue);
								}}
							/>
						</Row>
					</Container>
				</ListRow>
			)}
			<Row mainAlignment="flex-start" width="100%" padding={{ all: 'small' }}>
				<Table
					rows={cosMaxAccountListRow}
					headers={headers}
					showCheckbox={isGlobalAdmin}
					multiSelect={false}
					style={{ overflow: 'auto', height: '100%' }}
					RowFactory={HoverableRowFactory}
					HeaderFactory={CustomHeaderFactory}
				/>
				{cosMaxAccountListRow.length === 0 && (
					<Container
						crossAlignment="center"
						mainAlignment="flex-start"
						style={{ marginTop: '1rem' }}
					>
						<Padding all="medium" width="30.875rem">
							<ds-text
								as="p"
								color="gray1"
								overflow="break-word"
								weight="regular"
								size="large"
								style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
							>
								{t(
									'label.cos_not_included_for_domain_notes',
									'There are not COS included for this domain, please select one from the dropwdown menu and click on "DUPLICATE" or "LINK"'
								)}
							</ds-text>
						</Padding>
					</Container>
				)}
			</Row>
		</Container>
	);
};

export default DomainCosLink;
