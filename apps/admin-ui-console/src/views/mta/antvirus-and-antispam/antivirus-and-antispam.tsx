/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useIsAdvanced } from '@zextras/admin-ui-bootstrap';
import { useAdminConfigStore } from '@zextras/admin-ui-bootstrap';
import {
	Container,
	Row,
	Text,
	Padding,
	Button,
	Divider,
	Switch,
	useSnackbar,
	Input,
	Select,
	Table,
	Modal,
	SelectItem
} from '@zextras/carbonio-design-system';
import { isEqual, find } from 'lodash';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { MtaAntivirusAndAntispam, TRow } from '../../../../types';
import {
	CARBONIO_CLAM_AV_DATABASE_CUSTOM_URL,
	D_DISCARD,
	D_PASS,
	FALSE,
	TRUE,
	ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION,
	ZIMBRA_AMAVIS_FINAL_SPAM_DESTINY,
	ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA,
	ZIMBRA_CLAM_AVDATABASE_MIRROR,
	ZIMBRA_SPAM_KILL_PERCENT,
	ZIMBRA_SPAM_SUBJECT_TAG,
	ZIMBRA_SPAM_TAG_PERCENT,
	ZIMBRA_VIRUS_BLOCK_ENCRYPTED_ARCHIVE,
	ZIMBRA_VIRUS_DEFINITIONS_UPDATE_FREQUENCY,
	ZIMBRA_VIRUS_WARN_ADMIN,
	ZIMBRA_VIRUS_WARN_RECIPIENT,
	CONFIG,
	CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK
} from '../../../constants';
import { modifyConfig } from '../../../services/modify-config';
import { useRightsStore, Right, Rights } from '../../../store/rights/store';
import CustomHeaderFactory from '../../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../../app/shared/customTableRowFactory';
import ListRow from '../../list/list-row';
import { isSpaceAvailableInString, isValidHostname } from '../../utility/utils';


const MTAAntiVirusAndAntiSpam: FC = () => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const configInformation = useAdminConfigStore((state) => state.config);
	const updateConfig = useAdminConfigStore((state) => state.updateConfig);
	const [mtaAntiVirusAndAntispamInitialDetail, setMtaAntiVirusAndAntispamInitialDetail] =
		useState<MtaAntivirusAndAntispam>();
	const [mtaAntiVirusAndAntispamDetail, setMtaAntiVirusAndAntispamDetail] =
		useState<MtaAntivirusAndAntispam>();
	const [antiVirusMirrorTableRow, setAntiVirusMirrorTableRow] = useState<Array<any>>([]);
	const [selectedAntivirusMirrors, setSelectedAntivirusMirrors] = useState<any[]>([]);
	const [antiVirusMirrorsAddText, setAntiVirusMirrorsAddText] = useState<string>('');
	const [additionalAntiVirusDefinitionTableRow, setAdditionalAntiVirusDefinitionTableRow] =
		useState<Array<any>>([]);
	const [selectedAdditionalAntivirusDefinition, setSelectedAdditionalAntivirusDefinition] =
		useState<any[]>([]);
	const [additionalAntiVirusDefinitionAddText, setAdditionalAntiVirusDefinitionAddText] =
		useState<string>('');
	const isAdvanced = useIsAdvanced();
	const [isShowRemoveAlertDialog, setIsShowRemoveAlertDialog] = useState<boolean>(false);
	const rights: Rights = useRightsStore((state) => state.rights);
	const removeConfigItems = useAdminConfigStore((state) => state.removeConfigItems);

	const allowSetMTA = useMemo(() => {
		const rightsConfig: Right = find(rights, { type: CONFIG }) || { all: [], type: CONFIG };
		return !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
	}, [rights]);

	const setInitialValue = useCallback((key: string, value: unknown): void => {
		setMtaAntiVirusAndAntispamInitialDetail((prev: any) => ({
			...prev,
			[key]: value
		}));
	}, []);

	const setValue = useCallback((key: string, value: unknown): void => {
		setMtaAntiVirusAndAntispamDetail((prev: any) => ({ ...prev, [key]: value }));
	}, []);

	const [updateFrequncy, setUpdateFrequncy] = useState<string>('');

	const setInitialAndCurrentValue = useCallback(
		(key: string, value: unknown) => {
			setInitialValue(key, value);
			setValue(key, value);
		},
		[setInitialValue, setValue]
	);

	const updateGlobalConfig = useCallback(
		(attributes: Array<Record<string, string>>): void => {
			attributes.forEach((ele: Record<string, string>) => {
				if (
					ele?.n !== CARBONIO_CLAM_AV_DATABASE_CUSTOM_URL &&
					ele?.n !== ZIMBRA_CLAM_AVDATABASE_MIRROR
				) {
					updateConfig(ele?.n, ele._content);
				}
			});
			removeConfigItems({ n: CARBONIO_CLAM_AV_DATABASE_CUSTOM_URL });
			removeConfigItems({ n: ZIMBRA_CLAM_AVDATABASE_MIRROR });
			const customURL = attributes.filter(
				(item) => item?.n === CARBONIO_CLAM_AV_DATABASE_CUSTOM_URL
			);
			if (customURL.length > 0) {
				updateConfig(
					CARBONIO_CLAM_AV_DATABASE_CUSTOM_URL,
					mtaAntiVirusAndAntispamDetail?.carbonioClamAVDatabaseCustomURL
				);
			}
			const avDatabaseMirror = attributes.filter(
				(item) => item?.n === ZIMBRA_CLAM_AVDATABASE_MIRROR
			);
			if (avDatabaseMirror.length > 0) {
				updateConfig(
					ZIMBRA_CLAM_AVDATABASE_MIRROR,
					mtaAntiVirusAndAntispamDetail?.zimbraClamAVDatabaseMirror
				);
			}
		},
		[
			mtaAntiVirusAndAntispamDetail?.carbonioClamAVDatabaseCustomURL,
			mtaAntiVirusAndAntispamDetail?.zimbraClamAVDatabaseMirror,
			removeConfigItems,
			updateConfig
		]
	);

	const modifyConfigRequest = useCallback(
		(attributes: Array<Record<string, string>>): void => {
			modifyConfig(attributes)
				.then((data) => {
					createSnackbar({
						key: 'success',
						severity: 'success',
						label: t('label.change_save_success_msg', 'The change has been saved successfully'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
					updateGlobalConfig(attributes);
				})
				.catch((error) => {
					createSnackbar({
						key: 'error',
						severity: 'error',
						label: error?.message
							? error?.message
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				});
		},
		[createSnackbar, t, updateGlobalConfig]
	);

	const setSaveValues = useCallback(
		(attributes: Array<Record<string, string>>) => {
			if (mtaAntiVirusAndAntispamDetail?.zimbraClamAVDatabaseMirror) {
				const calmDatabaseMirror =
					mtaAntiVirusAndAntispamDetail?.zimbraClamAVDatabaseMirror.split(',');
				if (calmDatabaseMirror.length > 0) {
					calmDatabaseMirror.forEach((item: string) => {
						attributes.push({
							n: ZIMBRA_CLAM_AVDATABASE_MIRROR,
							_content: item
						});
					});
				}
			} else if (mtaAntiVirusAndAntispamDetail?.zimbraClamAVDatabaseMirror === '') {
				attributes.push({
					n: ZIMBRA_CLAM_AVDATABASE_MIRROR,
					_content: ''
				});
			}
			if (mtaAntiVirusAndAntispamDetail?.zimbraVirusDefinitionsUpdateFrequency) {
				attributes.push({
					n: ZIMBRA_VIRUS_DEFINITIONS_UPDATE_FREQUENCY,
					_content: mtaAntiVirusAndAntispamDetail?.zimbraVirusDefinitionsUpdateFrequency
				});
			}
			if (mtaAntiVirusAndAntispamDetail?.zimbraSpamTagPercent) {
				attributes.push({
					n: ZIMBRA_SPAM_TAG_PERCENT,
					_content: mtaAntiVirusAndAntispamDetail?.zimbraSpamTagPercent
				});
			}
		},
		[
			mtaAntiVirusAndAntispamDetail?.zimbraClamAVDatabaseMirror,
			mtaAntiVirusAndAntispamDetail?.zimbraSpamTagPercent,
			mtaAntiVirusAndAntispamDetail?.zimbraVirusDefinitionsUpdateFrequency
		]
	);

	const onSave = useCallback(() => {
		const attributes: Array<Record<string, string>> = [];
		setSaveValues(attributes);
		if (mtaAntiVirusAndAntispamDetail?.zimbraSpamSubjectTag) {
			attributes.push({
				n: ZIMBRA_SPAM_SUBJECT_TAG,
				_content: mtaAntiVirusAndAntispamDetail?.zimbraSpamSubjectTag
			});
		}
		if (mtaAntiVirusAndAntispamDetail?.zimbraAmavisFinalSpamDestiny) {
			attributes.push({
				n: ZIMBRA_AMAVIS_FINAL_SPAM_DESTINY,
				_content: mtaAntiVirusAndAntispamDetail?.zimbraAmavisFinalSpamDestiny
			});
		}
		attributes.push({
			n: ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA,
			_content: mtaAntiVirusAndAntispamDetail?.zimbraAmavisOriginatingBypassSA ? TRUE : FALSE
		});

		attributes.push({
			n: ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION,
			_content: mtaAntiVirusAndAntispamDetail?.zimbraAmavisEnableDKIMVerification ? TRUE : FALSE
		});

		attributes.push({
			n: ZIMBRA_VIRUS_WARN_RECIPIENT,
			_content: mtaAntiVirusAndAntispamDetail?.zimbraVirusWarnRecipient ? TRUE : FALSE
		});
		attributes.push({
			n: ZIMBRA_VIRUS_BLOCK_ENCRYPTED_ARCHIVE,
			_content: mtaAntiVirusAndAntispamDetail?.zimbraVirusBlockEncryptedArchive ? TRUE : FALSE
		});
		attributes.push({
			n: ZIMBRA_VIRUS_WARN_ADMIN,
			_content: mtaAntiVirusAndAntispamDetail?.zimbraVirusWarnAdmin ? TRUE : FALSE
		});
		if (
			mtaAntiVirusAndAntispamDetail?.zimbraSpamKillPercent &&
			mtaAntiVirusAndAntispamDetail?.zimbraAmavisFinalSpamDestiny &&
			mtaAntiVirusAndAntispamDetail?.zimbraAmavisFinalSpamDestiny !== D_PASS
		) {
			attributes.push({
				n: ZIMBRA_SPAM_KILL_PERCENT,
				_content: mtaAntiVirusAndAntispamDetail?.zimbraSpamKillPercent
			});
		}

		if (mtaAntiVirusAndAntispamDetail?.carbonioClamAVDatabaseCustomURL) {
			const clamAVDatabaseCustomURL =
				mtaAntiVirusAndAntispamDetail?.carbonioClamAVDatabaseCustomURL.split(',');
			if (clamAVDatabaseCustomURL.length > 0) {
				clamAVDatabaseCustomURL.forEach((item: string) => {
					attributes.push({
						n: CARBONIO_CLAM_AV_DATABASE_CUSTOM_URL,
						_content: item
					});
				});
			}
		} else if (mtaAntiVirusAndAntispamDetail?.carbonioClamAVDatabaseCustomURL === '') {
			attributes.push({
				n: CARBONIO_CLAM_AV_DATABASE_CUSTOM_URL,
				_content: ''
			});
		}
		attributes.push({
			n: CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK,
			_content: mtaAntiVirusAndAntispamDetail?.carbonioAmavisDisableVirusCheck ? TRUE : FALSE
		});
		modifyConfigRequest(attributes);
	}, [
		setSaveValues,
		mtaAntiVirusAndAntispamDetail?.zimbraSpamSubjectTag,
		mtaAntiVirusAndAntispamDetail?.zimbraAmavisFinalSpamDestiny,
		mtaAntiVirusAndAntispamDetail?.zimbraAmavisOriginatingBypassSA,
		mtaAntiVirusAndAntispamDetail?.zimbraAmavisEnableDKIMVerification,
		mtaAntiVirusAndAntispamDetail?.zimbraVirusWarnRecipient,
		mtaAntiVirusAndAntispamDetail?.zimbraVirusBlockEncryptedArchive,
		mtaAntiVirusAndAntispamDetail?.zimbraVirusWarnAdmin,
		mtaAntiVirusAndAntispamDetail?.zimbraSpamKillPercent,
		mtaAntiVirusAndAntispamDetail?.carbonioClamAVDatabaseCustomURL,
		mtaAntiVirusAndAntispamDetail?.carbonioAmavisDisableVirusCheck,
		modifyConfigRequest
	]);

	const onCancel = useCallback(() => {
		setMtaAntiVirusAndAntispamDetail(mtaAntiVirusAndAntispamInitialDetail);

		setValue(
			ZIMBRA_SPAM_SUBJECT_TAG,
			mtaAntiVirusAndAntispamInitialDetail?.zimbraSpamSubjectTag
				? mtaAntiVirusAndAntispamInitialDetail?.zimbraSpamSubjectTag
				: ''
		);
		setValue(
			ZIMBRA_VIRUS_DEFINITIONS_UPDATE_FREQUENCY,
			mtaAntiVirusAndAntispamInitialDetail?.zimbraVirusDefinitionsUpdateFrequency
				? mtaAntiVirusAndAntispamInitialDetail?.zimbraVirusDefinitionsUpdateFrequency
				: ''
		);
		setTimeout(() => {
			setIsDirty(false);
		}, 10);
	}, [mtaAntiVirusAndAntispamInitialDetail, setValue]);

	const antiVirusMirrorHeader = useMemo(
		() => [
			{
				id: 'antivirus_mirrors',
				label: t('mta.antivirus_mirrors', 'Antivirus Mirrors'),
				width: '100%',
				bold: true
			}
		],
		[t]
	);

	const additionalVirusDefinitionHeader = useMemo(
		() => [
			{
				id: 'additional_virus_definition',
				label: t('mta.additional_virus_definition', 'Additional Virus Definitions'),
				width: '100%',
				bold: true
			}
		],
		[t]
	);

	const spamTagPercentOptions = useMemo(
		() => [
			{
				label: t('mta.low', 'Low'),
				value: '33'
			},
			{
				label: t('mta.medium', 'Medium'),
				value: '20'
			},
			{
				label: t('mta.high', 'High'),
				value: '16'
			}
		],
		[t]
	);

	const spamKillPercentOptions = useMemo(
		() => [
			{
				label: t('mta.low', 'Low'),
				value: '90'
			},
			{
				label: t('mta.medium', 'Medium'),
				value: '75'
			},
			{
				label: t('mta.high', 'High'),
				value: '66'
			}
		],
		[t]
	);

	const discardPassOptions = useMemo(
		() => [
			{
				label: t('mta.discard', 'Discard'),
				value: D_DISCARD
			},
			{
				label: t('mta.pass', 'Pass'),
				value: D_PASS
			}
		],
		[t]
	);

	const intervalOptions = useMemo(
		() => [
			{
				label: t('mta.seconds', 'Seconds'),
				value: 's'
			},
			{
				label: t('mta.minutes', 'Minutes'),
				value: 'm'
			},
			{
				label: t('mta.hours', 'Hours'),
				value: 'h'
			},
			{
				label: t('mta.days', 'Days'),
				value: 'd'
			},
			{
				label: t('mta.weeks', 'Weeks'),
				value: 'w'
			}
		],
		[t]
	);

	const [updateMesurementUnit, setUpdateMesurementUnit] = useState(intervalOptions[2]);

	const setAmavisValues = useCallback(() => {
		const zimbraAmavisSpamDestiny = configInformation.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_AMAVIS_FINAL_SPAM_DESTINY
		);
		if (zimbraAmavisSpamDestiny && zimbraAmavisSpamDestiny?._content) {
			setInitialAndCurrentValue(
				ZIMBRA_AMAVIS_FINAL_SPAM_DESTINY,
				zimbraAmavisSpamDestiny?._content
			);
		}

		const zimbraAmavisOriginatingBypassSA = configInformation.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA
		);
		if (zimbraAmavisOriginatingBypassSA && zimbraAmavisOriginatingBypassSA?._content) {
			setInitialAndCurrentValue(
				ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA,
				zimbraAmavisOriginatingBypassSA?._content === TRUE
			);
		}

		const zimbraAmavisEnableDKIMVerification = configInformation.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION
		);
		if (zimbraAmavisEnableDKIMVerification && zimbraAmavisEnableDKIMVerification?._content) {
			setInitialAndCurrentValue(
				ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION,
				zimbraAmavisEnableDKIMVerification?._content === TRUE
			);
		}
	}, [configInformation, setInitialAndCurrentValue]);

	const setAntivirusAndSpamValues = useCallback(() => {
		const zimbraSpamSubjectTag = configInformation.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_SPAM_SUBJECT_TAG
		);
		if (zimbraSpamSubjectTag && zimbraSpamSubjectTag?._content) {
			setInitialAndCurrentValue(ZIMBRA_SPAM_SUBJECT_TAG, zimbraSpamSubjectTag?._content);
		}

		const zimbraVirusWarnRecipient = configInformation.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_VIRUS_WARN_RECIPIENT
		);
		if (zimbraVirusWarnRecipient && zimbraVirusWarnRecipient?._content) {
			setInitialAndCurrentValue(
				ZIMBRA_VIRUS_WARN_RECIPIENT,
				zimbraVirusWarnRecipient?._content === TRUE
			);
		}

		const zimbraVirusBlockEncryptedArchive = configInformation.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_VIRUS_BLOCK_ENCRYPTED_ARCHIVE
		);
		if (zimbraVirusBlockEncryptedArchive && zimbraVirusBlockEncryptedArchive?._content) {
			setInitialAndCurrentValue(
				ZIMBRA_VIRUS_BLOCK_ENCRYPTED_ARCHIVE,
				zimbraVirusBlockEncryptedArchive?._content === TRUE
			);
		}
		const zimbraVirusWarnAdmin = configInformation.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_VIRUS_WARN_ADMIN
		);
		if (zimbraVirusWarnAdmin && zimbraVirusWarnAdmin?._content) {
			setInitialAndCurrentValue(ZIMBRA_VIRUS_WARN_ADMIN, zimbraVirusWarnAdmin?._content === TRUE);
		}

		const zimbraClamAVDatabaseMirror = configInformation.filter(
			(item: Record<string, string>) => item?.n === ZIMBRA_CLAM_AVDATABASE_MIRROR
		);
		if (zimbraClamAVDatabaseMirror && zimbraClamAVDatabaseMirror?.length > 0) {
			const databaseMirrors: Array<unknown> = zimbraClamAVDatabaseMirror.map(
				(urlItem: Record<string, string>) => urlItem?._content
			);
			setInitialAndCurrentValue(ZIMBRA_CLAM_AVDATABASE_MIRROR, databaseMirrors.join(', '));
		} else {
			setInitialAndCurrentValue(ZIMBRA_CLAM_AVDATABASE_MIRROR, '');
		}

		const zimbraVirusDefinitionsUpdateFrequency = configInformation.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_VIRUS_DEFINITIONS_UPDATE_FREQUENCY
		);

		if (zimbraVirusDefinitionsUpdateFrequency && zimbraVirusDefinitionsUpdateFrequency?._content) {
			setInitialAndCurrentValue(
				ZIMBRA_VIRUS_DEFINITIONS_UPDATE_FREQUENCY,
				zimbraVirusDefinitionsUpdateFrequency?._content
			);
		}
	}, [configInformation, setInitialAndCurrentValue]);

	useEffect(() => {
		if (configInformation && configInformation.length > 0) {
			setAmavisValues();
			setAntivirusAndSpamValues();
			const zimbraSpamTagPercent = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_SPAM_TAG_PERCENT
			);

			if (zimbraSpamTagPercent && zimbraSpamTagPercent?._content) {
				setInitialAndCurrentValue(ZIMBRA_SPAM_TAG_PERCENT, zimbraSpamTagPercent?._content);
			}

			const zimbraSpamKillPercent = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_SPAM_KILL_PERCENT
			);

			if (zimbraSpamKillPercent && zimbraSpamKillPercent?._content) {
				setInitialAndCurrentValue(ZIMBRA_SPAM_KILL_PERCENT, zimbraSpamKillPercent?._content);
			}

			const carbonioClamAVDatabaseCustomURL = configInformation.filter(
				(item: Record<string, string>) => item?.n === CARBONIO_CLAM_AV_DATABASE_CUSTOM_URL
			);
			if (carbonioClamAVDatabaseCustomURL && carbonioClamAVDatabaseCustomURL.length > 0) {
				const customURL: Array<unknown> = carbonioClamAVDatabaseCustomURL.map(
					(urlItem: Record<string, string>) => urlItem?._content
				);
				setInitialAndCurrentValue(CARBONIO_CLAM_AV_DATABASE_CUSTOM_URL, customURL.join(', '));
			} else {
				setInitialAndCurrentValue(CARBONIO_CLAM_AV_DATABASE_CUSTOM_URL, '');
			}
			const carbonioAmavisDisableVirusCheck = configInformation.find(
				(item: Record<string, string>) => item?.n === CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK
			);
			if (carbonioAmavisDisableVirusCheck && carbonioAmavisDisableVirusCheck?._content) {
				setInitialAndCurrentValue(
					CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK,
					carbonioAmavisDisableVirusCheck?._content === TRUE
				);
			}
		}
	}, [configInformation, setAmavisValues, setAntivirusAndSpamValues, setInitialAndCurrentValue]);

	useEffect(() => {
		if (
			mtaAntiVirusAndAntispamDetail &&
			!isEqual(mtaAntiVirusAndAntispamDetail, mtaAntiVirusAndAntispamInitialDetail)
		) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [mtaAntiVirusAndAntispamDetail, mtaAntiVirusAndAntispamInitialDetail]);

	const onSpamDestinyChange = useCallback(
		(v: string) => {
			setValue(ZIMBRA_AMAVIS_FINAL_SPAM_DESTINY, v);
		},
		[setValue]
	);

	const onSpamKillPercentChange = useCallback(
		(v: string) => {
			setValue(ZIMBRA_SPAM_KILL_PERCENT, v);
		},
		[setValue]
	);

	const onSpamTagPercentChange = useCallback(
		(v: string) => {
			setValue(ZIMBRA_SPAM_TAG_PERCENT, v);
		},
		[setValue]
	);

	useEffect(() => {
		if (mtaAntiVirusAndAntispamDetail?.zimbraClamAVDatabaseMirror) {
			const calmDatabaseMirror =
				mtaAntiVirusAndAntispamDetail?.zimbraClamAVDatabaseMirror.split(',');
			if (calmDatabaseMirror && calmDatabaseMirror.length > 0) {
				const tableRow: Array<TRow> = [];
				calmDatabaseMirror.forEach((item: string) => {
					tableRow.push({
						id: item,
						columns: [
							<Container
								crossAlignment="flex-start"
								key={`${item}`}
								style={{ cursor: 'pointer' }}
								onClick={(): void => {
									setSelectedAntivirusMirrors([item]);
								}}
							>
								<Text size="small" weight="regular" key={item} color="gray0">
									{item}
								</Text>
							</Container>
						]
					});
				});
				setAntiVirusMirrorTableRow(tableRow);
			}
		} else {
			setAntiVirusMirrorTableRow([]);
		}
	}, [mtaAntiVirusAndAntispamDetail?.zimbraClamAVDatabaseMirror]);

	const onAddAntivirusMirrors = useCallback(() => {
		if (isSpaceAvailableInString(antiVirusMirrorsAddText)) {
			createSnackbar({
				key: 'error',
				severity: 'error',
				label: t(
					'mta.space_not_allowed_in_antivirus_mirror',
					'Space not allowed in antivirus mirror'
				),
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
			return;
		}

		if (!isValidHostname(antiVirusMirrorsAddText)) {
			createSnackbar({
				key: 'error',
				severity: 'error',
				label: t('mta.allowed_valid_antivirus_mirror', 'Antivirus mirror is not valid'),
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
			return;
		}
		if (mtaAntiVirusAndAntispamDetail?.zimbraClamAVDatabaseMirror) {
			const calmDatabaseMirror =
				mtaAntiVirusAndAntispamDetail?.zimbraClamAVDatabaseMirror.split(',');
			if (calmDatabaseMirror) {
				calmDatabaseMirror?.push(antiVirusMirrorsAddText);
				setValue(ZIMBRA_CLAM_AVDATABASE_MIRROR, calmDatabaseMirror.join(','));
			}
		} else {
			setValue(ZIMBRA_CLAM_AVDATABASE_MIRROR, antiVirusMirrorsAddText);
		}

		setSelectedAntivirusMirrors([]);
		setAntiVirusMirrorsAddText('');
	}, [
		antiVirusMirrorsAddText,
		createSnackbar,
		mtaAntiVirusAndAntispamDetail?.zimbraClamAVDatabaseMirror,
		setValue,
		t
	]);

	const onRemoveAntivirusMirrors = useCallback(() => {
		if (mtaAntiVirusAndAntispamDetail?.zimbraClamAVDatabaseMirror) {
			const calmDatabaseMirror =
				mtaAntiVirusAndAntispamDetail?.zimbraClamAVDatabaseMirror.split(',');
			const filterItems = calmDatabaseMirror.filter(
				(item: string) => !selectedAntivirusMirrors.includes(item)
			);

			setValue(ZIMBRA_CLAM_AVDATABASE_MIRROR, filterItems.join(','));
		}
		setSelectedAntivirusMirrors([]);
	}, [
		mtaAntiVirusAndAntispamDetail?.zimbraClamAVDatabaseMirror,
		selectedAntivirusMirrors,
		setValue
	]);

	useEffect(() => {
		if (mtaAntiVirusAndAntispamDetail?.carbonioClamAVDatabaseCustomURL) {
			const calmDatabaseMirror =
				mtaAntiVirusAndAntispamDetail?.carbonioClamAVDatabaseCustomURL.split(',');
			if (calmDatabaseMirror && calmDatabaseMirror.length > 0) {
				const tableRow: Array<TRow> = [];
				calmDatabaseMirror.forEach((item: string) => {
					tableRow.push({
						id: item,
						columns: [
							<Container
								crossAlignment="flex-start"
								key={`${item}`}
								style={{ cursor: 'pointer' }}
								onClick={(): void => {
									setSelectedAdditionalAntivirusDefinition([item]);
								}}
							>
								<Text size="small" weight="light" key={item} color="gray0">
									{item}
								</Text>
							</Container>
						]
					});
				});
				setAdditionalAntiVirusDefinitionTableRow(tableRow);
			}
		} else {
			setAdditionalAntiVirusDefinitionTableRow([]);
		}
	}, [mtaAntiVirusAndAntispamDetail?.carbonioClamAVDatabaseCustomURL]);

	const onAddAdditionalAntivirusDefinition = useCallback(() => {
		if (!additionalAntiVirusDefinitionAddText.startsWith('http')) {
			createSnackbar({
				key: 'error',
				severity: 'error',
				label: t(
					'mta.additional_virus_definition_start_with_http_https',
					'Additional Virus Definition should start with http'
				),
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
			return;
		}

		if (mtaAntiVirusAndAntispamDetail?.carbonioClamAVDatabaseCustomURL) {
			const calmDatabaseMirror =
				mtaAntiVirusAndAntispamDetail?.carbonioClamAVDatabaseCustomURL.split(',');
			if (calmDatabaseMirror) {
				calmDatabaseMirror?.push(additionalAntiVirusDefinitionAddText);
				setValue(CARBONIO_CLAM_AV_DATABASE_CUSTOM_URL, calmDatabaseMirror.join(','));
			}
		} else {
			setValue(CARBONIO_CLAM_AV_DATABASE_CUSTOM_URL, additionalAntiVirusDefinitionAddText);
		}

		setSelectedAdditionalAntivirusDefinition([]);
		setAdditionalAntiVirusDefinitionAddText('');
	}, [
		additionalAntiVirusDefinitionAddText,
		mtaAntiVirusAndAntispamDetail?.carbonioClamAVDatabaseCustomURL,
		setValue,
		t,
		createSnackbar
	]);

	const removeAdditionalAntivirusDefinition = useCallback(() => {
		if (mtaAntiVirusAndAntispamDetail?.carbonioClamAVDatabaseCustomURL) {
			const calmDatabaseMirror =
				mtaAntiVirusAndAntispamDetail?.carbonioClamAVDatabaseCustomURL.split(',');
			const filterItems = calmDatabaseMirror.filter(
				(item: string) => !selectedAdditionalAntivirusDefinition.includes(item)
			);
			setValue(CARBONIO_CLAM_AV_DATABASE_CUSTOM_URL, filterItems.join(','));
		}
		setSelectedAdditionalAntivirusDefinition([]);
		setIsShowRemoveAlertDialog(false);
	}, [
		mtaAntiVirusAndAntispamDetail?.carbonioClamAVDatabaseCustomURL,
		selectedAdditionalAntivirusDefinition,
		setValue
	]);

	const onRemoveAdditionalAntivirusDefinition = useCallback(() => {
		if (isAdvanced) {
			setIsShowRemoveAlertDialog(true);
		} else {
			removeAdditionalAntivirusDefinition();
		}
	}, [isAdvanced, removeAdditionalAntivirusDefinition]);

	useEffect(() => {
		if (mtaAntiVirusAndAntispamDetail?.zimbraVirusDefinitionsUpdateFrequency) {
			const val = mtaAntiVirusAndAntispamDetail?.zimbraVirusDefinitionsUpdateFrequency.replace(
				/[^0-9]/g,
				''
			);
			setUpdateFrequncy(val);

			const unit = mtaAntiVirusAndAntispamDetail?.zimbraVirusDefinitionsUpdateFrequency.replace(
				/[^a-zA-Z]/g,
				''
			);
			const findOption = intervalOptions.find(
				(item: Record<string, string>) => item?.value === unit
			);
			setUpdateMesurementUnit(findOption || intervalOptions[2]);
		}
	}, [mtaAntiVirusAndAntispamDetail?.zimbraVirusDefinitionsUpdateFrequency, intervalOptions]);

	const onUpdateMesurementChange = useCallback(
		(v: SelectItem[] | string | null) => {
			const findOption = intervalOptions.find((item: Record<string, string>) => item?.value === v);
			setUpdateMesurementUnit(findOption || intervalOptions[2]);
			setValue(ZIMBRA_VIRUS_DEFINITIONS_UPDATE_FREQUENCY, `${updateFrequncy}${findOption?.value}`);
		},
		[updateFrequncy, setValue, intervalOptions]
	);

	return (
		<Container background="gray6" mainAlignment="flex-start">
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				orientation="horizontal"
				background="gray6"
				width="fill"
				height="3.5rem"
			>
				<Row padding={{ horizontal: 'small' }}></Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium" overflow="ellipsis" weight="bold">
						{t('mta.antivirus_and_antispam', 'Antivirus & Antispam')}
					</Text>
				</Row>
				<Row>
					{isDirty && (
						<Container
							orientation="horizontal"
							mainAlignment="flex-end"
							crossAlignment="flex-end"
							background="gray6"
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
							<Padding right="small">
								{isDirty && (
									<Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
								)}
							</Padding>
						</Container>
					)}
				</Row>
			</Row>
			<ListRow>
				<Divider />
			</ListRow>
			<Container
				padding={{ all: 'extralarge' }}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 10.5rem)"
				style={{ overflow: 'auto' }}
			>
				<Container
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					height="auto"
					padding={{ top: 'medium', bottom: 'extralarge' }}
				>
					<Text size="small" weight="bold" color="gray0">
						{t('label.antispam', 'Antispam')}
					</Text>
				</Container>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ bottom: 'extralarge' }}
					height="auto"
				>
					<Container crossAlignment="flex-start" padding={{ right: 'medium' }}>
						<Input
							label={t(
								'mta.add_this_prefix_to_spam_mail_subject',
								'Add this prefix to the Spam mail subject'
							)}
							backgroundColor="gray5"
							value={mtaAntiVirusAndAntispamDetail?.zimbraSpamSubjectTag}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								setValue(ZIMBRA_SPAM_SUBJECT_TAG, e.target.value);
							}}
							disabled={!allowSetMTA}
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Select
							items={spamTagPercentOptions}
							background="gray5"
							label={t('mta.tolerance_for_spam_delivery', 'Tolerance for Spam Delivery')}
							showCheckbox={false}
							selection={spamTagPercentOptions.find(
								(item: Record<string, string>) =>
									item.value === mtaAntiVirusAndAntispamDetail?.zimbraSpamTagPercent
							)}
							// @ts-ignore
							onChange={onSpamTagPercentChange}
							disabled={!allowSetMTA}
						/>
					</Container>
				</Container>

				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ bottom: 'extralarge' }}
					height="auto"
				>
					<Container crossAlignment="flex-start" padding={{ right: 'medium' }}>
						<Select
							items={discardPassOptions}
							background="gray5"
							label={t('mta.block_spam_destiny', 'Block Spam destiny')}
							showCheckbox={false}
							selection={discardPassOptions.find(
								(item: Record<string, string>) =>
									item.value === mtaAntiVirusAndAntispamDetail?.zimbraAmavisFinalSpamDestiny
							)}
							// @ts-ignore
							onChange={onSpamDestinyChange}
							disabled={!allowSetMTA}
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Select
							items={spamKillPercentOptions}
							background="gray5"
							label={t('mta.tolerance_for_spam_blocking', 'Tolerance for Spam Blocking')}
							showCheckbox={false}
							selection={spamKillPercentOptions.find(
								(item: Record<string, string>) =>
									item.value === mtaAntiVirusAndAntispamDetail?.zimbraSpamKillPercent
							)}
							// @ts-ignore
							onChange={onSpamKillPercentChange}
							disabled={
								mtaAntiVirusAndAntispamDetail?.zimbraAmavisFinalSpamDestiny === D_PASS ||
								!allowSetMTA
							}
						/>
					</Container>
				</Container>

				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ bottom: 'extralarge' }}
					height="auto"
				>
					<Container crossAlignment="flex-start" padding={{ right: 'medium' }}>
						<Switch
							label={t('mta.also_check_outbound_messages', 'Also check outbound messages')}
							value={mtaAntiVirusAndAntispamDetail?.zimbraAmavisOriginatingBypassSA}
							onClick={(): void =>
								setValue(
									ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA,
									!mtaAntiVirusAndAntispamDetail?.zimbraAmavisOriginatingBypassSA
								)
							}
							disabled={!allowSetMTA}
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Switch
							label={t('mta.verify_dkim_validity', 'Verify DKIM validity')}
							value={mtaAntiVirusAndAntispamDetail?.zimbraAmavisEnableDKIMVerification}
							onClick={(): void =>
								setValue(
									ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION,
									!mtaAntiVirusAndAntispamDetail?.zimbraAmavisEnableDKIMVerification
								)
							}
							disabled={!allowSetMTA}
						/>
					</Container>
				</Container>

				<Container
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					height="auto"
					padding={{ top: 'medium', bottom: 'extralarge' }}
				>
					<Text size="small" weight="bold" color="gray0">
						{t('label.antivirus_definitions', 'Antivirus Definitions')}
					</Text>
				</Container>

				<Container crossAlignment="flex-start" padding={{ bottom: 'large' }} height="auto">
					<Switch
						label={t('mta.disable_virus_check', 'Disable Virus Check')}
						value={mtaAntiVirusAndAntispamDetail?.carbonioAmavisDisableVirusCheck}
						onClick={(): void =>
							setValue(
								CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK,
								!mtaAntiVirusAndAntispamDetail?.carbonioAmavisDisableVirusCheck
							)
						}
						disabled={!allowSetMTA}
					/>
				</Container>

				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ bottom: 'large' }}
					height="auto"
				>
					<Container
						crossAlignment="flex-start"
						padding={{ right: 'medium' }}
						orientation="horizontal"
						mainAlignment="space-between"
						height="auto"
					>
						<Container width="60%" padding={{ right: 'medium' }}>
							<Input
								label={t('mta.definition_mirrors', 'Definition Mirrors')}
								backgroundColor="gray5"
								value={antiVirusMirrorsAddText}
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
									setAntiVirusMirrorsAddText(e.target.value);
								}}
								disabled={!allowSetMTA}
							/>
						</Container>
						<Container width="15%" crossAlignment="flex-start">
							<Button
								type="outlined"
								size="large"
								label={t('mta.add', 'Add')}
								color="primary"
								onClick={onAddAntivirusMirrors}
								disabled={antiVirusMirrorsAddText === '' || !allowSetMTA}
							/>
						</Container>
						<Container width="25%" crossAlignment="flex-start" mainAlignment="flex-start">
							<Button
								type="ghost"
								size="large"
								label={t('mta.remove', 'Remove')}
								color="primary"
								disabled={selectedAntivirusMirrors.length === 0 || !allowSetMTA}
								onClick={onRemoveAntivirusMirrors}
							/>
						</Container>
					</Container>
					<Container crossAlignment="flex-start">
						<Container
							crossAlignment="flex-start"
							padding={{ right: 'medium' }}
							orientation="horizontal"
							mainAlignment="space-between"
							height="auto"
						>
							<Container width="60%" padding={{ right: 'medium' }}>
								<Input
									label={t('mta.additional_virus_definition', 'Additional Virus Definition')}
									backgroundColor="gray5"
									value={additionalAntiVirusDefinitionAddText}
									onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
										setAdditionalAntiVirusDefinitionAddText(e.target.value);
									}}
									disabled={!allowSetMTA}
								/>
							</Container>
							<Container width="15%" crossAlignment="flex-start">
								<Button
									type="outlined"
									size="large"
									label={t('mta.add', 'Add')}
									color="primary"
									disabled={additionalAntiVirusDefinitionAddText === '' || !allowSetMTA}
									onClick={onAddAdditionalAntivirusDefinition}
								/>
							</Container>
							<Container width="25%" crossAlignment="flex-start" mainAlignment="flex-start">
								<Button
									type="ghost"
									size="large"
									label={t('mta.remove', 'Remove')}
									color="primary"
									disabled={selectedAdditionalAntivirusDefinition.length === 0 || !allowSetMTA}
									onClick={onRemoveAdditionalAntivirusDefinition}
								/>
							</Container>
						</Container>
					</Container>
				</Container>

				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ bottom: 'small' }}
					height="auto"
				>
					<Container
						padding={{
							top: 'small',
							bottom: 'small',
							right: 'medium'
						}}
						mainAlignment="flex-start"
					>
						<Table
							rows={antiVirusMirrorTableRow}
							headers={antiVirusMirrorHeader}
							showCheckbox={false}
							selectedRows={selectedAntivirusMirrors}
							RowFactory={CustomRowFactory}
							HeaderFactory={CustomHeaderFactory}
						/>
					</Container>
					<Container
						padding={{
							top: 'small',
							bottom: 'small'
						}}
						mainAlignment="flex-start"
					>
						<Table
							rows={additionalAntiVirusDefinitionTableRow}
							headers={additionalVirusDefinitionHeader}
							showCheckbox={false}
							selectedRows={selectedAdditionalAntivirusDefinition}
							RowFactory={CustomRowFactory}
							HeaderFactory={CustomHeaderFactory}
						/>
					</Container>
				</Container>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ bottom: 'extralarge', top: 'large' }}
					height="auto"
				>
					<Container crossAlignment="flex-start" padding={{ right: 'medium' }} width="70%">
						<Input
							label={t('mta.definition_update_frequency', 'Definition Update Frenquency')}
							backgroundColor="gray5"
							value={updateFrequncy}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								setUpdateFrequncy(e.target.value);
								setValue(
									ZIMBRA_VIRUS_DEFINITIONS_UPDATE_FREQUENCY,
									`${e.target.value}${updateMesurementUnit?.value}`
								);
							}}
							disabled={!allowSetMTA}
						/>
					</Container>
					<Container crossAlignment="flex-start" width="30%">
						<Select
							items={intervalOptions}
							background="gray5"
							showCheckbox={false}
							selection={updateMesurementUnit}
							onChange={onUpdateMesurementChange}
							disabled={!allowSetMTA}
						/>
					</Container>
				</Container>

				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ bottom: 'extralarge', top: 'large' }}
					height="auto"
				>
					<Container crossAlignment="flex-start" padding={{ right: 'medium' }} height="auto">
						<Switch
							label={t(
								'mta.warn_recipients_when_is_quarantined',
								'Warn recipients when something is quarantined'
							)}
							value={mtaAntiVirusAndAntispamDetail?.zimbraVirusWarnRecipient}
							onClick={(): void =>
								setValue(
									ZIMBRA_VIRUS_WARN_RECIPIENT,
									!mtaAntiVirusAndAntispamDetail?.zimbraVirusWarnRecipient
								)
							}
							disabled={!allowSetMTA}
						/>
					</Container>
					<Container crossAlignment="flex-start" height="auto">
						<Switch
							label={t('mta.virus_block_encrypted_archive', 'Virus Block Encrypted Archive')}
							value={mtaAntiVirusAndAntispamDetail?.zimbraVirusBlockEncryptedArchive}
							onClick={(): void =>
								setValue(
									ZIMBRA_VIRUS_BLOCK_ENCRYPTED_ARCHIVE,
									!mtaAntiVirusAndAntispamDetail?.zimbraVirusBlockEncryptedArchive
								)
							}
							disabled={!allowSetMTA}
						/>
					</Container>
				</Container>

				<Container crossAlignment="flex-start" height="auto">
					<Switch
						label={t(
							'mta.warn_admins_when_something_quarntined',
							'Warn admins when something is quarantined'
						)}
						value={mtaAntiVirusAndAntispamDetail?.zimbraVirusWarnAdmin}
						onClick={(): void =>
							setValue(
								ZIMBRA_VIRUS_WARN_ADMIN,
								!mtaAntiVirusAndAntispamDetail?.zimbraVirusWarnAdmin
							)
						}
						disabled={!allowSetMTA}
					/>
				</Container>

				<Modal
					title={
						<Trans
							i18nKey="mta.remove_virus_difinition_warning_title"
							defaults="You are removing <bold>{{name}}</bold> definition"
							components={{ bold: <strong /> }}
							values={{
								name: selectedAdditionalAntivirusDefinition[0]
							}}
						/>
					}
					open={isShowRemoveAlertDialog}
					showCloseIcon
					onClose={(): void => {
						setIsShowRemoveAlertDialog(false);
					}}
					size="medium"
					customFooter={
						<Container orientation="horizontal" mainAlignment="space-between">
							<Container orientation="horizontal" mainAlignment="flex-end">
								<Padding all="small">
									<Button
										label={t('label.yes_remove_it', 'Yes, Remove it')}
										color="primary"
										type="outlined"
										size="medium"
										onClick={(): void => {
											removeAdditionalAntivirusDefinition();
										}}
									/>
								</Padding>
								<Button
									color="primary"
									type="outlined"
									label={t('label.keep_it_button', 'NO, KEEP IT')}
									onClick={(): void => {
										setIsShowRemoveAlertDialog(false);
									}}
								/>
							</Container>
						</Container>
					}
				>
					<Container>
						<Text overflow="break-word" weight="regular">
							{t(
								'mta.remove_virus_difinition_warning_line_1',
								'Removing a virus definition will reduce the chance to detect potential threats. This operation is not reversible'
							)}
						</Text>
					</Container>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ top: 'extralarge', bottom: 'extralarge' }}
					>
						<Text overflow="break-word" weight="regular">
							{
								<Trans
									i18nKey="mta.remove_virus_difinition_warning_line_2"
									defaults="Are you sure you want to remove the <bold>{{name}}</bold> definition?"
									components={{ bold: <strong /> }}
									values={{
										name: selectedAdditionalAntivirusDefinition[0]
									}}
								/>
							}
						</Text>
					</Container>
				</Modal>
			</Container>
		</Container>
	);
};

export default MTAAntiVirusAndAntiSpam;
