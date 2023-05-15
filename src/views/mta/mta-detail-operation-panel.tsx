/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { GENERAL, OUTBOUND_FLOW, POSTSCREEN_TUNING } from '../../constants';
import MTAInboundFlowSecurity from './inbound-flow-security/inbound-flow-security';
import MTAOutBoundFlow from './outbound-flow/outbound-flow';

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
					default:
						return null;
				}
			})()}
		</>
	);
};

export default MTADetailOperationPanel;
