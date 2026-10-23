/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button } from '@zextras/ui-components';
import { useCurrentUserRights, useUserSettings } from '@zextras/ui-shared';
import { find } from 'lodash-es';
import { useTranslation } from 'react-i18next';

import { ACCOUNT, ADMIN_LOGIN_AS, TRUE } from '../../../constants';
import { getDomainPublicServiceHostname } from '../../../services/get-domain-public-service-hostname';
import { useDelegateAuth } from '../../../services/use-delegate-auth';

type AccountHeaderActionsProps = {
  accountId: string;
  zimbraId: string | undefined;
  domainName: string | undefined;
  onDelete: () => void;
};

async function resolvePreauthHostname(domainName: string | undefined): Promise<string> {
  if (!domainName) return globalThis.location.hostname;
  try {
    return (await getDomainPublicServiceHostname(domainName)) ?? globalThis.location.hostname;
  } catch {
    return globalThis.location.hostname;
  }
}

function hasAdminLoginAsRight(
  rights: NonNullable<ReturnType<typeof useCurrentUserRights>['data']>,
): boolean {
  const rightsConfig = find(rights, { type: ACCOUNT }) ?? {
    all: [],
    inDomains: [],
    type: ACCOUNT,
  };
  return (
    !!rightsConfig?.all?.[0]?.right?.find((right) => right?.n === ADMIN_LOGIN_AS) ||
    !!rightsConfig?.inDomains?.[0]?.rights?.[0].right?.find(
      (right) => right?.n === ADMIN_LOGIN_AS,
    )
  );
}

export const AccountHeaderActions = ({
  accountId,
  zimbraId,
  domainName,
  onDelete,
}: AccountHeaderActionsProps) => {
  const { t } = useTranslation();
  const { data: rights = [] } = useCurrentUserRights();
  const userSetting = useUserSettings();
  const viewMailMutation = useDelegateAuth();

  const allowSetPrivacy = hasAdminLoginAsRight(rights);
  const isGlobalAdmin = userSetting?.attrs?.zimbraIsAdminAccount === TRUE;
  // Non-global admins with the IM feature enabled can't open the mailbox of an account
  const blockedByIm = !isGlobalAdmin && userSetting?.attrs?.zimbraFeatureIMEnabled === TRUE;

  const onViewMail = (): void => {
    viewMailMutation.mutate(accountId, {
      onSuccess: (authToken) => {
        void resolvePreauthHostname(domainName).then((hostname) => {
          window.open(
            `https://${hostname}/service/preauth?authtoken=${authToken}&isredirect=1&adminPreAuth=1&redirectURL=/carbonio/`,
            'blank',
          );
        });
      },
    });
  };

  return (
    <>
      <div className="pr-md">
        <Button
          size="medium"
          type="outlined"
          color="error"
          onClick={onDelete}
          icon="Trash2Outline"
          disabled={!zimbraId || zimbraId !== accountId}
          label={t('label.delete', 'delete')}
        />
      </div>
      <div className="pr-md">
        <Button
          size="medium"
          type="outlined"
          color="primary"
          onClick={onViewMail}
          icon="MailModOutline"
          disabled={!allowSetPrivacy || blockedByIm || viewMailMutation.isPending}
          label={t('label.view_mail', 'VIEW MAIL')}
        />
      </div>
    </>
  );
};
