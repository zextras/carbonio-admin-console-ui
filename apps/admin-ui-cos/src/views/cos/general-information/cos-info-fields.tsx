/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ReactFormExtendedApi } from '@tanstack/react-form';
import {
  Container,
  CustomTextArea,
  LabeledValue,
  ListRow,
  PlainInput,
  PlainSelect,
  Row,
  type SelectItem,
} from '@zextras/ui-components';
import { useIsAdvanced } from '@zextras/ui-shared';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { CosEdition } from '../../../../types/cos';

export type GeneralInfoFormValues = {
  cn: string;
  description: string;
  zimbraNotes: string;
  edition: CosEdition;
};

const EDITION_ITEMS: Array<SelectItem<string>> = [
  { label: 'Email', value: 'mail' },
  { label: 'Workspace', value: 'workspace' },
];

type CosInfoFormApi = ReactFormExtendedApi<
  GeneralInfoFormValues,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>;

type CosInfoFieldsProps = {
  form: CosInfoFormApi;
  cosId: string | undefined;
  cosCreationDate: string;
  totalAccount: number;
  totalDomain: number;
  canDeleteCOS: boolean;
  readonlyCOS: boolean;
};

export const CosInfoFields = ({
  form,
  cosId,
  cosCreationDate,
  totalAccount,
  totalDomain,
  canDeleteCOS,
  readonlyCOS,
}: CosInfoFieldsProps) => {
  const [t] = useTranslation();
  const isAdvanced = useIsAdvanced();

  return (
    <Row mainAlignment="flex-start" width="100%">
      <Container height="fit" crossAlignment="flex-start" background="gray6">
        <ListRow>
          <Container padding={{ all: 'small' }}>
            <form.Field name="cn">
              {(field) => (
                <PlainInput
                  required
                  label={t('label.name', 'Name')}
                  value={field.state.value}
                  onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                    field.handleChange(e.target.value);
                  }}
                  disabled={canDeleteCOS || readonlyCOS}
                />
              )}
            </form.Field>
          </Container>
        </ListRow>
        <ListRow>
          <Container padding={{ all: 'small' }}>
            <PlainInput
              label={t('label.id_lbl', 'ID')}
              value={cosId ?? ''}
              disabled
              onChange={(): void => {}}
            />
          </Container>
          <Container padding={{ all: 'small' }}>
            <PlainInput
              label={t('label.creation_date', 'Creation Date')}
              value={cosCreationDate}
              disabled
              onChange={(): void => {}}
            />
          </Container>
        </ListRow>
        <ListRow>
          <Container padding={{ all: 'small' }}>
            <LabeledValue
              label={t('label.accounts_that_use_this_cos', 'Accounts that use this CoS')}
              backgroundColor="gray6"
              value={totalAccount}
            />
          </Container>
          <Container padding={{ all: 'small' }}>
            <LabeledValue
              label={t(
                'label.domains_that_use_this_cos_as_default',
                'Domains that use this CoS as default',
              )}
              value={totalDomain}
              backgroundColor="gray6"
            />
          </Container>
        </ListRow>
        {isAdvanced && (
          <ListRow>
            <Container padding={{ all: 'small' }}>
              <form.Field name="edition">
                {(field) => {
                  return (
                    <PlainSelect
                      items={EDITION_ITEMS}
                      label={t('label.associated_edition', 'Associated edition')}
                      selection={
                        EDITION_ITEMS.find((item) => item.value === field.state.value) ??
                        EDITION_ITEMS[0]
                      }
                      onChange={(value): void => {
                        field.handleChange(value === 'workspace' ? 'workspace' : 'mail');
                      }}
                      disabled={readonlyCOS}
                    />
                  );
                }}
              </form.Field>
            </Container>
          </ListRow>
        )}
        <ListRow>
          <Container padding={{ all: 'small' }}>
            <form.Field name="description">
              {(field) => (
                <PlainInput
                  label={t('label.description', 'Description')}
                  value={field.state.value}
                  onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                    field.handleChange(e.target.value);
                  }}
                  disabled={readonlyCOS}
                />
              )}
            </form.Field>
          </Container>
        </ListRow>
        <ListRow>
          <Container padding={{ all: 'small' }}>
            <form.Field name="zimbraNotes">
              {(field) => (
                <CustomTextArea
                  label={t('label.notes', 'Notes')}
                  backgroundColor="gray5"
                  value={field.state.value}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>): void => {
                    field.handleChange(e.target.value);
                  }}
                  disabled={readonlyCOS}
                />
              )}
            </form.Field>
          </Container>
        </ListRow>
      </Container>
    </Row>
  );
};
