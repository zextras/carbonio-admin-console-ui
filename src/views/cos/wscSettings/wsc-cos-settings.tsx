/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react-hooks/rules-of-hooks */
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { Button, Container, useSnackbar } from '@zextras/carbonio-design-system';
import _, { find } from 'lodash';
import { useTranslation } from 'react-i18next';

import { WscSettings } from './wsc-settings';
import { COS, ZIMBRA_ADMIN_URN } from '../../../constants';
import { flushCache } from '../../../services/flush-cache-service';
import { modifyCos, ModifyCosBody } from '../../../services/modify-cos-service';
import { useCosStore } from '../../../store/cos/store';
import { Right, Rights, useRightsStore } from '../../../store/rights/store';
import { PageLayout } from '../../page-layout';

const WscCosSettings: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const createSnackbar = useSnackbar();
	const cosInformation = useCosStore((state) => state.cos?.a);
	const [initCosData, setInitCosData] = useState({});
	const [zimbraId, setZimbraId] = useState('');
	const setCos = useCosStore((state) => state.setCos);
	const [cosFeatures, setCosFeatures] = useState<Record<string, string>>({});
	const rights: Rights = useRightsStore((state) => state.rights);

	const readonlyCOS = useMemo(() => {
		const rightsConfig: Right = find(rights, { type: COS }) || { all: [], type: COS };
		return !rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
	}, [rights]);

	const setSwitchOptionValue = useCallback(
		(key: string, value: string): void => {
			setInitCosData((prev: Record<string, string>) => ({ ...prev, [key]: value }));
			setCosFeatures((prev: Record<string, string>) => ({ ...prev, [key]: value }));
		},
		[setCosFeatures, setInitCosData]
	);

	const setInitialValues = useCallback(
		(obj: any) => {
			if (obj) {
				setSwitchOptionValue('carbonioFeatureChatsEnabled', obj?.carbonioFeatureChatsEnabled);
			}
		},
		[setSwitchOptionValue]
	);

	useEffect(() => {
		if (!!cosInformation && cosInformation.length > 0) {
			const obj: any = {};
			cosInformation.forEach((item: any) => {
				obj[item?.n] = item._content;
			});
			setZimbraId(obj?.zimbraId);
			setInitialValues(obj);
			setIsDirty(false);
		}
	}, [cosInformation, setInitialValues, setSwitchOptionValue, setZimbraId]);

	useEffect(() => {
		if (zimbraId && !_.isEqual(cosFeatures, initCosData)) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [cosFeatures, initCosData, zimbraId]);

	const modifyCosRequest = useCallback(
		(body: ModifyCosBody): void => {
			modifyCos(body)
				.then((data) => {
					flushCache('cos', 'id', body.id._content);
					createSnackbar({
						key: 'success',
						severity: 'success',
						label: t('label.change_save_success_msg', 'The change has been saved successfully'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
					const cos: any = data.cos[0];
					if (cos) {
						setCos(cos);
					}
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
		[createSnackbar, setCos, t]
	);

	const onSave = useCallback(() => {
		const body: ModifyCosBody = {
			_jsns: ZIMBRA_ADMIN_URN,
			id: {
				_content: zimbraId
			}
		} as ModifyCosBody;
		body.a = Object.keys(cosFeatures).map((ele) => ({ n: ele, _content: cosFeatures[ele] }));
		modifyCosRequest(body);
	}, [cosFeatures, modifyCosRequest, zimbraId]);

	const onCancel = useCallback(() => {
		setCosFeatures(initCosData);
		setIsDirty(false);
	}, [initCosData]);

	const headerButtons = useMemo(() => {
		if (!isDirty) return null;
		return (
			<Container orientation="horizontal" width="fit" gap="1rem">
				<Button label={t('label.cancel', 'Cancel')} color="secondary" onClick={onCancel} />
				<Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
			</Container>
		);
	}, [isDirty, onCancel, onSave, t]);

	return (
		<PageLayout title={t('', 'Workstream Collaboration')} headerComponent={headerButtons}>
			<WscSettings
				featuresDetail={cosFeatures}
				setFeaturesDetail={setCosFeatures}
				readonlyFeatures={readonlyCOS}
			/>
		</PageLayout>
	);
};

export default WscCosSettings;
