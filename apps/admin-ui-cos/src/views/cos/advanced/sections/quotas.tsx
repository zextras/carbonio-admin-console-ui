/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import {
  Container,
  CustomTextArea,
  Input,
  ListRow,
  Padding,
  Row,
  Select,
} from '@zextras/ui-components';
import { type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { TimeItems } from '../../../../../types/general';
import { withForm } from '../../../../form/form-hook';
import { getFieldErrorProps } from '../fields/field-error';
import { useCosQuotaState } from '../hooks/use-cos-quota-state';
import type { CosAdvancedFormValues } from '../types';
import { COSQuotasNew } from './quotas-new';

type QuotaProps = {
  quotaState: ReturnType<typeof useCosQuotaState>;
  isTotalQuotaActive: boolean;
  isAdvanced: boolean;
  readonlyCOS: boolean;
  timeItems: TimeItems;
};

export const COSQuotas = withForm({
  defaultValues: {} as CosAdvancedFormValues,
  props: {
    quotaState: undefined as unknown as QuotaProps['quotaState'],
    isTotalQuotaActive: false as boolean,
    isAdvanced: false as boolean,
    readonlyCOS: false as boolean,
    timeItems: [] as unknown as TimeItems,
  },
  render: function Render({
    form,
    quotaState,
    isTotalQuotaActive,
    isAdvanced,
    readonlyCOS,
    timeItems,
  }) {
    const [t] = useTranslation();
    const isSubmitted = useSelector(form.store, (s) => s.submissionAttempts > 0);

    const labels = {
      quotas: t('cos.quotas', 'Quotas'),
      filesAccountQuotaGB: t('cos.files_account_quota_gb', 'Files Account quota (GB)'),
      mailsAccountQuotaGB: t('cos.mails_account_quota_gb', 'Mails Account quota (GB)'),
      maximumDigitsAllowed: t(
        'label.maximum_3_digits_allowed_decimal_point',
        'Maximum 3 digits allowed after the decimal point',
      ),
      maxContactsAllowedInTheFolder: t(
        'cos.max_contacts_allowed_in_the_folder',
        'Max contacts allowed in the folder',
      ),
      percentageThresholdForQuotaWarningMessages: t(
        'cos.percentage_threshold_for_quota_warning',
        'Percentage threshold for quota warning messages (%)',
      ),
      minimumDurationOfTimeBetweenQuotaWarnings: t(
        'cos.minimum_duration_of_time_between_quota_warnings',
        'Minimum duration of time between quota warnings',
      ),
      timeRange: t('cos.time_range', 'Time Range'),
      quotaWarningMessageTemplate: t(
        'cos.quota_warning_message_template',
        'Quota warning message template',
      ),
    };

    return (
      <Row
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        padding={{ all: 'large' }}
        width="100%"
      >
        <ds-text as="strong" weight="bold">
          {labels.quotas}
        </ds-text>
        <Row mainAlignment="flex-start" width="100%">
          <Container
            height="fit"
            crossAlignment="flex-start"
            background={'gray6'}
            padding={{ top: 'large' }}
          >
            <ListRow crossAlignment={'flex-end'}>
              {isTotalQuotaActive ? (
                <COSQuotasNew
                  totalComputedQuotaLimit={quotaState.totalComputedQuotaLimit}
                  totalQuotaSource={quotaState.totalQuotaSource}
                  initialTotalComputedQuotaLimit={quotaState.initialTotalComputedQuotaLimit}
                  onChange={quotaState.onTotalQuotaChange}
                  readonlyCOS={readonlyCOS}
                  showRevertButton={quotaState.showQuotaRevertButton}
                />
              ) : (
                <>
                  {isAdvanced && quotaState.initFileQuotaLimitGBValue && (
                    <Container padding={{ right: 'small' }}>
                      <Input
                        label={labels.filesAccountQuotaGB}
                        value={quotaState.fileQuotaLimitGBValue}
                        backgroundColor="gray5"
                        inputName="fileQuotaLimit"
                        onChange={quotaState.onFileQuotaChange}
                        disabled={readonlyCOS}
                      />
                      {quotaState.showFileQuotaLimitMsg && (
                        <Container
                          mainAlignment="flex-start"
                          crossAlignment="flex-start"
                          width="fill"
                        >
                          <Padding top="small">
                            <ds-text as="span" size="extrasmall" weight="regular" color="primary">
                              {labels.maximumDigitsAllowed}
                            </ds-text>
                          </Padding>
                        </Container>
                      )}
                    </Container>
                  )}
                  <Container padding={{ right: 'small' }}>
                    <form.AppField name="zimbraMailQuota">
                      {(field) => (
                        <field.QuotaGBField
                          label={labels.mailsAccountQuotaGB}
                          maximumDigitsLabel={labels.maximumDigitsAllowed}
                          disabled={readonlyCOS}
                        />
                      )}
                    </form.AppField>
                  </Container>
                </>
              )}
              <Container>
                <form.AppField name="zimbraContactMaxNumEntries">
                  {(field) => (
                    <field.ValidatedInput
                      label={labels.maxContactsAllowedInTheFolder}
                      disabled={readonlyCOS}
                    />
                  )}
                </form.AppField>
              </Container>
            </ListRow>
          </Container>
        </Row>
        {!isTotalQuotaActive && (
          <Row mainAlignment="flex-start" width="100%">
            <Container
              height="fit"
              crossAlignment="flex-start"
              background={'gray6'}
              padding={{ top: 'large' }}
            >
              <ListRow>
                <Container width="100%" padding={{ right: 'small' }}>
                  <form.AppField name="zimbraQuotaWarnPercent">
                    {(field) => (
                      <field.ValidatedInput
                        label={labels.percentageThresholdForQuotaWarningMessages}
                        disabled={readonlyCOS}
                      />
                    )}
                  </form.AppField>
                </Container>
                <form.Field name="zimbraQuotaWarnInterval">
                  {(field) => {
                    const raw = String(field.state.value ?? '');
                    const hasUnit = raw.length >= 2;
                    const num = hasUnit ? raw.slice(0, -1) : '';
                    const unit = hasUnit ? raw.slice(-1) : '';
                    const error = getFieldErrorProps(field, isSubmitted, t);
                    return (
                      <>
                        <Container width="72%" padding={{ left: 'small', right: 'small' }}>
                          <Input
                            label={labels.minimumDurationOfTimeBetweenQuotaWarnings}
                            value={num}
                            backgroundColor="gray5"
                            inputName="zimbraQuotaWarnInterval"
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              field.handleChange(e.target.value ? `${e.target.value}${unit}` : '')
                            }
                            onBlur={() => field.handleBlur()}
                            hasError={error.hasError}
                            description={error.description}
                            disabled={readonlyCOS}
                          />
                        </Container>
                        <Container width="26%" padding={{ left: 'small' }}>
                          <Select
                            items={timeItems}
                            background={'gray5'}
                            label={labels.timeRange}
                            selection={
                              timeItems.find((item) => item.value === unit) ?? timeItems[0]
                            }
                            showCheckbox={false}
                            onChange={(newType) => {
                              if (newType) field.handleChange(num ? `${num}${newType}` : '');
                            }}
                            disabled={readonlyCOS}
                          />
                        </Container>
                      </>
                    );
                  }}
                </form.Field>
              </ListRow>
            </Container>
          </Row>
        )}
        {!isTotalQuotaActive && (
          <Row mainAlignment="flex-start" width="100%">
            <Container
              height="fit"
              crossAlignment="flex-start"
              background={'gray6'}
              padding={{ top: 'large', bottom: 'large' }}
            >
              <ListRow>
                <Container>
                  <form.Field name="zimbraQuotaWarnMessage">
                    {(field) => (
                      <CustomTextArea
                        label={labels.quotaWarningMessageTemplate}
                        value={field.state.value ?? ''}
                        backgroundColor="gray5"
                        inputName="zimbraQuotaWarnMessage"
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          field.handleChange(e.target.value)
                        }
                        disabled={readonlyCOS}
                      />
                    )}
                  </form.Field>
                </Container>
              </ListRow>
            </Container>
          </Row>
        )}
        <ds-divider></ds-divider>
      </Row>
    );
  },
});
