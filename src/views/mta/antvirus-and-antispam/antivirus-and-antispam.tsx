/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Container,
	Row,
	Text,
	Padding,
	Button,
	Divider,
	Switch,
	SnackbarManagerContext,
	Input,
	Select,
	Table
} from '@zextras/carbonio-design-system';
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isEqual } from 'lodash';
import ListRow from '../../list/list-row';
import CustomRowFactory from '../../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../../app/shared/customTableHeaderFactory';
import {
	FALSE,
	HIGH,
	LOW,
	MEDIUM,
	TRUE,
	ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION,
	ZIMBRA_AMAVIS_FINAL_SPAM_DESTINY,
	ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA,
	ZIMBRA_CLAM_AVDATABASE_MIRROR,
	ZIMBRA_SPAM_SUBJECT_TAG,
	ZIMBRA_VIRUS_BLOCK_ENCRYPTED_ARCHIVE,
	ZIMBRA_VIRUS_DEFINITIONS_UPDATE_FREQUENCY,
	ZIMBRA_VIRUS_WARN_ADMIN,
	ZIMBRA_VIRUS_WARN_RECIPIENT
} from '../../../constants';
import { useConfigStore } from '../../../store/config/store';
import { MtaAntivirusAndAntispam } from '../../../../types';
import { modifyConfig } from '../../../services/modify-config';

const MTAAntiVirusAndAntiSpam: FC = () => {
	const [t] = useTranslation();
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const configInformation = useConfigStore((state) => state.config);
	const updateConfig = useConfigStore((state) => state.updateConfig);
	const [mtaAntiVirusAndAntispamInitialDetail, setMtaAntiVirusAndAntispamInitialDetail] =
		useState<MtaAntivirusAndAntispam>();
	const [mtaAntiVirusAndAntispamDetail, setMtaAntiVirusAndAntispamDetail] =
		useState<MtaAntivirusAndAntispam>();
	const [additionalVirusDefinitionsTableRow, setAdditionalVirusDefinitionsTableRow] = useState<
		Array<any>
	>([]);
	const [selectedAdditionalVirusDefinition, setSelectedAdditionalVirusDefinition] = useState<any[]>(
		[]
	);
	const [additionalVirusAddText, setAdditionalVirusAddText] = useState<string>('');

	const setInitialValue = useCallback((key: string, value: any): void => {
		setMtaAntiVirusAndAntispamInitialDetail((prev: any) => ({ ...prev, [key]: value }));
	}, []);

	const setValue = useCallback((key: string, value: any): void => {
		setMtaAntiVirusAndAntispamDetail((prev: any) => ({ ...prev, [key]: value }));
	}, []);

	const [updateFrequncy, setUpdateFrequncy] = useState<string>('');

	const setInitialAndCurrentValue = useCallback(
		(key, value) => {
			setInitialValue(key, value);
			setValue(key, value);
		},
		[setInitialValue, setValue]
	);

	const updateGlobalConfig = useCallback(
		(attributes: Array<Record<string, string>>): void => {
			attributes.forEach((ele: Record<string, string>) => {
				updateConfig(ele?.n, ele._content);
			});
		},
		[updateConfig]
	);

	const modifyConfigRequest = useCallback(
		(attributes: Array<Record<string, string>>): void => {
			modifyConfig(attributes)
				.then((data) => {
					createSnackbar({
						key: 'success',
						type: 'success',
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
		[createSnackbar, t, updateGlobalConfig]
	);

	const onSave = useCallback(() => {
		const attributes: Array<Record<string, string>> = [];
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
		if (mtaAntiVirusAndAntispamDetail?.zimbraClamAVDatabaseMirror) {
			attributes.push({
				n: ZIMBRA_CLAM_AVDATABASE_MIRROR,
				_content: mtaAntiVirusAndAntispamDetail?.zimbraClamAVDatabaseMirror
			});
		}
		if (mtaAntiVirusAndAntispamDetail?.zimbraVirusDefinitionsUpdateFrequency) {
			attributes.push({
				n: ZIMBRA_VIRUS_DEFINITIONS_UPDATE_FREQUENCY,
				_content: mtaAntiVirusAndAntispamDetail?.zimbraVirusDefinitionsUpdateFrequency
			});
		}
		modifyConfigRequest(attributes);
	}, [mtaAntiVirusAndAntispamDetail, modifyConfigRequest]);

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

	const antiVirusMirrorHeader: any[] = useMemo(
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

	const additionalVirusDefinitionHeader: any[] = useMemo(
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

	const limitOptions = useMemo(
		() => [
			{
				label: t('mta.low', 'Low'),
				value: LOW
			},
			{
				label: t('mta.medium', 'Medium'),
				value: MEDIUM
			},
			{
				label: t('mta.high', 'High'),
				value: HIGH
			}
		],
		[t]
	);

	const discardPassOptions = useMemo(
		() => [
			{
				label: t('mta.discard', 'Discard'),
				value: 'D_DISCARD'
			},
			{
				label: t('mta.pass', 'Pass'),
				value: 'P_PASS'
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

	useEffect(() => {
		if (configInformation && configInformation.length > 0) {
			const zimbraSpamSubjectTag = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_SPAM_SUBJECT_TAG
			);
			if (zimbraSpamSubjectTag && zimbraSpamSubjectTag?._content) {
				setInitialAndCurrentValue(ZIMBRA_SPAM_SUBJECT_TAG, zimbraSpamSubjectTag?._content);
			}

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

			const zimbraClamAVDatabaseMirror = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_CLAM_AVDATABASE_MIRROR
			);
			if (zimbraClamAVDatabaseMirror && zimbraClamAVDatabaseMirror?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_CLAM_AVDATABASE_MIRROR,
					zimbraClamAVDatabaseMirror?._content
				);
			}

			const zimbraVirusDefinitionsUpdateFrequency = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_VIRUS_DEFINITIONS_UPDATE_FREQUENCY
			);

			if (
				zimbraVirusDefinitionsUpdateFrequency &&
				zimbraVirusDefinitionsUpdateFrequency?._content
			) {
				setInitialAndCurrentValue(
					ZIMBRA_VIRUS_DEFINITIONS_UPDATE_FREQUENCY,
					zimbraVirusDefinitionsUpdateFrequency?._content
				);
			}
		}
	}, [configInformation, setInitialAndCurrentValue]);

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
		(v: any): any => {
			setValue(ZIMBRA_AMAVIS_FINAL_SPAM_DESTINY, v);
		},
		[setValue]
	);

	useEffect(() => {
		if (mtaAntiVirusAndAntispamDetail?.zimbraClamAVDatabaseMirror) {
			const calmDatabaseMirror =
				mtaAntiVirusAndAntispamDetail?.zimbraClamAVDatabaseMirror.split(',');
			if (calmDatabaseMirror && calmDatabaseMirror.length > 0) {
				const tableRow: any = [];
				calmDatabaseMirror.forEach((item: string) => {
					tableRow.push({
						id: item,
						columns: [
							<Container
								crossAlignment="flex-start"
								key={`${item}`}
								style={{ cursor: 'pointer' }}
								onClick={(): void => {
									setSelectedAdditionalVirusDefinition([item]);
								}}
							>
								<Text size="medium" weight="light" key={item} color="gray0">
									{item}
								</Text>
							</Container>
						]
					});
				});
				setAdditionalVirusDefinitionsTableRow(tableRow);
			}
		} else {
			setAdditionalVirusDefinitionsTableRow([]);
		}
	}, [mtaAntiVirusAndAntispamDetail?.zimbraClamAVDatabaseMirror]);

	const onAddAdditionalVirusDefinition = useCallback(() => {
		const calmDatabaseMirror = mtaAntiVirusAndAntispamDetail?.zimbraClamAVDatabaseMirror.split(',');
		if (calmDatabaseMirror) {
			calmDatabaseMirror?.push(additionalVirusAddText);
			setValue(ZIMBRA_CLAM_AVDATABASE_MIRROR, calmDatabaseMirror.join(','));
		}
		setSelectedAdditionalVirusDefinition([]);
		setAdditionalVirusAddText('');
	}, [additionalVirusAddText, mtaAntiVirusAndAntispamDetail?.zimbraClamAVDatabaseMirror, setValue]);

	const onRemoveAdditionalVirusDefinition = useCallback(() => {
		if (mtaAntiVirusAndAntispamDetail?.zimbraClamAVDatabaseMirror) {
			const calmDatabaseMirror =
				mtaAntiVirusAndAntispamDetail?.zimbraClamAVDatabaseMirror.split(',');
			const filterItems = calmDatabaseMirror.filter(
				(item: any) => !selectedAdditionalVirusDefinition.includes(item)
			);

			setValue(ZIMBRA_CLAM_AVDATABASE_MIRROR, filterItems.join(','));
		}
		setSelectedAdditionalVirusDefinition([]);
	}, [
		mtaAntiVirusAndAntispamDetail?.zimbraClamAVDatabaseMirror,
		selectedAdditionalVirusDefinition,
		setValue
	]);

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
			const findOption = intervalOptions.find((item: any) => item?.value === unit);
			setUpdateMesurementUnit(findOption || intervalOptions[2]);
		}
	}, [mtaAntiVirusAndAntispamDetail?.zimbraVirusDefinitionsUpdateFrequency, intervalOptions]);

	const onUpdateMesurementChange = useCallback(
		(v): any => {
			const findOption = intervalOptions.find((item: any) => item?.value === v);
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
										height={36}
										onClick={onCancel}
									/>
								)}
							</Padding>
							<Padding right="small">
								{isDirty && (
									<Button
										label={t('label.save', 'Save')}
										color="primary"
										height={36}
										onClick={onSave}
									/>
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
						<Select
							items={limitOptions}
							background="gray5"
							label={t('mta.light_span_limit', 'Light Spam limit')}
							showCheckbox={false}
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Input
							label={t(
								'mta.add_this_prefix_to_spam_mail_subject',
								'Add this prefix to the Spam mail subject'
							)}
							background="gray5"
							value={mtaAntiVirusAndAntispamDetail?.zimbraSpamSubjectTag}
							onChange={(e: any): any => {
								setValue(ZIMBRA_SPAM_SUBJECT_TAG, e.target.value);
							}}
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
							items={limitOptions}
							background="gray5"
							label={t('mta.hard_spam_limit', 'Hard Spam limit')}
							showCheckbox={false}
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Select
							items={discardPassOptions}
							background="gray5"
							label={t('mta.hard_spam_destiny', 'Hard Spam destiny')}
							showCheckbox={false}
							selection={discardPassOptions.find(
								(item: any) =>
									item.value === mtaAntiVirusAndAntispamDetail?.zimbraAmavisFinalSpamDestiny
							)}
							onChange={onSpamDestinyChange}
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

				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ bottom: 'extralarge' }}
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
							<Input label={t('mta.definition_mirrors', 'Definition Mirrors')} background="gray5" />
						</Container>
						<Container width="15%" crossAlignment="flex-start">
							<Button type="outlined" size="large" label={t('mta.add', 'Add')} color="primary" />
						</Container>
						<Container width="25%" crossAlignment="flex-start" mainAlignment="flex-start">
							<Button type="ghost" size="large" label={t('mta.remove', 'Remove')} color="primary" />
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
									background="gray5"
									value={additionalVirusAddText}
									onChange={(e: any): any => {
										setAdditionalVirusAddText(e.target.value);
									}}
								/>
							</Container>
							<Container width="15%" crossAlignment="flex-start">
								<Button
									type="outlined"
									size="large"
									label={t('mta.add', 'Add')}
									color="primary"
									onClick={onAddAdditionalVirusDefinition}
								/>
							</Container>
							<Container width="25%" crossAlignment="flex-start" mainAlignment="flex-start">
								<Button
									type="ghost"
									size="large"
									label={t('mta.remove', 'Remove')}
									color="primary"
									disabled={selectedAdditionalVirusDefinition.length === 0}
									onClick={onRemoveAdditionalVirusDefinition}
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
							rows={[]}
							headers={antiVirusMirrorHeader}
							showCheckbox={false}
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
							rows={additionalVirusDefinitionsTableRow}
							headers={additionalVirusDefinitionHeader}
							showCheckbox={false}
							selectedRows={selectedAdditionalVirusDefinition}
							RowFactory={CustomRowFactory}
							HeaderFactory={CustomHeaderFactory}
						/>
					</Container>
				</Container>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ bottom: 'extralarge', top: 'extralarge' }}
					height="auto"
				>
					<Container crossAlignment="flex-start" padding={{ right: 'medium' }} width="70%">
						<Input
							label={t('mta.definition_update_frequency', 'Definition Update Frenquency')}
							background="gray5"
							value={updateFrequncy}
							onChange={(e: any): void => {
								setUpdateFrequncy(e.target.value);
								setValue(
									ZIMBRA_VIRUS_DEFINITIONS_UPDATE_FREQUENCY,
									`${e.target.value}${updateMesurementUnit?.value}`
								);
							}}
						/>
					</Container>
					<Container crossAlignment="flex-start" width="30%">
						<Select
							items={intervalOptions}
							background="gray5"
							showCheckbox={false}
							selection={updateMesurementUnit}
							onChange={onUpdateMesurementChange}
						/>
					</Container>
				</Container>

				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ bottom: 'extralarge', top: 'extralarge' }}
					height="auto"
				>
					<Container crossAlignment="flex-start" padding={{ right: 'medium' }}>
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
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Switch
							label={t('mta.virus_block_encrypted_archive', 'Virus Block Encrypted Archive')}
							value={mtaAntiVirusAndAntispamDetail?.zimbraVirusBlockEncryptedArchive}
							onClick={(): void =>
								setValue(
									ZIMBRA_VIRUS_BLOCK_ENCRYPTED_ARCHIVE,
									!mtaAntiVirusAndAntispamDetail?.zimbraVirusBlockEncryptedArchive
								)
							}
						/>
					</Container>
				</Container>

				<Container crossAlignment="flex-start">
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
					/>
				</Container>
			</Container>
		</Container>
	);
};

export default MTAAntiVirusAndAntiSpam;
