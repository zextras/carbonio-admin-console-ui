/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Button,
  Container,
  Input,
  ListRow,
  Modal,
  Padding,
  useSnackbar,
} from '@zextras/ui-components';
import { type DomainDirectories, replaceHistory } from '@zextras/ui-shared';
import { filter, isEqual } from 'lodash-es';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { ZIMBRA_ADMIN_URN } from '../../../../constants';
import { useBatchDeleteDomainContents } from '../../../../services/use-batch-delete-domain-contents';
import { useCollectDomainDirectories } from '../../../../services/use-collect-domain-directories';
import { useDeleteDomain } from '../../../../services/use-delete-domain';
import { useModifyDomain } from '../../../../services/use-modify-domain';
import { generateSnackbarFromError } from '../../../../utils/generate-snackbar-error';

type DomainDeleteSectionProps = {
  domainId: string;
  domainName: string;
  domainStatusValue: string;
  closedStatusValue: string;
};

export const DomainDeleteSection = ({
  domainId,
  domainName,
  domainStatusValue,
  closedStatusValue,
}: DomainDeleteSectionProps) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const deleteDomainMutation = useDeleteDomain(domainId);
  const modifyDomainMutation = useModifyDomain(domainId);
  const collectDirectoriesMutation = useCollectDomainDirectories();
  const batchDeleteContentsMutation = useBatchDeleteDomainContents();

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openDeleteDomainConfirmDialog, setOpenDeleteDomainConfirmDialog] = useState(false);
  const [confirmDomainName, setConfirmDomainName] = useState('');
  const [isRequestInProgress, setIsRequestInProgress] = useState(true);
  const [domainDirectories, setDomainDirectories] = useState<DomainDirectories>({
    account: [],
    dl: [],
    alias: [],
    calresource: [],
  });
  const isDomainClosed = domainStatusValue === closedStatusValue;

  function deleteOnlyDomain(): void {
    deleteDomainMutation.mutateAsync().then(() => {
      setIsRequestInProgress(false);
      setOpenDeleteDomainConfirmDialog(false);
      setDomainDirectories({ account: [], dl: [], alias: [], calresource: [] });
      replaceHistory(`/`);
    });
  }

  function onDeleteAccountAndDomain(): void {
    setIsRequestInProgress(true);
    batchDeleteContentsMutation
      .mutateAsync({
        accounts: domainDirectories.account,
        distributionLists: domainDirectories.dl,
        calendarResources: domainDirectories.calresource,
      })
      .then((res) => {
        if (res?.Fault) {
          res.Fault.forEach((item) =>
            createSnackbar({
              key: 'error',
              severity: 'error',
              label: item?.Reason?.Text ?? '',
              autoHideTimeout: 3000,
              hideButton: true,
              replace: true,
            }),
          );
          setIsRequestInProgress(false);
        } else {
          deleteOnlyDomain();
        }
      });
  }

  function onDeleteDomain(): void {
    setIsRequestInProgress(true);
    collectDirectoriesMutation
      .mutateAsync(domainName)
      .then((directories) => {
        const hasItems =
          directories.account.length ||
          directories.dl.length ||
          directories.alias.length ||
          directories.calresource.length;
        if (hasItems) {
          setDomainDirectories(directories);
          setOpenConfirmDialog(false);
          setOpenDeleteDomainConfirmDialog(true);
        } else {
          deleteOnlyDomain();
        }
      })
      .catch((error) => {
        const snackbarConfig = generateSnackbarFromError(error, t);
        createSnackbar(snackbarConfig);
      });
  }

  function onCloseDomain(): void {
    setConfirmDomainName('');
    setOpenDeleteDomainConfirmDialog(false);
    setIsRequestInProgress(true);
    modifyDomainMutation
      .mutateAsync({
        _jsns: ZIMBRA_ADMIN_URN,
        id: domainId,
        a: [{ n: 'zimbraDomainStatus', _content: closedStatusValue }],
      })
      .then(() => {
        setIsRequestInProgress(false);
      })
      .catch(() => {
        setIsRequestInProgress(false);
      });
  }

  return (
    <ListRow>
      <Container padding={{ all: 'small' }} width="100%" style={{ display: 'block' }}>
        <Button
          type="outlined"
          label={t('label.delete_domain', 'Delete Domain')}
          color="error"
          size="extralarge"
          width="fill"
          onClick={onDeleteDomain}
          style={{ width: '100%' }}
        />
        <Modal
          title={`${t('label.deleteing', 'Deleting')} ${domainName}`}
          open={openConfirmDialog}
          showCloseIcon
          onClose={() => {
            setConfirmDomainName('');
            setOpenConfirmDialog(false);
          }}
          customFooter={
            <Container orientation="horizontal" mainAlignment="space-between">
              <Container orientation="horizontal" mainAlignment="flex-start" width="10rem">
                <Button
                  label={t('label.need_help', 'NEED HELP?')}
                  type="outlined"
                  color="primary"
                  onClick={() => {
                    setConfirmDomainName('');
                    setOpenConfirmDialog(false);
                  }}
                  width="fill"
                />
              </Container>
              <Container orientation="horizontal" mainAlignment="flex-end">
                <Padding all="small">
                  <Button
                    label={t('label.cancel', 'CANCEL')}
                    color="secondary"
                    onClick={() => {
                      setConfirmDomainName('');
                      setOpenConfirmDialog(false);
                    }}
                  />
                </Padding>
                <Button
                  label={t('label.delete', 'DELETE')}
                  color="error"
                  onClick={onDeleteDomain}
                  disabled={isRequestInProgress}
                />
              </Container>
            </Container>
          }
        >
          <Padding all="medium">
            <ds-text as="p" overflow="break-word" weight="regular">
              {t('label.delete_domain_error_msg', {
                domainName,
                defaultValue:
                  'You are deleting {{domainName}}. Are you sure you want to delete {{domainName}}?',
              })}
            </ds-text>
          </Padding>
        </Modal>

        <Modal
          title={`${t('label.deleteing', 'Deleting')} ${domainName}`}
          open={openDeleteDomainConfirmDialog}
          showCloseIcon
          onClose={() => {
            setConfirmDomainName('');
            setOpenDeleteDomainConfirmDialog(false);
            setDomainDirectories({ account: [], dl: [], alias: [], calresource: [] });
          }}
          customFooter={
            <Container orientation="horizontal" mainAlignment="space-between">
              <Container orientation="horizontal" mainAlignment="flex-start" width="10rem">
                <Button
                  label={t('label.cancel', 'CANCEL')}
                  color="secondary"
                  onClick={() => {
                    setConfirmDomainName('');
                    setOpenDeleteDomainConfirmDialog(false);
                    setDomainDirectories({ account: [], dl: [], alias: [], calresource: [] });
                  }}
                />
              </Container>
              <Container orientation="horizontal" mainAlignment="flex-end">
                <Padding right="small">
                  <Button
                    label={t('label.force_delete', 'Force Delete')}
                    color="error"
                    onClick={onDeleteAccountAndDomain}
                    disabled={isRequestInProgress}
                  />
                </Padding>
                {isDomainClosed ? null : (
                  <Button
                    label={t('label.close_domain', 'CLOSE DOMAIN')}
                    color="primary"
                    onClick={onCloseDomain}
                  />
                )}
              </Container>
            </Container>
          }
        >
          <Padding all="medium">
            <ds-text as="p" overflow="break-word" weight="regular">
              {t('label.delete_domain_with_all_resources_pre_msg', {
                domainName,
                defaultValue: 'Domain {{domainName}} is not empty and contains',
              })}
            </ds-text>
            <br />
            {domainDirectories.account.length ? (
              <ds-text as="p" overflow="break-word" weight="regular">
                {domainDirectories.account.length} {t('label.accounts', 'Accounts')}
              </ds-text>
            ) : (
              <></>
            )}
            {filter(domainDirectories.account, { zimbraIsSystemAccount: 'TRUE' }).length ? (
              <ds-text as="p" overflow="break-word" weight="regular">
                {filter(domainDirectories.account, { zimbraIsSystemAccount: 'TRUE' }).length}{' '}
                {t('label.system_account', 'System Accounts')}
              </ds-text>
            ) : (
              <></>
            )}
            {domainDirectories.dl.length ? (
              <ds-text as="p" overflow="break-word" weight="regular">
                {domainDirectories.dl.length} {t('label.distribution_list', 'Distribution List')}
              </ds-text>
            ) : (
              <></>
            )}
            {domainDirectories.alias.length ? (
              <ds-text as="p" overflow="break-word" weight="regular">
                {domainDirectories.alias.length} {t('label.aliases', 'Aliases')}
              </ds-text>
            ) : (
              <></>
            )}
            {domainDirectories.calresource.length ? (
              <ds-text as="p" overflow="break-word" weight="regular">
                {domainDirectories.calresource.length} {t('label.resources', 'Resources')}
              </ds-text>
            ) : (
              <></>
            )}
            <br />
            {isDomainClosed ? (
              <>
                <ds-text as="p" overflow="break-word" weight="regular">
                  {t('label.permanently_delete_domain_with_all_resources_permanently_remove', {
                    defaultValue:
                      'Permanently remove all the accounts and domain objects. This operation cannot be reverted.',
                  })}
                </ds-text>
                <br />
              </>
            ) : (
              <>
                <ds-text as="p" overflow="break-word" weight="regular">
                  {t('label.delete_domain_with_all_resources_close_domain', {
                    defaultValue:
                      'If you are not sure, you still can close the domain to avoid any further interaction, leaving all the resources available in case of need.',
                  })}
                </ds-text>
                <br />
                <ds-text as="p" overflow="break-word" weight="regular">
                  {t('label.delete_domain_with_all_resources_permanently_remove', {
                    defaultValue:
                      'Otherwise, you can permanently remove all the accounts and domain objects. This operation cannot be reverted.',
                  })}
                </ds-text>
                <br />
              </>
            )}
            <ds-text as="p" overflow="break-word" weight="regular">
              <Trans
                i18nKey="label.type_domain_name"
                defaults={`To confirm, type here the domain name <bold>"{{domainName}}"</bold>:`}
                components={{ bold: <strong /> }}
                values={{ domainName }}
                t={t}
              />
            </ds-text>
            <ListRow>
              <Container padding={{ top: 'large' }}>
                <Input
                  value={confirmDomainName}
                  backgroundColor="gray5"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setConfirmDomainName(e.target.value);
                    if (isEqual(e.target.value, domainName)) {
                      setIsRequestInProgress(false);
                    } else {
                      setIsRequestInProgress(true);
                    }
                  }}
                />
              </Container>
            </ListRow>
          </Padding>
        </Modal>
      </Container>
    </ListRow>
  );
};
