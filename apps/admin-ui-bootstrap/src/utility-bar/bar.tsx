/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, Dropdown, type IconName, Tooltip } from '@zextras/ui-components';
import {
  CARBONIO_CE_ADMIN_DOCUMENTATION_URL,
  logout,
  useIsAdvanced,
  useUserAccount,
  useUtilityBarStore,
  UtilityView,
} from '@zextras/ui-shared';
import clsx from 'clsx';
import { map, noop } from 'lodash-es';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './bar.module.css';
import { buildDocumentationUrl } from './build-documentation-url';
import { useDocumentationBaseUrl } from './use-documentation-base-url';
import { useDocumentationContext } from './use-documentation-context';
import { useServerVersion } from './use-server-version';
import { openLink, useUtilityViews } from './utils';

const UtilityBarItem = ({ view }: { view: UtilityView }) => {
  const { mode, setMode, current, setCurrent } = useUtilityBarStore();
  const onClick = (): void => {
    setMode(current !== view.id ? 'open' : mode !== 'open' ? 'open' : 'closed');
    setCurrent(view.id);
  };
  if (typeof view.button === 'string') {
    return (
      <Tooltip label={view.label} placement="bottom-end">
        <Button
          type="ghost"
          color={current === view.id ? 'primary' : 'text'}
          icon={view.button as IconName}
          onClick={onClick}
          size="large"
          aria-label={view.label}
        />
      </Tooltip>
    );
  }
  return <view.button mode={mode} setMode={setMode} />;
};

function clipTextAfterWords(text: string): string {
  const words = text?.split('');
  const clippedText = words?.slice(0, 32).join('');
  return clippedText + (words?.length > 32 ? '...' : '');
}

export const ShellUtilityBar = () => {
  const views = useUtilityViews();
  const acct = useUserAccount();
  const accountName = acct?.name ? clipTextAfterWords(acct.name) : '';
  const isAdvanced = useIsAdvanced();
  const baseUrl = useDocumentationBaseUrl();
  const { serverVersion } = useServerVersion();
  const docContext = useDocumentationContext();
  const [t] = useTranslation();
  const [isHelpHovered, setIsHelpHovered] = useState(false);
  const [isAccountHovered, setIsAccountHovered] = useState(false);

  const helpDocumentationUrl = useMemo(() => {
    if (!isAdvanced) {
      return CARBONIO_CE_ADMIN_DOCUMENTATION_URL;
    }

    return buildDocumentationUrl(baseUrl, {
      v: serverVersion || undefined,
      m: docContext.module,
      c: docContext.context,
    });
  }, [isAdvanced, baseUrl, serverVersion, docContext]);
  const moduleLabel = t(docContext.moduleLabelKey, docContext.moduleLabelFallback);
  const helpTooltipLabel = t('label.documentation_for_module', 'Documentation: {{module}}', {
    module: moduleLabel,
  });
  const accountItems = [
    {
      id: 'logout',
      label: t('label.logout', 'Logout'),
      onClick: (): void => {
        logout();
      },
      icon: 'LogOut' as IconName,
    },
  ];

  return (
    <Container orientation="horizontal" width="fit">
      {map(views, (view) => (
        <UtilityBarItem view={view} key={view.id} />
      ))}
      <Container orientation="horizontal" width="fit" gap="0.25rem">
        <Tooltip label={helpTooltipLabel} placement="bottom-end">
          <button
            type="button"
            className={clsx(styles.trigger, styles.helpTrigger)}
            onClick={() => {
              console.log(helpDocumentationUrl);
              openLink(helpDocumentationUrl);
            }}
            onMouseEnter={() => setIsHelpHovered(true)}
            onMouseLeave={() => setIsHelpHovered(false)}
            aria-label={helpTooltipLabel}
          >
            <ds-icon
              icon="QuestionMarkCircleOutline"
              color={isHelpHovered ? 'primary' : 'gray1'}
              size="large"
            />
          </button>
        </Tooltip>
        <Tooltip label={t('label.account_menu', 'Account menu')} placement="right-end">
          <Dropdown items={accountItems}>
            <button
              type="button"
              className={clsx(styles.trigger, styles.accountTrigger)}
              onClick={noop}
              onMouseEnter={() => setIsAccountHovered(true)}
              onMouseLeave={() => setIsAccountHovered(false)}
              aria-label={t('label.account_menu', 'Account menu')}
            >
              <ds-text
                as="span"
                color={isAccountHovered ? 'primary' : 'gray1'}
                style={{ whiteSpace: 'pre-line', textAlign: 'left' }}
              >
                {accountName}
              </ds-text>
              <ds-icon
                icon="AvatarOutline"
                color={isAccountHovered ? 'primary' : 'gray1'}
                size="large"
              />
            </button>
          </Dropdown>
        </Tooltip>
      </Container>
    </Container>
  );
};
