/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, Dropdown, type IconName, Tooltip } from '@zextras/ui-components';
import {
  CARBONIO_ADMIN_DOCUMENTATION_URL_ATTRIBUTE,
  CARBONIO_CE_ADMIN_DOCUMENTATION_URL,
  logout,
  useConfigAttribute,
  useIsAdvanced,
  useUserAccount,
  useUtilityBarStore,
  UtilityView,
} from '@zextras/ui-shared';
import { map, noop } from 'lodash-es';
import { useTranslation } from 'react-i18next';

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
  const { data: helpDocumentationUrlAttribute } = useConfigAttribute(
    CARBONIO_ADMIN_DOCUMENTATION_URL_ATTRIBUTE,
  );
  const helpDocumentationUrl = isAdvanced
    ? helpDocumentationUrlAttribute || CARBONIO_CE_ADMIN_DOCUMENTATION_URL
    : CARBONIO_CE_ADMIN_DOCUMENTATION_URL;
  const [t] = useTranslation();
  const accountItems = [
    {
      id: 'help',
      label: t('label.help_and_documentation', 'Help & Documentation'),
      onClick: () => openLink(helpDocumentationUrl),
      icon: 'QuestionMarkOutline' as IconName,
    },
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
      <Container margin={{ right: 'small' }}>
        <ds-text as="span" color="primary" style={{ whiteSpace: 'pre-line', textAlign: 'left' }}>
          {accountName}
        </ds-text>
      </Container>
      <Tooltip label={t('label.account_menu', 'Account menu')} placement="left-end">
        <Dropdown items={accountItems}>
          <Button
            type="ghost"
            icon="AvatarOutline"
            size={'extralarge'}
            color="primary"
            onClick={noop}
            aria-label={t('label.account_menu', 'Account menu')}
          />
        </Dropdown>
      </Tooltip>
    </Container>
  );
};
