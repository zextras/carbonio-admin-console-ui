/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { type AccountType } from '../../types/account';
import { ZIMBRA_ADMIN_URN } from '../constants';
import { type ModifyCosBody } from '../services/modify-cos-service';
import { useModifyCos } from '../services/use-modify-cos';
import { FormPageLayout } from '../views/form-page-layout';
import type { WscCosFormValues } from './types';
import { WscSettings } from './wsc-settings';

const WSC_FIELD_DEFAULTS: WscCosFormValues = {
	carbonioFeatureWscEnabled: 'FALSE',
	carbonioWscShowMessageReads: 'FALSE',
	carbonioWscShowUsersPresence: 'FALSE',
	carbonioWscVirtualBackgroundEnabled: 'FALSE',
	carbonioWscVideoCallEnabled: 'FALSE',
	carbonioWscRecordingEnabled: 'FALSE',
	carbonioWscGroupChatCreation: 'FALSE',
	carbonioWscPrivateChatCreation: 'FALSE',
	carbonioWscAttachmentUpload: 'FALSE',
	carbonioWscMessageDeleteTimeLimit: '0m',
	carbonioWscMessageEditTimeLimit: '0m',
	carbonioWscMaxGroupMembers: '0',
	carbonioWscMaxRoomPictureSize: '0',
	carbonioWscMaxAttachmentSize: '0',
};

const WSC_FIELD_KEYS = new Set<string>(Object.keys(WSC_FIELD_DEFAULTS));

type WscCosFormProps = {
	cosData: AccountType;
	readonlyCOS: boolean;
};

export const WscCosForm = ({ cosData, readonlyCOS }: WscCosFormProps) => {
	const { cosId } = useParams();
	const [t] = useTranslation();
	const modifyCosMutation = useModifyCos(cosId);

	const zimbraId = cosData?.zimbraId ?? '';

	const form = useForm({
		defaultValues: { ...WSC_FIELD_DEFAULTS, ...cosData },
		onSubmit: async ({ value }) => {
			const body: ModifyCosBody = {
				_jsns: ZIMBRA_ADMIN_URN,
				id: { _content: zimbraId },
				a: Object.keys(value)
					.filter((key) => WSC_FIELD_KEYS.has(key))
					.map((key) => ({
						n: key,
						_content: String(value[key as keyof WscCosFormValues] ?? ''),
					})),
			};

			modifyCosMutation.mutate(body, {
				onSuccess: () => {
					form.reset(value, { keepDefaultValues: true });
				},
			});
		},
	});

	const isDirty = useSelector(form.store, (state) => !state.isDefaultValue);

	return (
		<FormPageLayout
			title={t('label.wsc', 'Chats')}
			onSave={() => form.handleSubmit()}
			onCancel={() => form.reset()}
			unsavedChanges={isDirty}
		>
			<WscSettings form={form} readonlyFeatures={readonlyCOS} />
		</FormPageLayout>
	);
};
