/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, Modal, Padding, Row } from '@zextras/ui-components';
import { Trans, useTranslation } from 'react-i18next';

import { useDeleteCalResource, useDisableCalResource } from '../../../services/use-cal-resource';

type ResourceDeleteDialogProps = {
  resourceId: string;
  resourceName: string;
  isAccountClosed: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

export const ResourceDeleteDialog = ({
  resourceId,
  resourceName,
  isAccountClosed,
  onClose,
  onDeleted,
}: ResourceDeleteDialogProps) => {
  const [t] = useTranslation();
  const deleteResource = useDeleteCalResource();
  const disableResource = useDisableCalResource();

  const isLoading = deleteResource.isPending || disableResource.isPending;

  function handleDelete(): void {
    deleteResource.mutate(resourceId, {
      onSuccess: () => {
        onDeleted();
      },
    });
  }

  function handleDisable(): void {
    disableResource.mutate(resourceId, {
      onSuccess: () => {
        onDeleted();
      },
    });
  }

  return (
    <Modal
      size="medium"
      title={t('label.deleting_resource_name', 'You are deleting {{name}}', {
        name: resourceName,
      })}
      open
      customFooter={
        <Container orientation="horizontal" mainAlignment="flex-end">
          <Row style={{ gap: '1rem' }}>
            <Button
              label={t('label.delete_it_instead', 'Delete it instead')}
              color="error"
              type="outlined"
              onClick={handleDelete}
              disabled={isLoading}
            />
            <Button
              label={t('label.close_the_resource', 'Close the resource')}
              color="primary"
              onClick={handleDisable}
              disabled={isLoading || isAccountClosed}
            />
          </Row>
        </Container>
      }
      showCloseIcon
      onClose={onClose}
    >
      <Container mainAlignment="flex-start" crossAlignment="flex-start">
        <Padding bottom="medium" top="medium">
          <ds-text as="p" size="extralarge" overflow="break-word">
            <Trans
              i18nKey="label.deleting_account_content_1"
              defaults="Are you sure you want to delete <bold>{{name}}</bold> ?"
              components={{ bold: <strong /> }}
              values={{ name: resourceName }}
            />
          </ds-text>
        </Padding>
        <Padding bottom="medium">
          <ds-text as="p" overflow="break-word">
            <Trans
              i18nKey="label.deleting_account_content_2"
              defaults="Deleting the account <bold>will PERMANENTLY delete</bold> all the data."
              components={{ bold: <strong /> }}
            />
          </ds-text>
        </Padding>
        <Padding bottom="medium">
          <ds-text as="p" overflow="break-word">
            <Trans
              i18nKey="label.deleting_account_content_3"
              defaults="You can <bold>Disable it to preserve</bold> the data, instead."
              components={{ bold: <strong /> }}
            />
          </ds-text>
        </Padding>
        <Row padding={{ bottom: 'large' }} mainAlignment="center" crossAlignment="center" width="100%">
          <ds-icon
            icon="AlertTriangleOutline"
            size="large"
            style={{ height: '48px', width: '48px' }}
          ></ds-icon>
        </Row>
      </Container>
    </Modal>
  );
};
