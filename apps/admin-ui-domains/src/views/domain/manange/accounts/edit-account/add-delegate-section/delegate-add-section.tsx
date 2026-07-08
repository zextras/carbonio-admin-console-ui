/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, LabeledValue, Row } from '@zextras/ui-components';
import { FC, useContext, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { READ_MAILS_ONLY } from '../../../../../../constants';
import { delegateRightsType } from '../../../../../utility/utils';
import { AccountContext } from '../../account-context';

const DelegateAddSection: FC = () => {
  const [t] = useTranslation();
  const DELEGETES_RIGHTS_TYPE = useMemo(() => delegateRightsType(t), [t]);
  const context = useContext(AccountContext);
  const { accountDetail, deligateDetail } = context;

  return (
    <Container
        mainAlignment="flex-start"
        padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
      >
        <Row mainAlignment="flex-start" width="100%">
          <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
            <ds-text size="small" color="gray0" weight="bold" as="h3">
              {t('account_details.abstract', `Abstract`)}
            </ds-text>
          </Row>
        </Row>
        <Row mainAlignment="flex-start" width="100%">
          <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
            <ds-text size="small" color="gray0" weight="bold" as="h3">
              {
                <Trans
                  i18nKey="account_details.deligate_abstract_text"
                  defaults="The user {{granteeEmail}} will be able to send mails {{right}} {{targetEmail}}"
                  values={{
                    granteeEmail: deligateDetail?.grantee[0]?.name,
                    targetEmail: accountDetail?.zimbraMailDeliveryAddress,
                    right:
                      deligateDetail?.right?.[0]?._content === 'sendAs'
                        ? t('account_details.as', 'as')
                        : t('account_details.on_behalf_of', 'on behalf of'),
                  }}
                />
              }
            </ds-text>
          </Row>
        </Row>
        <Row width="100%" padding={{ top: "medium" }}>
          <ds-divider></ds-divider>
        </Row>
        <Row mainAlignment="flex-start" width="100%">
          <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
            <LabeledValue
              label={t('account_details.delegate_rights', 'Delegate`s rights')}
              backgroundColor="gray5"
              value={
                DELEGETES_RIGHTS_TYPE.find(
                  (item) => item.value === deligateDetail?.delegeteRights,
                )?.label
              }
            />
          </Row>
        </Row>
        {deligateDetail?.delegeteRights === READ_MAILS_ONLY ? null : (
          <Row mainAlignment="flex-start" width="100%">
            <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
              <LabeledValue
                label={t('account_details.sendin_options', 'Sending Options')}
                backgroundColor="gray5"
                defaultValue={t(
                  'account_details.send_recipients_see_the_mail',
                  'Send {{right}} (recipients will display this sender email {{targetEmail}})',
                  {
                    granteeEmail: deligateDetail?.grantee?.[0]?.name,
                    targetEmail: accountDetail?.zimbraMailDeliveryAddress,
                    right:
                      deligateDetail?.right?.[0]?._content === 'sendAs'
                        ? t('account_details.as', 'as')
                        : t('account_details.on_behalf_of', 'on behalf of'),
                  },
                )}
                value={t(
                  'account_details.send_recipients_see_the_mail',
                  'Send {{right}} (recipients will display this sender email {{targetEmail}})',
                  {
                    granteeEmail: deligateDetail?.grantee?.[0]?.name,
                    targetEmail: accountDetail?.zimbraMailDeliveryAddress,
                    right:
                      deligateDetail?.right?.[0]?._content === 'sendAs'
                        ? t('account_details.as', 'as')
                        : t('account_details.on_behalf_of', 'on behalf of'),
                  },
                )}
              />
            </Row>
          </Row>
        )}
    </Container>
  );
};

export default DelegateAddSection;
