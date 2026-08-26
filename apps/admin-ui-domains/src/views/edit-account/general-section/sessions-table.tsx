/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import {
  Button,
  Container,
  CustomHeaderFactory,
  HoverableRowFactory,
  Input,
  Paging,
  Row,
  Table,
  useSnackbar,
} from '@zextras/ui-components';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useDelegateAuth } from '../../../services/use-delegate-auth';
import { useEndSession } from '../../../services/use-end-session';
import { useAccountForm } from '../account-form-context';
import { filterSessions, somethingWrongSnackbarConfig, UserSession } from './utils';

/** Active sessions block: filter, table and End Session (delegate-auth token + endSession call). */
export const SessionsTable = () => {
  const { form, sessions } = useAccountForm();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

  const [selectedSession, setSelectedSession] = useState<any>([]);
  const [sessionFilter, setSessionFilter] = useState('');
  const [endedSids, setEndedSids] = useState<Array<string>>([]);
  const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);

  const delegateAuth = useDelegateAuth();
  const endSessionMutation = useEndSession();

  const allUserSessionList = sessions.filter(
    (item: UserSession) => !endedSids.includes(item?.sid),
  );
  const userSessionList = filterSessions(allUserSessionList, sessionFilter);

  const accountsLabel = t('label.accounts', 'Accounts');
  const sessionIdLabel = t('label.session_id', 'Session ID');
  const ipLabel = t('label.ip', 'IP');
  const serviceLabel = t('label.service', 'Service');

  const sessionTableHeader: any[] = [
    { id: 'accounts', label: accountsLabel, width: '25%', bold: true },
    { id: 'session_id', label: sessionIdLabel, width: '25%', bold: true },
    { id: 'ip', label: ipLabel, width: '25%', bold: true },
    { id: 'service', label: serviceLabel, width: '25%', bold: true },
  ];

  const addSelection = (item: UserSession) => {
    setSelectedSession([item?.sid]);
  };

  const sessionListRows = userSessionList.map((item: UserSession) => ({
    id: item?.sid,
    columns: [
      <Container
        crossAlignment="flex-start"
        key={item?.zid}
        style={{ cursor: 'pointer' }}
        onClick={(): void => addSelection(item)}
      >
        <ds-text as="span" size="small" weight="light" key={item?.zid} color="#828282">
          {item?.name}
        </ds-text>
      </Container>,
      <Container
        crossAlignment="flex-start"
        key={item?.zid}
        style={{ cursor: 'pointer' }}
        onClick={(): void => addSelection(item)}
      >
        <ds-text as="span" size="small" weight="light" key={item?.zid} color="#828282">
          {item?.sid}
        </ds-text>
      </Container>,
      <Container
        crossAlignment="flex-start"
        key={item?.zid}
        style={{ cursor: 'pointer' }}
        onClick={(): void => addSelection(item)}
      >
        <ds-text as="span" size="small" weight="light" key={item?.zid} color="#828282">
          {''}
        </ds-text>
      </Container>,
      <Container
        crossAlignment="flex-start"
        key={item?.zid}
        style={{ cursor: 'pointer' }}
        onClick={(): void => addSelection(item)}
      >
        <ds-text as="span" size="small" weight="light" key={item?.zid} color="#828282">
          {''}
        </ds-text>
      </Container>,
    ],
  }));

  const handleEndSessionError = (error: { message?: string }): void => {
    setIsRequestInProgress(false);
    createSnackbar(somethingWrongSnackbarConfig(error, t));
  };

  const onEndSession = (): void => {
    setIsRequestInProgress(true);
    delegateAuth
      .mutateAsync(values?.zimbraId)
      .then((token) =>
        endSessionMutation.mutateAsync({
          sessionId: selectedSession[0],
          accountName: values?.name,
          token,
        }),
      )
      .then(() => {
        setEndedSids((prev) => [...prev, selectedSession[0]]);
        setSelectedSession([]);
        createSnackbar({
          key: 'success',
          severity: 'success',
          label: t('label.session_end_success', 'Session end successfully'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      })
      .catch(handleEndSessionError)
      .finally(() => setIsRequestInProgress(false));
  };

  const onSessionFilterInputChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setSelectedSession([]);
    setSessionFilter(ev?.target?.value || '');
  };

  return (
    <Row
      mainAlignment="flex-start"
      padding={{ top: 'large', left: 'small', bottom: 'extralarge' }}
      width="100%"
    >
      <Row padding={{ top: 'extralarge' }}>
        <ds-text as="h2" size="small" weight="bold">
          {t('label.active_sessions', 'Active Sessions')}
        </ds-text>
      </Row>
      <Row
        padding={{ top: 'extralarge' }}
        width="97%"
        mainAlignment="flex-start"
        crossAlignment="flex-start"
      >
        <Container width="calc(100% - 13rem)">
          <Input
            label={t('label.i_m_looking_for_the_session', 'I`m looking for the session ...')}
            backgroundColor="gray5"
            width="100%"
            onChange={onSessionFilterInputChange}
          ></Input>
        </Container>
        <Container width="12rem" mainAlignment="flex-end" crossAlignment="flex-end">
          <Button
            label={t('label.end_session', 'End Session')}
            color="error"
            type="outlined"
            icon="StopCircleOutline"
            iconPlacement="right"
            size="extralarge"
            disabled={selectedSession.length === 0 || isRequestInProgress}
            onClick={onEndSession}
            loading={isRequestInProgress}
          />
        </Container>
      </Row>
      <Row
        padding={{ top: 'extralarge' }}
        width="97%"
        mainAlignment="flex-start"
        crossAlignment="flex-start"
      >
        <Table
          rows={sessionListRows}
          headers={sessionTableHeader}
          showCheckbox={false}
          selectedRows={selectedSession}
          multiSelect={false}
          HeaderFactory={CustomHeaderFactory}
          RowFactory={HoverableRowFactory}
        />
      </Row>
      <Row
        padding={{ top: 'extralarge' }}
        width="97%"
        mainAlignment="flex-end"
        crossAlignment="flex-end"
      >
        <Paging totalItem={1} setOffset={(): null => null} />
      </Row>
    </Row>
  );
};
