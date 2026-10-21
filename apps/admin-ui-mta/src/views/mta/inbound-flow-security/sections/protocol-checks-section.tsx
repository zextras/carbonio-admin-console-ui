/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Switch, Tooltip } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { MtaInboundFormApi } from '../types';

type ProtocolChecksSectionProps = {
  form: MtaInboundFormApi;
  allowSetMTA: boolean;
};

export const ProtocolChecksSection = ({
  form,
  allowSetMTA,
}: Readonly<ProtocolChecksSectionProps>) => {
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
          <form.Field name="rejectUnknownClientHostname">
            {(field) => (
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
                  value={field.state.value}
                  onClick={() => field.handleChange(!field.state.value)}
                  disabled={!allowSetMTA}
                />
              </Tooltip>
            )}
          </form.Field>
        </Container>
        <Container crossAlignment="flex-start">
          <form.Field name="rejectUnknownHeloHostname">
            {(field) => (
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
                  value={field.state.value}
                  onClick={() => field.handleChange(!field.state.value)}
                  disabled={!allowSetMTA}
                />
              </Tooltip>
            )}
          </form.Field>
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
          <form.Field name="rejectUnknownReverseClientHostname">
            {(field) => (
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
                  value={field.state.value}
                  onClick={() => field.handleChange(!field.state.value)}
                  disabled={!allowSetMTA}
                />
              </Tooltip>
            )}
          </form.Field>
        </Container>
        <Container crossAlignment="flex-start">
          <form.Field name="rejectUnknownSenderDomain">
            {(field) => (
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
                  value={field.state.value}
                  onClick={() => field.handleChange(!field.state.value)}
                  disabled={!allowSetMTA}
                />
              </Tooltip>
            )}
          </form.Field>
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
          <form.Field name="rejectInvalidHeloHostname">
            {(field) => (
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
                  value={field.state.value}
                  onClick={() => field.handleChange(!field.state.value)}
                  disabled={!allowSetMTA}
                />
              </Tooltip>
            )}
          </form.Field>
        </Container>
        <Container crossAlignment="flex-start">
          <form.Field name="rejectNonFqdnSender">
            {(field) => (
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
                  value={field.state.value}
                  onClick={() => field.handleChange(!field.state.value)}
                  disabled={!allowSetMTA}
                />
              </Tooltip>
            )}
          </form.Field>
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
          <form.Field name="rejectNonFqdnHeloHostname">
            {(field) => (
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
                  value={field.state.value}
                  onClick={() => field.handleChange(!field.state.value)}
                  disabled={!allowSetMTA}
                />
              </Tooltip>
            )}
          </form.Field>
        </Container>
      </Container>
    </>
  );
}
