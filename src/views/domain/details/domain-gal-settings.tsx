/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
	Container,
	Input,
	Row,
	Text,
	Divider,
	Button,
	Padding,
	SnackbarManagerContext,
	Dropdown,
	Select,
	Switch,
	Icon,
	Tooltip,
	Table
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { getAccount } from '../../../services/get-account-service';
import { getDatasource } from '../../../services/get-datasource-service';
import { modifyDomain } from '../../../services/modify-domain-service';
import { modifyDataSource } from '../../../services/modify-datasource-service';
import { useDomainStore } from '../../../store/domain/store';
import { RouteLeavingGuard } from '../../ui-extras/nav-guard';
import ListRow from '../../list/list-row';
import {
	FALSE,
	TRUE,
	INTERNAL_GAL,
	ZIMBRA,
	EXTERNAL_SERVER_EXAMPLE,
	LDAP_BIND_DN_LABLE,
	LDAP_FILTER_LABEL,
	LDAP_SEARCH_BASE_LABEL
} from '../../../constants';
import { modifyAccountRequest } from '../../../services/modify-account';
import { GalServerTableheaders, MeasureUnitItems } from '../../utility/utils';
import CustomRowFactory from '../../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../../app/shared/customTableHeaderFactory';
import CreateGalsyncAccountModel from './create-galsync-account-model';
import DistroyGalsyncAccountModel from './distroy-galsync-account-model';
import { destroyAccount } from '../../../services/destroy-account-service';
import { createGalSyncAccount } from '../../../services/create-gal-sync-service';
import {
	AccountDataType,
	Attribute,
	CreateSnackbarType,
	DomainDataType,
	IntervalType,
	Server,
	objectType
} from '../../../../types';
import { getDomainInformation } from '../../../services/domain-information-service';
import { useMailstoreListStore } from '../../../store/mailstore-list/store';
import { flushCache } from '../../../services/flush-cache-service';

// eslint-disable-next-line no-shadow
export enum RANGE {
	DAYS = 'd',
	HOURS = 'h',
	MINUTES = 'm',
	SECONDS = 's'
}

const ServerListTable: FC<{
	volumes: Array<AccountDataType>;
	selectedRows: number[];
	onSelectionChange: (selected: number[]) => void;
}> = ({ volumes, selectedRows, onSelectionChange }) => {
	const [t] = useTranslation();
	const tableRows = useMemo(
		() =>
			volumes.map((v, i) => ({
				id: i,
				columns: [
					<Tooltip placement="bottom" label={v?.name} key={i}>
						<Row style={{ textAlign: 'left', justifyContent: 'flex-start' }}>{v?.name}</Row>
					</Tooltip>,
					<Tooltip placement="bottom" label={v?.name} key={i}>
						<Row key={i} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
							{v?.galAccount !== null ? v?.galAccount?.name : '-'}
						</Row>
					</Tooltip>
				],
				clickable: true
			})),
		[volumes]
	);

	return (
		<Container mainAlignment="flex-start" crossAlignment="flex-start">
			<ListRow>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					width="fill"
					maxHeight="calc(100vh - 25rem)"
					minHeight="auto"
				>
					<Table
						headers={GalServerTableheaders(t)}
						rows={tableRows}
						showCheckbox={false}
						multiSelect={false}
						selectedRows={selectedRows}
						onSelectionChange={onSelectionChange}
						RowFactory={CustomRowFactory}
						HeaderFactory={CustomHeaderFactory}
					/>
				</Container>
			</ListRow>
			{tableRows.length === 0 && (
				<Container crossAlignment="center" mainAlignment="flex-start" style={{ marginTop: '1rem' }}>
					<Padding all="medium" width="30.875rem">
						<Text
							color="gray0"
							overflow="break-word"
							weight="normal"
							size="large"
							width="60%"
							style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
						>
							{t('label.empty_table', 'Empty Table')}
						</Text>
					</Padding>
				</Container>
			)}
		</Container>
	);
};

const DomainGalSettings: FC = () => {
	const [t] = useTranslation();
	const measureUnitItems = useMemo(() => MeasureUnitItems(t), [t]);
	const createSnackbar: (options: CreateSnackbarType) => void = useContext(SnackbarManagerContext);
	const domain: { name?: string } = useDomainStore((state) => state.domain);
	const { allMailstoreList } = useMailstoreListStore((state) => state);
	const { domainId }: { domainId: string } = useParams();

	const [open, setOpen] = useState<boolean>(false);
	const [domainInformation, setDomainInformation] = useState(
		useDomainStore((state) => state.domain?.a)
	);

	const onClose = useCallback(() => {
		setOpen(false);
	}, []);
	const onOpen = useCallback(() => {
		setOpen(true);
	}, []);
	const rangeItems = useMemo(
		() => [
			{
				label: t('label.days', 'Days'),
				value: RANGE.DAYS
			},
			{
				label: t('label.hours', 'Hours'),
				value: RANGE.HOURS
			},
			{
				label: t('label.minutes', 'Minutes'),
				value: RANGE.MINUTES
			},
			{
				label: t('label.seconds', 'Seconds'),
				value: RANGE.SECONDS
			}
		],
		[t]
	);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [domainData, setDomainData] = useState<{
		[key: string]: string;
	}>({
		zimbraGalMaxResults: '',
		zimbraGalAccountId: '',
		zimbraGalMode: '',
		zimbraDataSourcePollingInterval: '',
		zimbraGalLdapPageSize: '',
		zimbraGalLdapURL: '',
		zimbraGalLdapStartTlsEnabled: FALSE,
		zimbraGalLdapSearchBase: '',
		zimbraGalLdapFilter: '',
		zimbraGalLdapBindDn: '',
		zimbraGalLdapBindPassword: '',
		zimbraGalLdapAuthMech: 'none',
		zimbraDataSourceGalPollingInterval: ''
	});
	const [zimbraGalMode, setZimbraGalMode] = useState<string>('');
	const [zimbraGalMaxResults, setZimbraGalMaxResults] = useState<string>('');
	const [zimbraDataSourceGalPollingInterval, setZimbraDataSourceGalPollingInterval] =
		useState<string>('');
	const [zimbraGalLdapPageSize, setZimbraGalLdapPageSize] = useState<string>('');
	const [zimbraGalAccountId, setZimbraGalAccountId] = useState<string>('');
	const [zimbraGalLdapStartTlsEnabled, setZimbraGalLdapStartTlsEnabled] = useState<{
		init: boolean;
		current: boolean;
	}>({
		init: false,
		current: false
	});
	const [zimbraGalLdapAuthMech, setZimbraGalLdapAuthMech] = useState<boolean>(false);
	const [zimbraGalAccountName, setZimbraGalAccountName] = useState<string>('');
	const [mailServerName, setMailServerName] = useState<string>('');
	const [zimbraDataSourcePollingInterval, setZimbraDataSourcePollingInterval] =
		useState<string>('');
	const [pollingIntervalValue, setPollingIntervalValue] = useState<string>('');
	const [pollingIntervalType, setPollingIntervalType] = useState<IntervalType | undefined>(
		rangeItems[0]
	);
	const setDomain = useDomainStore((state) => state.setDomain);
	const [dataSourceName, setDataSourceName] = useState<string>('');
	const [measureUnitSelection, setMeasureUnitSelection] = useState<
		string | IntervalType | undefined
	>('');

	const [zimbraGalAccountIdArray, setZimbraGalAccountIdArray] = useState<
		{
			n: string;
			_content: string;
		}[]
	>([]);
	const [zimbraAccountDataSourceId, setZimbraAccountDataSourceId] = useState<object[]>([]);
	const [freqValue, setFreqValue] = useState<{
		digits: string;
		time: string;
	}>({
		digits: '1',
		time: 'm'
	});
	const [serverSelection, setServerSelection] = useState<number[]>([]);
	const [toggleCreateGalSyncAccModel, setToggleCreateGalSyncAccModel] = useState<boolean>(false);
	const [toggleDestroyGalSyncAccModel, setToggleDestroyGalSyncAccModel] = useState<boolean>(false);
	const [isDistroyBtnDisable, setIsDistroyBtnDisable] = useState<boolean>(true);
	const [isCreateAccBtnDisable, setIsCreateAccBtnDisable] = useState<boolean>(true);
	const [openAccModel, setOpenAccModel] = useState<boolean>(false);
	const [openDistroyModel, setOpenDistroyModel] = useState<boolean>(false);
	const [serverList, setServerList] = useState<AccountDataType[]>([]);

	const closeHandler = (): void => {
		setOpenAccModel(false);
		setOpenDistroyModel(false);
	};

	const changeGalModeBtnItems = [
		{
			id: 'internal',
			label: t('domain.gal_change_mode_internal', 'Internal'),
			value: 'zimbra',
			click: (ev: React.ChangeEvent<HTMLInputElement>): void => {
				setDomainData({ ...domainData, zimbraGalMode: 'zimbra' });
				if (ev?.target?.value !== domainData?.zimbraGalMode) {
					setIsDirty(true);
				}
			}
		},
		{
			id: 'external',
			label: t('domain.gal_change_mode_external', 'External'),
			value: 'ldap',
			click: (ev: React.ChangeEvent<HTMLInputElement>): void => {
				setDomainData({ ...domainData, zimbraGalMode: 'ldap' });
				if (ev?.target?.value !== domainData?.zimbraGalMode) {
					setIsDirty(true);
				}
			}
		}
	];

	const updateFreqValues = useCallback(
		(obj: DomainDataType | objectType) => {
			const val = obj?.zimbraDataSourceGalPollingInterval || zimbraDataSourceGalPollingInterval;
			setZimbraDataSourceGalPollingInterval(val);
			setDomainData({
				...domainData,
				zimbraDataSourceGalPollingInterval: val
			});
			const splitText = val.split(/(\d+)/);
			setFreqValue({
				digits: splitText[1],
				time: splitText[2]
			});

			const measureUnitObject: IntervalType | undefined = measureUnitItems?.find(
				(item: objectType) => item?.value === splitText[2]
			);
			setMeasureUnitSelection(measureUnitObject);
		},
		[domainData, measureUnitItems, zimbraDataSourceGalPollingInterval]
	);

	const getGalAccount = (accountId: string): void => {
		getAccount(accountId).then((data) => {
			const galAccount: {
				a: Attribute[];
				id: string;
				name: string;
			} = data?.account[0];
			if (galAccount) {
				setZimbraGalAccountName(galAccount?.name);
				if (galAccount?.a) {
					const obj: objectType = {};
					galAccount?.a.forEach((item: Attribute) => {
						obj[item?.n] = item._content;
					});
					if (obj?.zimbraMailHost) {
						setMailServerName(obj?.zimbraMailHost);
					} else {
						setMailServerName('');
					}
					if (obj?.zimbraDataSourceGalPollingInterval) {
						updateFreqValues(obj);
					}
				}
			}
		});
	};

	const getDomainDataSource = (accountId: string): void => {
		getDatasource(accountId).then((data) => {
			const dataSource: {
				id: string;
				name: string;
				type: string;
				_attrs: objectType;
			} = data?.dataSource[0];
			if (dataSource && dataSource?.id) {
				// eslint-disable-next-line array-callback-return, consistent-return
				zimbraGalAccountIdArray.forEach((item) => {
					if (item._content === accountId) {
						zimbraAccountDataSourceId.push({
							id: item._content,
							dataSourceId: dataSource?.id
						});
					}
				});
				if (dataSource?._attrs && dataSource?._attrs?.zimbraDataSourcePollingInterval) {
					setZimbraDataSourcePollingInterval(dataSource?._attrs?.zimbraDataSourcePollingInterval);
				}
				if (dataSource?._attrs && dataSource?._attrs?.zimbraDataSourceName) {
					setDataSourceName(dataSource?._attrs?.zimbraDataSourceName);
				}
			} else {
				setZimbraDataSourcePollingInterval('');
				setDataSourceName('');
			}
		});
	};

	const updateDomainInformation = useCallback(
		(data) => {
			if (!!domainInformation && domainInformation.length > 0) {
				setZimbraGalAccountId('');
				setZimbraGalAccountName('');
				setZimbraDataSourcePollingInterval('');
				setDataSourceName('');
				const obj: {
					[key: string]: string;
				} = {};
				data.map((item: Attribute) => {
					obj[item?.n] = item._content;
					return '';
				});
				if (obj.zimbraGalMaxResults) {
					setZimbraGalMaxResults(obj.zimbraGalMaxResults);
				} else {
					obj.zimbraGalMaxResults = '';
					setZimbraGalMaxResults('');
				}

				if (obj.zimbraGalLdapPageSize) {
					setZimbraGalLdapPageSize(obj.zimbraGalLdapPageSize);
				} else {
					obj.zimbraGalLdapPageSize = '';
					setZimbraGalLdapPageSize('');
				}

				if (obj.zimbraGalAccountId) {
					// eslint-disable-next-line consistent-return, array-callback-return
					const result = domainInformation.filter((item) => item.n === 'zimbraGalAccountId');
					setZimbraGalAccountIdArray(result);
					setZimbraGalAccountId(obj.zimbraGalAccountId);
				} else {
					obj.zimbraGalAccountId = '';
					setZimbraGalAccountId('');
				}

				if (!obj.zimbraGalLdapURL) {
					obj.zimbraGalLdapURL = '';
				}

				if (!obj.zimbraGalLdapFilter) {
					obj.zimbraGalLdapFilter = '';
				}

				if (!obj.zimbraGalLdapSearchBase) {
					obj.zimbraGalLdapSearchBase = '';
				}

				if (!obj.zimbraGalLdapStartTlsEnabled) {
					obj.zimbraGalLdapStartTlsEnabled = FALSE;
					setZimbraGalLdapStartTlsEnabled({ init: false, current: false });
				} else if (obj.zimbraGalLdapStartTlsEnabled && obj.zimbraGalLdapStartTlsEnabled === TRUE) {
					setZimbraGalLdapStartTlsEnabled({ init: true, current: true });
				} else {
					setZimbraGalLdapStartTlsEnabled({ init: false, current: false });
				}

				if (!obj.zimbraGalLdapAuthMech) {
					obj.zimbraGalLdapAuthMech = 'none';
				} else {
					setZimbraGalLdapAuthMech(obj.zimbraGalLdapAuthMech !== 'none');
				}
				setDomainData(obj);
				setIsDirty(false);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[domainInformation]
	);

	useEffect(() => {
		if (zimbraGalAccountId !== '') {
			getGalAccount(zimbraGalAccountId);
			// eslint-disable-next-line array-callback-return
			zimbraGalAccountIdArray.forEach((items) => {
				getDomainDataSource(items?._content);
			});
		} else {
			setZimbraGalAccountName('');
			setMailServerName('');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [zimbraGalAccountId]);

	useMemo(() => {
		if (zimbraDataSourcePollingInterval !== '') {
			const rangeType = zimbraDataSourcePollingInterval.charAt(
				zimbraDataSourcePollingInterval.length - 1
			);
			setPollingIntervalValue(
				zimbraDataSourcePollingInterval.substring(0, zimbraDataSourcePollingInterval.length - 1)
			);
			if (rangeType && rangeType !== '') {
				const range: IntervalType | undefined = rangeItems.find(
					(item: IntervalType) => item.value === rangeType
				);
				setPollingIntervalType(range);
			}
		} else {
			setPollingIntervalType(rangeItems[0]);
			setPollingIntervalValue('');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [zimbraDataSourcePollingInterval, rangeItems]);

	const onCancel = (): void => {
		setZimbraGalMaxResults(domainData?.zimbraGalMaxResults);
		setZimbraGalLdapPageSize(domainData?.zimbraGalLdapPageSize);
		updateFreqValues(domainData);
		updateDomainInformation(domainInformation);
		if (zimbraGalAccountId !== '') {
			getGalAccount(zimbraGalAccountId);
		}
		if (zimbraGalAccountId !== '') {
			const rangeType = zimbraDataSourcePollingInterval.charAt(
				zimbraDataSourcePollingInterval.length - 1
			);
			if (rangeType && rangeType !== '') {
				const range: IntervalType | undefined = rangeItems.find(
					(item: IntervalType) => item.value === rangeType
				);
				setPollingIntervalType(range);
			}
			setPollingIntervalValue(
				zimbraDataSourcePollingInterval.substring(0, zimbraDataSourcePollingInterval.length - 1)
			);
		}
		// eslint-disable-next-line array-callback-return
		domainInformation?.map((item) => {
			if (item.n === 'zimbraGalLdapURL') {
				if (domainData?.zimbraGalLdapURL === item?._content) {
					setIsDirty(false);
				}
			}
		});
	};

	useEffect(() => {
		if (!isDirty) {
			// eslint-disable-next-line array-callback-return
			domainInformation?.map((item) => {
				if (
					item.n === 'zimbraGalLdapURL' ||
					item.n === 'zimbraGalLdapFilter' ||
					item.n === 'zimbraGalLdapSearchBase' ||
					item.n === 'zimbraGalLdapBindDn' ||
					item.n === 'zimbraGalLdapBindPassword' ||
					item.n === 'zimbraGalMaxResults' ||
					item.n === 'zimbraGalLdapPageSize'
				) {
					if (
						domainData?.zimbraGalLdapURL !== item?._content ||
						domainData?.zimbraGalLdapFilter !== item?._content ||
						domainData?.zimbraGalLdapSearchBase !== item?._content ||
						domainData?.zimbraGalLdapBindDn !== item?._content ||
						domainData?.zimbraGalLdapBindPassword !== item?._content ||
						domainData?.zimbraGalMaxResults !== item?._content ||
						domainData?.zimbraGalLdapPageSize !== item?._content
					) {
						updateDomainInformation(domainInformation);
					}
				}
			});
		}
	}, [
		domainData?.zimbraGalLdapBindDn,
		domainData?.zimbraGalLdapBindPassword,
		domainData?.zimbraGalLdapFilter,
		domainData?.zimbraGalLdapPageSize,
		domainData?.zimbraGalLdapSearchBase,
		domainData?.zimbraGalLdapURL,
		domainData?.zimbraGalMaxResults,
		domainInformation,
		isDirty,
		updateDomainInformation
	]);

	const onSave = (): void => {
		const requests = [];
		const body: {
			id?: string;
			_jsns?: string;
			a?: { n: string; _content?: string }[];
		} = {};
		let attributes: Attribute[] = [];
		body.id = domainData?.zimbraId;
		body._jsns = 'urn:zimbraAdmin';
		attributes.push({
			n: 'zimbraGalMaxResults',
			_content: zimbraGalMaxResults
		});
		attributes.push({
			n: 'zimbraGalLdapPageSize',
			_content: zimbraGalLdapPageSize
		});
		attributes.push({
			n: 'zimbraGalMode',
			_content: domainData?.zimbraGalMode
		});
		attributes.push({
			n: 'zimbraGalLdapURL',
			_content: domainData?.zimbraGalLdapURL
		});

		attributes.push({
			n: 'zimbraGalLdapStartTlsEnabled',
			_content: domainData?.zimbraGalLdapStartTlsEnabled
		});
		setZimbraGalLdapStartTlsEnabled({
			...zimbraGalLdapStartTlsEnabled,
			current: zimbraGalLdapStartTlsEnabled?.init
		});

		attributes.push({
			n: 'zimbraGalLdapFilter',
			_content: domainData?.zimbraGalLdapFilter
		});

		attributes.push({
			n: 'zimbraGalLdapSearchBase',
			_content: domainData?.zimbraGalLdapSearchBase
		});

		attributes.push({
			n: 'zimbraGalLdapBindDn',
			_content: domainData?.zimbraGalLdapBindDn
		});

		attributes.push({
			n: 'zimbraGalLdapBindPassword',
			_content: domainData?.zimbraGalLdapBindPassword
		});
		attributes.push({
			n: 'zimbraGalLdapAuthMech',
			_content: domainData?.zimbraGalLdapAuthMech
		});
		body.a = attributes;
		requests.push(modifyDomain(body));
		if (zimbraGalAccountId !== '') {
			if (zimbraGalAccountIdArray?.length !== 0 && zimbraAccountDataSourceId?.length !== 0) {
				// eslint-disable-next-line array-callback-return
				zimbraGalAccountIdArray.forEach((items) => {
					interface DataSourceId {
						dataSourceId?: string;
						id?: number;
					}

					const dataSourceId: DataSourceId[] = zimbraAccountDataSourceId?.filter(
						(item: { id?: string }) => item?.id === items?._content
					);

					const dataSourceBody: {
						id?: string;
						_jsns?: string;
						dataSource?: { id?: string; a?: { n: string; _content?: string }[] };
					} = {};
					dataSourceBody.id = items?._content;
					dataSourceBody._jsns = 'urn:zimbraAdmin';
					attributes = [];
					attributes.push({
						n: 'zimbraGalType',
						_content: domainData?.zimbraGalMode
					});
					attributes.push({
						n: 'zimbraDataSourcePollingInterval',
						_content: zimbraDataSourceGalPollingInterval
					});
					dataSourceBody.dataSource = {
						id: dataSourceId[0]?.dataSourceId,
						a: attributes
					};
					requests.push(modifyDataSource(dataSourceBody));
				});
			}
		}
		Promise.all(requests)
			.then((results) => Promise.all(results))
			.then((results) => {
				const response: {
					a: Attribute[];
					id: string;
					name: string;
				} = results[0]?.domain[0];
				if (response) {
					setDomain(response);
					updateDomainInformation(response?.a);
				}
				setIsDirty(false);
				createSnackbar({
					key: 'success',
					type: 'success',
					label: t('label.change_save_success_msg', 'The change has been saved successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
		if (zimbraGalAccountIdArray?.length !== 0) {
			// eslint-disable-next-line array-callback-return
			zimbraGalAccountIdArray.forEach((items) => {
				modifyAccountRequest(items?._content, {
					zimbraDataSourceGalPollingInterval
				}).catch((error) => {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: error?.message
							? error?.message
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 5000,
						hideButton: true,
						replace: true
					});
					updateFreqValues({});
				});
			});
		}
	};

	const onZimbraGalMaxResultChange = (ev: React.ChangeEvent<HTMLInputElement>): void => {
		setZimbraGalMaxResults(ev.target.value);
	};

	const onZimbraGalLdapPageSizeChange = (ev: React.ChangeEvent<HTMLInputElement>): void => {
		setZimbraGalLdapPageSize(ev.target.value);
	};

	const onZimbraGalLdapUrlChange = (ev: React.ChangeEvent<HTMLInputElement>): void => {
		setDomainData({ ...domainData, zimbraGalLdapURL: ev?.target?.value });
		setIsDirty(domainData?.zimbraGalLdapURL !== ev?.target?.value);
	};

	const onZimbraGalLdapStartTlsEnabledChange = (): void => {
		setZimbraGalLdapStartTlsEnabled({
			...zimbraGalLdapStartTlsEnabled,
			current: !zimbraGalLdapStartTlsEnabled?.current
		});
		setDomainData({
			...domainData,
			zimbraGalLdapStartTlsEnabled: domainData?.zimbraGalLdapStartTlsEnabled === TRUE ? FALSE : TRUE
		});
	};
	useEffect(() => {
		if (
			domainData?.zimbraGalMaxResults !== zimbraGalMaxResults ||
			domainData?.zimbraGalLdapPageSize !== zimbraGalLdapPageSize
		) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}

		if (zimbraGalLdapStartTlsEnabled?.current !== zimbraGalLdapStartTlsEnabled?.init) {
			setIsDirty(true);
		}
		if (zimbraGalAccountId !== '' && pollingIntervalValue !== '') {
			if (
				zimbraDataSourcePollingInterval !== `${pollingIntervalValue}${pollingIntervalType?.value}`
			) {
				setIsDirty(true);
			}
		}
	}, [
		domainData?.zimbraGalLdapPageSize,
		domainData?.zimbraGalMaxResults,
		pollingIntervalType?.value,
		pollingIntervalValue,
		zimbraDataSourcePollingInterval,
		zimbraGalAccountId,
		zimbraGalLdapPageSize,
		zimbraGalLdapStartTlsEnabled,
		zimbraGalMaxResults
	]);

	const onFreqDigitsChange = useCallback(
		(ev) => {
			if (ev?.target?.value < 0 || ev?.target?.value > 9) {
				return;
			}
			setFreqValue({ digits: ev?.target?.value, time: freqValue.time });
			const measureUnitObject: IntervalType | undefined = measureUnitItems?.find(
				(item: IntervalType): boolean => item?.value === freqValue?.time
			);
			setMeasureUnitSelection(measureUnitObject);
			setZimbraDataSourceGalPollingInterval(`${ev?.target?.value}${freqValue.time}`);
			if (ev?.target?.value !== freqValue?.digits) {
				setIsDirty(true);
			}
		},
		[freqValue?.digits, freqValue.time, measureUnitItems]
	);

	const onFreqTimeUnitChange = useCallback(
		(ev: string) => {
			setFreqValue({ digits: freqValue.digits, time: ev });
			const measureUnitObject: IntervalType | undefined = measureUnitItems?.find(
				(item: IntervalType): boolean => item?.value === ev
			);
			setMeasureUnitSelection(measureUnitObject);
			if (ev) {
				setZimbraDataSourceGalPollingInterval(`${freqValue.digits}${ev}`);
			}
			if (ev !== freqValue?.time) {
				setIsDirty(true);
			}
		},
		[freqValue.digits, freqValue?.time, measureUnitItems]
	);

	const onZimbraGalLdapFilterChange = (ev: React.ChangeEvent<HTMLInputElement>): void => {
		setIsDirty(ev?.target?.value !== domainData?.zimbraGalLdapFilter);

		setDomainData({
			...domainData,
			zimbraGalLdapFilter: ev?.target?.value
		});
	};
	const onZimbraGalLdapSearchBaseChange = (ev: React.ChangeEvent<HTMLInputElement>): void => {
		setDomainData({
			...domainData,
			zimbraGalLdapSearchBase: ev?.target?.value
		});
		if (ev?.target?.value !== domainData?.zimbraGalLdapSearchBase) {
			setIsDirty(true);
		}
	};

	const onZimbraGalLdapBindDnChange = (ev: React.ChangeEvent<HTMLInputElement>): void => {
		setDomainData({
			...domainData,
			zimbraGalLdapBindDn: ev?.target?.value
		});
		if (ev?.target?.value !== domainData?.zimbraGalLdapBindDn) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	};
	const onZimbraGalLdapBindPasswordChange = (ev: React.ChangeEvent<HTMLInputElement>): void => {
		setDomainData({
			...domainData,
			zimbraGalLdapBindPassword: ev?.target?.value
		});
		if (ev?.target?.value !== domainData?.zimbraGalLdapBindPassword) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	};

	const onZimbraGalLdapAuthMechChange = (): void => {
		setIsDirty(true);
		setDomainData({
			...domainData,
			zimbraGalLdapAuthMech: domainData?.zimbraGalLdapAuthMech === 'none' ? 'simple' : 'none'
		});
	};

	useEffect(() => {
		if (domainData?.zimbraGalMode === '' || domainData?.zimbraGalMode === 'zimbra') {
			setZimbraGalMode('Internal');
		} else if (domainData?.zimbraGalMode === 'ldap') {
			setZimbraGalMode('External');
		} else {
			setZimbraGalMode('Both');
		}
	}, [domainData?.zimbraGalMode]);

	useEffect(() => {
		updateDomainInformation(domainInformation);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleClick = useCallback((i: number[], serverListData): void => {
		if (i.length !== 0) {
			if (serverListData[i[0]]?.galAccount === null) {
				setIsDistroyBtnDisable(true);
				setIsCreateAccBtnDisable(false);
			} else {
				setIsCreateAccBtnDisable(true);
				setIsDistroyBtnDisable(false);
			}
		} else {
			setIsDistroyBtnDisable(true);
			setIsCreateAccBtnDisable(true);
		}
	}, []);

	const getAllTableList = useCallback(
		(data) => {
			// eslint-disable-next-line array-callback-return
			const result = allMailstoreList.map((listItems: Server) => {
				const obj: AccountDataType = {};
				const matchingData = data.find(
					(galAccount: { accountData: { _content: string }[] }) =>
						listItems.name === galAccount?.accountData[0]?._content
				);
				obj.name = listItems?.name;
				obj.id = listItems?.id;
				obj.galAccount = matchingData
					? {
							server: matchingData?.accountData[0]?._content,
							name: matchingData?.name,
							id: matchingData?.id
					  }
					: null;
				return obj;
			});
			setServerList(result);
			handleClick(serverSelection, result);
		},
		[allMailstoreList, handleClick, serverSelection]
	);

	const getDomainWithGAlSyncList = useCallback(
		(domainList) => {
			const allDomains = domainList?.filter((item: Attribute) => item.n === 'zimbraGalAccountId');
			// eslint-disable-next-line array-callback-return
			const result: readonly unknown[] | [] = allDomains?.map((item: Attribute) =>
				getAccount(item?._content)
					.then((data) => {
						const galAccount: {
							a: Attribute[];
							id: string;
							name: string;
						} = data?.account[0];
						const accountData: Attribute[] = galAccount?.a?.filter(
							(account) => account?.n === 'zimbraMailHost'
						);

						const object = {
							accountData,
							name: galAccount?.name,
							id: galAccount?.id
						};
						return object;
					})
					// eslint-disable-next-line @typescript-eslint/no-empty-function
					.catch(() => {})
			);
			Promise.all(result).then((results) => {
				getAllTableList(results);
			});
		},
		[getAllTableList]
	);

	const getSelectedDomainInformation = useCallback(
		(id: string): void => {
			flushCache('all').then((result) => {
				if (result) {
					getDomainInformation(id).then((data) => {
						const domainList = data?.domain[0];
						if (domainList) {
							setDomain(domainList);
							setDomainInformation(domainList?.a);
							getDomainWithGAlSyncList(domainList?.a);
						}
					});
				}
			});
		},
		[getDomainWithGAlSyncList, setDomain]
	);

	const createHandler = (
		accountData: {
			id?: string;
			name: string;
			galAccount?: null;
		},
		galDomainName: string
	): void => {
		const attributes = [];
		const account = [];
		attributes.push({
			n: 'zimbraDataSourcePollingInterval',
			_content: '1d'
		});
		account.push({
			by: 'name',
			_content: `${galDomainName}.${accountData.name}@${domain?.name}`
		});
		createGalSyncAccount(INTERNAL_GAL, domain?.name, accountData.name, account, ZIMBRA, attributes)
			.then((res) => {
				if (res) {
					createSnackbar({
						key: 'success',
						type: 'success',
						label: t(
							'label.create_galsync_account_success_msg',
							'You have created the GALSync account name'
						),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				}
				getSelectedDomainInformation(domainId);
				setOpenAccModel(false);
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 5000,
					hideButton: true,
					replace: true
				});
			});
	};

	const deleteHandler = (destroyData: {
		id?: string;
		name?: string;
		galAccount: {
			id: string;
			name: string;
			server: string;
		};
	}): void => {
		destroyAccount(destroyData?.galAccount?.id)
			.then((res) => {
				if (res) {
					createSnackbar({
						key: 'success',
						type: 'success',
						label: t('label.changes_save_success_msg', 'Your changes has been saved!'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				}
				getSelectedDomainInformation(domainId);
				setOpenDistroyModel(false);
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 5000,
					hideButton: true,
					replace: true
				});
			});
	};

	useEffect(() => {
		getDomainWithGAlSyncList(domainInformation);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Container padding={{ all: 'large' }} background="gray6" mainAlignment="flex-start">
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
				<Container orientation="vertical" mainAlignment="space-around" height="4rem">
					<Row orientation="horizontal" width="100%">
						<Row
							padding={{ all: 'large' }}
							mainAlignment="flex-start"
							width="50%"
							crossAlignment="flex-start"
						>
							<Text size="medium" weight="bold" color="gray0">
								{t('label.global_address_list', 'Global Add`ress List')}
							</Text>
						</Row>
						<Row
							padding={{ all: 'large' }}
							width="50%"
							mainAlignment="flex-end"
							crossAlignment="flex-end"
						>
							<Padding right="small">
								{isDirty && (
									<Button
										label={t('label.cancel', 'Cancel')}
										color="secondary"
										onClick={onCancel}
									/>
								)}
							</Padding>
							{isDirty && (
								<Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
							)}
						</Row>
					</Row>
				</Container>
			</Row>
			<Divider />

			{/* new layout based on internal external mode */}
			<Container
				orientation="column"
				background="gray6"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				style={{ overflow: 'auto' }}
			>
				{toggleCreateGalSyncAccModel && (
					<CreateGalsyncAccountModel
						open={openAccModel}
						closeHandler={closeHandler}
						saveHandler={createHandler}
						accountData={serverList[serverSelection[0]]}
					/>
				)}
				{toggleDestroyGalSyncAccModel && (
					<DistroyGalsyncAccountModel
						open={openDistroyModel}
						closeHandler={closeHandler}
						saveHandler={deleteHandler}
						accountData={serverList[serverSelection[0]]}
					/>
				)}
				<Padding vertical="medium" />
				<Row orientation="horizontal" width="100%" background="gray6">
					<Row
						width="100%"
						mainAlignment="flex-end"
						orientation="horizontal"
						padding={{ top: 'extralarge', right: 'large', left: 'large' }}
						style={{ gap: '1rem' }}
					>
						<Button
							type="ghost"
							label={t('label.create_account_name', 'CREATE ACCOUNT NAME')}
							color="primary"
							onClick={(): void => {
								setToggleCreateGalSyncAccModel(true);
								setOpenAccModel(true);
							}}
							disabled={isCreateAccBtnDisable}
						/>
						<Button
							type="ghost"
							label={t('label.destroy', 'DELETE')}
							color="error"
							onClick={(): void => {
								setToggleDestroyGalSyncAccModel(true);
								setOpenDistroyModel(true);
							}}
							disabled={isDistroyBtnDisable}
						/>
					</Row>
				</Row>
				<Row padding={{ top: 'extralarge' }} width="100%">
					<ServerListTable
						volumes={serverList}
						selectedRows={serverSelection}
						onSelectionChange={(selected: number[]): void => {
							setServerSelection(selected);
							handleClick(selected, serverList);
						}}
					/>
				</Row>
				<Container
					orientation="column"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					width="100%"
					height="fit"
				>
					<Row
						takeAvwidth="fill"
						mainAlignment="flex-start"
						width="100%"
						padding={{ top: 'large' }}
					>
						<Container height="fit" crossAlignment="flex-start" background="gray6">
							<Row
								takeAvwidth="fill"
								mainAlignment="flex-start"
								width="100%"
								background="gray6"
								padding={{ all: 'small' }}
							>
								<Text size="small" weight="bold">
									{t('account_details.general', 'General')}
								</Text>
							</Row>
							<ListRow>
								<Container orientation="horizontal">
									<Container width="15rem" mainAlignment="flex-start">
										<Dropdown items={changeGalModeBtnItems} onOpen={onOpen} onClose={onClose}>
											<Button
												type="outlined"
												size="extralarge"
												label={t('label.change_to', 'CHANGE TO')}
												icon={open ? 'ChevronUp' : 'ChevronDown'}
											/>
										</Dropdown>
									</Container>
									<Padding left="small" width="100%">
										<Input
											label={t('label.gal_mode', 'GAL Mode')}
											value={zimbraGalMode}
											background="gray6"
											readOnly
										/>
									</Padding>
								</Container>
							</ListRow>
							<Container padding={{ all: 'small' }}>
								<Input
									type="number"
									label={t(
										'label.limit_search_results_from_address_book_list_to',
										'Limit search results from  Address Book List to'
									)}
									value={zimbraGalMaxResults}
									background="gray5"
									onChange={onZimbraGalMaxResultChange}
								/>
							</Container>
							<Container padding={{ all: 'small' }}>
								<Input
									type="number"
									label={t('domain.page_size', 'Page Size')}
									value={zimbraGalLdapPageSize}
									background="gray5"
									onChange={onZimbraGalLdapPageSizeChange}
								/>
							</Container>
						</Container>
					</Row>
				</Container>
				<Container
					orientation="column"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					width="100%"
					height="fit"
				>
					<Row
						takeAvwidth="fill"
						mainAlignment="flex-start"
						width="100%"
						padding={{ top: 'large' }}
					>
						<Container height="fit" crossAlignment="flex-start" background="gray6">
							<Row
								takeAvwidth="fill"
								mainAlignment="flex-start"
								width="100%"
								background="gray6"
								padding={{ all: 'small' }}
							>
								<Text size="small" weight="bold">
									{t('label.settings', 'Settings')}
								</Text>
							</Row>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('label.gal_update_frequencey_value', 'GAL Update Frequency (value)')}
										value={freqValue?.digits}
										background="gray5"
										onChange={onFreqDigitsChange}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Select
										items={measureUnitItems}
										background="gray5"
										label={t('label.interval', 'Interval')}
										onChange={onFreqTimeUnitChange}
										showCheckbox={false}
										selection={measureUnitSelection}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
				</Container>

				{domainData?.zimbraGalMode === 'ldap' && (
					<>
						<Container
							orientation="column"
							crossAlignment="flex-start"
							mainAlignment="flex-start"
							width="100%"
							height="fit"
						>
							<Row
								takeAvwidth="fill"
								mainAlignment="flex-start"
								width="100%"
								padding={{ top: 'large' }}
							>
								<Container height="fit" crossAlignment="flex-start" background="gray6">
									<Row
										takeAvwidth="fill"
										mainAlignment="flex-start"
										width="100%"
										background="gray6"
										padding={{ all: 'small' }}
									>
										<Text size="small" weight="bold">
											{t('label.ldap_url', 'LDAP Url')}
										</Text>
									</Row>
									<Row
										orientation="horizontal"
										mainAlignment="space-between"
										crossAlignment="center"
										width="fill"
										wrap="nowrap"
									>
										<Container padding={{ all: 'small' }}>
											<Input
												label={t('label.external_server_address', 'External Server Address')}
												value={domainData?.zimbraGalLdapURL}
												background="gray5"
												onChange={onZimbraGalLdapUrlChange}
												CustomIcon={({
													hasFocus
												}: {
													hasError: boolean;
													hasFocus: boolean;
													disabled: boolean;
												}): React.ReactElement => (
													<Tooltip
														placement="top"
														overflow="break-word"
														maxWidth="40rem"
														label={EXTERNAL_SERVER_EXAMPLE}
													>
														<Text>
															<Icon
																icon="InfoOutline"
																size="large"
																color={hasFocus ? 'primary' : 'text'}
															/>
														</Text>
													</Tooltip>
												)}
											/>
										</Container>

										<Container
											width="20%"
											orientation="horizontal"
											mainAlignment="flex-start"
											crossAlignment="center"
										>
											<Switch
												defaultChecked={zimbraGalLdapStartTlsEnabled?.current}
												onClick={onZimbraGalLdapStartTlsEnabledChange}
												label={t('label.user_ssl', 'Use SSL')}
												value={zimbraGalLdapStartTlsEnabled?.current}
											/>
										</Container>
									</Row>
									<Container padding={{ all: 'small' }}>
										<Input
											label={t('label.ldap_filter', 'LDAP Filter')}
											value={domainData?.zimbraGalLdapFilter}
											background="gray5"
											onChange={onZimbraGalLdapFilterChange}
											CustomIcon={({
												hasFocus
											}: {
												hasError: boolean;
												hasFocus: boolean;
												disabled: boolean;
											}): React.ReactElement => (
												<Tooltip
													placement="top"
													overflow="break-word"
													maxWidth="40rem"
													label={LDAP_FILTER_LABEL}
												>
													<Text>
														<Icon
															icon="InfoOutline"
															size="large"
															color={hasFocus ? 'primary' : 'text'}
														/>
													</Text>
												</Tooltip>
											)}
										/>
									</Container>
									<Container padding={{ all: 'small' }}>
										<Input
											label={t('label.ldap_search_base', 'LDAP Search Base')}
											value={domainData?.zimbraGalLdapSearchBase}
											background="gray5"
											onChange={onZimbraGalLdapSearchBaseChange}
											CustomIcon={({
												hasFocus
											}: {
												hasError: boolean;
												hasFocus: boolean;
												disabled: boolean;
											}): React.ReactElement => (
												<Tooltip
													placement="top"
													overflow="break-word"
													maxWidth="40rem"
													label={LDAP_SEARCH_BASE_LABEL}
												>
													<Text>
														<Icon
															icon="InfoOutline"
															size="large"
															color={hasFocus ? 'primary' : 'text'}
														/>
													</Text>
												</Tooltip>
											)}
										/>
									</Container>
								</Container>
							</Row>
						</Container>

						<Container height="fit" padding={{ all: 'small' }}>
							<Divider />
						</Container>

						<Container
							orientation="column"
							crossAlignment="flex-start"
							mainAlignment="flex-start"
							width="100%"
							height="fit"
						>
							<Row
								takeAvwidth="fill"
								mainAlignment="flex-start"
								width="100%"
								background="gray6"
								padding={{ all: 'small' }}
							>
								<Text size="small" weight="bold">
									{t('label.dn_settings', 'DN Settings')}
								</Text>
							</Row>
							<ListRow>
								<Container
									orientation="horizontal"
									mainAlignment="flex-start"
									crossAlignment="center"
									padding={{ all: 'small' }}
								>
									<Switch
										defaultChecked={zimbraGalLdapAuthMech}
										onClick={onZimbraGalLdapAuthMechChange}
										label={t(
											'label.use_dn_password_to_bind_external_server',
											'Use DN/Password to bind to external server'
										)}
									/>
								</Container>
							</ListRow>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('label.bind_dn', 'Bind DN')}
										value={domainData?.zimbraGalLdapBindDn}
										background="gray5"
										onChange={onZimbraGalLdapBindDnChange}
										CustomIcon={({
											hasFocus
										}: {
											hasError: boolean;
											hasFocus: boolean;
											disabled: boolean;
										}): React.ReactElement => (
											<Tooltip
												placement="top"
												overflow="break-word"
												maxWidth="40rem"
												label={LDAP_BIND_DN_LABLE}
											>
												<Text>
													<Icon
														icon="InfoOutline"
														size="large"
														color={hasFocus ? 'primary' : 'text'}
													/>
												</Text>
											</Tooltip>
										)}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('label.bind_password', 'Bind Password')}
										value={domainData?.zimbraGalLdapBindPassword}
										background="gray5"
										onChange={onZimbraGalLdapBindPasswordChange}
									/>
								</Container>
							</ListRow>
						</Container>
					</>
				)}
			</Container>
			<RouteLeavingGuard when={isDirty} onSave={onSave}>
				<Text>
					{t(
						'label.unsaved_changes_line1',
						'Are you sure you want to leave this page without saving?'
					)}
				</Text>
				<Text>{t('label.unsaved_changes_line2', 'All your unsaved changes will be lost')}</Text>
			</RouteLeavingGuard>
		</Container>
	);
};

export default DomainGalSettings;
