/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Spinner as SpinnerDS } from '@zextras/ui-components';
import React from 'react';

export const CustomSpinner = (): React.JSX.Element => (
	<Container>
		<SpinnerDS color={'primary'} />
	</Container>
);
