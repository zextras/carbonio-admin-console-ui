/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import { Container, Input, ListRow, Row, Switch, Tooltip } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { LDAP_BIND_DN_LABLE } from '../../../../../constants';
import type { DomainGalSettingsFormApi } from '../use-domain-gal-form';

type GalAuthSectionProps = {
  form: DomainGalSettingsFormApi;
};

export const GalAuthSection = ({ form }: GalAuthSectionProps) => {
  const [t] = useTranslation();
  const galMode = useSelector(form.store, (s) => s.values.zimbraGalMode);

  if (galMode !== 'ldap') {
    return null;
  }

  return (
    <>
      <Container height="fit" padding={{ all: 'small' }}>
        <ds-divider></ds-divider>
      </Container>

      <Container
        height="fit"
        crossAlignment="flex-start"
        background="gray6"
      >
        <Row
          mainAlignment="flex-start"
          width="100%"
          background="gray6"
          padding={{ all: 'small' }}
        >
          <ds-text as="h3" size="small" weight="bold">
            {t('label.authentication_settings', 'Authentication Settings')}
          </ds-text>
        </Row>

        <ListRow>
          <Container
            orientation="horizontal"
            mainAlignment="flex-start"
            crossAlignment="center"
            padding={{ all: 'small' }}
          >
            <form.Field name="zimbraGalLdapAuthMech">
              {(field) => (
                <Switch
                  defaultChecked={field.state.value !== 'none'}
                  onClick={(): void => {
                    field.handleChange(field.state.value === 'none' ? 'simple' : 'none');
                  }}
                  label={t(
                    'label.external_server_needs_authentication',
                    'External Server needs authentication',
                  )}
                />
              )}
            </form.Field>
          </Container>
        </ListRow>

        <ListRow>
          <Container padding={{ all: 'small' }}>
            <form.Field name="zimbraGalLdapBindDn">
              {(field) => (
                <Input
                  label={t('label.bind_dn', 'Bind DN')}
                  value={field.state.value}
                  backgroundColor="gray5"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    field.handleChange(e.target.value);
                  }}
                  CustomIcon={({
                    hasFocus,
                  }: {
                    hasError: boolean;
                    hasFocus: boolean;
                    disabled: boolean;
                  }): React.ReactElement => (
                    <Tooltip
                      placement="top"
                      overflow="break-word"
                      maxWidth="40rem"
                      label={LDAP_BIND_DN_LABLE}
                    >
                      <ds-text as="span">
                        <ds-icon
                          icon="InfoOutline"
                          size="large"
                          color={hasFocus ? 'primary' : 'text'}
                        ></ds-icon>
                      </ds-text>
                    </Tooltip>
                  )}
                />
              )}
            </form.Field>
          </Container>
          <Container padding={{ all: 'small' }}>
            <form.Field name="zimbraGalLdapBindPassword">
              {(field) => (
                <Input
                  label={t('label.password', 'Password')}
                  value={field.state.value}
                  backgroundColor="gray5"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    field.handleChange(e.target.value);
                  }}
                />
              )}
            </form.Field>
          </Container>
        </ListRow>
      </Container>
    </>
  );
};
