/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback } from 'react';

import { Catcher } from '@zextras/carbonio-design-system';

const AppErrorCatcher: FC<{ children: React.ReactNode }> = ({ children }) => {
	const onError = useCallback((error: unknown) => {
		console.error(error);
		// ({event: 'report-exception',data: { exception: error }});
	}, []);
	return <Catcher onError={onError}>{children}</Catcher>;
};
export default AppErrorCatcher;
