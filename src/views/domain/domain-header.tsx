/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC } from 'react';
import { Container, Button } from '@zextras/carbonio-design-system';

const DomainHeader: FC = () => (
	<Container
		orientation="horizontal"
		mainAlignment="flex-end"
		crossAlignment="flex-end"
		height="49px"
		background="#FFFFFF"
	>
		<Button
			type="ghost"
			label="Details"
			icon="CheckmarkCircleOutline"
			iconPlacement="left"
			color="primary"
			disabled
		/>
		<Button
			type="ghost"
			label="Manage"
			icon="AdminPanelOutline"
			iconPlacement="left"
			color="primary"
			disabled
		/>
	</Container>
);
export default DomainHeader;
