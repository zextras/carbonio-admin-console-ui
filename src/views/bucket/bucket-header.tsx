/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC } from 'react';
import { Container, Button } from '@zextras/carbonio-design-system';
import Breadcrumbs from '../app/breadcrumbs';

const BucketHeader: FC<{ currentpath: any }> = ({ currentpath }) => (
	<Container mainAlignment="flex-start" orientation="horizontal" height="49px" background="#FFFFFF">
		<Breadcrumbs folderPath={currentpath} />
		<Container width="auto" mainAlignment="flex-end" orientation="horizontal">
			<Button type="ghost" label="GLOBAL" icon="Globe" iconPlacement="left" color="primary" />
			<Button
				type="ghost"
				label="ACTIONS"
				icon="AdminPanelOutline"
				iconPlacement="left"
				color="primary"
			/>
		</Container>
	</Container>
);

export default BucketHeader;
