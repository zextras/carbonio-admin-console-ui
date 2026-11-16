/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Container, Radio, RadioGroup, Row, Select } from '@zextras/ui-components';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import {
  SEND_MAILS_ONLY,
  SEND_READ_MAILS,
  SEND_READ_MANAGE_MAILS,
} from '../../../constants';
import { delegateRightsType } from '../../utility/utils';
import { useAccountForm } from '../account-form-context';

export const DelegateSetRightsSection: FC = () => {
  const [t] = useTranslation();
  const sendingOption = '';
  const DELEGETES_RIGHTS_TYPE = delegateRightsType(t);
  const { form, deligateDetail, setDeligateDetail } = useAccountForm();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const accountDetail = values;

  const onWhoDelegateChange = (v: any): any => {
    setDeligateDetail((prev: any) => ({ ...prev, delegeteRights: v }));
  };

  return (
    <Container
      mainAlignment="flex-start"
      padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
    >
      <Row mainAlignment="flex-start" width="100%">
        <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
          <ds-text size="small" color="gray0" weight="bold" as="h3">
            {t('account_details.delegate_rights', 'Delegate`s rights')}
          </ds-text>
        </Row>
      </Row>
      <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
        <Row width="100%" mainAlignment="flex-start">
          <Select
            background="gray5"
            label={t(
              'account_details.what_rights_will_the_delegate_have',
              'What rights will the delegate have?',
            )}
            showCheckbox={false}
            defaultSelection={DELEGETES_RIGHTS_TYPE.find(
              (item: any) => item.value === deligateDetail?.delegeteRights,
            )}
            onChange={onWhoDelegateChange}
            items={DELEGETES_RIGHTS_TYPE}
          />
        </Row>
      </Row>
      <Row width="100%" padding={{ top: 'medium' }}>
        <ds-divider></ds-divider>
      </Row>
      {(deligateDetail?.delegeteRights === SEND_MAILS_ONLY ||
        deligateDetail?.delegeteRights === SEND_READ_MAILS ||
        deligateDetail?.delegeteRights === SEND_READ_MANAGE_MAILS) && (
        <>
          <Row mainAlignment="flex-start" width="100%">
            <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
              <ds-text size="small" color="gray0" weight="bold" as="h3">
                {t('account_details.sending_options', `Sending Options`)}
              </ds-text>
            </Row>
          </Row>
          <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
            <Row width="100%" mainAlignment="flex-start">
              <RadioGroup value={sendingOption || deligateDetail?.right?.[0]?._content}>
                <Radio
                  label={t(
                    'account_details.send_as_recipients',
                    `Send as (recipients will display this sender email {{targetEmail}})`,
                    {
                      targetEmail: accountDetail?.zimbraMailDeliveryAddress,
                    },
                  )}
                  value="sendAs"
                  onClick={(): void => {
                    setDeligateDetail((prev: any) => ({
                      ...prev,
                      right: [{ _content: 'sendAs' }],
                    }));
                  }}
                  iconColor="primary"
                />
                <Radio
                  label={t(
                    'account_details.send_as_behalf',
                    `Send on Behalf of (recipients will see the sender {{targetEmail}})`,
                    {
                      targetEmail: accountDetail?.zimbraMailDeliveryAddress,
                    },
                  )}
                  value="sendOnBehalfOf"
                  onClick={(): void => {
                    setDeligateDetail((prev: any) => ({
                      ...prev,
                      right: [{ _content: 'sendOnBehalfOf' }],
                    }));
                  }}
                  iconColor="primary"
                />
              </RadioGroup>
            </Row>
          </Row>
        </>
      )}
    </Container>
  );
};
