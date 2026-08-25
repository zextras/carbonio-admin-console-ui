/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import { Container, Input, Row, Switch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { FALSE, TRUE } from '../../../../../constants';
import type { DomainGalSettingsFormApi } from '../use-domain-gal-form';
import {
  GalExternalServerInfoIcon,
  GalLdapFilterInfoIcon,
  GalLdapSearchBaseInfoIcon,
} from './gal-info-tooltip-icon';

type GalLdapSectionProps = {
  form: DomainGalSettingsFormApi;
};

export const GalLdapSection = ({ form }: GalLdapSectionProps) => {
  const [t] = useTranslation();
  const galMode = useSelector(form.store, (s) => s.values.zimbraGalMode);

  if (galMode !== 'ldap') {
    return null;
  }

  return (
    <Container
      height="fit"
      crossAlignment="flex-start"
      background="gray6"
      padding={{ top: 'large' }}
    >
      <Row
        mainAlignment="flex-start"
        width="100%"
        background="gray6"
        padding={{ all: 'small' }}
      >
        <ds-text as="h3" size="small" weight="bold">
          {t('label.ldap_url', 'LDAP Url')}
        </ds-text>
      </Row>

      <Row
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="center"
        width="fill"
        wrap="nowrap"
      >
        <Container padding={{ all: 'small' }}>
          <form.Field name="zimbraGalLdapURL">
            {(field) => (
              <Input
                label={t('label.external_server_address', 'External Server Address')}
                value={field.state.value}
                backgroundColor="gray5"
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  field.handleChange(e.target.value);
                }}
                CustomIcon={GalExternalServerInfoIcon}
              />
            )}
          </form.Field>
        </Container>

        <Container
          width="10%"
          orientation="horizontal"
          mainAlignment="flex-start"
          crossAlignment="center"
        >
          <form.Field name="zimbraGalLdapStartTlsEnabled">
            {(field) => (
              <Switch
                defaultChecked={field.state.value === TRUE}
                onClick={(): void => {
                  field.handleChange(field.state.value === TRUE ? FALSE : TRUE);
                }}
                label={t('label.user_ssl', 'Use SSL')}
                value={field.state.value === TRUE}
              />
            )}
          </form.Field>
        </Container>
      </Row>

      <Container padding={{ all: 'small' }}>
        <form.Field name="zimbraGalLdapFilter">
          {(field) => (
            <Input
              label={t('label.ldap_filter', 'LDAP Filter')}
              value={field.state.value}
              backgroundColor="gray5"
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                field.handleChange(e.target.value);
              }}
              CustomIcon={GalLdapFilterInfoIcon}
            />
          )}
        </form.Field>
      </Container>

      <Container padding={{ all: 'small' }}>
        <form.Field name="zimbraGalLdapSearchBase">
          {(field) => (
            <Input
              label={t('label.ldap_search_base', 'LDAP based search')}
              value={field.state.value}
              backgroundColor="gray5"
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                field.handleChange(e.target.value);
              }}
              CustomIcon={GalLdapSearchBaseInfoIcon}
            />
          )}
        </form.Field>
      </Container>
    </Container>
  );
};
