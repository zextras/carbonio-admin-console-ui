/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, useSnackbar } from '@zextras/ui-components';
import { useCurrentUserRights, useIsAdvanced } from '@zextras/ui-shared';
import { find, isEqual } from 'lodash-es';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import {
  COS,
  MOBILE_CALENDAR_FEATURE_SYNC,
  MOBILE_CONTACT_FEATURE_SYNC,
  ZIMBRA_ADMIN_URN,
} from '../../constants';
import { ModifyCosBody } from '../../services/modify-cos-service';
import { setCoreAttributes } from '../../services/set-core-attributes';
import { useCoreAttributes } from '../../services/use-core-attributes';
import { useCosDetail } from '../../services/use-cos-detail';
import { useModifyCos } from '../../services/use-modify-cos';
import { PageLayout } from '../page-layout';
import { Features } from './features';

const CosFeatures: FC = () => {
  const [t] = useTranslation();
  const { cosId } = useParams();
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const createSnackbar = useSnackbar();
  const { data: cosDetailData, isPending } = useCosDetail(cosId);
  const cosInformation = cosDetailData?.cos?.[0]?.a;
  const cosName = cosDetailData?.cos?.[0]?.name;
  const [initCosData, setInitCosData] = useState<Partial<Record<string, string>>>({});
  const [zimbraId, setZimbraId] = useState<string>('');
  const [cosFeatures, setCosFeatures] = useState<Partial<Record<string, string>>>({});
  const isAdvanced = useIsAdvanced();
  const { data: rights = [] } = useCurrentUserRights();
  const modifyCosMutation = useModifyCos(cosId);

  const readonlyCOS = (() => {
    const rightsConfig = find(rights, { type: COS }) || { all: [], type: COS };
    return !rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
  })();

  const setSwitchOptionValue = (key: string, value: string | undefined): void => {
    setInitCosData((prev: Partial<Record<string, string>>) => ({
      ...prev,
      [key]: value,
    }));
    setCosFeatures((prev: Partial<Record<string, string>>) => ({
      ...prev,
      [key]: value,
    }));
  };

  const mobileFeatureBody = isAdvanced && cosName
    ? [
        {
          configType: COS,
          configName: [cosName],
          attrName: ['mobileContactFeatureSync', 'mobileCalendarFeatureSync'],
        },
      ]
    : [];

  const { data: mobileAttributesData, error: mobileAttributesError } =
    useCoreAttributes(mobileFeatureBody);

  const [mobileSyncOverrides, setMobileSyncOverrides] = useState<Partial<Record<string, string>>>(
    {},
  );

  const mobileSyncValues: Partial<Record<string, string>> = {
    mobileContactFeatureSync:
      mobileSyncOverrides.mobileContactFeatureSync
      ?? (mobileAttributesData?.attributes?.mobileContactFeatureSync?.[0]?.value === 'enabled'
        ? 'TRUE'
        : 'FALSE'),
    mobileCalendarFeatureSync:
      mobileSyncOverrides.mobileCalendarFeatureSync
      ?? (mobileAttributesData?.attributes?.mobileCalendarFeatureSync?.[0]?.value === 'enabled'
        ? 'TRUE'
        : 'FALSE'),
  };

  useEffect(() => {
    if (mobileAttributesError) {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label: (mobileAttributesError as Error)?.message
          ? (mobileAttributesError as Error).message
          : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    }
  }, [mobileAttributesError, createSnackbar, t]);

  const setInitialValues = (obj: Partial<Record<string, string>>) => {
    if (obj) {
      setSwitchOptionValue('carbonioFeatureMailsAppEnabled', obj?.carbonioFeatureMailsAppEnabled);
      setSwitchOptionValue(
        'zimbraFeatureOutOfOfficeReplyEnabled',
        obj?.zimbraFeatureOutOfOfficeReplyEnabled,
      );
      setSwitchOptionValue('zimbraFeatureSignaturesEnabled', obj?.zimbraFeatureSignaturesEnabled);
      setSwitchOptionValue('zimbraFeatureMobileSyncEnabled', obj?.zimbraFeatureMobileSyncEnabled);
      setSwitchOptionValue('zimbraFeatureContactsEnabled', obj?.zimbraFeatureContactsEnabled);
      setSwitchOptionValue('zimbraFeatureCalendarEnabled', obj?.zimbraFeatureCalendarEnabled);
      setSwitchOptionValue('carbonioFeatureFilesAppEnabled', obj?.carbonioFeatureFilesAppEnabled);
      setSwitchOptionValue('carbonioFeatureFilesEnabled', obj?.carbonioFeatureFilesEnabled);
      setSwitchOptionValue('carbonioFeatureTasksEnabled', obj?.carbonioFeatureTasksEnabled);
      setSwitchOptionValue('zimbraFeatureOptionsEnabled', obj?.zimbraFeatureOptionsEnabled);
      setSwitchOptionValue('carbonioOtpWizardFromUntrusted', obj?.carbonioOtpWizardFromUntrusted);
      setSwitchOptionValue('carbonioFeatureOTPMgmtEnabled', obj?.carbonioFeatureOTPMgmtEnabled);
      setSwitchOptionValue(
        'carbonioOtpGracePeriodEndingTime',
        obj?.carbonioOtpGracePeriodEndingTime ?? '',
      );
      setSwitchOptionValue('carbonioOtpGracePeriodEnabled', obj?.carbonioOtpGracePeriodEnabled);
    }
  };

  useEffect(() => {
    if (!!cosInformation && cosInformation.length > 0) {
      const obj: Partial<Record<string, string>> = {};
      cosInformation.forEach((item) => {
        obj[item?.n] = item._content;
      });
      setZimbraId(obj?.zimbraId ?? '');
      setInitialValues(obj);
      setIsDirty(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cosInformation]);

  useEffect(() => {
    const hasCosChanges = zimbraId && !isEqual(cosFeatures, initCosData);
    const hasMobileChanges = Object.keys(mobileSyncOverrides).length > 0;
    setIsDirty(hasCosChanges || hasMobileChanges);
  }, [cosFeatures, initCosData, zimbraId, mobileSyncOverrides]);

  const modifyCoreAttributes = (body: Record<string, unknown>): void => {
    setCoreAttributes(body)
      .then(() => {
        setMobileSyncOverrides({});
      })
      .catch((error) => {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: error?.message
            ? error?.message
            : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      });
  };

  const onSave = (): void => {
    const body: ModifyCosBody = {
      _jsns: ZIMBRA_ADMIN_URN,
      id: {
        _content: zimbraId,
      },
    } as ModifyCosBody;
    body.a = Object.keys(cosFeatures)
      .filter((ele) => ele !== MOBILE_CALENDAR_FEATURE_SYNC && ele !== MOBILE_CONTACT_FEATURE_SYNC)
      .map((ele) => ({ n: ele, _content: cosFeatures[ele] ?? '' }));

    const hasMobileChanges = Object.keys(mobileSyncOverrides).length > 0;
    if (hasMobileChanges && isAdvanced) {
      const coreAttrBody: Record<string, unknown> = {
        mobileCalendarFeatureSync: {
          value: mobileSyncValues.mobileCalendarFeatureSync === 'TRUE' ? 'enabled' : 'disabled',
          objectName: cosName,
          configType: COS,
        },
        mobileContactFeatureSync: {
          value: mobileSyncValues.mobileContactFeatureSync === 'TRUE' ? 'enabled' : 'disabled',
          objectName: cosName,
          configType: COS,
        },
      };
      modifyCoreAttributes(coreAttrBody);
    }
    modifyCosMutation.mutate(body);
  };

  const onCancel = (): void => {
    setCosFeatures(initCosData);
    setMobileSyncOverrides({});
    setIsDirty(false);
  };

  if (isPending) {
    return (
      <Container crossAlignment="center" mainAlignment="center" height="fill">
        <ds-spinner />
      </Container>
    );
  }

  return (
    <PageLayout
      title={t('label.features', 'Features')}
      onSave={onSave}
      onCancel={onCancel}
      unSavedChanges={isDirty}
    >
      <Features
        featuresDetail={cosFeatures}
        setFeaturesDetail={setCosFeatures}
        readonlyFeatures={readonlyCOS}
        cosLevelFeatures
      />
    </PageLayout>
  );
};

export default CosFeatures;
