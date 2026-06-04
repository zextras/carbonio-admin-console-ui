/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Container } from '@zextras/ui-components';
import { type GetCoreAttributesResponse } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { Attribute } from '../../../../types/attribute';
import {
  COS,
  MOBILE_CALENDAR_FEATURE_SYNC,
  MOBILE_CONTACT_FEATURE_SYNC,
  ZIMBRA_ADMIN_URN,
} from '../../../constants';
import { useAppForm } from '../../../form/form-hook';
import { ModifyCosBody } from '../../../services/modify-cos-service';
import { useModifyCos } from '../../../services/use-modify-cos';
import { useSetCoreAttributes } from '../../../services/use-set-core-attributes';
import { FormPageLayout } from '../../form-page-layout';
import { ContactsCalendarSection } from '../features/sections/contacts-calendar-section';
import { FilesTasksSection } from '../features/sections/files-tasks-section';
import { GeneralSection } from '../features/sections/general-section';
import { MailSection } from '../features/sections/mail-section';
import { TwoFactorSection } from '../features/sections/two-factor-section';
import type { CosFeaturesFormValues } from '../types';
import { buildCosDataMap } from '../utils';

const COS_FEATURE_DEFAULTS: CosFeaturesFormValues = {
  carbonioFeatureMailsAppEnabled: 'FALSE',
  zimbraFeatureOutOfOfficeReplyEnabled: 'FALSE',
  zimbraFeatureSignaturesEnabled: 'FALSE',
  zimbraFeatureMobileSyncEnabled: 'FALSE',
  zimbraFeatureContactsEnabled: 'FALSE',
  zimbraFeatureCalendarEnabled: 'FALSE',
  carbonioFeatureFilesAppEnabled: 'FALSE',
  carbonioFeatureFilesEnabled: 'FALSE',
  carbonioFeatureTasksEnabled: 'FALSE',
  zimbraFeatureOptionsEnabled: 'FALSE',
  carbonioOtpWizardFromUntrusted: 'FALSE',
  carbonioFeatureOTPMgmtEnabled: 'FALSE',
  carbonioOtpGracePeriodEndingTime: '',
  carbonioOtpGracePeriodEnabled: 'FALSE',
  mobileContactFeatureSync: 'FALSE',
  mobileCalendarFeatureSync: 'FALSE',
};

const COS_FEATURE_ALLOWED_KEYS = new Set<string>(Object.keys(COS_FEATURE_DEFAULTS));

function enabledToBool(value: string | undefined): string {
  return value === 'enabled' ? 'TRUE' : 'FALSE';
}

function buildDefaultValues(
  cosInformation: Array<Attribute> | undefined,
  mobileAttributesData: GetCoreAttributesResponse | undefined,
): CosFeaturesFormValues {
  return {
    ...COS_FEATURE_DEFAULTS,
    ...buildCosDataMap(cosInformation, COS_FEATURE_ALLOWED_KEYS),
    mobileContactFeatureSync: enabledToBool(
      mobileAttributesData?.attributes?.mobileContactFeatureSync?.[0]?.value,
    ),
    mobileCalendarFeatureSync: enabledToBool(
      mobileAttributesData?.attributes?.mobileCalendarFeatureSync?.[0]?.value,
    ),
  };
}

type CosFeaturesFormProps = {
  cosInformation: Array<Attribute> | undefined;
  cosName: string | undefined;
  mobileAttributesData: GetCoreAttributesResponse | undefined;
  readonlyCOS: boolean;
  isAdvanced: boolean;
};

export const FeaturesForm = ({
  cosInformation,
  cosName,
  mobileAttributesData,
  readonlyCOS,
  isAdvanced,
}: CosFeaturesFormProps) => {
  const { cosId } = useParams();
  const [t] = useTranslation();
  const modifyCosMutation = useModifyCos(cosId);
  const setCoreAttributesMutation = useSetCoreAttributes();

  const form = useAppForm({
    defaultValues: buildDefaultValues(cosInformation, mobileAttributesData),
    onSubmit: async ({ value }) => {
      const zimbraId = cosInformation?.find((a) => a.n === 'zimbraId')?._content ?? '';

      const originalMobileContactSync = enabledToBool(
        mobileAttributesData?.attributes?.mobileContactFeatureSync?.[0]?.value,
      );
      const originalMobileCalendarSync = enabledToBool(
        mobileAttributesData?.attributes?.mobileCalendarFeatureSync?.[0]?.value,
      );
      const hasMobileChanges =
        value.mobileContactFeatureSync !== originalMobileContactSync ||
        value.mobileCalendarFeatureSync !== originalMobileCalendarSync;

      if (hasMobileChanges && isAdvanced) {
        await setCoreAttributesMutation.mutateAsync({
          mobileCalendarFeatureSync: {
            value: value.mobileCalendarFeatureSync === 'TRUE' ? 'enabled' : 'disabled',
            objectName: cosName,
            configType: COS,
          },
          mobileContactFeatureSync: {
            value: value.mobileContactFeatureSync === 'TRUE' ? 'enabled' : 'disabled',
            objectName: cosName,
            configType: COS,
          },
        });
      }

      const body: ModifyCosBody = {
        _jsns: ZIMBRA_ADMIN_URN,
        id: { _content: zimbraId },
        a: (Object.keys(value) as Array<keyof CosFeaturesFormValues>)
          .filter(
            (key) => key !== MOBILE_CALENDAR_FEATURE_SYNC && key !== MOBILE_CONTACT_FEATURE_SYNC,
          )
          .map((key) => ({ n: key, _content: value[key] ?? '' })),
      };

      await modifyCosMutation.mutateAsync(body);
      form.reset(value, { keepDefaultValues: true });
    },
  });

  const isDirty = useSelector(form.store, (state) => !state.isDefaultValue);

  return (
    <FormPageLayout
      title={t('label.features', 'Features')}
      onSave={() => form.handleSubmit()}
      onCancel={() => form.reset()}
      unsavedChanges={isDirty}
    >
      <form.AppForm>
        <Container mainAlignment="flex-start" width="100%" height="auto" orientation="vertical">
          <GeneralSection form={form} readonlyCOS={readonlyCOS} />
          <ds-divider />
          <TwoFactorSection form={form} readonlyCOS={readonlyCOS} isAdvanced={isAdvanced} />
          <ds-divider />
          <MailSection form={form} readonlyCOS={readonlyCOS} />
          <ds-divider />
          <ContactsCalendarSection form={form} readonlyCOS={readonlyCOS} />
          <ds-divider />
          <FilesTasksSection form={form} readonlyCOS={readonlyCOS} />
        </Container>
      </form.AppForm>
    </FormPageLayout>
  );
};
