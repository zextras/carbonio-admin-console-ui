/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
	Container,
	Row,
	Text,
	Icon,
	Padding,
	Button,
	Input,
	Table,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	postSoapFetchRequest,
	useUserSettings
} from '@zextras/carbonio-shell-ui';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Attribute } from '../../../../types/attribute';
import { Cos } from '../../../../types/cos';
import { CosMaxAccountValues } from '../../../../types/domain';
import { HELPDESK_ADMINS, MAX_COS_DISPLAY, TRUE } from '../../../constants';
import { copyCos } from '../../../services/copy-cos-service';
import { modifyDomain } from '../../../services/modify-domain-service';
import { getCosList } from '../../../services/search-cos-service';
import { useDomainStore } from '../../../store/domain/store';
import CustomHeaderFactory from '../../app/shared/customTableHeaderFactory';
import HoverContentRowFactory from '../../app/shared/hoverContentRowFactory';
import DropDownInput from '../../components/dropDownInput';
import ListRow from '../../list/list-row';

const SelectItem = styled(Row)``;

const CustomIcon = styled(Icon)`
	width: 1.25rem;
	height: 1.25rem;
`;
const DomainCosLink: FC<{
	cosMaxAccountList: Array<CosMaxAccountValues>;
	defaultCosId: string;
	domainId: string;
	domainName: string;
}> = ({ cosMaxAccountList, defaultCosId, domainId, domainName }) => {
	const [t] = useTranslation();
	const [isCosSelect, setIsCosSelect] = useState(false);
	const [cosList, setCosList] = useState<Array<Cos>>([]);
	const [isCosListExpand, setIsCosListExpand] = useState(false);
	const [searchCosName, setSearchCosName] = useState('');
	const [cosId, setCosId] = useState('');
	const [maxAccountValue, setMaxAccountValue] = useState('');
	const [domainCosMaxAccountList, setDomainCosMaxAccountList] = useState<Array<any>>([]);
	const [cosMaxAccountListRow, setCosMaxAccountListRow] = useState<Array<any>>([]);
	const setDomain = useDomainStore((state) => state.setDomain);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const userSetting = useUserSettings();
	const [isGlobalAdmin, setIsGlobalAdmin] = useState<boolean>(false);
	useEffect(() => {
		if (userSetting?.attrs) {
			const account = userSetting?.attrs?.zimbraIsAdminAccount;
			if (account && account === TRUE) {
				setIsGlobalAdmin(true);
			}
		}
	}, [userSetting?.attrs]);

	const customIconDetail = {
		icon: isCosListExpand ? 'ArrowIosUpward' : 'ArrowIosDownwardOutline',
		onClick: (): void => {
			setIsCosListExpand(!isCosListExpand);
		},
		style: {
			width: '1.25rem',
			height: '1.25rem'
		}
	};

	useEffect(() => {
		const domainMaxAccountList: Array<CosMaxAccountValues> = [];
		cosMaxAccountList.forEach((item) => {
			domainMaxAccountList.push({
				id: item?.id,
				name: cosList.find((c) => c.id === item.id)?.name,
				value: item?.value
			});
		});
		if (domainMaxAccountList.length > 0) {
			setDomainCosMaxAccountList(domainMaxAccountList);
		} else {
			setDomainCosMaxAccountList([]);
		}
	}, [cosMaxAccountList, cosList]);

	const getCosLists = (cos: string): any => {
		getCosList(cos, 0).then((data) => {
			const searchResponse: any = data;
			if (!!searchResponse && searchResponse?.searchTotal > 0) {
				setCosList(searchResponse?.cos);
			} else {
				setCosList([]);
			}
		});
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchCosCall = useCallback(
		debounce((cos) => {
			getCosLists(cos);
		}, 700),
		[debounce]
	);

	useEffect(() => {
		if (!isCosSelect) {
			searchCosCall(searchCosName);
		}
	}, [searchCosName, isCosSelect, searchCosCall]);

	const selectedCos = useCallback((cos: any) => {
		setIsCosSelect(true);
		setSearchCosName(cos?.name);
		setIsCosListExpand(false);
		setCosId(cos?.id);
	}, []);

	const onSaveCosLinkToDomain = useCallback(
		(cId: string, cosMaxAccValue: string): void => {
			if (!cId || !cosMaxAccValue) {
				return;
			}
			const body: {
				id?: string;
				_jsns?: string;
				a?: { n: string; _content?: string }[];
			} = {};
			const attributes: Attribute[] = [];
			body.id = domainId;
			// eslint-disable-next-line sonarjs/no-duplicate-string
			body._jsns = 'urn:zimbraAdmin';
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

			body.a = attributes;
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
			modifyDomain(body)
				.then((data) => {
					createSnackbar({
						key: 'success',
						type: 'success',
						// eslint-disable-next-line sonarjs/no-duplicate-string
						label: t('label.change_save_success_msg', 'The change has been saved successfully'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
					const domain: any = data?.domain[0];
					if (domain) {
						setDomain(domain);
					}
					setMaxAccountValue('');
				})
				.catch((error) => {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: error?.message
							? error?.message
							: // eslint-disable-next-line sonarjs/no-duplicate-string
							  t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				});
			// If it override that case no need to assign further rights
			if (!isOverride) {
				postSoapFetchRequest(
					`/service/admin/soap/GrantRightRequest`,
					{
						_jsns: 'urn:zimbraAdmin',
						target,
						grantee,
						right: {
							_content: 'getCos'
						}
					},
					'GrantRightRequest'
				).then(() => {
					postSoapFetchRequest(
						`/service/admin/soap/GrantRightRequest`,
						{
							_jsns: 'urn:zimbraAdmin',
							target,
							grantee,
							right: {
								_content: 'listCos'
							}
						},
						'GrantRightRequest'
						// eslint-disable-next-line @typescript-eslint/no-empty-function
					).then(() => {
						postSoapFetchRequest(
							`/service/admin/soap/GrantRightRequest`,
							{
								_jsns: 'urn:zimbraAdmin',
								target,
								grantee,
								right: {
									_content: 'assignCos'
								}
							},
							'GrantRightRequest'
							// eslint-disable-next-line @typescript-eslint/no-empty-function
						).then(() => {});
					});
				});
			}
		},
		[cosMaxAccountList, createSnackbar, domainId, domainName, setDomain, t]
	);

	const onDuplicate = useCallback(
		(cId: string, cosMaxAccValue: string, cosName: string): void => {
			if (!cId || !cosMaxAccValue) {
				return;
			}
			const newName = `${cosName}.${domainName}`;
			copyCos(newName, cId)
				.then((data) => {
					const cosDetail = data?.cos[0];
					getCosLists('');
					setTimeout(() => {
						onSaveCosLinkToDomain(cosDetail?.id, cosMaxAccValue);
					}, 1500);
				})
				.catch((error) => {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: error?.message
							? error?.message
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				});
		},
		[createSnackbar, domainName, t, onSaveCosLinkToDomain]
	);

	const onRemoveCosLinkToDomain = useCallback(
		(cId: string, cosMaxAccValue: string): void => {
			if (!cId || !cosMaxAccValue) {
				return;
			}
			const body: {
				id?: string;
				_jsns?: string;
				a?: { n: string; _content?: string }[];
			} = {};
			const attributes: Attribute[] = [];
			body.id = domainId;
			body._jsns = 'urn:zimbraAdmin';
			attributes.push({
				n: '-zimbraDomainCOSMaxAccounts',
				_content: `${cId}:${cosMaxAccValue}`
			});
			body.a = attributes;
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
			modifyDomain(body)
				.then((data) => {
					createSnackbar({
						key: 'success',
						type: 'success',
						label: t('label.change_save_success_msg', 'The change has been saved successfully'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
					const domain: any = data?.domain[0];
					if (domain) {
						setDomain(domain);
					}
					setMaxAccountValue('');
				})
				.catch((error) => {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: error?.message
							? error?.message
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				});
			postSoapFetchRequest(
				`/service/admin/soap/RevokeRightRequest`,
				{
					_jsns: 'urn:zimbraAdmin',
					target,
					grantee,
					right: {
						_content: 'getCos'
					}
				},
				'RevokeRightRequest'
			).then(() => {
				postSoapFetchRequest(
					`/service/admin/soap/RevokeRightRequest`,
					{
						_jsns: 'urn:zimbraAdmin',
						target,
						grantee,
						right: {
							_content: 'listCos'
						}
					},
					'RevokeRightRequest'
					// eslint-disable-next-line @typescript-eslint/no-empty-function
				).then(() => {
					postSoapFetchRequest(
						`/service/admin/soap/RevokeRightRequest`,
						{
							_jsns: 'urn:zimbraAdmin',
							target,
							grantee,
							right: {
								_content: 'assignCos'
							}
						},
						'RevokeRightRequest'
						// eslint-disable-next-line @typescript-eslint/no-empty-function
					).then(() => {});
				});
			});
		},
		[createSnackbar, domainId, domainName, setDomain, t]
	);

	const markAsDefaultCos = useCallback(
		(cId: string): void => {
			if (!cId) {
				return;
			}
			const body: {
				id?: string;
				_jsns?: string;
				a?: { n: string; _content?: string }[];
			} = {};
			const attributes: Attribute[] = [];
			body.id = domainId;
			body._jsns = 'urn:zimbraAdmin';
			attributes.push({
				n: 'zimbraDomainDefaultCOSId',
				_content: `${cId}`
			});
			body.a = attributes;
			modifyDomain(body)
				.then((data) => {
					createSnackbar({
						key: 'success',
						type: 'success',
						label: t('label.change_save_success_msg', 'The change has been saved successfully'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
					const domain: any = data?.domain[0];
					if (domain) {
						setDomain(domain);
					}
				})
				.catch((error) => {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: error?.message
							? error?.message
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				});
		},
		[createSnackbar, domainId, setDomain, t]
	);

	const removeCosLinkRows = useCallback(
		(item: CosMaxAccountValues) => {
			if (item) {
				onRemoveCosLinkToDomain(item?.id, item?.value);
			}
		},
		[onRemoveCosLinkToDomain]
	);

	const markAsDefaultCosToDomain = useCallback(
		(cId: string) => {
			if (cId) {
				markAsDefaultCos(cId);
			}
		},
		[markAsDefaultCos]
	);

	const generateCosLinkTable = useCallback(
		(cosMaxAccValue: Array<CosMaxAccountValues>, defaultDomainCosId?: string): void => {
			if (cosMaxAccValue) {
				const cosLinkRows: Array<any> = [];
				cosMaxAccValue.forEach((item: CosMaxAccountValues, index) => {
					cosLinkRows.push({
						id: index.toString(),
						columns: [
							<Container crossAlignment="flex-start" mainAlignment="center" key={index}>
								<Text size="medium" weight="light" color="gray0">
									{item?.name}
								</Text>
							</Container>,
							<Container crossAlignment="flex-start" mainAlignment="center" key={index}>
								<Text size="medium" weight="light" color="gray0">
									{item?.value}
								</Text>
							</Container>,
							<Container key={index}>
								{defaultDomainCosId === item.id && (
									<Row>
										<Padding right="small">
											<Text size="medium" weight="light" color="gray0">
												{t('label.default_cos', 'Default COS')}
											</Text>
										</Padding>
										<Icon icon="Star" color="primary" />
									</Row>
								)}
							</Container>
						],
						hoverContent:
							defaultDomainCosId !== item.id && isGlobalAdmin ? (
								<Container>
									<Row>
										<Padding right="small">
											<Text>{t('label.set_as_default', 'Set as Default')}</Text>
										</Padding>
										<Padding right="small">
											<Icon
												icon="StarOutline"
												color="primary"
												onClick={(event: { stopPropagation: () => void }): void => {
													event.stopPropagation();
													markAsDefaultCosToDomain(item?.id);
												}}
											/>
										</Padding>
										<Icon
											icon="Close"
											color="primary"
											onClick={(event: { stopPropagation: () => void }): void => {
												event.stopPropagation();
												removeCosLinkRows(item);
											}}
										/>
									</Row>
								</Container>
							) : (
								''
							)
					});
				});
				setCosMaxAccountListRow(cosLinkRows);
			} else {
				setCosMaxAccountListRow([]);
			}
		},
		[isGlobalAdmin, markAsDefaultCosToDomain, removeCosLinkRows, t]
	);

	useEffect(() => {
		generateCosLinkTable(domainCosMaxAccountList, defaultCosId);
	}, [generateCosLinkTable, domainCosMaxAccountList, defaultCosId]);

	const headers: any[] = useMemo(
		() => [
			{
				id: 'cos_list',
				label: t('label.cos_list', 'Cos List'),
				width: '35%',
				bold: true
			},
			{
				id: 'accounts',
				label: t(
					'label.how_many_accounts_handled',
					'How many accounts are handled? (-1 if unlimited)'
				),
				width: '45%',
				bold: true
			},
			{
				id: 'description',
				label: '',
				width: '20%',
				bold: true
			}
		],
		[t]
	);

	const items =
		cosList.length > MAX_COS_DISPLAY
			? [
					{
						customComponent: (
							<>
								<Row mainAlignment="flex-start">
									<Padding horizontal="small">
										<CustomIcon icon="InfoOutline"></CustomIcon>
									</Padding>
								</Row>
								<Row
									mainAlignment="flex-start"
									width="100%"
									padding={{
										all: 'small'
									}}
								>
									<Text overflow="break-word">
										{t(
											'many_cos_info_msg',
											'So many COSes! Which one would you like to see? Start typing to filter.'
										)}
									</Text>
								</Row>
							</>
						)
					}
			  ]
			: cosList.map((cos: any, index) => ({
					id: cos.id,
					label: cos.name,
					customComponent: (
						<SelectItem
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
						</SelectItem>
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
				<Text size="medium" weight="bold" color="gray0">
					{t('label.class_of_service', 'Class of Service (cos)')}
				</Text>
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
							onKeyDown={(e): void => {
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
							onChange={(e: any): any => {
								if (e.target.value < -1) {
									setMaxAccountValue('-1');
								} else {
									setMaxAccountValue(e.target.value.toString());
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
					RowFactory={HoverContentRowFactory}
					HeaderFactory={CustomHeaderFactory}
				/>
				{cosMaxAccountListRow.length === 0 && (
					<Container
						crossAlignment="center"
						mainAlignment="flex-start"
						style={{ marginTop: '1rem' }}
					>
						<Padding all="medium" width="30.875rem">
							<Text
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
							</Text>
						</Padding>
					</Container>
				)}
			</Row>
		</Container>
	);
};

export default DomainCosLink;
