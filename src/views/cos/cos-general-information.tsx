/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useContext, useEffect, useState } from 'react';
import {
	Container,
	Divider,
	Row,
	Text,
	Input,
	Icon,
	Button,
	Padding,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { useCosStore } from '../../store/cos/store';
import { getFormatedDate, getDateFromStr } from '../utility/utils';

const CosGeneralInformation: FC = () => {
	const [t] = useTranslation();
	// const cos = useCosStore((state) => state.cos);
	const cosInformation = useCosStore((state) => state.cos?.a);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [cosData, setCosData]: any = useState({});
	const [cosName, setCosName] = useState<string>('');
	const [description, setDescription] = useState<string>('');
	const [zimbraNotes, setZimbraNotes] = useState<string>('');

	const SettingRow: FC<{ children?: any; wrap?: any }> = ({ children, wrap }) => (
		<Row
			orientation="horizontal"
			mainAlignment="space-between"
			crossAlignment="flex-start"
			width="fill"
			wrap={wrap || 'nowrap'}
		>
			{children}
		</Row>
	);

	useEffect(() => {
		if (!!cosInformation && cosInformation.length > 0) {
			const obj: any = {};
			cosInformation.map((item: any) => {
				obj[item?.n] = item._content;
				return '';
			});
			setCosName(obj.cn);
			if (obj.description) {
				setDescription(obj.description);
			} else {
				obj.description = '';
			}
			if (obj.zimbraNotes) {
				setZimbraNotes(obj.zimbraNotes);
			} else {
				obj.zimbraNotes = '';
			}
			setCosData(obj);
			setIsDirty(false);
		}
	}, [cosInformation]);

	useEffect(() => {
		if (cosData.cn !== cosName) {
			setIsDirty(true);
		}
	}, [cosData, cosName]);

	useEffect(() => {
		if (cosData.description !== description) {
			setIsDirty(true);
		}
	}, [cosData, description]);

	useEffect(() => {
		if (cosData.zimbraNotes !== zimbraNotes) {
			setIsDirty(true);
		}
	}, [cosData, zimbraNotes]);

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	const onSave = (): void => {};
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	const onCancel = (): void => {
		setCosName(cosData.cn);
		setDescription(cosData.description);
		setZimbraNotes(cosData.zimbraNotes);
		setIsDirty(false);
	};

	return (
		<Container mainAlignment="flex-start" background="gray6" style={{ maxWidth: '982px' }}>
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
				<Container
					orientation="vertical"
					mainAlignment="space-around"
					background="gray6"
					height="58px"
				>
					<Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
						<Row mainAlignment="flex-start" width="50%" crossAlignment="flex-start">
							<Text size="medium" weight="bold" color="gray0">
								{t('cos.general_information', 'General Information')}
							</Text>
						</Row>
						<Row width="50%" mainAlignment="flex-end" crossAlignment="flex-end">
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
			<Row orientation="horizontal" width="100%" background="gray6">
				<Divider />
			</Row>
			<Container
				orientation="column"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				style={{ overflow: 'auto' }}
				width="100%"
				// height="calc(100vh - 230px)"
			>
				<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
					<Container
						height="fit"
						crossAlignment="flex-start"
						background="gray6"
						padding={{ left: 'small', right: 'small' }}
					>
						<SettingRow>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.name', 'Name')}
									background="gray5"
									value={cosName}
									onChange={(e: any): any => {
										setCosName(e.target.value);
									}}
								/>
							</Container>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.description', 'Description')}
									value={description}
									background="gray5"
									onChange={(e: any): any => {
										setDescription(e.target.value);
									}}
								/>
							</Container>
						</SettingRow>
						<SettingRow>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.id', 'ID')}
									background="gray6"
									value={cosData.zimbraId}
									disabled
								/>
							</Container>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.creation_date', 'Creation Date')}
									value={
										!!cosData.zimbraCreateTimestamp && cosData.zimbraCreateTimestamp !== null
											? getFormatedDate(getDateFromStr(cosData.zimbraCreateTimestamp))
											: ''
									}
									background="gray6"
									disabled
								/>
							</Container>
						</SettingRow>
						<SettingRow>
							<SettingRow>
								<Row
									mainAlignment="flex-start"
									crossAlignment="flex-start"
									width="10%"
									padding={{ top: 'large', left: 'small' }}
								>
									<Icon icon="AtOutline" size="large" />
								</Row>
								<Row
									width="90%"
									mainAlignment="flex-start"
									crossAlignment="flex-start"
									padding={{ right: 'small' }}
								>
									<Input
										label={t('label.used_on_accounts', 'Used on Accounts')}
										background="gray6"
										value="85"
										disabled
									/>
								</Row>
							</SettingRow>
							<SettingRow>
								<Row
									mainAlignment="flex-start"
									crossAlignment="flex-start"
									width="10%"
									padding={{ top: 'large', left: 'small' }}
								>
									<Icon icon="GlobeOutline" size="large" />
								</Row>
								<Row
									width="90%"
									mainAlignment="flex-start"
									crossAlignment="flex-start"
									padding={{ right: 'small' }}
								>
									<Input
										label={t('label.used_on_Domains', 'Used on Domains')}
										value="7"
										background="gray6"
										disabled
									/>
								</Row>
							</SettingRow>
						</SettingRow>
						<SettingRow>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.notes', 'Notes')}
									background="gray5"
									value={zimbraNotes}
									onChange={(e: any): any => {
										setZimbraNotes(e.target.value);
									}}
								/>
							</Container>
						</SettingRow>
					</Container>
				</Row>
			</Container>
			<Container
				width="100%"
				mainAlignment="flex-end"
				crossAlignment="flex-end"
				padding={{ top: 'small', right: 'large', bottom: 'small', left: 'large' }}
			>
				<Button type="outlined" label="DELETE" icon="CloseOutline" color="error" size="fill" />
			</Container>
		</Container>
	);
};

export default CosGeneralInformation;
