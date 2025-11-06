/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Spinner as SpinnerDS } from '@zextras/carbonio-design-system';
import React from 'react';


export const Spinner = (): React.JSX.Element => (
	<Container>
		<SpinnerDS color={'primary'} />
	</Container>
);
