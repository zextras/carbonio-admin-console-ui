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
import React, { FC, useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ListRow from '../../list/list-row';
import CustomRowFactory from '../../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../../app/shared/customTableHeaderFactory';
import { HIGH, LOW, MEDIUM } from '../../../constants';
import { useConfigStore } from '../../../store/config/store';
import { MtaAntivirusAndAntispam } from '../../../../types';

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

	const setInitialValue = useCallback((key: string, value: any): void => {
		setMtaAntiVirusAndAntispamInitialDetail((prev: any) => ({ ...prev, [key]: value }));
	}, []);

	const setValue = useCallback((key: string, value: any): void => {
		setMtaAntiVirusAndAntispamDetail((prev: any) => ({ ...prev, [key]: value }));
	}, []);

	const setInitialAndCurrentValue = useCallback(
		(key, value) => {
			setInitialValue(key, value);
			setValue(key, value);
		},
		[setInitialValue, setValue]
	);

	const onSave = useCallback(() => {
		console.log('save');
	}, []);

	const onCancel = useCallback(() => {
		console.log('cancel');
	}, []);

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
						<Switch label={t('mta.also_check_outbound_messages', 'Also check outbound messages')} />
					</Container>
					<Container crossAlignment="flex-start">
						<Switch label={t('mta.verify_dkim_validity', 'Verify DKIM validity')} />
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
								/>
							</Container>
							<Container width="15%" crossAlignment="flex-start">
								<Button type="outlined" size="large" label={t('mta.add', 'Add')} color="primary" />
							</Container>
							<Container width="25%" crossAlignment="flex-start" mainAlignment="flex-start">
								<Button
									type="ghost"
									size="large"
									label={t('mta.remove', 'Remove')}
									color="primary"
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
							rows={[]}
							headers={additionalVirusDefinitionHeader}
							showCheckbox={false}
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
						/>
					</Container>
					<Container crossAlignment="flex-start" width="30%">
						<Select items={intervalOptions} background="gray5" showCheckbox={false} />
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
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Switch
							label={t('mta.virus_block_encrypted_archive', 'Virus Block Encrypted Archive')}
						/>
					</Container>
				</Container>

				<Container crossAlignment="flex-start">
					<Switch
						label={t(
							'mta.warn_admins_when_something_quarntined',
							'Warn admins when something is quarantined'
						)}
					/>
				</Container>
			</Container>
		</Container>
	);
};

export default MTAAntiVirusAndAntiSpam;
