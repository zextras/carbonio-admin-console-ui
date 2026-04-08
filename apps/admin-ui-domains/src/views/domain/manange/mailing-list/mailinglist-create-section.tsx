/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Container,
  CustomHeaderFactory,
  CustomTextArea,
  HoverableRowFactory,
  LabeledValue,
  ListRow,
  Row,
  Table,
  Text,
} from '@zextras/ui-components';
import { FC, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ALL, EMAIL, GRP, PUB } from '../../../../constants';
import { MailingListContext } from './mailinglist-context';

const MailingListCreateSection: FC<any> = () => {
  const { t } = useTranslation();
  const context = useContext(MailingListContext);
  const { mailingListDetail } = context;
  const [ownerMember, setOwnerMember] = useState<Array<any>>([]);
  const [memberList, setMemberList] = useState<Array<any>>([]);
  const [grantEmailType, setGrantEmailType] = useState<string>('');
  const [grantEmailsList, setGrantEmailsList] = useState<Array<any>>([]);

  const tableHeader: any[] = useMemo(
    () => [
      {
        id: 'members',
        label: t('label.accounts', 'Accounts'),
        width: '100%',
        bold: true,
      },
    ],
    [t],
  );

  const ownerTableHeader: any[] = useMemo(
    () => [
      {
        id: 'members',
        label: t('label.accounts_that_are_owners', 'Accounts that are owners'),
        width: '100%',
        bold: true,
      },
    ],
    [t],
  );

  const grantEmailHeaders: any[] = useMemo(
    () => [
      {
        id: 'grantEmail',
        label: t('label.who_can_send_mails_to_list ', 'Who can send mails TO this list?'),
        width: '100%',
        bold: true,
      },
    ],
    [t],
  );

  useEffect(() => {
    const member = mailingListDetail?.members;
    if (member && member.length > 0) {
      const allRows = member.map((item: any) => ({
        id: item,
        columns: [
          <Text size="medium" weight="light" key={item} color="#828282">
            {item}
          </Text>,
        ],
      }));
      setMemberList(allRows);
    }
  }, [mailingListDetail?.members]);

  useEffect(() => {
    const ownersList = mailingListDetail?.owners;
    if (ownersList && ownersList.length > 0) {
      const allRows = ownersList.map((item: any) => ({
        id: item,
        columns: [
          <Text size="medium" weight="light" key={item?.id} color="#828282">
            {item}
          </Text>,
        ],
      }));
      setOwnerMember(allRows);
    }
  }, [mailingListDetail?.owners]);

  useEffect(() => {
    const grantList = mailingListDetail?.ownerGrantEmails;
    if (grantList && grantList.length > 0) {
      const allRows = grantList.map((item: any) => ({
        id: item,
        columns: [
          <Text size="medium" weight="light" key={item?.id} color="#828282">
            {item}
          </Text>,
        ],
      }));
      setGrantEmailsList(allRows);
    }
  }, [mailingListDetail?.owners]);

  useEffect(() => {
    if (mailingListDetail?.ownerGrantEmailType?.value === PUB) {
      setGrantEmailType(t('label.everyone', 'Everyone'));
    } else if (mailingListDetail?.ownerGrantEmailType?.value === GRP) {
      setGrantEmailType(t('label.members_only', 'Members only'));
    } else if (mailingListDetail?.ownerGrantEmailType?.value === ALL) {
      setGrantEmailType(t('label.internal_users_only', 'Internal Users only'));
    } else if (mailingListDetail?.ownerGrantEmailType?.value === EMAIL) {
      setGrantEmailType(t('label.only_there_users', 'Only these users'));
    }
  }, [mailingListDetail?.ownerGrantEmailType, t]);

  return (
    <Container mainAlignment="flex-start">
      <Container
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        height="calc(100vh - 300px)"
        background="white"
        style={{ overflow: 'auto', padding: '16px' }}
      >
        <ListRow>
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            orientation="horizontal"
            padding={{ top: 'large', right: 'small' }}
          >
            <LabeledValue
              label={t('label.display_name', 'Display Name')}
              backgroundColor="gray6"
              value={mailingListDetail?.displayName}
            />
          </Container>
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            orientation="horizontal"
            padding={{ top: 'large', right: 'small' }}
          >
            <LabeledValue
              label={t('label.address', 'Address')}
              backgroundColor="gray6"
              value={`${mailingListDetail?.prefixName}@${mailingListDetail?.suffixName}`}
            />
          </Container>
        </ListRow>

        <ListRow>
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            orientation="horizontal"
            padding={{ top: 'large', right: 'small' }}
          >
            <LabeledValue
              label={t('label.description', 'Description')}
              backgroundColor="gray6"
              value={mailingListDetail?.description}
            />
          </Container>
        </ListRow>

        <ListRow>
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            orientation="horizontal"
            padding={{ top: 'large', right: 'small' }}
          >
            <CustomTextArea
              label={t('label.notes', 'Notes')}
              backgroundColor="gray6"
              value={mailingListDetail?.zimbraNotes}
            />
          </Container>
        </ListRow>

        <Row padding={{ top: 'large' }}>
          <Text size="small" weight="bold">
            {t('label.main_settings', 'Main Settings')}
          </Text>
        </Row>
        <ListRow>
          {!mailingListDetail?.dynamic && (
            <Container
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              orientation="horizontal"
              padding={{ top: 'large', right: 'small' }}
            >
              <LabeledValue
                label={t('label.share_message_to_new_member', 'Share message to new members')}
                backgroundColor="gray6"
                value={
                  mailingListDetail?.zimbraDistributionListSendShareMessageToNewMembers
                    ? t('label.yes', 'Yes')
                    : t('label.no', 'No')
                }
              />
            </Container>
          )}
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            orientation="horizontal"
            padding={{ top: 'large', right: 'small' }}
          >
            <LabeledValue
              label={t('label.hidden_from_gal', 'Hidden from GAL')}
              backgroundColor="gray6"
              value={
                mailingListDetail?.zimbraHideInGal ? t('label.yes', 'Yes') : t('label.no', 'No')
              }
            />
          </Container>
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            orientation="horizontal"
            padding={{ top: 'large', right: 'small' }}
          >
            <LabeledValue
              label={t('label.can_receive_email', 'Can receive email')}
              backgroundColor="gray6"
              value={
                mailingListDetail?.zimbraMailStatus ? t('label.yes', 'Yes') : t('label.no', 'No')
              }
            />
          </Container>
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            orientation="horizontal"
            padding={{ top: 'large', right: 'small' }}
          >
            <LabeledValue
              label={t('label.dynamic_mode', 'Dynamic Mode')}
              backgroundColor="gray6"
              value={mailingListDetail?.dynamic ? t('label.yes', 'Yes') : t('label.no', 'No')}
            />
          </Container>
        </ListRow>

        {!mailingListDetail?.dynamic && (
          <Row>
            <Container
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              orientation="horizontal"
              padding={{ top: 'extralarge', bottom: 'medium' }}
            >
              <Text size="small" weight="bold">
                {t('label.members', 'Members')}
              </Text>
            </Container>
          </Row>
        )}
        {!mailingListDetail?.dynamic && (
          <ListRow>
            <Container padding={{ bottom: 'medium' }}>
              <Table
                rows={memberList}
                headers={tableHeader}
                showCheckbox={false}
                RowFactory={HoverableRowFactory}
                HeaderFactory={CustomHeaderFactory}
              />
            </Container>
          </ListRow>
        )}

        {mailingListDetail?.dynamic && (
          <>
            <ListRow>
              <Container
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                orientation="horizontal"
                padding={{ top: 'small', bottom: 'medium' }}
              >
                <LabeledValue
                  label={t('label.distribution_list_url', "Distribution List's URL")}
                  backgroundColor="gray6"
                  value={mailingListDetail?.memberURL}
                />
              </Container>
            </ListRow>
          </>
        )}

        <Row>
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            orientation="horizontal"
            padding={{ top: 'extralarge' }}
          >
            <Text size="small" weight="bold">
              {t('label.owners_settings', 'Owners’ Settings')}
            </Text>
          </Container>
        </Row>

        <ListRow>
          <Container padding={{ bottom: 'medium', top: 'medium' }}>
            <Table
              rows={ownerMember}
              headers={ownerTableHeader}
              showCheckbox={false}
              RowFactory={HoverableRowFactory}
              HeaderFactory={CustomHeaderFactory}
            />
          </Container>
        </ListRow>

        <Row padding={{ top: 'large' }}>
          <Text size="small" weight="bold" color="gray0">
            {t('label.sending_options', 'Sending Options')}
          </Text>
        </Row>
        <ListRow>
          <LabeledValue
            label={t('label.who_can_send_mails_to_this_list', 'Who can send mails TO this list?')}
            backgroundColor="gray6"
            value={grantEmailType}
          />
        </ListRow>
        {grantEmailsList && grantEmailsList.length > 0 && (
          <ListRow>
            <Container padding={{ bottom: 'medium', top: 'medium' }}>
              <Table
                rows={grantEmailsList}
                headers={grantEmailHeaders}
                showCheckbox={false}
                RowFactory={HoverableRowFactory}
                HeaderFactory={CustomHeaderFactory}
              />
            </Container>
          </ListRow>
        )}
      </Container>
    </Container>
  );
};

export default MailingListCreateSection;
