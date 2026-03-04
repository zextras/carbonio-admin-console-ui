/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { Text, useSnackbar } from '@zextras/ui-components';
import { soapFetch, useAllConfig, useCurrentUserRights } from '@zextras/ui-shared';
import { find } from 'lodash-es';
import { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { tv } from 'tailwind-variants';

import {
  CARBONIO_ALLOW_FEEDBACK,
  CARBONIO_SEND_ANALYTICS,
  CARBONIO_SEND_FULL_ERROR_STACK,
  CONFIG,
  FALSE,
  TRUE,
} from '../../constants';
import { FormButtons } from './parts/form-buttons';
import { FormSwitch } from './parts/form-switch';
import { SwitchDescription } from './parts/form-title';

type ModifyConfigAPI = { allowFeedback: boolean; sendAnalytics: boolean; sendFullError: boolean };

async function modifyConfigApi(value: ModifyConfigAPI) {
  return soapFetch('Batch', {
    ModifyConfigRequest: [
      { n: CARBONIO_ALLOW_FEEDBACK, _content: value.allowFeedback ? TRUE : FALSE },
      {
        n: CARBONIO_SEND_FULL_ERROR_STACK,
        _content: value.sendFullError ? TRUE : FALSE,
      },
      {
        n: CARBONIO_SEND_ANALYTICS,
        _content: value.sendAnalytics ? TRUE : FALSE,
      },
    ],
    _jsns: 'urn:zimbra',
  });
}

const privacyView = tv({
  slots: {
    root: 'flex flex-col justify-start items-center bg-gray6-regular h-full w-full',
    headerRow: 'flex flex-row justify-start w-full',
    headerContainer: 'flex flex-col justify-around items-center bg-gray6-regular h-[58px] w-full',
    headerContent: 'flex flex-row w-full p-lg box-border',
    titleSection: 'flex flex-row justify-start w-[30%] items-start',
    buttonsSection: 'flex flex-row w-[70%] justify-end items-end',
    contentContainer:
      'flex flex-col items-start justify-start w-full h-[calc(100vh-200px)] pt-xl overflow-auto box-border',
    formContainer: 'flex flex-col items-center h-fit bg-gray6-regular px-sm w-full box-border',
  },
});

const PrivacyView: FC = () => {
  const [t] = useTranslation();
  const { data: config = [] } = useAllConfig();
  const createSnackbar = useSnackbar();
  const {
    root,
    headerRow,
    headerContainer,
    headerContent,
    titleSection,
    buttonsSection,
    contentContainer,
    formContainer,
  } = privacyView();

  const { data: rights } = useCurrentUserRights();
  const allowSetPrivacy = useMemo(() => {
    const rightsConfig = find(rights, { type: CONFIG }) || { all: [], type: CONFIG };
    return !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
  }, [rights]);

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
      const response = await modifyConfigApi(value);
      if (response) {
        createSnackbar({
          key: 'success',
          severity: 'success',
          label: t('label.change_save_success_msg', 'The change has been saved successfully'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
        formApi.reset(value);
      }
    },
  });

  const onCancel = useCallback(() => {
    form.reset();
  }, [form]);

  const onSave = useCallback(() => {
    form.handleSubmit();
  }, [form]);

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
    <div className={root()}>
      <form.Subscribe selector={(state) => state.isDirty}>
        {(isDirty) => (
          <>
            <div className={headerRow()}>
              <div className={headerContainer()}>
                <div className={headerContent()}>
                  <div className={titleSection()}>
                    <Text size="medium" weight="bold" color="gray0">
                      {t('label.privacy', 'Privacy')}
                    </Text>
                  </div>
                  <div className={buttonsSection()}>
                    {isDirty && <FormButtons onCancel={onCancel} onSave={onSave} />}
                  </div>
                </div>
              </div>
            </div>
            <divider-wc></divider-wc>
            <div className={contentContainer()}>
              <div className={formContainer()}>
                <form.Field name="sendFullError">
                  {(field) => (
                    <FormSwitch
                      label={t('privacy.send_full_error_data', 'Send full error data')}
                      fieldValue={field.state.value}
                      allowSetPrivacy={allowSetPrivacy}
                      onClick={(): void => {
                        field.handleChange(!field.state.value);
                      }}
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
                      onClick={(): void => {
                        field.handleChange(!field.state.value);
                      }}
                    />
                  )}
                </form.Field>
                <SwitchDescription label={privacyAnalyticsDescription} />
                <form.Field name="allowFeedback">
                  {(field) => (
                    <FormSwitch
                      label={t(
                        'privacy.allow_live_survey_feedbacks',
                        'Allow live survey feedbacks',
                      )}
                      fieldValue={field.state.value}
                      allowSetPrivacy={allowSetPrivacy}
                      onClick={(): void => {
                        field.handleChange(!field.state.value);
                      }}
                    />
                  )}
                </form.Field>
                <SwitchDescription label={privacyFeedbackDescription} />
              </div>
            </div>
          </>
        )}
      </form.Subscribe>
    </div>
  );
};

export default PrivacyView;
