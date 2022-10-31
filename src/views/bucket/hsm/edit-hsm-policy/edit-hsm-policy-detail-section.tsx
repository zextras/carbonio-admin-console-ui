/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Container,
	Input,
	Text,
	Select,
	IconButton,
	Padding,
	Checkbox,
	Table,
	Button
} from '@zextras/carbonio-design-system';
import { cloneDeep } from 'lodash';
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import ListRow from '../../../list/list-row';
import { HSMContext } from '../hsm-context/hsm-context';

const EditHsmPolicyDetailSection: FC<{
	currentPolicy: any;
	setIsDirty: any;
}> = ({ currentPolicy, setIsDirty }) => {
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
	const [policyCriteria, setPolicyCriteria] = useState<Array<any>>([]);
	const [isShowDateScale, setIsShowDateScale] = useState<boolean>(true);
	const [value, setValue] = useState<string>();
	const [selectedPolicies, setSelectedPolicies] = useState<Array<any>>([]);
	const [isUpdatePolicyCriteria, setIsUpdatePolicyCriteria] = useState<boolean>(false);
	const [selectedDestinationVolume, setSelectedDestinationVolume] = useState<Array<any>>(
		hsmDetail?.destinationVolume.map((item: any) => item?.id)
	);
	const [selectedSourceVolume, setSelectedSourceVolume] = useState<Array<any>>(
		hsmDetail?.sourceVolume.map((item: any) => item?.id)
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

	useMemo(() => {
		if (currentPolicy) {
			if (currentPolicy?.hsmType) {
				if (currentPolicy?.hsmType.length === 4) {
					setIsDocument(true);
					setIsContactEnable(true);
					setIsMessageEnable(true);
					setIsEventEnable(true);
				} else {
					currentPolicy?.hsmType.forEach((element: any) => {
						if (element === 5) {
							setIsMessageEnable(true);
						} else if (element === 8) {
							setIsDocument(true);
						} else if (element === 11) {
							setIsEventEnable(true);
						} else if (element === 6) {
							setIsContactEnable(true);
						}
					});
				}
			}

			if (currentPolicy?.hsmQuery) {
				const queries = currentPolicy?.hsmQuery.split(' ');
				if (queries && queries.length > 0 && hsmDetail?.isDataLoaded === false) {
					queries.forEach((element: string) => {
						if (
							element !== '' &&
							!element.startsWith('source') &&
							!element.startsWith('destination')
						) {
							const option = element.split(':')[0];
							const scale = element
								.split(':')[1]
								.match(/[a-zA-Z]/g)
								?.join('');
							const valueItem = element.split(':')[1].match(/\d/g)?.join('');
							setPolicyCriteria((prev) => [
								...prev,
								{
									option,
									scale,
									dateScale: valueItem
								}
							]);
						}

						if (
							element !== '' &&
							(element.startsWith('source') || element.startsWith('destination'))
						) {
							const option = element.split(':')[0];
							const valueItem = element.split(':')[1];
							if (option.startsWith('source')) {
								setSelectedSourceVolume(valueItem.split(',').map((item: any) => +item));
							}
							if (option.startsWith('destination')) {
								setSelectedDestinationVolume(valueItem.split(',').map((item: any) => +item));
							}
						}
					});
				} else {
					setPolicyCriteria(hsmDetail?.policyCriteria);
				}
			}
			setHsmDetail((prev: any) => ({
				...prev,
				isDataLoaded: true
			}));
		}
	}, [currentPolicy, setHsmDetail, hsmDetail?.isDataLoaded, hsmDetail?.policyCriteria]);

	useEffect(() => {
		setHsmDetail((prev: any) => ({
			...prev,
			policyCriteria
		}));
	}, [policyCriteria, setHsmDetail]);

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
				value: 'small'
			}
		],
		[t]
	);

	const dateScaleOption: any[] = useMemo(
		() => [
			{
				label: t('hsm.days', 'Days'),
				value: 'day'
			},
			{
				label: t('hsm.months', 'Months'),
				value: 'month'
			},
			{
				label: t('hsm.years', 'Years'),
				value: 'year'
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
	const [selectedScale, setSelectedScale]: any = useState<any>(
		isShowDateScale ? dateScaleOption[0] : scaleOptions[0]
	);
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

	const onScaleChange = useCallback(
		(v: any): any => {
			const it = scaleOptions.find((item: any) => item.value === v);
			setSelectedScale(it);
		},
		[scaleOptions]
	);

	const onDateScaleChange = useCallback(
		(v: any): any => {
			const it = dateScaleOption.find((item: any) => item.value === v);
			setSelectedScale(it);
		},
		[dateScaleOption]
	);

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
						<Text size="medium" weight="bold" key={index} color="#828282">
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

	const onAdd = useCallback(() => {
		const data = {
			option: selectedOption?.value,
			scale: selectedScale?.value,
			dateScale: value
		};
		setPolicyCriteria((prev) => [...prev, data]);
		setIsDirty(true);
	}, [selectedOption?.value, selectedScale?.value, value, setIsDirty]);

	const onDeletePolicy = useCallback(() => {
		const reducedArr = policyCriteria.filter(
			(item, itemIndex) => itemIndex !== selectedPolicies[0]
		);
		setPolicyCriteria(reducedArr);
		setSelectedPolicies([]);
		setIsDirty(true);
	}, [selectedPolicies, policyCriteria, setIsDirty]);

	useEffect(() => {
		if (selectedPolicies.length > 0) {
			setIsUpdatePolicyCriteria(true);
			const policy = policyCriteria[selectedPolicies[0]];
			const it = options.find((item: any) => item.value === policy?.option);
			setSelectedOption(it);
			if (policy) {
				if (policy?.option === 'after' || policy?.option === 'before') {
					setIsShowDateScale(true);
					onDateScaleChange(policy?.scale);
				} else {
					setIsShowDateScale(false);
					onScaleChange(policy?.scale);
				}
				setValue(policy?.dateScale);
			}
		} else {
			setValue('');
			setIsUpdatePolicyCriteria(false);
		}
	}, [selectedPolicies, policyCriteria, onScaleChange, onDateScaleChange, options]);

	const onUpdate = useCallback(() => {
		setPolicyCriteria([]);
		const data = {
			option: selectedOption?.value,
			scale: selectedScale?.value,
			dateScale: value
		};
		const _policy = cloneDeep(policyCriteria);
		_policy[selectedPolicies[0]] = data;
		setPolicyCriteria(_policy);
		setIsUpdatePolicyCriteria(false);
		setValue('');
		setSelectedPolicies([]);
		setIsDirty(true);
	}, [selectedOption, selectedScale, value, selectedPolicies, policyCriteria, setIsDirty]);

	useEffect(() => {
		const sourceVol = hsmDetail?.allVolumes?.filter((item: any) =>
			selectedSourceVolume?.includes(item?.id)
		);
		if (sourceVol && sourceVol.length > 0) {
			setHsmDetail((prev: any) => ({
				...prev,
				sourceVolume: sourceVol
			}));
		} else {
			setHsmDetail((prev: any) => ({
				...prev,
				sourceVolume: []
			}));
		}
	}, [selectedSourceVolume, hsmDetail?.allVolumes, setHsmDetail]);

	useEffect(() => {
		if (Array.isArray(hsmDetail?.allVolumes)) {
			const destVol = hsmDetail?.allVolumes?.filter((item: any) =>
				selectedDestinationVolume?.includes(item?.id)
			);
			if (destVol && destVol.length > 0) {
				setHsmDetail((prev: any) => ({
					...prev,
					destinationVolume: destVol
				}));
			} else {
				setHsmDetail((prev: any) => ({
					...prev,
					destinationVolume: []
				}));
			}
		}
	}, [hsmDetail?.allVolumes, selectedDestinationVolume, setHsmDetail]);

	return (
		<Container
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			height="calc(100vh - 300px)"
			background="white"
			style={{ overflow: 'auto', padding: '16px' }}
		>
			<ListRow>
				<Container padding={{ bottom: 'large' }}>
					<Input label={t('hsm.server', 'Server')} background="gray6" value={server} readOnly />
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
							setIsDirty(true);
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
							setIsDirty(true);
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
							setIsDirty(true);
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
							setIsDirty(true);
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
							setIsDirty(true);
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
						size="medium"
						value={value}
						onChange={(e: any): any => {
							setValue(e.target.value);
						}}
					/>
				</Container>
				<Container style={{ border: '1px solid #2b73d2' }} width="fit">
					{!isUpdatePolicyCriteria && (
						<Button
							type="outlined"
							label={t('label.add', 'Add')}
							icon="PlusOutline"
							iconPlacement="right"
							color="primary"
							height={46}
							onClick={onAdd}
						/>
					)}
					{isUpdatePolicyCriteria && (
						<Button
							type="outlined"
							label={t('label.update', 'Update')}
							icon="EditOutline"
							iconPlacement="right"
							color="primary"
							height={46}
							onClick={onUpdate}
						/>
					)}
				</Container>
				<Padding left="small">
					<Container style={{ border: '1px solid rgb(215, 73, 66)' }} width="fit">
						<IconButton
							iconColor="error"
							icon="Trash2Outline"
							height={44}
							width={44}
							onClick={onDeletePolicy}
							disabled={selectedPolicies.length === 0}
						/>
					</Container>
				</Padding>
			</ListRow>
			<ListRow>
				<Padding top="large">
					<Table
						rows={policyCriteriaRows}
						headers={headers}
						showCheckbox={false}
						multiSelect={false}
						selectedRows={selectedPolicies}
						onSelectionChange={(selected: any): void => setSelectedPolicies(selected)}
					/>
				</Padding>
			</ListRow>
		</Container>
	);
};

export default EditHsmPolicyDetailSection;
