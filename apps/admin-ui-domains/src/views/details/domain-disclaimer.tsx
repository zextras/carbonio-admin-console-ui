/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { FormPageLayout, Switch, TextArea } from '@zextras/ui-components';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { Composer } from '../../composer/composer';
import { useSelectedDomain } from '../../hooks/use-selected-domain';
import styles from './domain-disclaimer.module.css';
import { useDomainDisclaimerForm } from './domain-disclaimer/use-domain-disclaimer-form';
import { getDefaultDisclaimerFormValues } from './domain-disclaimer/utils';

export const DomainDisclaimer = () => {
  const [t] = useTranslation();
  const { data: domain } = useSelectedDomain();
  const domainInformation = domain?.a;
  const domainId = domain?.id;
  const domainName = domain?.name;

  const defaultValues = getDefaultDisclaimerFormValues(domainInformation);

  const { form, handleSave, handleCancel } = useDomainDisclaimerForm({
    defaultValues,
    domainId,
    domainName,
  });

  const isDirty = useSelector(form.store, (s) => !s.isDefaultValue);

  return (
    <div className={styles.page}>
      <FormPageLayout
        title={t('label.disclaimer', 'Disclaimer')}
        unsavedChanges={isDirty}
        onSave={handleSave}
        onCancel={handleCancel}
      >
        <form.Field name="zimbraDomainMandatoryMailSignatureEnabled">
          {(field) => (
            <Switch
              label={t(
                'label.enable_disclaimers_for_this_domain',
                'Enable disclaimers for this domain',
              )}
              iconColor="primary"
              value={field.state.value}
              onClick={() => {
                field.handleChange(!field.state.value);
              }}
            />
          )}
        </form.Field>

        <div className={styles.editorsGrid}>
          <section className={styles.editorColumn}>
            <ds-text as="h3" size="small" weight="bold" color="gray0">
              {t('label.text_editor', 'Text Editor')}
            </ds-text>
            <form.Field name="zimbraAmavisDomainDisclaimerText">
              {(field) => (
                <TextArea
                  label={''}
                  value={field.state.value}
                  // @ts-expect-error - needs a fix
                  onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                    field.handleChange(event.currentTarget.value);
                  }}
                  maxHeight="20.5rem"
                />
              )}
            </form.Field>
          </section>

          <section className={styles.editorColumn}>
            <ds-text as="h3" size="small" weight="bold" color="gray0">
              {t('label.rich_text_editor', 'Rich Text Editor')}
            </ds-text>
            <form.Field name="zimbraAmavisDomainDisclaimerHTML">
              {(field) => (
                <div className={styles.editorWrapper}>
                  <Composer
                    initialValue={defaultValues.zimbraAmavisDomainDisclaimerHTML}
                    value={field.state.value}
                    onEditorChange={(values) => {
                      field.handleChange(values[1]);
                    }}
                  />
                </div>
              )}
            </form.Field>
          </section>
        </div>
      </FormPageLayout>
    </div>
  );
};
