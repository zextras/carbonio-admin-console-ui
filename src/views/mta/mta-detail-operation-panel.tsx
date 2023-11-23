/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';

import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import MTAAntiVirusAndAntiSpam from './antvirus-and-antispam/antivirus-and-antispam';
import MTAInboundFlowSecurity from './inbound-flow-security/inbound-flow-security';
import MTAAdvanced from './mta-advanced/mta-advanced';
import MTAOutBoundFlow from './outbound-flow/outbound-flow';
import MTAPostScreenTuning from './post-screen-tuning/post-screen-tuning';
import MTAStats from './stats/mta-stats';
import {
	ADVANCED,
	ANTIVIRUS_AND_ANTISPAM,
	GENERAL,
	OUTBOUND_FLOW,
	POSTSCREEN_TUNING,
	QUEUE
} from '../../constants';

const MTADetailOperationPanel: FC = () => {
	const [t] = useTranslation();
	const { operation, server }: { operation: string; server: string } = useParams();

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
					default:
						return null;
				}
			})()}
		</>
	);
};

export default MTADetailOperationPanel;
