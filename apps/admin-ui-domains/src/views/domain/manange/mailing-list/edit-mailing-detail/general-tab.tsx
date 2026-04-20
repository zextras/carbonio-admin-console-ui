/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Container,
  CustomTextArea,
  Input,
  LabeledValue,
  ListRow,
  Row,
  Select,
  Switch,
} from '@zextras/ui-components';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';

import ManageAliases from '../../../../components/manageAliases';

type GeneralTabProps = {
  displayName: string;
  setDisplayName: (v: string) => void;
  distributionName: string;
  setDistributionName: (v: string) => void;
  zimbraHideInGal: boolean;
  setZimbraHideInGal: (v: boolean) => void;
  zimbraNotes: string;
  setZimbraNotes: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  zimbraDistributionListSendShareMessageToNewMembers: boolean;
  setZimbraDistributionListSendShareMessageToNewMembers: (v: boolean) => void;
  zimbraMailStatus: any;
  onRightsChange: (v: any) => void;
  rightsOptions: Array<any>;
  zimbraMailAlias: Array<any>;
  setZimbraMailAlias: (v: Array<any>) => void;
  dlCreateDate: string;
  dlId: string;
  dlmCount: number;
  selectedMailingList: any;
  dlMembershipListNames: string;
  setIsDirty: (v: boolean) => void;
};

export const GeneralTab: FC<GeneralTabProps> = ({
  displayName,
  setDisplayName,
  distributionName,
  setDistributionName,
  zimbraHideInGal,
  setZimbraHideInGal,
  zimbraNotes,
  setZimbraNotes,
  description,
  setDescription,
  zimbraDistributionListSendShareMessageToNewMembers,
  setZimbraDistributionListSendShareMessageToNewMembers,
  zimbraMailStatus,
  onRightsChange,
  rightsOptions,
  zimbraMailAlias,
  setZimbraMailAlias,
  dlCreateDate,
  dlId,
  dlmCount,
  selectedMailingList,
  dlMembershipListNames,
  setIsDirty,
}) => {
  const [t] = useTranslation();

  return (
    <Container
      padding={{ left: 'large', right: 'large', bottom: 'large' }}
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      height="calc(100vh - 3.6rem)"
      background="white"
      width={'58.75rem'}
      style={{ overflow: 'auto' }}
    >
      <Row padding={{ top: 'medium', bottom: 'medium' }}>
        <ds-text as="h3" size="medium" weight="bold" color="gray0">
          {t('domain.list_details', 'List Details')}
        </ds-text>
      </Row>

      <ListRow padding={{ right: 'small', bottom: 'small' }}>
        <Container padding={{ top: 'small' }}>
          <Input
            isRequired
            label={t('label.display_name', 'Display Name')}
            value={displayName}
            backgroundColor="gray5"
            onChange={(e: any): any => {
              setDisplayName(e.target.value);
            }}
          />
        </Container>
        <Container padding={{ left: 'large', top: 'small' }}>
          <Input
            isRequired
            label={t('label.address', 'Address')}
            value={distributionName}
            backgroundColor="gray5"
            onChange={(e: any): any => {
              setDistributionName(e.target.value);
            }}
          />
        </Container>
      </ListRow>
      <ListRow>
        <Container padding={{ right: 'small', top: 'small' }}>
          <Select
            items={rightsOptions}
            background="gray5"
            label={t('label.status', 'Status')}
            showCheckbox={false}
            onChange={onRightsChange}
            selection={zimbraMailStatus}
          />
        </Container>
      </ListRow>
      <Container
        height="fit"
        padding={{ left: 'small', top: 'large', right: 'small', bottom: 'small' }}
      >
        <ManageAliases
          listAliases={zimbraMailAlias}
          setListAliases={setZimbraMailAlias}
          setAliasChange={(): void => ((): any => true)()}
        />
      </Container>
      {!selectedMailingList?.dynamic && (
        <ListRow padding={{ all: 'small' }}>
          <Container
            padding={{ top: 'small' }}
            mainAlignment="flex-start"
            crossAlignment="flex-start"
          >
            <Switch
              value={zimbraDistributionListSendShareMessageToNewMembers}
              label={t(
                'label.send_new_members_notification_for_share_assigned_to_this_group',
                'Send to new members a notification for the share/delegation assigned to this group',
              )}
              onClick={(): void => {
                setIsDirty(true);
                setZimbraDistributionListSendShareMessageToNewMembers(
                  !zimbraDistributionListSendShareMessageToNewMembers,
                );
              }}
              iconColor="primary"
            />
          </Container>
        </ListRow>
      )}
      <ListRow padding={{ left: 'small', right: 'small', bottom: 'small' }}>
        <Container mainAlignment="flex-start" crossAlignment="flex-start">
          <Switch
            value={zimbraHideInGal}
            label={t('label.this_is_hidden_from_gal', 'This list is hidden from GAL')}
            onClick={(): void => {
              setIsDirty(true);
              setZimbraHideInGal(!zimbraHideInGal);
            }}
            iconColor="primary"
          />
        </Container>
      </ListRow>
      <ListRow padding={{ all: 'small' }}>
        <Container orientation="horizontal">
          <Container padding={{ right: 'large' }}>
            <LabeledValue
              label={t('label.members', 'Members')}
              value={dlmCount}
              backgroundColor="gray5"
              textColor={'black'}
            />
          </Container>
          <Container>
            <LabeledValue
              label={t('label.alias_in_the_list', 'Alias in the List')}
              value={zimbraMailAlias.length}
              backgroundColor="gray5"
              textColor={'black'}
            />
          </Container>
        </Container>
      </ListRow>

      <ListRow padding={{ all: 'small' }}>
        <Container padding={{ bottom: 'small' }} orientation="horizontal">
          <Container padding={{ right: 'large' }}>
            <LabeledValue
              label={t('label.id_lbl', 'ID')}
              value={dlId}
              backgroundColor="gray5"
              textColor={'black'}
            />
          </Container>
          <Container>
            <LabeledValue
              label={t('label.creation_date', 'Creation Date')}
              value={dlCreateDate}
              backgroundColor="gray5"
              textColor={'black'}
            />
          </Container>
        </Container>
      </ListRow>
      <Row padding={{ top: 'large' }}>
        <ds-text as="h3" size="medium" weight="bold" color="gray0">
          {t('label.description', 'Description')}
        </ds-text>
      </Row>
      <ListRow padding={{ all: 'small' }}>
        <Container padding={{ bottom: 'medium' }}>
          <Input
            value={description}
            label={t(
              'label.note_label',
              'Write something that will easily make you remember this element',
            )}
            backgroundColor="gray5"
            onChange={(e: any): any => {
              setDescription(e.target.value);
            }}
          />
        </Container>
      </ListRow>
      <Row padding={{ top: 'large' }}>
        <ds-text as="h3" size="medium" weight="bold" color="gray0">
          {t('label.notes', 'Notes')}
        </ds-text>
      </Row>
      <ListRow padding={{ all: 'small' }}>
        <Container padding={{ bottom: 'medium' }}>
          <CustomTextArea
            value={zimbraNotes}
            label={t('label.notes', 'Notes')}
            backgroundColor="gray5"
            onChange={(e: any): any => {
              setZimbraNotes(e.target.value);
            }}
          />
        </Container>
      </ListRow>

      {!selectedMailingList?.dynamic && (
        <>
          <Row padding={{ top: 'small' }}>
            <ds-text as="h3" size="medium" weight="bold" color="gray0">
              {t('label.this_list_included_in', 'This list is included in')}
            </ds-text>
          </Row>
          <ListRow padding={{ all: 'small' }}>
            <Container padding={{ bottom: 'small' }}>
              <LabeledValue
                label={t('label.distribution_lists', 'Distribution Lists')}
                value={dlMembershipListNames}
                backgroundColor="gray5"
                textColor={'black'}
              />
            </Container>
          </ListRow>
        </>
      )}
      <Row mainAlignment="flex-start" width="100%" padding={{ top: 'small', bottom: 'small' }}>
        <Container padding={{ bottom: 'small' }}>
          <ds-divider />
        </Container>
      </Row>
    </Container>
  );
};
