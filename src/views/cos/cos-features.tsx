/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react-hooks/rules-of-hooks */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import {
	Container,
	Row,
	Text,
	Divider,
	Switch,
	Padding,
	Button,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { useCosStore } from '../../store/cos/store';
import { modifyCos } from '../../services/modify-cos-service';
import { RouteLeavingGuard } from '../ui-extras/nav-guard';
import { useAuthIsAdvanced } from '../../store/auth-advanced/store';
import { Features } from './features';
import { getCoreAttributes } from '../../services/get-core-attributes';

const CosFeatures: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const cosInformation = useCosStore((state) => state.cos?.a);
	const cosName = useCosStore((state) => state.cos?.name);
	const [initCosData, setInitCosData]: any = useState({});
	const [zimbraId, setZimbraId]: any = useState('');
	const setCos = useCosStore((state) => state.setCos);
	const [cosFeatures, setCosFeatures] = useState<any>({
		carbonioFeatureMailsAppEnabled: false,
		zimbraFeatureOutOfOfficeReplyEnabled: true,
		zimbraFeatureSignaturesEnabled: false,
		zimbraFeatureMobileSyncEnabled: false,
		zimbraFeatureContactsEnabled: true,
		mobileContactFeatureSync: false,
		zimbraFeatureCalendarEnabled: true,
		mobileCalendarFeatureSync: false,
		carbonioFeatureFilesEnabled: false,
		carbonioFeatureFilesAppEnabled: false,
		carbonioFeatureChatsEnabled: false,
		carbonioFeatureChatsAppEnabled: false,
		zimbraFeatureTaskEnabled: false
	});
	const isAdvanced = useAuthIsAdvanced((state) => state.isAdvanced);

	const setSwitchOptionValue = useCallback(
		(key: string, value: boolean): void => {
			setInitCosData((prev: Record<string, boolean>) => ({ ...prev, [key]: value }));
			setCosFeatures((prev: Record<string, boolean>) => ({ ...prev, [key]: value }));
		},
		[setCosFeatures, setInitCosData]
	);

	const getMobileFeatureSync = useCallback(() => {
		const body: any = [
			{
				configType: 'cos',
				configName: [cosName],
				attrName: ['mobileContactFeatureSync', 'mobileCalendarFeatureSync']
			}
		];

		getCoreAttributes(body)
			.then((data) => {
				console.log('data:::', data);
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
	}, [cosName, createSnackbar, t]);

	const setInitalValues = useCallback(
		(obj: any) => {
			if (obj) {
				setSwitchOptionValue(
					'carbonioFeatureMailsAppEnabled',
					obj?.carbonioFeatureMailsAppEnabled === 'TRUE'
				);
				setSwitchOptionValue(
					'zimbraFeatureOutOfOfficeReplyEnabled',
					obj?.zimbraFeatureOutOfOfficeReplyEnabled === 'TRUE'
				);
				setSwitchOptionValue(
					'zimbraFeatureSignaturesEnabled',
					obj?.zimbraFeatureSignaturesEnabled === 'TRUE'
				);
				setSwitchOptionValue(
					'zimbraFeatureMobileSyncEnabled',
					obj?.zimbraFeatureMobileSyncEnabled === 'TRUE'
				);
				setSwitchOptionValue(
					'zimbraFeatureContactsEnabled',
					obj?.zimbraFeatureContactsEnabled === 'TRUE'
				);
				setSwitchOptionValue('mobileContactFeatureSync', obj?.mobileContactFeatureSync === 'TRUE');
				setSwitchOptionValue(
					'zimbraFeatureCalendarEnabled',
					obj?.zimbraFeatureCalendarEnabled === 'TRUE'
				);
				setSwitchOptionValue(
					'mobileCalendarFeatureSync',
					obj?.mobileCalendarFeatureSync === 'TRUE'
				);
				setSwitchOptionValue(
					'carbonioFeatureFilesAppEnabled',
					obj?.carbonioFeatureFilesAppEnabled === 'TRUE'
				);
				setSwitchOptionValue(
					'carbonioFeatureFilesEnabled',
					obj?.carbonioFeatureFilesEnabled === 'TRUE'
				);
				setSwitchOptionValue(
					'carbonioFeatureChatsEnabled',
					obj?.carbonioFeatureChatsEnabled === 'TRUE'
				);
				setSwitchOptionValue(
					'carbonioFeatureChatsAppEnabled',
					obj?.carbonioFeatureChatsAppEnabled === 'TRUE'
				);
				setSwitchOptionValue('zimbraFeatureTaskEnabled', obj?.zimbraFeatureTaskEnabled === 'TRUE');
			}
		},
		[setSwitchOptionValue]
	);

	useEffect(() => {
		if (!!cosInformation && cosInformation.length > 0) {
			const obj: any = {};
			cosInformation.map((item: any) => {
				obj[item?.n] = item._content;
				return '';
			});
			setZimbraId(obj?.zimbraId);
			setInitalValues(obj);
			setIsDirty(false);
		}
	}, [cosInformation, setInitalValues, setSwitchOptionValue, setZimbraId]);

	useEffect(() => {
		if (zimbraId && !_.isEqual(cosFeatures, initCosData)) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [cosFeatures, initCosData, zimbraId]);

	useEffect(() => {
		if (isAdvanced && cosName) {
			getMobileFeatureSync();
		}
	}, [cosName, getMobileFeatureSync, isAdvanced]);

	const onSave = (): void => {
		const body: any = {};
		body._jsns = 'urn:zimbraAdmin';
		const attrList: { n: string; _content: string }[] = [];
		Object.keys(cosFeatures).map((ele: any) =>
			attrList.push({ n: ele, _content: cosFeatures[ele] === true ? 'TRUE' : 'FALSE' })
		);
		body.a = attrList;
		const id = {
			_content: zimbraId
		};
		body.id = id;
		modifyCos(body)
			.then((data) => {
				createSnackbar({
					key: 'success',
					type: 'success',
					label: t('label.change_save_success_msg', 'The change has been saved successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				const cos: any = data.cos[0];
				if (cos) {
					setCos(cos);
				}
				setIsDirty(false);
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
	};

	const onCancel = (): void => {
		setCosFeatures(initCosData);
		setIsDirty(false);
	};

	return (
		<Container mainAlignment="flex-start" background="gray6" padding={{ all: 'large' }}>
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
								{t('cos.features', 'Features')}
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
			<Features featuresDetail={cosFeatures} setFeaturesDetail={setCosFeatures} />
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

export default CosFeatures;
