/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { type Dispatch, type SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { type AccountType } from '../../types/account';
import { ZIMBRA_ADMIN_URN } from '../constants';
import { type ModifyCosBody } from '../services/modify-cos-service';
import { useModifyCos } from '../services/use-modify-cos';
import { FormPageLayout } from '../views/form-page-layout';
import { WscSettings } from './wsc-settings';

const WSC_FIELD_DEFAULTS: Record<string, string> = {
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
            _content: String(value[key as keyof typeof value] ?? ''),
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

  const featuresDetail = form.state.values as AccountType;
  const setFeaturesDetail: Dispatch<SetStateAction<AccountType>> = (action) => {
    const newValue =
      typeof action === 'function' ? action(form.state.values as AccountType) : action;
    Object.entries(newValue).forEach(([key, val]) => {
      form.setFieldValue(key as keyof AccountType, val as string);
    });
  };

  return (
    <FormPageLayout
      title={t('label.wsc', 'Chats')}
      onSave={() => form.handleSubmit()}
      onCancel={() => form.reset()}
      unsavedChanges={isDirty}
    >
      <WscSettings
        featuresDetail={featuresDetail}
        setFeaturesDetail={setFeaturesDetail}
        readonlyFeatures={readonlyCOS}
      />
    </FormPageLayout>
  );
};
