/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, useSnackbar } from '@zextras/ui-components';
import { useCurrentUserRights } from '@zextras/ui-shared';
import { find } from 'lodash-es';
import { useTranslation } from 'react-i18next';

import { ACCOUNT, ADMIN_LOGIN_AS } from '../../../../constants';
import { useDelegateAuth } from '../../../../services/use-delegate-auth';

type AccountHeaderActionsProps = {
  accountId: string;
  zimbraId: string | undefined;
  onDelete: () => void;
};

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

export const AccountHeaderActions = ({ accountId, zimbraId, onDelete }: AccountHeaderActionsProps) => {
  const { t } = useTranslation();
  const createSnackbar = useSnackbar();
  const { data: rights = [] } = useCurrentUserRights();
  const viewMailMutation = useDelegateAuth();

  const allowSetPrivacy = hasAdminLoginAsRight(rights);

  const showErrorMessage = (message?: string): void => {
    createSnackbar({
      key: 'error',
      severity: 'error',
      label: message ?? t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
      autoHideTimeout: 3000,
      hideButton: true,
      replace: true,
    });
  };

  const onViewMail = (): void => {
    viewMailMutation.mutate(accountId, {
      onSuccess: (authToken) => {
        if (authToken) {
          window.open(
            `https://${globalThis.location.hostname}/service/preauth?authtoken=${authToken}&isredirect=1&adminPreAuth=1&redirectURL=/carbonio/`,
            'blank',
          );
        } else {
          showErrorMessage();
        }
      },
      onError: (error) => {
        showErrorMessage(error?.message);
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
          disabled={!allowSetPrivacy || viewMailMutation.isPending}
          label={t('label.view_mail', 'VIEW MAIL')}
        />
      </div>
    </>
  );
};
