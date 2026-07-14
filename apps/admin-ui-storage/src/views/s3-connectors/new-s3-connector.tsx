/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { objectType } from '../../../types';
import { Connection } from './connection';

type NewS3ConnectorProps = {
  setToggleWizardSection: (value: boolean) => void;
  setDetailsConnector: (value: boolean) => void;
  setConnectionData: (value: objectType | undefined) => void;
};

export function NewS3Connector({
  setToggleWizardSection,
  setDetailsConnector,
  setConnectionData,
}: NewS3ConnectorProps) {
  const { t } = useTranslation();

  return (
    <Container background="gray6" orientation="vertical">
      <Row
        mainAlignment="flex-start"
        crossAlignment="center"
        orientation="horizontal"
        background="white"
        width="fill"
        height="4rem"
      >
        <Row mainAlignment="flex-start" padding={{ left: 'large'}} takeAvailableSpace>
          <ds-text as="h2" weight="bold">
            {t('storages.connectNewS3', 'Connect a new S3')}
          </ds-text>
        </Row>
        <Row padding={{ horizontal: 'small' }}>
          <Button
            type="ghost"
            color="text"
            icon="CloseOutline"
            onClick={(): void => {
              setToggleWizardSection(false);
              setDetailsConnector(false);
              setConnectionData(undefined);
            }}
          />
        </Row>
      </Row>
      <ds-divider></ds-divider>
      <Connection
        onCancel={(): void => {
          setToggleWizardSection(false);
          setDetailsConnector(false);
        }}
      />
    </Container>
  );
}
