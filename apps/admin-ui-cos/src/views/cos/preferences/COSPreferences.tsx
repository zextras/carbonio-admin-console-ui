/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {  Container  } from '@zextras/ui-components';
import {  useCurrentUserRights  } from '@zextras/ui-shared';
import {  find  } from 'lodash-es';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { CosAttributes, CosPrefAttributes } from '../../../../types/cos';
import { COS, ZIMBRA_ADMIN_URN } from '../../../constants';
import { ModifyCosBody } from '../../../services/modify-cos-service';
import { useCosDetail } from '../../../services/use-cos-detail';
import { useModifyCos } from '../../../services/use-modify-cos';
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
  const { cosId } = useParams();
  const { data: cosDetailData } = useCosDetail(cosId);
  const cosInformation = cosDetailData?.cos?.[0]?.a;
  const { data: rights = [] } = useCurrentUserRights();
  const modifyCosMutation = useModifyCos(cosId);

  const locales = localeList(t);
  const isReadOnlyCos = (() => {
    const rightsConfig = find(rights, { type: COS }) || { all: [], type: COS };
    return !rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
  })();

  const [currentCosAttributes, setCurrentCosAttributes] = useState<Partial<CosAttributes>>();
  const [draftCosPrefAttributes, setDraftCosPrefAttributes] = useState<CosPrefAttributes>(
    DEFAULT_COS_PREF_ATTRIBUTES,
  );

  const hasUnsavedChanges = useHasUnsavedChanges(currentCosAttributes, draftCosPrefAttributes);

  const handleCosPrefAttributeChange = (
    key: keyof CosPrefAttributes,
    value: AttributeValue
  ) => {
    if (value === null) return;
    const newValue = typeof value === 'object' && 'value' in value ? value.value : value;
    setDraftCosPrefAttributes((prev) => ({
      ...prev,
      [key]: newValue,
    }));
  };

  const handleSwitchOptionChange = (key: keyof CosPrefAttributes): void => {
    setDraftCosPrefAttributes((prev: CosPrefAttributes) => ({
      ...prev,
      [key]: prev[key] === 'TRUE' ? 'FALSE' : 'TRUE',
    }));
  };

  const setInitialValues = (initialCosPrefAttributes: Partial<CosAttributes>) => {
    setDraftCosPrefAttributes((prev) => ({
      ...DEFAULT_COS_PREF_ATTRIBUTES,
      ...prev,
      ...initialCosPrefAttributes,
    }));
  };

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

    modifyCosMutation.mutate(body);
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
     
  }, [cosInformation]);

  return (
    <PageLayout
      title={t('label.preferences', 'Preferences')}
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
        <ds-divider></ds-divider>
        <MailOptions
          cosPrefAttributes={draftCosPrefAttributes}
          isReadOnlyCosEntry={isReadOnlyCos}
          changeSwitchOption={handleSwitchOptionChange}
          onCosAttributeChanged={handleCosPrefAttributeChange}
        />
        <ds-divider></ds-divider>
        <ReceivingMails
          cosPrefAttributes={draftCosPrefAttributes}
          isReadOnlyCosEntry={isReadOnlyCos}
          onCosAttributeChanged={handleCosPrefAttributeChange}
        />
        <ds-divider></ds-divider>
        <ForwardingOptions
          cosPrefAttributes={draftCosPrefAttributes}
          isReadOnlyCosEntry={isReadOnlyCos}
          changeSwitchOption={handleSwitchOptionChange}
        />
        <ds-divider></ds-divider>
        <SendingMails
          cosPrefAttributes={draftCosPrefAttributes}
          isReadOnlyCosEntry={isReadOnlyCos}
          onCosAttributeChanged={handleCosPrefAttributeChange}
          changeSwitchOption={handleSwitchOptionChange}
        />
        <ds-divider></ds-divider>
        <ContactOptions
          cosPrefAttributes={draftCosPrefAttributes}
          isReadOnlyCosEntry={isReadOnlyCos}
          changeSwitchOption={handleSwitchOptionChange}
        />
        <ds-divider></ds-divider>
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
