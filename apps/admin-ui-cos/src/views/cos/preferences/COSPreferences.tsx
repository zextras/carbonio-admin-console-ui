/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCurrentUserRights } from '@zextras/admin-ui-bootstrap';
import { Container, Divider, useSnackbar } from '@zextras/carbonio-design-system';
import { find } from 'lodash-es';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CosAttributes, CosPrefAttributes } from '../../../../types/cos';
import { COS, ZIMBRA_ADMIN_URN } from '../../../constants';
import { flushCache } from '../../../services/flush-cache-service';
import { modifyCos, ModifyCosBody } from '../../../services/modify-cos-service';
import { useCosStore } from '../../../store/cos/store';
import { PageLayout } from '../../page-layout';
import { localeList } from '../../utility/utils';
import { DEFAULT_COS_PREF_ATTRIBUTES } from '../constants';
import { AttributeValue } from '../constants/types';
import { CalendarOptions } from './CalendarOptions';
import { ContactOptions } from './ContactOptions';
import { ForwardingOptions } from './ForwardingOptions';
import { GeneralOptions } from './GeneralOptions';
import { useHasUnsavedChanges } from './hooks/useHasUnsavedChanges';
import { MailOptions } from './MailOptions';
import { ReceivingMails } from './ReceivingMails';
import { SendingMails } from './SendingMails';

export const COSPreferences = (): React.JSX.Element => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const cosInformation = useCosStore((state) => state.cos?.a);
  const { data: rights = [] } = useCurrentUserRights();
  const setCos = useCosStore((state) => state.setCos);

  const locales = useMemo(() => localeList(t), [t]);
  const isReadOnlyCos = useMemo(() => {
    const rightsConfig = find(rights, { type: COS }) || { all: [], type: COS };
    return !rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
  }, [rights]);

  const [currentCosAttributes, setCurrentCosAttributes] = useState<Partial<CosAttributes>>();
  const [draftCosPrefAttributes, setDraftCosPrefAttributes] = useState<CosPrefAttributes>(
    DEFAULT_COS_PREF_ATTRIBUTES,
  );

  const hasUnsavedChanges = useHasUnsavedChanges(currentCosAttributes, draftCosPrefAttributes);

  const handleCosPrefAttributeChange = useCallback(
    (key: keyof CosPrefAttributes, value: AttributeValue) => {
      if (value === null) return;
      const newValue = typeof value === 'object' && 'value' in value ? value.value : value;
      setDraftCosPrefAttributes((prev) => ({
        ...prev,
        [key]: newValue,
      }));
    },
    [],
  );

  const handleSwitchOptionChange = useCallback((key: keyof CosPrefAttributes): void => {
    setDraftCosPrefAttributes((prev: CosPrefAttributes) => ({
      ...prev,
      [key]: prev[key] === 'TRUE' ? 'FALSE' : 'TRUE',
    }));
  }, []);

  const setInitialValues = useCallback((initialCosPrefAttributes: Partial<CosAttributes>) => {
    setDraftCosPrefAttributes((prev) => ({
      ...DEFAULT_COS_PREF_ATTRIBUTES,
      ...prev,
      ...initialCosPrefAttributes,
    }));
  }, []);

  const handleSave = (): void => {
    const zimbraID = currentCosAttributes?.zimbraId;
    if (!zimbraID) return;

    const body: ModifyCosBody = {
      _jsns: ZIMBRA_ADMIN_URN,
      id: { _content: zimbraID },
      a: Object.keys(DEFAULT_COS_PREF_ATTRIBUTES).map((key) => ({
        n: key,
        _content: draftCosPrefAttributes[key as keyof CosPrefAttributes],
      })),
    };

    modifyCos(body)
      .then((data) => {
        flushCache('cos', 'id', body.id._content);
        createSnackbar({
          key: 'success',
          severity: 'success',
          label: t('label.change_save_success_msg', 'The change has been saved successfully'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
        setCos(data?.cos[0]);
      })
      .catch((error) => {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label:
            error?.message ||
            t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      });
  };

  const handleCancel = (): void => {
    currentCosAttributes && setInitialValues(currentCosAttributes);
  };

  useEffect(() => {
    if (cosInformation?.length) {
      const initialCosPrefAttributes = cosInformation.reduce((accumulator, item) => {
        const key = item?.n as keyof CosAttributes;
        accumulator[key] = item._content;
        return accumulator;
      }, {} as Partial<CosAttributes>);
      setCurrentCosAttributes(initialCosPrefAttributes);
      setInitialValues(initialCosPrefAttributes);
    }
  }, [cosInformation, setInitialValues]);

  return (
    <PageLayout
      title={t('cos.preferences', 'Preferences')}
      onSave={handleSave}
      onCancel={handleCancel}
      unSavedChanges={hasUnsavedChanges}
    >
      <Container mainAlignment="flex-start" width="100%" orientation="vertical">
        <GeneralOptions
          cosPrefAttributes={draftCosPrefAttributes}
          isReadOnlyCosEntry={isReadOnlyCos}
          locales={locales}
          onCosAttributeChanged={handleCosPrefAttributeChange}
        />
        <Divider />
        <MailOptions
          cosPrefAttributes={draftCosPrefAttributes}
          isReadOnlyCosEntry={isReadOnlyCos}
          changeSwitchOption={handleSwitchOptionChange}
          onCosAttributeChanged={handleCosPrefAttributeChange}
        />
        <Divider />
        <ReceivingMails
          cosPrefAttributes={draftCosPrefAttributes}
          isReadOnlyCosEntry={isReadOnlyCos}
          onCosAttributeChanged={handleCosPrefAttributeChange}
        />
        <Divider />
        <ForwardingOptions
          cosPrefAttributes={draftCosPrefAttributes}
          isReadOnlyCosEntry={isReadOnlyCos}
          changeSwitchOption={handleSwitchOptionChange}
        />
        <Divider />
        <SendingMails
          cosPrefAttributes={draftCosPrefAttributes}
          isReadOnlyCosEntry={isReadOnlyCos}
          onCosAttributeChanged={handleCosPrefAttributeChange}
          changeSwitchOption={handleSwitchOptionChange}
        />
        <Divider />
        <ContactOptions
          cosPrefAttributes={draftCosPrefAttributes}
          isReadOnlyCosEntry={isReadOnlyCos}
          changeSwitchOption={handleSwitchOptionChange}
        />
        <Divider />
        <CalendarOptions
          cosPrefAttributes={draftCosPrefAttributes}
          isReadOnlyCosEntry={isReadOnlyCos}
          onCosAttributeChanged={handleCosPrefAttributeChange}
          onSwitchOptionChanged={handleSwitchOptionChange}
        />
      </Container>
    </PageLayout>
  );
};
