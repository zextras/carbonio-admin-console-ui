/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Input, Radio, RadioGroup, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import type { MtaAdvancedFormApi } from '../types';

type MailMessageSizeSectionProps = {
  form: MtaAdvancedFormApi;
  allowSetMTA: boolean;
};

export const MailMessageSizeSection = ({
  form,
  allowSetMTA,
}: Readonly<MailMessageSizeSectionProps>) => {
  const [t] = useTranslation();

  return (
    <Container crossAlignment="flex-start" mainAlignment="flex-start" padding={{ top: 'large' }}>
      <ds-text as="h3" size="medium" overflow="ellipsis" weight="bold">
        {t('mta.advanced.mail_messages_size', 'Mail messages size')}
      </ds-text>
      <Container crossAlignment="flex-start" padding={{ top: 'large' }} height="auto">
        <form.Field name="limitMaxMessageSize">
          {(limitField) => (
            <>
              <Row width="100%" mainAlignment="flex-start">
                <RadioGroup value={limitField.state.value.toString()}>
                  <Radio
                    label={t(
                      'mta.advanced.no_size_limit_for_mail_messages',
                      'No size limit for mail messages',
                    )}
                    value={'false'}
                    onClick={() => {
                      limitField.handleChange(false);
                      form.setFieldValue('zimbraMtaMaxMessageSize', '');
                    }}
                    iconColor="primary"
                  />
                  <Radio
                    label={t(
                      'mta.advanced.custom_max_size_mail_messages',
                      'Custom max size mail messages (MB)',
                    )}
                    value="true"
                    onClick={() => {
                      limitField.handleChange(true);
                    }}
                    iconColor="primary"
                  />
                </RadioGroup>
              </Row>
              {limitField.state.value && (
                <Container
                  crossAlignment="flex-start"
                  mainAlignment="flex-start"
                  padding={{ left: 'extralarge', top: 'large' }}
                >
                  <form.Field name="zimbraMtaMaxMessageSizeState">
                    {(sizeField) => {
                      const hasError =
                        Number(sizeField.state.value) <= 0 ||
                        Number.isNaN(Number(sizeField.state.value));
                      return (
                        <Input
                          isRequired
                          label={t(
                            'mta.advanced.max_size_for_mail_messages',
                            'Max size for mail messages (MB)',
                          )}
                          backgroundColor="gray5"
                          value={sizeField.state.value}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const { value } = e.target;
                            form.setFieldValue('zimbraMtaMaxMessageSize', value);
                            sizeField.handleChange(value);
                          }}
                          disabled={!allowSetMTA}
                          hasError={hasError}
                          description={
                            hasError
                              ? t(
                                  'mta.advanced.value_0_disables_email_sending',
                                  'Value 0 disables email sending: enter a value greater than 0',
                                )
                              : undefined
                          }
                        />
                      );
                    }}
                  </form.Field>
                </Container>
              )}
            </>
          )}
        </form.Field>
      </Container>
    </Container>
  );
}
