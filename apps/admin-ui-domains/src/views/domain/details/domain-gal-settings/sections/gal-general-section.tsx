/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import {
  Button,
  Container,
  Dropdown,
  DropdownItem,
  getFieldErrorProps,
  Input,
  LabeledValue,
  ListRow,
  Padding,
  Row,
} from '@zextras/ui-components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { GAL_VALIDATION_MESSAGES } from '../schema';
import type { DomainGalSettingsFormApi } from '../use-domain-gal-form';

type GalGeneralSectionProps = {
  form: DomainGalSettingsFormApi;
};

export const GalGeneralSection = ({ form }: GalGeneralSectionProps) => {
  const [t] = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isSubmitted = useSelector(form.store, (s) => s.submissionAttempts > 0);
  const galMode = useSelector(form.store, (s) => s.values.zimbraGalMode);

  const galModeLabel = galMode === 'ldap' ? 'External' : 'Internal';

  const changeGalModeBtnItems: Array<DropdownItem> = [
    {
      id: 'internal',
      label: t('domain.gal_change_mode_internal', 'Internal'),
      selected: galMode === 'zimbra',
      onClick: (): void => {
        form.setFieldValue('zimbraGalMode', 'zimbra');
      },
    },
    {
      id: 'external',
      label: t('domain.gal_change_mode_external', 'External'),
      selected: galMode === 'ldap',
      onClick: (): void => {
        form.setFieldValue('zimbraGalMode', 'ldap');
      },
    },
  ];

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
          {t('account_details.general', 'General')}
        </ds-text>
      </Row>

      <ListRow>
        <Container orientation="horizontal">
          <Container width="15rem" minWidth="11rem" mainAlignment="flex-start">
            <Dropdown
              items={changeGalModeBtnItems}
              onOpen={(): void => setDropdownOpen(true)}
              onClose={(): void => setDropdownOpen(false)}
            >
              <Button
                type="outlined"
                size="extralarge"
                label={t('label.change_to', 'CHANGE TO')}
                icon={dropdownOpen ? 'ChevronUp' : 'ChevronDown'}
                onClick={(): null => null}
              />
            </Dropdown>
          </Container>
          <Padding left="small" width="100%">
            <LabeledValue
              label={t('label.gal_mode', 'GAL Mode')}
              value={galModeLabel}
              backgroundColor="gray6"
            />
          </Padding>
        </Container>
      </ListRow>

      <Container padding={{ all: 'small' }}>
        <form.Field name="zimbraGalMaxResults">
          {(field) => {
            const error = getFieldErrorProps(
              field,
              isSubmitted,
              t,
              GAL_VALIDATION_MESSAGES,
            );
            return (
              <Input
                isRequired
                type="number"
                label={t(
                  'label.limit_search_results_from_address_book_list_to',
                  'Limit search results from Address Book List to',
                )}
                value={field.state.value}
                backgroundColor="gray5"
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  field.handleChange(e.target.value);
                }}
                onBlur={(): void => field.handleBlur()}
                hasError={error.hasError}
                description={error.description}
              />
            );
          }}
        </form.Field>
      </Container>

      <Container padding={{ all: 'small' }}>
        <form.Field name="zimbraGalLdapPageSize">
          {(field) => {
            const error = getFieldErrorProps(
              field,
              isSubmitted,
              t,
              GAL_VALIDATION_MESSAGES,
            );
            return (
              <Input
                isRequired
                type="number"
                label={t('domain.page_size', 'Page Size')}
                value={field.state.value}
                backgroundColor="gray5"
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  field.handleChange(e.target.value);
                }}
                onBlur={(): void => field.handleBlur()}
                hasError={error.hasError}
                description={error.description}
              />
            );
          }}
        </form.Field>
      </Container>
    </Container>
  );
};
