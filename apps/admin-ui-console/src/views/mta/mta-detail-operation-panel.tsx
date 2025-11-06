/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';
import { useParams } from 'react-router-dom';

import {
	ADVANCED,
	ANTIVIRUS_AND_ANTISPAM,
	GENERAL,
	MTA_SERVER_GENERAL,
	OUTBOUND_FLOW,
	POSTSCREEN_TUNING,
	QUEUE
} from '../../constants';

import MTAAntiVirusAndAntiSpam from './antvirus-and-antispam/antivirus-and-antispam';
import MTAInboundFlowSecurity from './inbound-flow-security/inbound-flow-security';
import MTAAdvanced from './mta-advanced/mta-advanced';
import MTAOutBoundFlow from './outbound-flow/outbound-flow';
import MTAPostScreenTuning from './post-screen-tuning/post-screen-tuning';
import MTAServerGeneral from './server/general/mta-server-general';
import MTAStats from './stats/mta-stats';

const MTADetailOperationPanel: FC = () => {
	const { operation }: { operation: string } = useParams();
	return (
		<>
			{((): any => {
				switch (operation) {
					case GENERAL:
						return <MTAInboundFlowSecurity />;
					case OUTBOUND_FLOW:
						return <MTAOutBoundFlow />;
					case ANTIVIRUS_AND_ANTISPAM:
						return <MTAAntiVirusAndAntiSpam />;
					case POSTSCREEN_TUNING:
						return <MTAPostScreenTuning />;
					case ADVANCED:
						return <MTAAdvanced />;
					case QUEUE:
						return <MTAStats />;
					case MTA_SERVER_GENERAL:
						return <MTAServerGeneral />;
					default:
						return null;
				}
			})()}
		</>
	);
};

export default MTADetailOperationPanel;
