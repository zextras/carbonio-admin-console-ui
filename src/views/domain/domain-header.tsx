/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback } from 'react';
import { Container, Button } from '@zextras/carbonio-design-system';
import { useDomainStore } from '../../store/domain/store';
import { DOMAIN_DETAIL_VIEW, DOMAIN_MANAGE_VIEW } from '../../constants';

const DomainHeader: FC = () => {
	const setDomainView = useDomainStore((state) => state.setDomainView);
	const domainView = useDomainStore((state) => state.domainView);
	const setDetailView = useCallback(() => {
		setDomainView(DOMAIN_DETAIL_VIEW);
	}, [setDomainView]);

	const setManageView = useCallback(() => {
		setDomainView(DOMAIN_MANAGE_VIEW);
	}, [setDomainView]);
	return (
		<Container
			orientation="horizontal"
			mainAlignment="flex-end"
			crossAlignment="flex-end"
			height="44px"
			background="#FFFFFF"
		>
			<Button
				type="ghost"
				label="Details"
				icon="CheckmarkCircleOutline"
				iconPlacement="left"
				color="primary"
				height="44px"
				onClick={setDetailView}
				forceActive={domainView === DOMAIN_DETAIL_VIEW}
			/>
			<Button
				type="ghost"
				label="Manage"
				icon="AdminPanelOutline"
				iconPlacement="left"
				color="primary"
				height="44px"
				onClick={setManageView}
				forceActive={domainView === DOMAIN_MANAGE_VIEW}
			/>
		</Container>
	);
};
export default DomainHeader;
