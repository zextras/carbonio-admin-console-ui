/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCurrentUserRights } from '@zextras/ui-shared'
import { find, forEach, isEqual, size } from 'lodash-es';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { AccountType } from '../../types/account';
import { Attribute } from '../../types/attribute';
import { COS, ZIMBRA_ADMIN_URN } from '../constants';
import { ModifyCosBody } from '../services/modify-cos-service';
import { useCosDetail } from '../services/use-cos-detail';
import { useModifyCos } from '../services/use-modify-cos';
import { PageLayout } from '../views/page-layout';
import { WscSettings } from './wsc-settings';

const WscCosSettings: FC = () => {
	const [t] = useTranslation();
	const { cosId } = useParams();

	const [zimbraId, setZimbraId] = useState<string | undefined>(undefined);
	const [initCosData, setInitCosData] = useState<AccountType>({});
	const [cosFeatures, setCosFeatures] = useState<AccountType>({});
	const [isDirty, setIsDirty] = useState<boolean>(false);

	const { data: cosDetailData } = useCosDetail(cosId);
	const cosInformation = cosDetailData?.cos?.[0]?.a;
	const { data: rights = [] } = useCurrentUserRights();
	const modifyCosMutation = useModifyCos(cosId);

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
		modifyCosMutation.mutate(body);
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
