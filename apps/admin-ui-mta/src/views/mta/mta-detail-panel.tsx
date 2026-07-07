/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Padding } from '@zextras/ui-components';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router';

import {
  ADVANCED,
  ANTIVIRUS_AND_ANTISPAM,
  GENERAL,
  MTA_SERVER_GENERAL,
  OUTBOUND_FLOW,
  POSTSCREEN_TUNING,
  QUEUE,
} from '../../constants';
import MTAAntiVirusAndAntiSpam from './antvirus-and-antispam/antivirus-and-antispam';
import MTAInboundFlowSecurity from './inbound-flow-security/inbound-flow-security';
import MTAAdvanced from './mta-advanced/mta-advanced';
import MTAOutBoundFlow from './outbound-flow/outbound-flow';
import MTAPostScreenTuning from './post-screen-tuning/post-screen-tuning';
import MTAServerGeneral from './server/general/mta-server-general';
import MTAStats from './stats/mta-stats';

const EmptyState: FC = () => {
  const [t] = useTranslation();
  return (
    <Container height="fill" mainAlignment="center" crossAlignment="center">
      <Padding horizontal="large">
        <ds-text as="p" size="medium" color="secondary">
          {t('mta.select_an_option', 'Please select an option from the list')}
        </ds-text>
      </Padding>
    </Container>
  );
};

export const MTADetailPanel: FC = () => (
  <Container
    orientation="column"
    crossAlignment="center"
    mainAlignment="flex-start"
    style={{ overflowY: 'hidden' }}
    background="gray6"
  >
    <Routes>
      <Route index element={<EmptyState />} />

      <Route path={`/${GENERAL}`} element={<MTAInboundFlowSecurity />} />
      <Route path={`/${POSTSCREEN_TUNING}`} element={<MTAPostScreenTuning />} />
      <Route path={`/${OUTBOUND_FLOW}`} element={<MTAOutBoundFlow />} />
      <Route path={`/${ANTIVIRUS_AND_ANTISPAM}`} element={<MTAAntiVirusAndAntiSpam />} />
      <Route path={`/${ADVANCED}`} element={<MTAAdvanced />} />
      <Route path={`/${QUEUE}`} element={<MTAStats />} />

      <Route path={`/:server/${MTA_SERVER_GENERAL}`} element={<MTAServerGeneral />} />

      <Route path="*" element={null} />
    </Routes>
  </Container>
);
