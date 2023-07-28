/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
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
import { debounce } from 'lodash';
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	postSoapFetchRequest
} from '@zextras/carbonio-shell-ui';
import { getCosList } from '../../../services/search-cos-service';
import { MAX_COS_DISPLAY } from '../../../constants';
import DropDownInput from '../../components/dropDownInput';
import { CosMaxAccountValues } from '../../../../types/domain';
import HoverContentRowFactory from '../../app/shared/hoverContentRowFactory';
import CustomHeaderFactory from '../../app/shared/customTableHeaderFactory';
import { Attribute } from '../../../../types/attribute';
import { useDomainStore } from '../../../store/domain/store';
import { modifyDomain } from '../../../services/modify-domain-service';

const SelectItem = styled(Row)``;

const CustomIcon = styled(Icon)`
	width: 1.25rem;
	height: 1.25rem;
`;
const DomainCosLink: FC<{
	cosMaxAccountValue: Array<CosMaxAccountValues>;
	defaultCosId: string;
	domainId: string;
	domainName: string;
}> = ({ cosMaxAccountValue, defaultCosId, domainId, domainName }) => {
	const [t] = useTranslation();
	const [isCosSelect, setIsCosSelect] = useState(false);
	const [cosList, setCosList] = useState([]);
	const [isCosListExpand, setIsCosListExpand] = useState(false);
	const [searchCosName, setSearchCosName] = useState('');
	const [cosId, setCosId] = useState('');
	const [maxAccountValue, setMaxAccountValue] = useState('');
	const [cosMaxAccountListRow, setCosMaxAccountListRow] = useState<Array<any>>([]);
	const setDomain = useDomainStore((state) => state.setDomain);
	const createSnackbar: any = useContext(SnackbarManagerContext);

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

	const getCosLists = (cos: string): any => {
		getCosList(cos).then((data) => {
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

	const onSaveCosLinkToDomain = (): void => {
		const requests = [];
		if (!cosId || !maxAccountValue) {
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
		const isOverride = cosMaxAccountValue.some((item) => item.id === cosId);
		if (isOverride) {
			cosMaxAccountValue.forEach((item) => {
				if (item.id !== cosId) {
					attributes.push({
						n: 'zimbraDomainCOSMaxAccounts',
						_content: `${item.id}:${item.value}`
					});
				}
			});
			attributes.push({
				n: 'zimbraDomainCOSMaxAccounts',
				_content: `${cosId}:${maxAccountValue}`
			});
		} else {
			attributes.push({
				n: '+zimbraDomainCOSMaxAccounts',
				_content: `${cosId}:${maxAccountValue}`
			});
		}

		body.a = attributes;
		const target = {
			_content: cosId,
			type: 'cos',
			by: 'id'
		};
		const grantee = {
			by: 'name',
			type: 'grp',
			_content: `__domain_admins@${domainName}`
		};
		requests.push(modifyDomain(body));
		requests.push(
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
			)
		);
		requests.push(
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
			)
		);
		Promise.all(requests)
			.then((response: any) => Promise.all(response))
			.then((data: any) => {
				// eslint-disable-next-line no-shadow
				let isError = false;
				let errorMessage = '';
				data.forEach((item: any) => {
					if (item?.Fault) {
						isError = true;
						errorMessage = item?.Fault?.Reason?.Text;
					}
				});
				if (isError) {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: errorMessage,
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				} else {
					const response: {
						a: Attribute[];
						id: string;
						name: string;
					} = data[0]?.domain[0];
					if (response) {
						setDomain(response);
					}
					createSnackbar({
						key: 'success',
						type: 'success',
						label: t('label.change_save_success_msg', 'The change has been saved successfully'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
					setIsCosSelect(false);
					setMaxAccountValue('');
				}
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: error.message
						? error.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	};

	const onRemoveCosLinkToDomain = useCallback(
		(cId: string, maxAccValue: string): void => {
			const requests = [];
			if (!cId || !maxAccValue) {
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
				_content: `${cId}:${maxAccValue}`
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
				_content: `__domain_admins@${domainName}`
			};
			requests.push(
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
				)
			);
			requests.push(
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
				)
			);
			requests.push(modifyDomain(body));
			Promise.all(requests)
				.then((response: any) => Promise.all(response))
				.then((data: any) => {
					// eslint-disable-next-line no-shadow
					let isError = false;
					let errorMessage = '';
					data.forEach((item: any) => {
						if (item?.Fault) {
							isError = true;
							errorMessage = item?.Fault?.Reason?.Text;
						}
					});
					if (isError) {
						createSnackbar({
							key: 'error',
							type: 'error',
							label: errorMessage,
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
					} else {
						const response: {
							a: Attribute[];
							id: string;
							name: string;
						} = data[2]?.domain[0];
						if (response) {
							setDomain(response);
						}
						createSnackbar({
							key: 'success',
							type: 'success',
							label: t('label.change_save_success_msg', 'The change has been saved successfully'),
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
					}
				})
				.catch((error) => {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: error.message
							? error.message
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
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
						label: t('label.domain_close_success_msg', 'Domain has been closed successfully'),
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
							defaultDomainCosId !== item.id ? (
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
		[markAsDefaultCosToDomain, removeCosLinkRows, t]
	);

	useEffect(() => {
		if (cosMaxAccountValue && defaultCosId) {
			generateCosLinkTable(cosMaxAccountValue, defaultCosId);
		}
	}, [generateCosLinkTable, cosMaxAccountValue, defaultCosId]);

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
								<Row takeAvwidth="fill" mainAlignment="flex-start">
									<Padding horizontal="small">
										<CustomIcon icon="InfoOutline"></CustomIcon>
									</Padding>
								</Row>
								<Row
									takeAvwidth="fill"
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
							top="0.563rem"
							right="large"
							bottom="0.563rem"
							left="large"
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
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
				<Container padding={{ all: 'small' }} width="48%">
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

				<Container padding={{ all: 'small' }} width="34%">
					<Input
						label={t('label.handle_accounts', 'Handle Accounts (-1 if unlimited)')}
						value={maxAccountValue}
						background="gray6"
						onChange={(e: any): any => {
							setMaxAccountValue(e.target.value);
						}}
					/>
				</Container>
				<Container crossAlignment="flex-end" padding={{ all: 'small' }} width="18%">
					<Row>
						<Padding right="medium">
							<Button
								type="outlined"
								label={t('label.duplicate', 'Duplicate')}
								color="primary"
								disabled
							/>
						</Padding>
						<Button
							type="outlined"
							label={t('label.link', 'Link')}
							color="primary"
							onClick={onSaveCosLinkToDomain}
						/>
					</Row>
				</Container>
			</Row>
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%" padding={{ all: 'small' }}>
				<Table
					rows={cosMaxAccountListRow}
					headers={headers}
					showCheckbox
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
								width="60%"
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
