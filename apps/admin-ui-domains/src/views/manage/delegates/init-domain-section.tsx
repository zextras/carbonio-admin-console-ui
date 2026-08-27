/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, useSnackbar } from '@zextras/ui-components';
import { useUserSettings } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import { Attribute } from '../../../../types';
import { parseCosMaxAccounts } from '../../../services/grant-cos-rights';
import { useGrantAllCosRights } from '../../../services/use-grant-cos-rights';
import { useInitializedDomains } from '../../../services/use-initialized-domains';
import { useInitDomainForDelegation } from '../../../services/use-init-domain-for-delegation';
import { generateSnackbarFromError } from '../../error/generate-snackbar-error';
import styles from './delegates.module.css';

type InitDomainSectionProps = {
  domainName: string | undefined;
  domainAttrs: Array<Attribute> | undefined;
};

/**
 * INIT / RE-INIT DOMAIN control, rendered for global administrators only.
 * Initializing delegates the domain and then grants the COS delegation rights
 * to the domain helpdesk admins group; the initialized-domains query
 * invalidation flips the button to RE-INIT automatically.
 */
export const InitDomainSection = ({ domainName, domainAttrs }: InitDomainSectionProps) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const userSetting = useUserSettings();
  const initMutation = useInitDomainForDelegation();
  const grantMutation = useGrantAllCosRights();

  const isGlobalAdmin = userSetting?.attrs?.zimbraIsAdminAccount === 'TRUE';
  const { data } = useInitializedDomains(
    domainName ?? '',
    isGlobalAdmin && domainName !== undefined,
  );
  const isInitDomain = (data?.domain ?? []).some((entry) => entry.name === domainName);

  if (!isGlobalAdmin) {
    return null;
  }

  const handleInitDomain = (): void => {
    if (domainName === undefined) {
      return;
    }
    initMutation.mutate(
      { domain: domainName },
      {
        onSuccess: () => {
          const cosIds = parseCosMaxAccounts(domainAttrs).map((entry) => entry.id);
          if (cosIds.length === 0) {
            return;
          }
          grantMutation.mutate(
            { domainName, cosIds },
            {
              onError: (error: Error) => {
                createSnackbar(generateSnackbarFromError(error, t));
              },
            },
          );
        },
      },
    );
  };

  return (
    <>
      <div className={styles.initDomainRow}>
        <Button
          label={
            isInitDomain
              ? t('label.re_init_domain', 'RE-INIT DOMAIN')
              : t('label.init_domain', 'INIT DOMAIN')
          }
          color="primary"
          onClick={handleInitDomain}
          loading={initMutation.isPending || grantMutation.isPending}
        />
      </div>
      <div className={styles.dividerRow}>
        <ds-divider></ds-divider>
      </div>
    </>
  );
};
