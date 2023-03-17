/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { GENERAL } from '../../constants';
import MTAInboundFlowSecurity from './inbound-flow-security/inbound-flow-security';

const MTADetailOperationPanel: FC = () => {
	const [t] = useTranslation();
	const { operation, server }: { operation: string; server: string } = useParams();

	return (
		<>
			{((): any => {
				switch (operation) {
					case GENERAL:
						return <MTAInboundFlowSecurity />;
					default:
						return null;
				}
			})()}
		</>
	);
};

export default MTADetailOperationPanel;
