/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, HorizontalWizard, WizardInSection } from '@zextras/ui-components';
import { useDomainStore } from '@zextras/ui-shared';
import { noop } from 'lodash-es';
import { type FC, type ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LDAP, PUB } from '../../../../constants';
import MailingListMembersSection from './mailing-list-members-section';
import MailingListSection from './mailing-list-section';
import MailingListSettingsSection from './mailing-list-settings-sections';
import { MailingListContext, MailingListDetail } from './mailinglist-context';
import MailingListCreateSection from './mailinglist-create-section';

type MailingListDetailObj = MailingListDetail;

const CreateMailingList: FC<{
  setShowCreateMailingListView: any;
  createMailingListReq: any;
  isLoading: boolean;
}> = ({ setShowCreateMailingListView, createMailingListReq, isLoading }) => {
  const { t } = useTranslation();
  const domainInformation = useDomainStore((state) => state.domain);

  const [mailingListDetail, setMailingListDetail] = useState<MailingListDetailObj>({
    name: '',
    description: '',
    dynamic: false,
    displayName: '',
    zimbraHideInGal: false,
    zimbraIsACLGroup: '',
    zimbraMailStatus: true,
    zimbraNotes: '',
    memberURL: LDAP,
    members: [],
    zimbraDistributionListSendShareMessageToNewMembers: false,
    owners: [],
    prefixName: '',
    suffixName: '',
    ldapQueryMembers: [],
    allOwnersList: [],
    ownerGrantEmailType: {
      label: t('label.everyone', 'Everyone'),
      value: PUB,
    },
    ownerGrantEmails: [],
  });

  const onCreate = useCallback(() => {
    createMailingListReq(
      `${mailingListDetail?.prefixName}@${mailingListDetail?.suffixName}`,
      mailingListDetail?.description,
      mailingListDetail?.dynamic,
      mailingListDetail?.displayName,
      mailingListDetail?.zimbraHideInGal,
      mailingListDetail?.zimbraMailStatus,
      mailingListDetail?.zimbraNotes,
      mailingListDetail?.memberURL,
      mailingListDetail?.members,
      mailingListDetail?.zimbraDistributionListSendShareMessageToNewMembers,
      mailingListDetail?.owners,
      mailingListDetail?.allOwnersList,
      mailingListDetail?.ownerGrantEmailType,
      mailingListDetail?.ownerGrantEmails,
    );
  }, [createMailingListReq, mailingListDetail]);

  const standardMailingListSizardSteps = useMemo(
    () => [
      {
        name: 'details',
        label: t('label.distribution_list', 'Distribution List'),
        icon: 'ListOutline',
        view: MailingListSection,
        CancelButton: (props: any): ReactElement => (
          <Button
            {...props}
            type="outlined"
            key="wizard-cancel"
            label={t('label.cancel', 'Cancel')}
            color="secondary"
            icon="CloseOutline"
            iconPlacement="right"
            onClick={(): void => {
              setShowCreateMailingListView(false);
            }}
          />
        ),
        PrevButton: () => null,
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
        label: t('label.members', 'Members'),
        icon: 'PeopleOutline',
        view: MailingListMembersSection,
        CancelButton: (props: any): ReactElement => (
          <Button
            {...props}
            type="outlined"
            key="wizard-cancel"
            label={t('label.cancel', 'Cancel')}
            color="secondary"
            icon="CloseOutline"
            iconPlacement="right"
            onClick={(): void => {
              setShowCreateMailingListView(false);
            }}
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
        name: 'settings',
        label: t('label.settings', 'Settings'),
        icon: 'OptionsOutline',
        view: MailingListSettingsSection,
        CancelButton: (props: any): ReactElement => (
          <Button
            {...props}
            type="outlined"
            key="wizard-cancel"
            label={t('label.cancel', 'Cancel')}
            color="secondary"
            icon="CloseOutline"
            iconPlacement="right"
            onClick={(): void => {
              setShowCreateMailingListView(false);
            }}
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
        label: t('label.create', 'Create'),
        icon: 'PowerOutline',
        view: MailingListCreateSection,
        CancelButton: (props: any): ReactElement => (
          <Button
            {...props}
            type="outlined"
            key="wizard-cancel"
            label={t('label.cancel', 'Cancel')}
            color="secondary"
            icon="CloseOutline"
            iconPlacement="right"
            onClick={(): void => {
              setShowCreateMailingListView(false);
            }}
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
            label={t('label.create', 'CREATE')}
            icon="PowerOutline"
            iconPlacement="right"
            disabled={!mailingListDetail?.prefixName || !mailingListDetail?.suffixName}
            onClick={onCreate}
          />
        ),
      },
    ],
    [
      t,
      setShowCreateMailingListView,
      mailingListDetail?.prefixName,
      mailingListDetail?.suffixName,
      onCreate,
    ],
  );

  const dynamicMailingListSizardSteps = useMemo(
    () => [
      {
        name: 'details',
        label: t('label.distribution_list', 'Distribution List'),
        icon: 'ListOutline',
        view: MailingListSection,
        CancelButton: (props: any): ReactElement => (
          <Button
            {...props}
            type="outlined"
            key="wizard-cancel"
            label={'CANCEL'}
            color="secondary"
            icon="CloseOutline"
            iconPlacement="right"
            onClick={(): void => {
              setShowCreateMailingListView(false);
            }}
          />
        ),
        PrevButton: () => null,
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
        name: 'settings',
        label: t('label.settings', 'Settings'),
        icon: 'OptionsOutline',
        view: MailingListSettingsSection,
        CancelButton: (props: any): ReactElement => (
          <Button
            {...props}
            type="outlined"
            key="wizard-cancel"
            label={t('label.cancel', 'Cancel')}
            color="secondary"
            icon="CloseOutline"
            iconPlacement="right"
            onClick={(): void => {
              setShowCreateMailingListView(false);
            }}
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
        label: t('label.create', 'Create'),
        icon: 'PowerOutline',
        view: MailingListCreateSection,
        CancelButton: (props: any): ReactElement => (
          <Button
            {...props}
            type="outlined"
            key="wizard-cancel"
            label={'CANCEL'}
            color="secondary"
            icon="CloseOutline"
            iconPlacement="right"
            onClick={(): void => {
              setShowCreateMailingListView(false);
            }}
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
            label={t('label.create', 'CREATE')}
            icon="PowerOutline"
            iconPlacement="right"
            disabled={!mailingListDetail?.prefixName || !mailingListDetail?.suffixName}
            onClick={onCreate}
          />
        ),
      },
    ],
    [
      t,
      setShowCreateMailingListView,
      mailingListDetail?.prefixName,
      mailingListDetail?.suffixName,
      onCreate,
    ],
  );

  const onComplete = useCallback(() => {
    setShowCreateMailingListView(false);
  }, [setShowCreateMailingListView]);

  useEffect(() => {
    if (domainInformation?.name) {
      setMailingListDetail((prev: any) => ({ ...prev, suffixName: domainInformation?.name }));
    }
  }, [domainInformation?.name]);

  return (
    <>
      {isLoading && <ds-spinner></ds-spinner>}
      <Container
        background="gray5"
        mainAlignment="flex-start"
        style={{
          position: 'absolute',
          top: '0rem',
          right: '0rem',
          bottom: '0rem',
          transition: 'left 0.2s ease-in-out',
          maxHeight: '100%',
          overflow: 'hidden',
        }}
      >
        <MailingListContext.Provider value={{ mailingListDetail, setMailingListDetail }}>
          <HorizontalWizard
            steps={
              mailingListDetail?.dynamic
                ? dynamicMailingListSizardSteps
                : standardMailingListSizardSteps
            }
            title={t('label.new_distribution_list', 'New Distribution List')}
            Wrapper={WizardInSection}
            onChange={noop}
            onComplete={onComplete}
            setToggleWizardSection={setShowCreateMailingListView}
          />
        </MailingListContext.Provider>
      </Container>
    </>
  );
};

export default CreateMailingList;
