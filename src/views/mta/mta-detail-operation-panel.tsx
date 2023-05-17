/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { ANTIVIRUS_AND_ANTISPAM, GENERAL, OUTBOUND_FLOW } from '../../constants';
import MTAInboundFlowSecurity from './inbound-flow-security/inbound-flow-security';
import MTAOutBoundFlow from './outbound-flow/outbound-flow';
import MTAAntiVirusAndAntiSpam from './antvirus-and-antispam/antivirus-and-antispam';

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
					default:
						return null;
				}
			})()}
		</>
	);
};

export default MTADetailOperationPanel;
