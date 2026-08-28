/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import {
  Container,
  CustomTextArea,
  Input,
  LabeledValue,
  ListRow,
  Row,
  Select,
  Switch,
} from '@zextras/ui-components';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';

import { TRUE_FALSE } from '../../../../constants';
import ManageAliases from '../../../components/manageAliases';
import type { EditDistributionListFormApi } from '../edit-distribution-list/types';

type GeneralTabProps = {
  form: EditDistributionListFormApi;
  dlCreateDate: string;
  dlId: string;
  selectedMailingList: any;
  dlMembershipListNames: string;
};

export const GeneralTab: FC<GeneralTabProps> = ({
  form,
  dlCreateDate,
  dlId,
  selectedMailingList,
  dlMembershipListNames,
}) => {
  const [t] = useTranslation();
  const dlmCount = useSelector(form.store, (state) => state.values.dlm.length);
  const aliasCount = useSelector(form.store, (state) => state.values.aliases.length);

  const rightsOptions: any[] = [
    {
      label: t('domain.mailingList.canReceive', 'Can Receive'),
      value: TRUE_FALSE.TRUE,
    },
    {
      label: t('domain.mailingList.cantReceive', "Can't Receive"),
      value: TRUE_FALSE.FALSE,
    },
  ];

  return (
    <Container
      padding={{ left: 'large', right: 'large', bottom: 'large' }}
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      height="calc(100vh - 3.6rem)"
      background="white"
      width={'58.75rem'}
      style={{ overflow: 'auto' }}
    >
      <Row padding={{ top: 'medium', bottom: 'medium' }}>
        <ds-text as="h3" size="medium" weight="bold" color="gray0">
          {t('domain.list_details', 'List Details')}
        </ds-text>
      </Row>

      <ListRow padding={{ right: 'small', bottom: 'small' }}>
        <Container padding={{ top: 'small' }}>
          <form.Field name="displayName">
            {(field) => (
              <Input
                isRequired
                label={t('label.display_name', 'Display Name')}
                value={field.state.value}
                backgroundColor="gray5"
                onChange={(e: any): any => {
                  field.handleChange(e.target.value);
                }}
              />
            )}
          </form.Field>
        </Container>
        <Container padding={{ left: 'large', top: 'small' }}>
          <form.Field name="distributionName">
            {(field) => (
              <Input
                isRequired
                label={t('label.address', 'Address')}
                value={field.state.value}
                backgroundColor="gray5"
                onChange={(e: any): any => {
                  field.handleChange(e.target.value);
                }}
              />
            )}
          </form.Field>
        </Container>
      </ListRow>
      <ListRow>
        <Container padding={{ right: 'small', top: 'small' }}>
          <form.Field name="zimbraMailStatusValue">
            {(field) => (
              <Select
                items={rightsOptions}
                background="gray5"
                label={t('label.status', 'Status')}
                showCheckbox={false}
                onChange={(v: any): void => {
                  field.handleChange(v);
                }}
                selection={
                  rightsOptions.find((item: any) => item.value === field.state.value) ??
                  rightsOptions[1]
                }
              />
            )}
          </form.Field>
        </Container>
      </ListRow>
      <Container
        height="fit"
        padding={{ left: 'small', top: 'large', right: 'small', bottom: 'small' }}
      >
        <form.Field name="aliases">
          {(field) => (
            <ManageAliases
              listAliases={field.state.value}
              setListAliases={(aliases: Array<any>): void => {
                field.handleChange(aliases as never);
              }}
              setAliasChange={(): void => undefined}
            />
          )}
        </form.Field>
      </Container>
      {!selectedMailingList?.dynamic && (
        <ListRow padding={{ all: 'small' }}>
          <Container
            padding={{ top: 'small' }}
            mainAlignment="flex-start"
            crossAlignment="flex-start"
          >
            <form.Field name="sendShareMessageToNewMembers">
              {(field) => (
                <Switch
                  value={field.state.value}
                  label={t(
                    'label.send_new_members_notification_for_share_assigned_to_this_group',
                    'Send to new members a notification for the share/delegation assigned to this group',
                  )}
                  onClick={(): void => {
                    field.handleChange(!field.state.value);
                  }}
                  iconColor="primary"
                />
              )}
            </form.Field>
          </Container>
        </ListRow>
      )}
      <ListRow padding={{ left: 'small', right: 'small', bottom: 'small' }}>
        <Container mainAlignment="flex-start" crossAlignment="flex-start">
          <form.Field name="zimbraHideInGal">
            {(field) => (
              <Switch
                value={field.state.value}
                label={t('label.this_is_hidden_from_gal', 'This list is hidden from GAL')}
                onClick={(): void => {
                  field.handleChange(!field.state.value);
                }}
                iconColor="primary"
              />
            )}
          </form.Field>
        </Container>
      </ListRow>
      <ListRow padding={{ all: 'small' }}>
        <Container orientation="horizontal">
          <Container padding={{ right: 'large' }}>
            <LabeledValue
              label={t('label.members', 'Members')}
              value={dlmCount}
              backgroundColor="gray5"
              textColor={'black'}
            />
          </Container>
          <Container>
            <LabeledValue
              label={t('label.alias_in_the_list', 'Alias in the List')}
              value={aliasCount}
              backgroundColor="gray5"
              textColor={'black'}
            />
          </Container>
        </Container>
      </ListRow>

      <ListRow padding={{ all: 'small' }}>
        <Container padding={{ bottom: 'small' }} orientation="horizontal">
          <Container padding={{ right: 'large' }}>
            <LabeledValue
              label={t('label.id_lbl', 'ID')}
              value={dlId}
              backgroundColor="gray5"
              textColor={'black'}
            />
          </Container>
          <Container>
            <LabeledValue
              label={t('label.creation_date', 'Creation Date')}
              value={dlCreateDate}
              backgroundColor="gray5"
              textColor={'black'}
            />
          </Container>
        </Container>
      </ListRow>
      <Row padding={{ top: 'large' }}>
        <ds-text as="h3" size="medium" weight="bold" color="gray0">
          {t('label.description', 'Description')}
        </ds-text>
      </Row>
      <ListRow padding={{ all: 'small' }}>
        <Container padding={{ bottom: 'medium' }}>
          <form.Field name="description">
            {(field) => (
              <Input
                value={field.state.value}
                label={t(
                  'label.note_label',
                  'Write something that will easily make you remember this element',
                )}
                backgroundColor="gray5"
                onChange={(e: any): any => {
                  field.handleChange(e.target.value);
                }}
              />
            )}
          </form.Field>
        </Container>
      </ListRow>
      <Row padding={{ top: 'large' }}>
        <ds-text as="h3" size="medium" weight="bold" color="gray0">
          {t('label.notes', 'Notes')}
        </ds-text>
      </Row>
      <ListRow padding={{ all: 'small' }}>
        <Container padding={{ bottom: 'medium' }}>
          <form.Field name="zimbraNotes">
            {(field) => (
              <CustomTextArea
                value={field.state.value}
                label={t('label.notes', 'Notes')}
                backgroundColor="gray5"
                onChange={(e: any): any => {
                  field.handleChange(e.target.value);
                }}
              />
            )}
          </form.Field>
        </Container>
      </ListRow>

      {!selectedMailingList?.dynamic && (
        <>
          <Row padding={{ top: 'small' }}>
            <ds-text as="h3" size="medium" weight="bold" color="gray0">
              {t('label.this_list_included_in', 'This list is included in')}
            </ds-text>
          </Row>
          <ListRow padding={{ all: 'small' }}>
            <Container padding={{ bottom: 'small' }}>
              <LabeledValue
                label={t('label.distribution_lists', 'Distribution Lists')}
                value={dlMembershipListNames}
                backgroundColor="gray5"
                textColor={'black'}
              />
            </Container>
          </ListRow>
        </>
      )}
      <Row mainAlignment="flex-start" width="100%" padding={{ top: 'small', bottom: 'small' }}>
        <Container padding={{ bottom: 'small' }}>
          <ds-divider />
        </Container>
      </Row>
    </Container>
  );
};
