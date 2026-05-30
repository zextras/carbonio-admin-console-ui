/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { Container } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { Attribute } from '../../../../types/attribute';
import { CosAttributes, CosPrefAttributes } from '../../../../types/cos';
import { ZIMBRA_ADMIN_URN } from '../../../constants';
import { ModifyCosBody } from '../../../services/modify-cos-service';
import { useModifyCos } from '../../../services/use-modify-cos';
import { FormPageLayout } from '../../form-page-layout';
import { localeList } from '../../utility/utils';
import { DEFAULT_COS_PREF_ATTRIBUTES } from '../constants';
import { CalendarOptions } from './sections/calendar-options';
import { ContactOptions } from './sections/contact-options';
import { ForwardingOptions } from './sections/forwarding-options';
import { GeneralOptions } from './sections/general-options';
import { MailOptions } from './sections/mail-options';
import { ReceivingMails } from './sections/receiving-mails';
import { SendingMails } from './sections/sending-mails';

type PreferencesFormProps = {
  cosInformation: Array<Attribute> | undefined;
  readonlyCOS: boolean;
};

function buildDefaultValues(cosInformation: Array<Attribute> | undefined): CosPrefAttributes {
  if (!cosInformation?.length) return DEFAULT_COS_PREF_ATTRIBUTES;
  const fromServer: Partial<CosAttributes> = {};
  cosInformation.forEach((item) => {
    const key = item?.n as keyof CosAttributes;
    fromServer[key] = item._content;
  });
  return {
    ...DEFAULT_COS_PREF_ATTRIBUTES,
    ...(fromServer as Partial<CosPrefAttributes>),
  };
}

export const PreferencesForm = ({ cosInformation, readonlyCOS }: PreferencesFormProps) => {
  const { cosId } = useParams();
  const [t] = useTranslation();
  const modifyCosMutation = useModifyCos(cosId);
  const locales = localeList(t);

  const form = useForm({
    defaultValues: buildDefaultValues(cosInformation),
    onSubmit: async ({ value }) => {
      const zimbraId = cosInformation?.find((a) => a.n === 'zimbraId')?._content;
      if (!zimbraId) return;

      const body: ModifyCosBody = {
        _jsns: ZIMBRA_ADMIN_URN,
        id: { _content: zimbraId },
        a: Object.keys(DEFAULT_COS_PREF_ATTRIBUTES).map((key) => ({
          n: key,
          _content: value[key as keyof CosPrefAttributes],
        })),
      };

      modifyCosMutation.mutate(body, {
        onSuccess: () => {
          form.reset(value, { keepDefaultValues: true });
        },
      });
    },
  });

  const isDirty = useSelector(form.store, (state) => state.isDirty);

  return (
    <FormPageLayout
      title={t('label.preferences', 'Preferences')}
      onSave={() => form.handleSubmit()}
      onCancel={() => form.reset()}
      unsavedChanges={isDirty}
    >
      <Container mainAlignment="flex-start" width="100%" orientation="vertical">
        <GeneralOptions form={form} readonlyCOS={readonlyCOS} locales={locales} />
        <ds-divider></ds-divider>
        <MailOptions form={form} readonlyCOS={readonlyCOS} />
        <ds-divider></ds-divider>
        <ReceivingMails form={form} readonlyCOS={readonlyCOS} />
        <ds-divider></ds-divider>
        <ForwardingOptions form={form} readonlyCOS={readonlyCOS} />
        <ds-divider></ds-divider>
        <SendingMails form={form} readonlyCOS={readonlyCOS} />
        <ds-divider></ds-divider>
        <ContactOptions form={form} readonlyCOS={readonlyCOS} />
        <ds-divider></ds-divider>
        <CalendarOptions form={form} readonlyCOS={readonlyCOS} />
      </Container>
    </FormPageLayout>
  );
};
