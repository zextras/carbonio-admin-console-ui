/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useCurrentUserRights } from '@zextras/ui-shared'
import { find, forEach, isEqual, size } from 'lodash-es';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { AccountType } from '../../types/account';
import { Attribute } from '../../types/attribute';
import { COS, ZIMBRA_ADMIN_URN } from '../constants';
import { cosQueryKeys } from '../services/cos-query-keys';
import { flushCache } from '../services/flush-cache-service';
import { modifyCos, ModifyCosBody } from '../services/modify-cos-service';
import { useCosDetail } from '../services/use-cos-detail';
import { PageLayout } from '../views/page-layout';
import { WscSettings } from './wsc-settings';

const WscCosSettings: FC = () => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const { cosId } = useParams();

	const [zimbraId, setZimbraId] = useState<string | undefined>(undefined);
	const [initCosData, setInitCosData] = useState<AccountType>({});
	const [cosFeatures, setCosFeatures] = useState<AccountType>({});
	const [isDirty, setIsDirty] = useState<boolean>(false);

	const { data: cosDetailData } = useCosDetail(cosId);
	const cosInformation = cosDetailData?.cos?.[0]?.a;
	const queryClient = useQueryClient();
	const { data: rights = [] } = useCurrentUserRights();

	const readonlyCOS = (() => {
		const rightsConfig = find(rights, { type: COS }) || { all: [], type: COS };
		return !rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
	})();

	const setSwitchOptionValue = (key: keyof AccountType, value: string | undefined): void => {
		if (value) {
			setInitCosData((prev) => ({ ...prev, [key]: value }));
			setCosFeatures((prev) => ({ ...prev, [key]: value }));
		}
	};

	const setInitialValues = (obj: AccountType) => {
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
	};

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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cosInformation]);

	useEffect(() => {
		if (zimbraId && !isEqual(cosFeatures, initCosData)) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [cosFeatures, initCosData, zimbraId]);

	const modifyCosRequest = (body: ModifyCosBody) => {
		modifyCos(body)
			.then(() => {
				flushCache('cos', 'id', body.id._content);
				if (cosId) {
					queryClient.invalidateQueries({ queryKey: cosQueryKeys.detail(cosId) });
				}
				createSnackbar({
					key: 'success',
					severity: 'success',
					label: t('label.change_save_success_msg', 'The change has been saved successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
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
	};

	const onSave = () => {
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
	};

	const onCancel = () => {
		setCosFeatures(initCosData);
		setIsDirty(false);
	};

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
