/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCurrentUserRights } from '@zextras/admin-ui-bootstrap'
import { useSnackbar } from '@zextras/carbonio-design-system';
import { find, forEach, isEqual, size } from 'lodash-es';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AccountType } from '../../types/account';
import { Attribute } from '../../types/attribute';
import { Cos } from '../../types/cos';
import { COS, ZIMBRA_ADMIN_URN } from '../constants';
import { flushCache } from '../services/flush-cache-service';
import { modifyCos, ModifyCosBody } from '../services/modify-cos-service';
import { useCosStore } from '../store/cos/store';
import { PageLayout } from '../views/page-layout';
import { WscSettings } from './wsc-settings';

const WscCosSettings: FC = () => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();

	const [zimbraId, setZimbraId] = useState<string | undefined>(undefined);
	const [initCosData, setInitCosData] = useState<AccountType>({});
	const [cosFeatures, setCosFeatures] = useState<AccountType>({});
	const [isDirty, setIsDirty] = useState<boolean>(false);

	const cosInformation = useCosStore((state) => state.cos?.a);
	const setCos = useCosStore((state) => state.setCos);
	const { data: rights = [] } = useCurrentUserRights();

	const readonlyCOS = useMemo(() => {
		const rightsConfig = find(rights, { type: COS }) || { all: [], type: COS };
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
				setSwitchOptionValue('carbonioFeatureWscEnabled', obj?.carbonioFeatureWscEnabled);
				setSwitchOptionValue('carbonioWscShowMessageReads', obj?.carbonioWscShowMessageReads);
				setSwitchOptionValue('carbonioWscShowUsersPresence', obj?.carbonioWscShowUsersPresence);
				setSwitchOptionValue(
					'carbonioWscVirtualBackgroundEnabled',
					obj?.carbonioWscVirtualBackgroundEnabled
				);
				setSwitchOptionValue('carbonioWscVideoCallEnabled', obj?.carbonioWscVideoCallEnabled);
				setSwitchOptionValue('carbonioWscRecordingEnabled', obj?.carbonioWscRecordingEnabled);
				setSwitchOptionValue('carbonioWscGroupChatCreation', obj?.carbonioWscGroupChatCreation);
				setSwitchOptionValue('carbonioWscPrivateChatCreation', obj?.carbonioWscPrivateChatCreation);
				setSwitchOptionValue('carbonioWscAttachmentUpload', obj?.carbonioWscAttachmentUpload);
				setSwitchOptionValue(
					'carbonioWscMessageDeleteTimeLimit',
					obj?.carbonioWscMessageDeleteTimeLimit
				);
				setSwitchOptionValue(
					'carbonioWscMessageEditTimeLimit',
					obj?.carbonioWscMessageEditTimeLimit
				);
				setSwitchOptionValue('carbonioWscMaxGroupMembers', obj?.carbonioWscMaxGroupMembers);
				setSwitchOptionValue('carbonioWscMaxRoomPictureSize', obj?.carbonioWscMaxRoomPictureSize);
				setSwitchOptionValue('carbonioWscMaxAttachmentSize', obj?.carbonioWscMaxAttachmentSize);
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

	return (
		<PageLayout
			title={t('label.wsc', 'Chats')}
			onSave={onSave}
			onCancel={onCancel}
			unSavedChanges={isDirty}
		>
			<WscSettings
				featuresDetail={cosFeatures}
				setFeaturesDetail={setCosFeatures}
				readonlyFeatures={readonlyCOS}
			/>
		</PageLayout>
	);
};

export default WscCosSettings;
