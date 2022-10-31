/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	Text,
	Input,
	Container,
	Checkbox,
	Select,
	Button,
	IconButton,
	Padding,
	Table
} from '@zextras/carbonio-design-system';
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
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

	const [isShowDateScale, setIsShowDateScale] = useState<boolean>(true);

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
			height="calc(100vh - 280px)"
			background="white"
			style={{ overflow: 'auto', padding: '16px' }}
		>
			<ListRow>
				<Container padding={{ bottom: 'large' }}>
					<Input label={t('hsm.server', 'Server')} background="gray6" value={server} />
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
						size="medium"
						value={value}
						onChange={(e: any): any => {
							setValue(e.target.value);
						}}
					/>
				</Container>
				<Container width="fit" padding={{ right: 'small' }}>
					<Button
						type="outlined"
						label={t('label.add', 'Add')}
						icon="PlusOutline"
						iconPlacement="right"
						color="primary"
						height={46}
						onClick={onAdd}
					/>
				</Container>
				<Container style={{ border: '1px solid rgb(215, 73, 66)' }} width="fit">
					<IconButton
						iconColor="error"
						icon="Trash2Outline"
						height={44}
						width={44}
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
						onSelectionChange={(selected: any): void => setSelectedPolicies(selected)}
					/>
				</Container>
			</ListRow>
		</Container>
	);
};

export default HSMpolicySettings;
