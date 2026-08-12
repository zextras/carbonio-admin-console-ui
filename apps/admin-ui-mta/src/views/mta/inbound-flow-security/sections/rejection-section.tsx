/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Switch, Tooltip } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { MtaInboundSecurity } from '../../../../../types';
import {
  ZIMBRA_MTA_SMTPD_REJECT_UNLISTED_RECIPIENT,
  ZIMBRA_MTA_SMTPD_REJECT_UNLISTED_SENDER,
  ZIMBRA_MTA_SMTPD_SENDER_RESTRICTIONS,
} from '../../../../constants';

type RejectionSectionProps = {
  mtaInboundSecurityDetail: MtaInboundSecurity | undefined;
  allowSetMTA: boolean;
  setValue: (key: string, value: unknown) => void;
};

export function RejectionSection({
  mtaInboundSecurityDetail,
  allowSetMTA,
  setValue,
}: Readonly<RejectionSectionProps>) {
  const [t] = useTranslation();

  return (
    <>
      <Container
        crossAlignment="flex-start"
        padding={{ top: 'extralarge', bottom: 'large' }}
        height="auto"
      >
        <ds-text as="h3" size="small" weight="bold" color="gray0">
          {t('mta.rejection', 'Rejection')}
        </ds-text>
      </Container>
      <Container
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        padding={{ top: 'large', bottom: 'extralarge' }}
        height="auto"
      >
        <Container crossAlignment="flex-start">
          <Tooltip
            placement="bottom"
            label={t(
              'mta.reject_emails_from_unlisted_senders',
              'Reject emails from unlisted senders',
            )}
            maxWidth="auto"
          >
            <Switch
              label={t('mta.reject_unlisted_sender', 'Reject unlisted Sender')}
              value={mtaInboundSecurityDetail?.zimbraMtaSmtpdRejectUnlistedSender}
              onClick={(): void =>
                setValue(
                  ZIMBRA_MTA_SMTPD_REJECT_UNLISTED_SENDER,
                  !mtaInboundSecurityDetail?.zimbraMtaSmtpdRejectUnlistedSender,
                )
              }
              disabled={!allowSetMTA}
            />
          </Tooltip>
        </Container>
        <Container crossAlignment="flex-start">
          <Tooltip
            placement="bottom"
            label={t(
              'mta.reject_emails_addressed_to_unlisted_recipients',
              'Reject emails addressed to unlisted recipients',
            )}
            maxWidth="auto"
          >
            <Switch
              label={t('mta.reject_unlisted_recipient', 'Reject unlisted Recipient')}
              value={mtaInboundSecurityDetail?.zimbraMtaSmtpdRejectUnlistedRecipient}
              onClick={(): void =>
                setValue(
                  ZIMBRA_MTA_SMTPD_REJECT_UNLISTED_RECIPIENT,
                  !mtaInboundSecurityDetail?.zimbraMtaSmtpdRejectUnlistedRecipient,
                )
              }
              disabled={!allowSetMTA}
            />
          </Tooltip>
        </Container>
        <Container crossAlignment="flex-start">
          <Tooltip
            placement="bottom"
            label={t(
              'mta.reject_emails_when_sender_login_does_not_match_authenticated_user',
              "Reject emails when the sender's login does not match the authenticated user",
            )}
            maxWidth="auto"
          >
            <Switch
              label={t(
                'mta.reject_sender_login_mismatch_or_empty',
                'Reject Sender login mismatch or empty ',
              )}
              value={mtaInboundSecurityDetail?.zimbraMtaSmtpdSenderRestrictions}
              onClick={(): void =>
                setValue(
                  ZIMBRA_MTA_SMTPD_SENDER_RESTRICTIONS,
                  !mtaInboundSecurityDetail?.zimbraMtaSmtpdSenderRestrictions,
                )
              }
              disabled={!allowSetMTA}
            />
          </Tooltip>
        </Container>
      </Container>
    </>
  );
}
