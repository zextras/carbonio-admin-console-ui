/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useCurrentUserRights, useIsAdvanced } from '@zextras/ui-shared';
import { find, isEqual, reduce } from 'lodash-es';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import {
  COS,
  MOBILE_CALENDAR_FEATURE_SYNC,
  MOBILE_CONTACT_FEATURE_SYNC,
  ZIMBRA_ADMIN_URN,
} from '../../constants';
import { cosQueryKeys } from '../../services/cos-query-keys';
import { flushCache } from '../../services/flush-cache-service';
import { getCoreAttributes } from '../../services/get-core-attributes';
import { modifyCos, ModifyCosBody } from '../../services/modify-cos-service';
import { setCoreAttributes } from '../../services/set-core-attributes';
import { useCosDetail } from '../../services/use-cos-detail';
import { PageLayout } from '../page-layout';
import { Features } from './features';

const CosFeatures: FC = () => {
  const [t] = useTranslation();
  const { cosId } = useParams();
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const createSnackbar = useSnackbar();
  const { data: cosDetailData } = useCosDetail(cosId);
  const cosInformation = cosDetailData?.cos?.[0]?.a;
  const cosName = cosDetailData?.cos?.[0]?.name;
  const [initCosData, setInitCosData] = useState<Partial<Record<string, string>>>({});
  const [zimbraId, setZimbraId] = useState<string>('');
  const [cosFeatures, setCosFeatures] = useState<Partial<Record<string, string>>>({});
  const isAdvanced = useIsAdvanced();
  const queryClient = useQueryClient();
  const { data: rights = [] } = useCurrentUserRights();

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

  const getMobileFeatureSync = () => {
    const body = [
      {
        configType: COS,
        configName: [cosName],
        attrName: ['mobileContactFeatureSync', 'mobileCalendarFeatureSync'],
      },
    ];
    getCoreAttributes(body)
      .then((data) => {
        if (data?.attributes) {
          setSwitchOptionValue(
            'mobileContactFeatureSync',
            data?.attributes?.mobileContactFeatureSync[0]?.value === 'enabled' ? 'TRUE' : 'FALSE',
          );
          setSwitchOptionValue(
            'mobileCalendarFeatureSync',
            data?.attributes?.mobileCalendarFeatureSync[0]?.value === 'enabled' ? 'TRUE' : 'FALSE',
          );
        }
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
    if (zimbraId && !isEqual(cosFeatures, initCosData)) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [cosFeatures, initCosData, zimbraId]);

  useEffect(() => {
    if (isAdvanced && cosName) {
      getMobileFeatureSync();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cosName, isAdvanced]);

  const modifyCosRequest = (body: ModifyCosBody): void => {
    modifyCos(body)
      .then(() => {
        flushCache('cos', 'id', body.id._content);
        if (cosId) {
          queryClient.invalidateQueries({ queryKey: cosQueryKeys.detail(cosId) });
        }
        createSnackbar({
          key: 'success',
          severity: 'success',
          label: t('label.change_save_success_msg', 'The change has been saved successfully'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
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

  const modifyCoreAttributes = (body: Record<string, unknown>): void => {
    setCoreAttributes(body)
      .then(() => {
        setSwitchOptionValue('mobileContactFeatureSync', cosFeatures?.mobileContactFeatureSync ?? '');
        setSwitchOptionValue('mobileCalendarFeatureSync', cosFeatures?.mobileCalendarFeatureSync ?? '');
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

    const modifiedKeys = reduce<Partial<Record<string, string>>, Array<string>>(
      cosFeatures,
      (result, value, key) => (isEqual(value, initCosData[key]) ? result : [...result, key]),
      [],
    );
    if (
      (modifiedKeys.includes(MOBILE_CALENDAR_FEATURE_SYNC) ||
        modifiedKeys.includes(MOBILE_CONTACT_FEATURE_SYNC)) &&
      isAdvanced
    ) {
      const coreAttrBody: Record<string, unknown> = {
        mobileCalendarFeatureSync: {
          value: cosFeatures.mobileCalendarFeatureSync === 'TRUE' ? 'enabled' : 'disabled',
          objectName: cosName,
          configType: COS,
        },
        mobileContactFeatureSync: {
          value: cosFeatures.mobileContactFeatureSync === 'TRUE' ? 'enabled' : 'disabled',
          objectName: cosName,
          configType: COS,
        },
      };
      modifyCoreAttributes(coreAttrBody);
    }
    modifyCosRequest(body);
  };

  const onCancel = (): void => {
    setCosFeatures(initCosData);
    setIsDirty(false);
  };

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
