/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react-hooks/rules-of-hooks */
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { Button, Container, useSnackbar } from '@zextras/carbonio-design-system';
import { find, forEach, isEqual, size } from 'lodash';
import { useTranslation } from 'react-i18next';

import { WscSettings } from './wsc-settings';
import { Attribute, Cos } from '../../../../types';
import { COS, ZIMBRA_ADMIN_URN } from '../../../constants';
import { flushCache } from '../../../services/flush-cache-service';
import { modifyCos, ModifyCosBody } from '../../../services/modify-cos-service';
import { useCosStore } from '../../../store/cos/store';
import { Right, Rights, useRightsStore } from '../../../store/rights/store';
import { AccountType } from '../../domain/manange/accounts/account-types/account-types';
import { PageLayout } from '../../page-layout';

const WscCosSettings: FC = () => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();

	const [zimbraId, setZimbraId] = useState<string | undefined>(undefined);
	const [initCosData, setInitCosData] = useState<AccountType>({});
	const [cosFeatures, setCosFeatures] = useState<AccountType>({});
	const [isDirty, setIsDirty] = useState<boolean>(false);

	const cosInformation = useCosStore((state) => state.cos?.a);
	const setCos = useCosStore((state) => state.setCos);
	const rights: Rights = useRightsStore((state) => state.rights);

	const readonlyCOS = useMemo(() => {
		const rightsConfig: Right = find(rights, { type: COS }) || { all: [], type: COS };
		return !rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
	}, [rights]);

	const setSwitchOptionValue = useCallback(
		(key: keyof AccountType, value: string | undefined): void => {
			if (value) {
				setInitCosData((prev) => ({ ...prev, [key]: value }));
				setCosFeatures((prev) => ({ ...prev, [key]: value }));
			}
		},
		[setCosFeatures, setInitCosData]
	);

	const setInitialValues = useCallback(
		(obj: AccountType) => {
			if (obj) {
				setSwitchOptionValue('carbonioFeatureChatsEnabled', obj?.carbonioFeatureChatsEnabled);
				setSwitchOptionValue('carbonioWscShowMessageReads', obj?.carbonioWscShowMessageReads);
				setSwitchOptionValue('carbonioWscShowUsersPresence', obj?.carbonioWscShowUsersPresence);
				setSwitchOptionValue('carbonioWscVirtualBackground', obj?.carbonioWscVirtualBackground);
				setSwitchOptionValue('carbonioWscVideoCall', obj?.carbonioWscVideoCall);
				setSwitchOptionValue('carbonioWscVideoCallRecord', obj?.carbonioWscVideoCallRecord);
				setSwitchOptionValue('carbonioWscGroupCreation', obj?.carbonioWscGroupCreation);
				setSwitchOptionValue('carbonioWscSingleCreation', obj?.carbonioWscSingleCreation);
				setSwitchOptionValue('carbonioWscAttachmentUpload', obj?.carbonioWscAttachmentUpload);
				// setSwitchOptionValue(
				// 	'carbonioWscMessageDeletionTimeLimit',
				// 	obj?.carbonioWscMessageDeletionTimeLimit
				// );
				// setSwitchOptionValue(
				// 	'carbonioWscMessageEditTimeLimit',
				// 	obj?.carbonioWscMessageEditTimeLimit
				// );
				// setSwitchOptionValue('carbonioWscMaxGroupMembers', obj?.carbonioWscMaxGroupMembers);
				// setSwitchOptionValue('carbonioWscMaxRoomPictureSize', obj?.carbonioWscMaxRoomPictureSize);
				// setSwitchOptionValue('carbonioWscMaxAttachmentSize', obj?.carbonioWscMaxAttachmentSize);
			}
		},
		[setSwitchOptionValue]
	);

	useEffect(() => {
		if (size(cosInformation) > 0) {
			const obj: AccountType = {};
			forEach(cosInformation, (item: Attribute) => {
				obj[item?.n as keyof AccountType] = item._content;
			});
			setZimbraId(obj?.zimbraId);
			setInitialValues(obj);
			setIsDirty(false);
		}
	}, [cosInformation, setInitialValues, setSwitchOptionValue, setZimbraId]);

	useEffect(() => {
		if (zimbraId && !isEqual(cosFeatures, initCosData)) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [cosFeatures, initCosData, zimbraId]);

	const modifyCosRequest = useCallback(
		(body: ModifyCosBody) => {
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
					const cos: Cos = data.cos[0];
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
		body.a = Object.keys(cosFeatures).map((ele) => ({
			n: ele,
			_content: cosFeatures[ele as keyof AccountType] as string
		}));
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
