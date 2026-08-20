/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import {
  ChipInput,
  Container,
  InheritedSwitch,
  Input,
  Row,
  Tooltip,
} from '@zextras/ui-components';
import { map, some } from 'lodash-es';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { WscSettings } from '../../../../../wsc/wsc-settings';
import CustomChip from '../../../../components/customChip';
import { Features } from '../../../../cos/features';
import { isValidEmail } from '../../../../utility/utils';
import { useAccountForm, useSetAccountValues, useToggleAccountValue } from './account-form-context';

const EditAccountConfigurationSection: React.FC = () => {
  const { form, cosDetail, accSpecificDetail } = useAccountForm();
  const setAccountValues = useSetAccountValues();
  const toggleAccountValue = useToggleAccountValue();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const [t] = useTranslation();
  const [prefMailForwardingAddress, setPrefMailForwardingAddress] = useState<any[]>([]);
  const [mailForwardingAddress, setMailForwardingAddress] = useState<any[]>([]);
  const [prefCalendarForwardInvitesTo, setPrefCalendarForwardInvitesTo] = useState<any[]>([]);

  useEffect(() => {
    setPrefMailForwardingAddress(
      values?.zimbraPrefMailForwardingAddress
        ? values.zimbraPrefMailForwardingAddress
            .split(', ')
            .map((ele: string) => ({ label: ele }))
        : [],
    );
  }, [values?.zimbraPrefMailForwardingAddress]);
  useEffect(() => {
    setMailForwardingAddress(
      values?.zimbraMailForwardingAddress
        ? values.zimbraMailForwardingAddress
            .split(', ')
            .map((ele: string) => ({ label: ele }))
        : [],
    );
  }, [values?.zimbraMailForwardingAddress]);
  useEffect(() => {
    setPrefCalendarForwardInvitesTo(
      values?.zimbraPrefCalendarForwardInvitesTo
        ? values.zimbraPrefCalendarForwardInvitesTo
            .split(', ')
            .map((ele: string) => ({ label: ele }))
        : [],
    );
  }, [values?.zimbraPrefCalendarForwardInvitesTo]);

  const setEmptyValue = (keyName: string): void => {
    setAccountValues((prev: Record<string, any>) => ({ ...prev, [keyName]: undefined }));
  };

  const changeAccDetail = (e: ChangeEvent<HTMLInputElement>): void => {
    setAccountValues((prev: Record<string, any>) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Container
      mainAlignment="flex-start"
      padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
      style={{ overflow: 'auto' }}
    >
      <Row mainAlignment="flex-start" width="100%">
        <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
          <ds-text size="small" color="gray0" weight="bold" as="h2">
            {t('label.forwarding', 'Forwarding')}
          </ds-text>
        </Row>
        <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
          <Row width="48%" mainAlignment="flex-start">
            <InheritedSwitch
              subValue={values?.zimbraFeatureMailForwardingEnabled}
              onChange={toggleAccountValue}
              label={t(
                'account_details.user_can_specify_forwarding_address',
                'User can specify forwarding address',
              )}
              iconColor="primary"
              inheritedValue={cosDetail.zimbraFeatureMailForwardingEnabled}
              fromSubValue={accSpecificDetail?.zimbraFeatureMailForwardingEnabled}
              inputName={'zimbraFeatureMailForwardingEnabled'}
              onChangeReset={(): void => setEmptyValue('zimbraFeatureMailForwardingEnabled')}
            />
          </Row>
          <Row width="48%" mainAlignment="flex-start">
            <InheritedSwitch
              subValue={values?.zimbraPrefMailLocalDeliveryDisabled}
              onChange={toggleAccountValue}
              label={t(
                'account_details.dont_keep_local_copy_of_messages',
                `Don't Keep local copy of messages`,
              )}
              iconColor="primary"
              inheritedValue={cosDetail.zimbraPrefMailLocalDeliveryDisabled}
              fromSubValue={accSpecificDetail?.zimbraPrefMailLocalDeliveryDisabled}
              inputName={'zimbraPrefMailLocalDeliveryDisabled'}
              onChangeReset={(): void => setEmptyValue('zimbraPrefMailLocalDeliveryDisabled')}
            />
          </Row>
        </Row>
        <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
          <Row width="48%" mainAlignment="flex-start">
            <InheritedSwitch
              subValue={values?.zimbraFeatureMailForwardingInFiltersEnabled}
              onChange={toggleAccountValue}
              label={t(
                'account_details.user_can_specify_mail_forwarding_filter',
                'User can specify mail forwarding filter',
              )}
              iconColor="primary"
              inheritedValue={cosDetail.zimbraFeatureMailForwardingInFiltersEnabled}
              fromSubValue={accSpecificDetail?.zimbraFeatureMailForwardingInFiltersEnabled}
              inputName={'zimbraFeatureMailForwardingInFiltersEnabled'}
              onChangeReset={(): void =>
                setEmptyValue('zimbraFeatureMailForwardingInFiltersEnabled')
              }
            />
          </Row>
        </Row>
        <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
          <Row width="100%" mainAlignment="space-between">
            <ChipInput
              placeholder={t(
                'account_details.forwarding_addresses_specified_by_the_user',
                'Forwarding addresses specified by the user',
              )}
              onChange={(contacts: any): void => {
                const data: any = [];
                map(contacts, (contact) => {
                  if (isValidEmail(contact.label ?? '')) data.push(contact);
                });
                setPrefMailForwardingAddress(data);
                setAccountValues((prev: Record<string, any>) => ({
                  ...prev,
                  zimbraPrefMailForwardingAddress: map(data, 'label').join(', '),
                }));
              }}
              ChipComponent={CustomChip}
              value={prefMailForwardingAddress}
              background="gray5"
              hasError={some(prefMailForwardingAddress || [], { error: true })}
              maxChips={null}
            />
          </Row>
        </Row>
        <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
          <Row width="100%" mainAlignment="space-between">
            <ChipInput
              placeholder={t(
                'account_details.forwarding_addresses_hidden_from_the_user',
                'Forwarding addresses hidden from the user',
              )}
              onChange={(contacts: any): void => {
                const data: any = [];
                map(contacts, (contact) => {
                  if (isValidEmail(contact.label ?? '')) data.push(contact);
                });
                setMailForwardingAddress(data);
                setAccountValues((prev: Record<string, any>) => ({
                  ...prev,
                  zimbraMailForwardingAddress: map(data, 'label').join(', '),
                }));
              }}
              value={mailForwardingAddress}
              background="gray5"
              hasError={some(mailForwardingAddress || [], { error: true })}
              ChipComponent={CustomChip}
              maxChips={null}
            />
          </Row>
        </Row>
        <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
          <Row width="100%" mainAlignment="space-between">
            <ChipInput
              placeholder={t(
                'account_details.forwarding_calendar_invitations_to_these_addresses',
                'Forwarding calendar invitations to these addresses',
              )}
              onChange={(contacts: any): void => {
                const data: any = [];
                map(contacts, (contact) => {
                  if (isValidEmail(contact.label ?? '')) data.push(contact);
                });
                setPrefCalendarForwardInvitesTo(data);
                setAccountValues((prev: Record<string, any>) => ({
                  ...prev,
                  zimbraPrefCalendarForwardInvitesTo: map(data, 'label').join(', '),
                }));
              }}
              value={prefCalendarForwardInvitesTo}
              background="gray5"
              hasError={some(prefCalendarForwardInvitesTo || [], { error: true })}
              ChipComponent={CustomChip}
              maxChips={null}
            />
          </Row>
        </Row>
        <Row width="100%" padding={{ top: 'medium' }}>
          <ds-divider></ds-divider>
        </Row>
        <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
          <ds-text size="small" color="gray0" weight="bold" as="h2">
            {t('label.mail_transport', 'Mail Transport')}
          </ds-text>
        </Row>
        <Row padding={{ top: 'large', left: 'large' }} width="100%">
          <Input
            onChange={changeAccDetail}
            inputName="zimbraMailTransport"
            label={t('label.mail_transport_map', 'Mail Transport Map')}
            backgroundColor="gray5"
            value={values?.zimbraMailTransport || ''}
            CustomIcon={(): React.ReactElement => (
              <Tooltip
                placement="top"
                label={`${t('label.format', 'Format')} :  ${t(
                  'label.protocol_server_port',
                  'protocol:server:port',
                )}${` | `}:${` lmtp:server.demo.zextras.io:7025`}`}
              >
                <ds-text as="span">
                  <ds-icon icon="InfoOutline" size="large" color="secondary"></ds-icon>
                </ds-text>
              </Tooltip>
            )}
          />
        </Row>
        <Row width="100%" padding={{ top: 'medium' }}>
          <ds-divider></ds-divider>
        </Row>
        <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
          <ds-text size="small" color="gray0" weight="bold" as="h2">
            {t('label.features', 'Features')}
          </ds-text>
        </Row>
        <Features
          featuresDetail={values}
          setFeaturesDetail={setAccountValues}
          cosDetail={cosDetail}
          accSpecificDetail={accSpecificDetail}
          setEmptyValue={setEmptyValue}
        />
        <Row width="100%" padding={{ top: 'medium' }}>
          <ds-divider></ds-divider>
        </Row>
        <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
          <ds-text size="small" color="gray0" weight="bold" as="h2">
            {t('label.wsc', 'Chat')}
          </ds-text>
        </Row>
        <WscSettings
          featuresDetail={values}
          setFeaturesDetail={setAccountValues}
          cosDetail={cosDetail}
          accSpecificDetail={accSpecificDetail}
          setEmptyValue={setEmptyValue}
        />
      </Row>
    </Container>
  );
};

export default EditAccountConfigurationSection;
