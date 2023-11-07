/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
	Text,
	Input,
	Container,
	Checkbox,
	Select,
	Button,
	Switch,
	Padding,
	Table,
	Row,
	SnackbarManagerContext,
	Divider
} from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import CustomHeaderFactory from '../../../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../../../app/shared/customTableRowFactory';
import ListRow from '../../../list/list-row';
import { HSMContext } from '../hsm-context/hsm-context';

const HSMpolicySettings: FC<any> = () => {
	const { operation, server }: { operation: string; server: string } = useParams();
	const [t] = useTranslation();
	const context = useContext(HSMContext);
	const { hsmDetail, setHsmDetail } = context;
	const [all, setAll] = useState<boolean>(hsmDetail?.isAllEnabled);
	const [isMessageEnable, setIsMessageEnable] = useState<boolean>(hsmDetail?.isMessageEnabled);
	const [isEventEnable, setIsEventEnable] = useState<boolean>(hsmDetail?.isEventEnabled);
	const [isContactEnable, setIsContactEnable] = useState<boolean>(hsmDetail?.isContactEnabled);
	const [isDocument, setIsDocument] = useState<boolean>(hsmDetail?.isDocumentEnabled);
	const [policyCriteriaRows, setPolicyCriteriaRows] = useState<Array<any>>();
	const [value, setValue] = useState<string>();
	const [selectedPolicies, setSelectedPolicies] = useState<Array<any>>([]);

	const options: any[] = useMemo(
		() => [
			{
				label: t('hsm.after_date', 'After (Date)'),
				value: 'after'
			},
			{
				label: t('hsm.before_date', 'Before (Date)'),
				value: 'before'
			},
			{
				label: t('hsm.larger_size', 'Larger (Size)'),
				value: 'larger'
			},
			{
				label: t('hsm.smaller_size', 'Smaller (Size)'),
				value: 'smaller'
			}
		],
		[t]
	);

	const dateScaleOption: any[] = useMemo(
		() => [
			{
				label: t('hsm.minutes', 'Minutes'),
				value: 'minutes'
			},
			{
				label: t('hsm.hours', 'Hours'),
				value: 'hours'
			},
			{
				label: t('hsm.days', 'Days'),
				value: 'days'
			},
			{
				label: t('hsm.months', 'Months'),
				value: 'months'
			},
			{
				label: t('hsm.years', 'Years'),
				value: 'years'
			}
		],
		[t]
	);

	const scaleOptions: any[] = useMemo(
		() => [
			{
				label: t('hsm.bytes', 'Byte (B)'),
				value: 'byte'
			},
			{
				label: t('hsm.kb', 'KB'),
				value: 'kb'
			},
			{
				label: t('hsm.mb', 'MB'),
				value: 'mb'
			},
			{
				label: t('hsm.gb', 'GB'),
				value: 'gb'
			}
		],
		[t]
	);

	const headers = useMemo(
		() => [
			{
				id: 'name',
				label: t('hsm.policy_criteria', 'Policy Criteria'),
				width: '100%',
				bold: true
			}
		],
		[t]
	);

	const [selectedOption, setSelectedOption]: any = useState<any>(options[0]);

	const [isShowDateScale, setIsShowDateScale] = useState<boolean>(true);

	const [selectedScale, setSelectedScale]: any = useState<any>(
		isShowDateScale ? dateScaleOption[2] : scaleOptions[0]
	);
	const [showSourceVolume, setShowSourceVolume] = useState<boolean>(
		hsmDetail?.sourceVolume.length > 0
	);
	const [showDestinationVolume, setShowDestinationVolume] = useState<boolean>(
		hsmDetail?.destinationVolume.length > 0
	);

	const [volumeRows, setVolumeRows] = useState<Array<any>>([]);
	const [selectedDestinationVolume, setSelectedDestinationVolume] = useState<Array<any>>(
		hsmDetail?.destinationVolume.map((item: any) => item?.id)
	);
	const [selectedSourceVolume, setSelectedSourceVolume] = useState<Array<any>>(
		hsmDetail?.sourceVolume.map((item: any) => item?.id)
	);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const header = useMemo(
		() => [
			{
				id: 'name',
				label: t('hsm.name', 'Name'),
				width: '25%',
				bold: true
			},
			{
				id: 'allocation',
				label: t('hsm.allocation', 'Allocation'),
				width: '25%',
				bold: true
			},
			{
				id: 'type',
				label: t('hsm.type', 'Type'),
				width: '25%',
				bold: true
			},
			{
				id: 'current',
				label: t('hsm.current', 'Current'),
				width: '25%',
				bold: true
			}
		],
		[t]
	);

	const getVoumeType = useCallback(
		(type: number): string => {
			if (type === 1) {
				return t('hsm.primary', 'Primary');
			}
			if (type === 2) {
				return t('hsm.secondary', 'Secondary');
			}
			return t('hsm.indexes', 'Indexes');
		},
		[t]
	);

	useEffect(() => {
		const volumeList = hsmDetail?.allVolumes;
		if (volumeList && volumeList.length > 0) {
			const allRows = volumeList.map((item: any) => ({
				id: item?.id,
				columns: [
					<Text size="small" weight="regular" key={item}>
						{item?.name}
					</Text>,
					<Text size="small" weight="light" key={item}>
						{''}
					</Text>,
					<Text size="small" weight="light" key={item}>
						{getVoumeType(item?.type)}
					</Text>,
					<Text
						size="small"
						weight="light"
						key={item}
						color={item?.isCurrent ? 'gray0' : '#D74942'}
					>
						{item?.isCurrent ? t('hsm.yes', 'Yes') : t('hsm.no', 'No')}
					</Text>
				]
			}));
			setVolumeRows(allRows);
		} else {
			setVolumeRows([]);
		}
	}, [hsmDetail?.allVolumes, getVoumeType, t]);

	useEffect(() => {
		if (Array.isArray(hsmDetail?.allVolumes)) {
			const sourceVol = hsmDetail?.allVolumes?.filter((item: any) =>
				selectedSourceVolume?.includes(item?.id)
			);
			if (sourceVol) {
				setHsmDetail((prev: any) => ({
					...prev,
					sourceVolume: sourceVol
				}));
			}
		}
	}, [hsmDetail?.allVolumes, selectedSourceVolume, setHsmDetail]);

	useEffect(() => {
		if (Array.isArray(hsmDetail?.allVolumes)) {
			const destVol = hsmDetail?.allVolumes?.filter((item: any) =>
				selectedDestinationVolume?.includes(item?.id)
			);
			if (destVol) {
				setHsmDetail((prev: any) => ({
					...prev,
					destinationVolume: destVol
				}));
			}
		}
	}, [hsmDetail?.allVolumes, selectedDestinationVolume, setHsmDetail]);

	const onOptionChange = (v: any): any => {
		const it = options.find((item: any) => item.value === v);
		setSelectedOption(it);
		if (it?.value === 'after' || it?.value === 'before') {
			setIsShowDateScale(true);
			setSelectedScale(dateScaleOption[0]);
		} else {
			setIsShowDateScale(false);
			setSelectedScale(scaleOptions[0]);
		}
	};

	const onScaleChange = (v: any): any => {
		const it = scaleOptions.find((item: any) => item.value === v);
		setSelectedScale(it);
	};

	const onDateScaleChange = (v: any): any => {
		const it = dateScaleOption.find((item: any) => item.value === v);
		setSelectedScale(it);
	};

	const [policyCriteria, setPolicyCriteria] = useState<Array<any>>(hsmDetail?.policyCriteria);

	const onAdd = useCallback(() => {
		setPolicyCriteria((prev) => [
			...prev,
			{
				option: selectedOption?.value,
				scale: selectedScale?.value,
				dateScale: value
			}
		]);
	}, [selectedOption?.value, selectedScale?.value, value]);

	useEffect(() => {
		setHsmDetail((prev: any) => ({
			...prev,
			policyCriteria
		}));
	}, [policyCriteria, setHsmDetail]);

	useEffect(() => {
		if (policyCriteria.length > 0) {
			let displayPolicy = '';
			const allRows = policyCriteria.map((item: any, index: number) => {
				if (item?.option === 'before' || item?.option === 'after') {
					displayPolicy = `${item?.option} ${item?.dateScale} ${item?.scale}`;
				} else if (item?.option === 'larger' || item?.option === 'smaller') {
					displayPolicy = `${item?.option}  ${item?.dateScale} ${item?.scale}`;
				}
				return {
					id: index,
					columns: [
						<Text
							size="small"
							weight="regular"
							key={index}
							onClick={(): void => {
								setSelectedPolicies([index]);
							}}
						>
							{displayPolicy}
						</Text>
					]
				};
			});
			setPolicyCriteriaRows(allRows);
		} else if (policyCriteria.length === 0) {
			setPolicyCriteriaRows([]);
		}
	}, [policyCriteria, t]);

	const onClickAll = useCallback(
		(check: boolean) => {
			setAll(check);
			setHsmDetail((prev: any) => ({
				...prev,
				isAllEnabled: check,
				isMessageEnabled: check,
				isEventEnabled: check,
				isContactEnabled: check,
				isDocumentEnabled: check
			}));
			setIsDocument(check);
			setIsContactEnable(check);
			setIsMessageEnable(check);
			setIsEventEnable(check);
		},
		[setHsmDetail]
	);

	useEffect(() => {
		if (!isDocument || !isContactEnable || !isMessageEnable || !isEventEnable) {
			setAll(false);
			setHsmDetail((prev: any) => ({
				...prev,
				isAllEnabled: false
			}));
		} else if (isDocument && isContactEnable && isMessageEnable && isEventEnable) {
			setAll(true);
			setHsmDetail((prev: any) => ({
				...prev,
				isAllEnabled: true
			}));
		}
	}, [isDocument, isContactEnable, isMessageEnable, isEventEnable, setHsmDetail]);

	const onDeletePolicy = useCallback(() => {
		const reducedArr = policyCriteria.filter(
			(item, itemIndex) => itemIndex !== selectedPolicies[0]
		);
		setPolicyCriteria(reducedArr);
		setSelectedPolicies([]);
	}, [selectedPolicies, policyCriteria]);

	return (
		<Container
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			height="calc(100vh - 12.5rem)"
			background="white"
			style={{ overflow: 'auto', padding: '1rem' }}
		>
			<ListRow>
				<Container padding={{ bottom: 'extralarge' }}>
					<Input label={t('hsm.server', 'Server')} backgroundColor="gray6" value={server} />
				</Container>
			</ListRow>
			<ListRow>
				<Padding bottom="large">
					<Text size="medium" weight="bold" color="gray0">
						{<Trans i18nKey="hsm.items" defaults="Items" />}
					</Text>
				</Padding>
			</ListRow>
			<ListRow>
				<Container mainAlignment="flex-start" crossAlignment="flex-start">
					<Checkbox
						iconColor="primary"
						size="small"
						label={t('hsm.all', 'All')}
						value={all}
						onClick={(): void => {
							onClickAll(!all);
						}}
					/>
				</Container>
				<Container mainAlignment="flex-start" crossAlignment="flex-start">
					<Checkbox
						iconColor="primary"
						size="small"
						label={t('hsm.message', 'Message')}
						value={isMessageEnable}
						onClick={(): void => {
							setIsMessageEnable(!isMessageEnable);
							setHsmDetail((prev: any) => ({
								...prev,
								isMessageEnabled: !isMessageEnable
							}));
						}}
					/>
				</Container>
				<Container mainAlignment="flex-start" crossAlignment="flex-start">
					<Checkbox
						iconColor="primary"
						size="small"
						label={t('hsm.document', 'Document')}
						value={isDocument}
						onClick={(): void => {
							setIsDocument(!isDocument);
							setHsmDetail((prev: any) => ({
								...prev,
								isDocumentEnabled: !isDocument
							}));
						}}
					/>
				</Container>
				<Container mainAlignment="flex-start" crossAlignment="flex-start">
					<Checkbox
						iconColor="primary"
						size="small"
						label={t('hsm.event', 'Event')}
						value={isEventEnable}
						onClick={(): void => {
							setIsEventEnable(!isEventEnable);
							setHsmDetail((prev: any) => ({
								...prev,
								isEventEnabled: !isEventEnable
							}));
						}}
					/>
				</Container>
				<Container mainAlignment="flex-start" crossAlignment="flex-start">
					<Checkbox
						iconColor="primary"
						size="small"
						label={t('hsm.contact', 'Contact')}
						value={isContactEnable}
						onClick={(): void => {
							setIsContactEnable(!isContactEnable);
							setHsmDetail((prev: any) => ({
								...prev,
								isContactEnabled: !isContactEnable
							}));
						}}
					/>
				</Container>
			</ListRow>
			<ListRow>
				<Padding bottom="large" top="large">
					<Text size="medium" weight="bold" color="gray0">
						{<Trans i18nKey="hsm.criteria" defaults="Criteria" />}
					</Text>
				</Padding>
			</ListRow>
			<ListRow>
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ right: 'large' }}
				>
					<Select
						items={options}
						background="gray5"
						label={t('hsm.option', 'Option')}
						showCheckbox={false}
						selection={selectedOption}
						onChange={onOptionChange}
					/>
				</Container>

				{isShowDateScale && (
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ right: 'large' }}
					>
						<Select
							items={dateScaleOption}
							background="gray5"
							label={t('hsm.value', 'Value')}
							showCheckbox={false}
							selection={selectedScale}
							onChange={onDateScaleChange}
						/>
					</Container>
				)}
				{!isShowDateScale && (
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ right: 'large' }}
					>
						<Select
							items={scaleOptions}
							background="gray5"
							label={t('hsm.value', 'Value')}
							showCheckbox={false}
							selection={selectedScale}
							onChange={onScaleChange}
						/>
					</Container>
				)}

				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ right: 'large' }}
				>
					<Input
						label={t('hsm.value', 'Value')}
						backgroundColor="gray5"
						value={value}
						onChange={(e: any): any => {
							setValue(e.target.value);
						}}
					/>
				</Container>
				<Container>
					<Button
						type="outlined"
						label={t('label.add', 'Add')}
						icon="PlusOutline"
						iconPlacement="right"
						color="primary"
						onClick={onAdd}
						size="large"
					/>
				</Container>
				<Container maxWidth="5rem">
					<Button
						type="outlined"
						key="add-button"
						label={''}
						color="error"
						icon="Trash2Outline"
						iconPlacement="left"
						size="large"
						onClick={onDeletePolicy}
					/>
				</Container>
			</ListRow>
			<ListRow>
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ top: 'large' }}
				>
					<Table
						rows={policyCriteriaRows}
						headers={headers}
						showCheckbox={false}
						multiSelect={false}
						selectedRows={selectedPolicies}
						RowFactory={CustomRowFactory}
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore // Need to fix it with custom soultion
						HeaderFactory={CustomHeaderFactory}
					/>
				</Container>
			</ListRow>
			{policyCriteriaRows?.length === 0 && (
				<Container orientation="column" crossAlignment="center" mainAlignment="center">
					<Row
						padding={{ top: 'extralarge' }}
						orientation="vertical"
						crossAlignment="center"
						style={{ textAlign: 'center' }}
					>
						<Text weight="light" color="#828282" size="large" overflow="break-word">
							{t('label.this_list_is_empty', 'This list is empty.')}
						</Text>
					</Row>
					<Row
						orientation="vertical"
						crossAlignment="center"
						style={{ textAlign: 'center' }}
						padding={{ top: 'small' }}
						width="53%"
					>
						<Text weight="light" color="#828282" size="large" overflow="break-word">
							<Trans
								i18nKey="label.do_you_need_more_information"
								defaults="Do you need more information?"
							/>
						</Text>
					</Row>
					<Row
						orientation="vertical"
						crossAlignment="center"
						style={{ textAlign: 'center' }}
						padding={{ top: 'small', bottom: 'small' }}
						width="53%"
					>
						<Text weight="light" color="primary">
							{t('label.click_here', 'Click here')}
						</Text>
					</Row>
				</Container>
			)}
			<Container padding={{ top: 'extralarge', bottom: 'extralarge' }}>
				<Divider />
			</Container>

			<Container mainAlignment="flex-start" crossAlignment="flex-start" background="white">
				<ListRow>
					<Padding bottom="large">
						<Text size="medium" weight="bold" color="gray0">
							{<Trans i18nKey="hsm.source_volume" defaults="Source Volume" />}
						</Text>
					</Padding>
				</ListRow>
				<ListRow>
					<Padding bottom="large">
						<Text size="medium" color="secondary" style={{ whiteSpace: 'normal' }}>
							{t(
								'hsm.all_primary_volume_used_source_msg',
								'All primary volumes will be used as source by default. Or select manually other volumes.'
							)}
						</Text>
					</Padding>
				</ListRow>
				<ListRow>
					<Padding bottom="large">
						<Switch
							label={t('hsm.select_manually_source_volumes', 'Select manually source volumes')}
							value={showSourceVolume}
							onClick={(): void => {
								setShowSourceVolume(!showSourceVolume);
							}}
							iconColor="primary"
						/>
					</Padding>
				</ListRow>
				<ListRow>
					<Padding bottom="large">
						{showSourceVolume && (
							<Table
								rows={volumeRows}
								headers={header}
								selectedRows={selectedSourceVolume}
								onSelectionChange={(selected: any): void => {
									const available = selectedDestinationVolume.filter((item: any) =>
										selected?.includes(item)
									);
									if (available.length > 0) {
										createSnackbar({
											key: 'error',
											type: 'error',
											label: t(
												'hsm.volume_already_selected_in_destination',
												'Volume already selected in destination volume'
											),
											autoHideTimeout: 3000,
											hideButton: true,
											replace: true
										});
									} else {
										setSelectedSourceVolume(selected);
									}
								}}
								RowFactory={CustomRowFactory}
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore // Need to fix it with custom soultion
								HeaderFactory={CustomHeaderFactory}
							/>
						)}
					</Padding>
				</ListRow>

				<ListRow>
					<Padding bottom="large">
						<Text size="medium" weight="bold" color="gray0">
							{<Trans i18nKey="hsm.destination_volume" defaults="Destination Volume" />}
						</Text>
					</Padding>
				</ListRow>
				<ListRow>
					<Padding bottom="large">
						<Text size="medium" color="secondary" style={{ whiteSpace: 'normal' }}>
							{t(
								'hsm.all_secondary_volume_used_source_msg',
								'The current secondary volume will be used as a destination. Or select manually other volumes.'
							)}
						</Text>
					</Padding>
				</ListRow>
				<ListRow>
					<Padding bottom="large">
						<Switch
							label={t(
								'hsm.select_manually_destination_volumes',
								'Select manually destination volumes'
							)}
							value={showDestinationVolume}
							onClick={(): void => {
								setShowDestinationVolume(!showDestinationVolume);
							}}
							iconColor="primary"
						/>
					</Padding>
				</ListRow>
				<ListRow>
					<Padding bottom="large">
						{showDestinationVolume && (
							<Table
								rows={volumeRows}
								headers={header}
								showCheckbox
								multiSelect={false}
								selectedRows={selectedDestinationVolume}
								onSelectionChange={(selected: any): void => {
									const available = selectedSourceVolume.filter((item: any) =>
										selected?.includes(item)
									);
									if (available.length > 0) {
										createSnackbar({
											key: 'error',
											type: 'error',
											label: t(
												'hsm.volume_already_selected_in_source',
												'Volume already selected in source volume'
											),
											autoHideTimeout: 3000,
											hideButton: true,
											replace: true
										});
									} else {
										setSelectedDestinationVolume(selected);
									}
								}}
								RowFactory={CustomRowFactory}
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore // Need to fix it with custom soultion
								HeaderFactory={CustomHeaderFactory}
							/>
						)}
					</Padding>
				</ListRow>
			</Container>
		</Container>
	);
};

export default HSMpolicySettings;
