/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ComponentType } from 'react';

import {
  ADVANCED,
  ANTIVIRUS_AND_ANTISPAM,
  INBOUND_FLOW_SECURITY,
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

export type SectionRoute = {
  id: string;
  prefix?: string;
  labelKey: string;
  labelDefault: string;
  Component: ComponentType;
};

export const SECTION_ROUTES: Array<SectionRoute> = [
  {
    id: INBOUND_FLOW_SECURITY,
    labelKey: 'mta.inbound_flow_and_security',
    labelDefault: 'Inbound Flow & Security',
    Component: MTAInboundFlowSecurity,
  },
  {
    id: POSTSCREEN_TUNING,
    labelKey: 'mta.postscreen_tuning',
    labelDefault: 'Postscreen Tuning',
    Component: MTAPostScreenTuning,
  },
  {
    id: OUTBOUND_FLOW,
    labelKey: 'mta.outbound_flow',
    labelDefault: 'Outbound Flow',
    Component: MTAOutBoundFlow,
  },
  {
    id: ANTIVIRUS_AND_ANTISPAM,
    labelKey: 'mta.antivirus_and_antispam',
    labelDefault: 'Antivirus & Antispam',
    Component: MTAAntiVirusAndAntiSpam,
  },
  {
    id: ADVANCED,
    labelKey: 'label.advanced',
    labelDefault: 'Advanced',
    Component: MTAAdvanced,
  },
  {
    id: QUEUE,
    labelKey: 'mta.queue',
    labelDefault: 'Queue',
    Component: MTAStats,
  },
  {
    id: MTA_SERVER_GENERAL,
    prefix: ':server',
    labelKey: 'label.mta_server_general',
    labelDefault: 'General',
    Component: MTAServerGeneral,
  },
];
