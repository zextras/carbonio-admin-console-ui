/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { useServiceStartStop } from '../../../../services/use-service-start-stop';

type ServiceStatusProps = {
  serverName: string;
  serverId: string;
  serviceRunning: boolean;
  onServiceToggle: (running: boolean) => void;
  allowSetBackup: boolean;
};

export const ServiceStatus = ({
  serverName,
  serverId,
  serviceRunning,
  onServiceToggle,
  allowSetBackup,
}: ServiceStatusProps) => {
  const [t] = useTranslation();
  const startStopMutation = useServiceStartStop(serverId);

  const handleStartStop = () => {
    startStopMutation.mutate(
      {
        action: serviceRunning ? 'doStopService' : 'doStartService',
        server: serverName,
      },
      { onSuccess: () => onServiceToggle(!serviceRunning) },
    );
  };

  return (
    <>
      <Container
        mainAlignment="flex-end"
        crossAlignment="flex-end"
        padding={{ top: 'large' }}
        height="fit"
        orientation="horizontal"
      >
        <ds-text as="span">{t('backup.the_service_is', 'The service is')}</ds-text>&nbsp;
        {!serviceRunning && (
          <ds-text as="span" color="error">
            {t('backup.stopped', 'stopped')}
          </ds-text>
        )}
        {serviceRunning && (
          <ds-text as="span" color="primary">
            {t('backup.running', 'running')}
          </ds-text>
        )}
      </Container>
      <Container
        mainAlignment="flex-start"
        crossAlignment="flex-end"
        padding={{ top: 'medium' }}
        height="fit"
      >
        <Button
          type="outlined"
          label={
            serviceRunning
              ? t('backup.stop_service', 'Stop service')
              : t('backup.start_service', 'Start service')
          }
          color={serviceRunning ? 'error' : 'primary'}
          width="fit"
          onClick={handleStartStop}
          disabled={startStopMutation.isPending || !allowSetBackup}
          loading={startStopMutation.isPending}
          size="large"
        />
      </Container>
    </>
  );
};
