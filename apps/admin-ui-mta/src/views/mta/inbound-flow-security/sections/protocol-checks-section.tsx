/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Switch, Tooltip } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { MtaInboundSecurity } from '../../../../../types';
import { _REJECT_UNKNOWN_CLIENT_HOSTNAME } from '../../../../constants';

type ProtocolChecksSectionProps = {
  mtaInboundSecurityDetail: MtaInboundSecurity | undefined;
  allowSetMTA: boolean;
  setValue: (key: string, value: unknown) => void;
};

export function ProtocolChecksSection({
  mtaInboundSecurityDetail,
  allowSetMTA,
  setValue,
}: Readonly<ProtocolChecksSectionProps>) {
  const [t] = useTranslation();

  return (
    <>
      <Container
        crossAlignment="flex-start"
        padding={{ top: 'extralarge', bottom: 'large' }}
        height="auto"
      >
        <ds-text as="h3" size="small" weight="bold" color="gray0">
          {t('mta.protocol_checks', 'Protocol Checks')}
        </ds-text>
      </Container>
      <Container
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        padding={{ top: 'large', bottom: 'medium' }}
        height="auto"
      >
        <Container crossAlignment="flex-start">
          <Tooltip
            placement="bottom"
            label={t(
              'mta.reject_emails_from_client_hostnames',
              'Rejects emails from clients with unknown or unresolvable hostnames',
            )}
            maxWidth="auto"
          >
            <Switch
              label={t('mta.clients_ip_address', "Client's IP address")}
              value={mtaInboundSecurityDetail?.rejectUnknownClientHostname}
              onClick={(): void =>
                setValue(
                  _REJECT_UNKNOWN_CLIENT_HOSTNAME,
                  !mtaInboundSecurityDetail?.rejectUnknownClientHostname,
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
              'mta.reject_emails_from_client_with_inresolved_helo_hostnames',
              'Rejects emails from clients with unresolvable HELO/EHLO hostnames',
            )}
            maxWidth="auto"
          >
            <Switch
              label={t(
                'mta.client_must_greet_with_resolving_hostname',
                'Client should have a resolving hostname',
              )}
              value={mtaInboundSecurityDetail?.rejectUnknownHeloHostname}
              onClick={(): void =>
                setValue(
                  'rejectUnknownHeloHostname',
                  !mtaInboundSecurityDetail?.rejectUnknownHeloHostname,
                )
              }
              disabled={!allowSetMTA}
            />
          </Tooltip>
        </Container>
      </Container>
      <Container
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        padding={{ top: 'small', bottom: 'small' }}
        height="auto"
      >
        <Container crossAlignment="flex-start">
          <Tooltip
            placement="bottom"
            label={t(
              'mta.reject_emails_from_client_with_unknown_unresolvable_reverse_hostname',
              'Rejects emails from clients with unknown or unresolvable reverse hostnames',
            )}
            maxWidth="auto"
          >
            <Switch
              label={t('mta.check_client_host_name', 'Check Client Hostname')}
              value={mtaInboundSecurityDetail?.rejectUnknownReverseClientHostname}
              onClick={(): void =>
                setValue(
                  'rejectUnknownReverseClientHostname',
                  !mtaInboundSecurityDetail?.rejectUnknownReverseClientHostname,
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
              'mta.reject_emails_from_unknown_or_unresolvable_sender_domains',
              'Rejects emails from unknown or unresolvable sender domains',
            )}
            maxWidth="auto"
          >
            <Switch
              label={t('mta.senders_domain', "Sender's Domain")}
              value={mtaInboundSecurityDetail?.rejectUnknownSenderDomain}
              onClick={(): void =>
                setValue(
                  'rejectUnknownSenderDomain',
                  !mtaInboundSecurityDetail?.rejectUnknownSenderDomain,
                )
              }
              disabled={!allowSetMTA}
            />
          </Tooltip>
        </Container>
      </Container>
      <Container
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        padding={{ top: 'small', bottom: 'small' }}
        height="auto"
      >
        <Container crossAlignment="flex-start">
          <Tooltip
            placement="bottom"
            label={t(
              'mta.reject_emails_with_an_invalid_or_unresolvable_helo_hostname',
              'Reject emails with an invalid or unresolvable HELO hostname',
            )}
            maxWidth="auto"
          >
            <Switch
              label={t(
                'mta.hostname_in_greeting_violates_rfc',
                'Hostname in greeting violates RFC',
              )}
              value={mtaInboundSecurityDetail?.rejectInvalidHeloHostname}
              onClick={(): void =>
                setValue(
                  'rejectInvalidHeloHostname',
                  !mtaInboundSecurityDetail?.rejectInvalidHeloHostname,
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
              'mta.reject_emails_with_non_fully_qualified_domain_name_sender_address',
              'Rejects emails with non fully qualified domain name (FQDN) sender addresses',
            )}
            maxWidth="auto"
          >
            <Switch
              label={t(
                'mta.senders_address_must_fully_qualified',
                'Sender address must be fully qualified',
              )}
              value={mtaInboundSecurityDetail?.rejectNonFqdnSender}
              onClick={(): void =>
                setValue('rejectNonFqdnSender', !mtaInboundSecurityDetail?.rejectNonFqdnSender)
              }
              disabled={!allowSetMTA}
            />
          </Tooltip>
        </Container>
      </Container>
      <Container
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        padding={{ top: 'small', bottom: 'small' }}
        height="auto"
      >
        <Container crossAlignment="flex-start">
          <Tooltip
            placement="bottom"
            label={t(
              'mta.reject_emails_from_client_domain_hostname',
              'Rejects emails from clients with non fully qualified domain name (FQDN) in their HELO/EHLO hostname',
            )}
            maxWidth="auto"
          >
            <Switch
              label={t(
                'mta.client_must_greet_with_fully_qualified_hostname',
                'Client should have a qualified hostname',
              )}
              value={mtaInboundSecurityDetail?.rejectNonFqdnHeloHostname}
              onClick={(): void =>
                setValue(
                  'rejectNonFqdnHeloHostname',
                  !mtaInboundSecurityDetail?.rejectNonFqdnHeloHostname,
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
