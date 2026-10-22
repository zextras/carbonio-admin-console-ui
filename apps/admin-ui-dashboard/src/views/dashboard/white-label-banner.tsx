/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button } from '@zextras/ui-components';
import {
  buildPath,
  isSameOriginUrlOutsideProxyAllowlist,
  useLoginConfigStore,
} from '@zextras/ui-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { GLOBAL_WHITELABEL_SETTINGS } from '../../constants';

const WHITELABEL_BRANDING_URL_KEYS = [
  'carbonioAdminUiAppLogo',
  'carbonioAdminUiDarkAppLogo',
  'carbonioAdminUiFavicon',
  'carbonioAdminUiLoginLogo',
  'carbonioAdminUiDarkLoginLogo',
  'carbonioAdminUiBackground',
  'carbonioAdminUiDarkBackground',
] as const;

/** Returns the configured branding URLs the proxy embedded-resource guard would block. */
function getBlockedWhiteLabelUrls(
  store: ReturnType<typeof useLoginConfigStore.getState>,
): Array<string> {
  return WHITELABEL_BRANDING_URL_KEYS
    .map((key) => store[key])
    .filter((url): url is string => url !== undefined)
    .filter((url) => isSameOriginUrlOutsideProxyAllowlist(url));
}

export const WhiteLabelBanner = () => {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const loginConfig = useLoginConfigStore();
  const [dismissed, setDismissed] = useState(false);

  const blockedUrls = getBlockedWhiteLabelUrls(loginConfig);
  if (dismissed || blockedUrls.length === 0) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-xs rounded-md bg-warning-banner p-sm">
      <div className="flex flex-row items-start gap-sm">
        <ds-icon icon="AlertTriangleOutline" color="gray6" size="large" />
        <div className="flex flex-1 flex-col gap-xs">
          <ds-text as="p" color="gray6" overflow="break-word" style={{ whiteSpace: 'pre-line' }}>
            {t(
              'banner.whitelabel_blocked_urls_description',
              'Some white-label branding URLs point to this server outside the allowed asset paths and will not load: the proxy blocks them with a 403.',
            )}
          </ds-text>
          <ds-text as="p" color="gray6" overflow="break-word" style={{ whiteSpace: 'pre-line' }}>
            {t(
              'banner.whitelabel_blocked_urls_detail',
              'Host logos, favicons and login backgrounds on an external origin, or under /static/ on this server.',
            )}
          </ds-text>
        </div>
        <Button
          type="ghost"
          aria-label={t('button.close', 'Close')}
          icon="CloseOutline"
          color="gray6"
          onClick={(): void => {
            setDismissed(true);
          }}
        />
      </div>
      <div className="flex flex-row justify-end">
        <Button
          type="outlined"
          backgroundColor="transparent"
          color="gray6"
          label={t('button.go_to_whitelabel_settings', 'Go to Whitelabel Settings')}
          onClick={(): void => {
            navigate(buildPath(GLOBAL_WHITELABEL_SETTINGS));
          }}
        />
      </div>
    </div>
  );
};
