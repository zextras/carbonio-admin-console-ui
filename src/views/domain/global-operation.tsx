/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { THEME } from '../../constants';
import GlobalTheme from './global/global-theme';

const GlobalOperations: FC = () => {
	const [t] = useTranslation();
	const { operation }: { operation: string } = useParams();
	return (
		<>
			{((): any => {
				switch (operation) {
					case THEME:
						return <GlobalTheme />;
					default:
						return null;
				}
			})()}
		</>
	);
};
export default GlobalOperations;
