/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { useAllConfig, useCurrentUserRights } from '@zextras/ui-shared';
import { find } from 'lodash-es';
import { useTranslation } from 'react-i18next';

import {
  CARBONIO_ALLOW_FEEDBACK,
  CARBONIO_SEND_ANALYTICS,
  CARBONIO_SEND_FULL_ERROR_STACK,
  CONFIG,
  TRUE,
} from '../../constants';
import { useModifyPrivacyConfig } from '../../services/use-modify-privacy-config';
import { FormButtons } from './parts/form-buttons';
import { FormSwitch } from './parts/form-switch';
import { SwitchDescription } from './parts/switch-description';

const styles = {
  root: 'flex flex-col justify-start items-center bg-gray6-regular h-full w-full',
  header: 'flex flex-row justify-start items-center w-full h-[58px] p-lg box-border',
  formContainer:
    'flex flex-col items-center items-start justify-start w-full h-[calc(100vh-200px)] pt-xl overflow-auto bg-gray6-regular px-sm box-border',
};

const titleStyle = { flexBasis: '30%' };

export function PrivacyView() {
  const [t] = useTranslation();
  const { data: config = [] } = useAllConfig();
  const { data: rights } = useCurrentUserRights();
  const { mutateAsync } = useModifyPrivacyConfig();

  const rightsConfig = find(rights, { type: CONFIG }) || { all: [], type: CONFIG };
  const allowSetPrivacy = !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;

  const privacyFeedbackInitialValue = !!(
    config.find((item: { n: string }) => item?.n === CARBONIO_ALLOW_FEEDBACK)?._content === TRUE
  );
  const privacyAnalyticsInitialValue = !!(
    config.find((item: { n: string }) => item?.n === CARBONIO_SEND_ANALYTICS)?._content === TRUE
  );
  const privacyErrorInitialValue = !!(
    config.find((item: { n: string }) => item?.n === CARBONIO_SEND_FULL_ERROR_STACK)?._content ===
    TRUE
  );

  const form = useForm({
    defaultValues: {
      allowFeedback: privacyFeedbackInitialValue,
      sendAnalytics: privacyAnalyticsInitialValue,
      sendFullError: privacyErrorInitialValue,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await mutateAsync(value);
        formApi.reset(value);
      } catch {
        // Error snackbar is handled by useModifyPrivacyConfig.onError
      }
    },
  });

  const privacyAnalyticsDescription = t(
    'privacy.analytics_sub_1',
    'Your data is safe. All information we gather is and will stay anonymous. It will be used by our team to understand how can we improve Carbonio.',
  );
  const privacyErrorDescription = t(
    'privacy.full_error_sub_1',
    "We all make mistakes but it's how you deal with them that that changes everything! We want to learn from them so let us know how we can fix them.",
  );
  const privacyFeedbackDescription = t(
    'privacy.survey_feedback_sub_1',
    'We promise they will be fast, easy and very useful to understand how are we doing.',
  );

  return (
    <div className={styles.root}>
      <form.Subscribe selector={(state) => !state.isDefaultValue}>
        {(isDirty) => (
          <>
            <header className={styles.header}>
              <ds-text as="h2" size="medium" weight="bold" color="gray0" style={titleStyle}>
                {t('label.privacy', 'Privacy')}
              </ds-text>
              {isDirty && (
                <div className="flex flex-row w-[70%] justify-end items-end">
                  <FormButtons onCancel={() => form.reset()} onSave={() => form.handleSubmit()} />
                </div>
              )}
            </header>
            <ds-divider />
            <div className={styles.formContainer}>
              <form.Field name="sendFullError">
                {(field) => (
                  <FormSwitch
                    label={t('privacy.send_full_error_data', 'Send full error data')}
                    fieldValue={field.state.value}
                    allowSetPrivacy={allowSetPrivacy}
                    onClick={() => field.handleChange(!field.state.value)}
                  />
                )}
              </form.Field>
              <SwitchDescription label={privacyErrorDescription} />
              <form.Field name="sendAnalytics">
                {(field) => (
                  <FormSwitch
                    label={t('privacy.allow_data_analytics', 'Allow data analytics')}
                    fieldValue={field.state.value}
                    allowSetPrivacy={allowSetPrivacy}
                    onClick={() => field.handleChange(!field.state.value)}
                  />
                )}
              </form.Field>
              <SwitchDescription label={privacyAnalyticsDescription} />
              <form.Field name="allowFeedback">
                {(field) => (
                  <FormSwitch
                    label={t('privacy.allow_live_survey_feedbacks', 'Allow live survey feedbacks')}
                    fieldValue={field.state.value}
                    allowSetPrivacy={allowSetPrivacy}
                    onClick={() => field.handleChange(!field.state.value)}
                  />
                )}
              </form.Field>
              <SwitchDescription label={privacyFeedbackDescription} />
            </div>
          </>
        )}
      </form.Subscribe>
    </div>
  );
}
