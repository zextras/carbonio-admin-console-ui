/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, HorizontalWizard, Section } from '@zextras/ui-components';
import { type FC, type ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type RestoreAccountRequestParams } from './restore-delete-account';
import RestoreAccountConfigSection from './restore-delete-account-config-section';
import { RestoreDeleteAccountContext } from './restore-delete-account-context';
import RestoreSelectAccountSection from './restore-delete-account-select-section';
import RestoreAccountStartSection from './restore-delete-account-start-section';

const WizardInSection: FC<any> = ({ wizard, wizardFooter, setToggleWizardSection }) => {
	const { t } = useTranslation();
	return (
		<Section
			title={t('label.restore_account', 'Restore Account')}
			padding={{ all: '0' }}
			footer={wizardFooter}
			divider
			showClose={false}
			onClose={(): void => {
				setToggleWizardSection(false);
			}}
		>
			{wizard}
		</Section>
	);
};

interface AccountDetailObj {
  name: string;
  id: string;
  createDate: string;
  status: string;
  copyAccount: string;
  dateTime: string | null;
  lastAvailableStatus: boolean;
  hsmApply: boolean;
  dataSource: boolean;
  isEmailNotificationEnable: boolean;
  notificationReceiver: string;
  copyDomain: string;
  serverName: string;
}

const RestoreDeleteAccountWizard: FC<{
  setShowRestoreAccountWizard: any;
  restoreAccountRequest: (params: RestoreAccountRequestParams) => void;
  onReset: () => void;
}> = ({ setShowRestoreAccountWizard, restoreAccountRequest, onReset }) => {
  const { t } = useTranslation();
  const [isStartClicked, setIsStartClicked] = useState<boolean>();
  const [restoreAccountDetail, setRestoreAccountDetail] = useState<AccountDetailObj>({
    name: '',
    id: '',
    createDate: '',
    status: '',
    copyAccount: '',
    dateTime: null,
    lastAvailableStatus: false,
    hsmApply: false,
    dataSource: false,
    isEmailNotificationEnable: false,
    notificationReceiver: '',
    copyDomain: '',
    serverName: '',
  });

  function startRestoreAccount(): void {
    if (isStartClicked !== undefined) {
      return;
    }
    setIsStartClicked(true);
    restoreAccountRequest({
      id: restoreAccountDetail.id,
      createDate: restoreAccountDetail.createDate,
      copyAccount: restoreAccountDetail.copyAccount,
      dateTime: restoreAccountDetail.dateTime,
      hsmApply: restoreAccountDetail.hsmApply,
      notificationReceiver: restoreAccountDetail.notificationReceiver,
      isEmailNotificationEnable: restoreAccountDetail.isEmailNotificationEnable,
      copyDomain: restoreAccountDetail.copyDomain,
      serverName: restoreAccountDetail.serverName,
    });
  }

  const wizardSteps = [
    {
      name: 'details',
      label: t('label.select_an_account', 'Select An Account'),
      icon: 'AtOutline',
      view: RestoreSelectAccountSection,
      canGoNext: (): any => restoreAccountDetail?.id !== '',
      CancelButton: (props: any): ReactElement => (
        <Button
          {...props}
          type="outlined"
          key="wizard-cancel"
          label={t('label.cancel', 'Cancel')}
          color="secondary"
          icon="CloseOutline"
          iconPlacement="right"
          onClick={onReset}
        />
      ),
      PrevButton: () => <></>,
      NextButton: (props: any) => (
        <Button
          {...props}
          label={t('label.next', 'NEXT')}
          icon="ChevronRightOutline"
          iconPlacement="right"
        />
      ),
    },
    {
      name: 'members',
      label: t('label.config', 'Config'),
      icon: 'OptionsOutline',
      view: RestoreAccountConfigSection,
      canGoNext: (): any => restoreAccountDetail?.copyAccount && restoreAccountDetail?.copyDomain,
      CancelButton: (props: any): ReactElement => (
        <Button
          {...props}
          type="outlined"
          key="wizard-cancel"
          label={t('label.cancel', 'Cancel')}
          color="secondary"
          icon="CloseOutline"
          iconPlacement="right"
          onClick={onReset}
        />
      ),
      PrevButton: (props: any) => (
        <Button
          {...props}
          label={t('label.back', 'BACK')}
          icon="ChevronLeftOutline"
          color="secondary"
          iconPlacement="left"
        />
      ),
      NextButton: (props: any) => (
        <Button
          {...props}
          label={t('label.next', 'NEXT')}
          icon="ChevronRightOutline"
          iconPlacement="right"
        />
      ),
    },
    {
      name: 'create',
      label: t('label.start', 'start'),
      icon: 'PowerOutline',
      view: RestoreAccountStartSection,
      CancelButton: (props: any): ReactElement => (
        <Button
          {...props}
          type="outlined"
          key="wizard-cancel"
          label={t('label.cancel', 'Cancel')}
          color="secondary"
          icon="CloseOutline"
          iconPlacement="right"
          onClick={onReset}
        />
      ),
      PrevButton: (props: any) => (
        <Button
          {...props}
          label={t('label.back', 'BACK')}
          icon="ChevronLeftOutline"
          color="secondary"
          iconPlacement="left"
        />
      ),
      NextButton: (props: any) => (
        <Button
          {...props}
          label={t('label.restore_account', 'Restore Account')}
          icon="PowerOutline"
          iconPlacement="right"
          onClick={startRestoreAccount}
          disabled={restoreAccountDetail?.name === '' || restoreAccountDetail?.copyAccount === ''}
        />
      ),
    },
  ];

  return (
    <Container background="gray5" mainAlignment="flex-start">
      <RestoreDeleteAccountContext.Provider
        value={{ restoreAccountDetail, setRestoreAccountDetail }}
      >
        <HorizontalWizard
          steps={wizardSteps}
          Wrapper={WizardInSection}
          setToggleWizardSection={setShowRestoreAccountWizard}
        />
      </RestoreDeleteAccountContext.Provider>
    </Container>
  );
};

export default RestoreDeleteAccountWizard;
