/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSnackbar } from '@zextras/ui-components';
import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import {
  ADVANCED,
  FEATURES,
  GENERAL_INFORMATION,
  PREFERENCES,
  SERVER_POOLS,
  WSC,
} from '../../constants';
import { getCosGeneralInformation } from '../../services/cos-general-information-service';
import { searchDirectory } from '../../services/search-directory-service';
import { useCosStore } from '../../store/cos/store';
import WscCosSettings from '../../wsc/wsc-cos-settings';
import CosAdvanced from './cos-advanced';
import CosFeatures from './cos-features';
import CosGeneralInformation from './cos-general-information';
import CosServerPools from './cos-server-pools';
import { COSPreferences } from './preferences/COSPreferences';

const CosDetailOperation: FC = () => {
  const { operation, cosId } = useParams();
  const createSnackbar = useSnackbar();
  const [t] = useTranslation();
  const setCos = useCosStore((state) => state.setCos);
  const setTotalAccount = useCosStore((state) => state.setTotalAccount);
  const setTotalDomain = useCosStore((state) => state.setTotalDomain);

  const getTotalDomain = (id: string): void => {
    const query = `(zimbraDomainDefaultCOSId=${id})`;
    searchDirectory('', 'domains', '', query, 0, -1).then((data) => {
      const totalDomain = data?.searchTotal || 0;
      setTotalDomain(totalDomain);
    });
  };

  const getTotalAccount = (id: string): void => {
    const query = `(&(zimbraCOSId=${id})(!(zimbraIsSystemAccount=TRUE)))`;
    searchDirectory('', 'accounts', '', query, 0, -1).then((data) => {
      const totalAccount = data?.searchTotal || 0;
      setTotalAccount(totalAccount);
    });
  };

  const getSelectedCosInformation = (id: string): void => {
    getCosGeneralInformation(id)
      .then((data) => {
        const cos = data?.cos[0];
        if (cos) {
          setCos(cos);
          if (cos.id) {
            getTotalAccount(cos.id);
            getTotalDomain(cos.id);
          }
        }
      })
      .catch((error) => {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: error.message
            ? error.message
            : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      });
  };

  useEffect(() => {
    if (cosId) {
      getSelectedCosInformation(cosId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cosId]);

  return (
    <>
      {((): React.ReactElement | null => {
        switch (operation) {
          case GENERAL_INFORMATION:
            return <CosGeneralInformation />;
          case FEATURES:
            return <CosFeatures />;
          case WSC:
            return <WscCosSettings />;
          case PREFERENCES:
            return <COSPreferences />;
          case ADVANCED:
            return <CosAdvanced />;
          case SERVER_POOLS:
            return <CosServerPools />;
          default:
            return null;
        }
      })()}
    </>
  );
};

export default CosDetailOperation;
