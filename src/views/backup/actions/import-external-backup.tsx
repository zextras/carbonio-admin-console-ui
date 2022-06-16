/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Container } from '@zextras/carbonio-design-system';

const ImportExternalBackup: FC = () => {
	const [t] = useTranslation();
	return (
		<Container>
			<Container>Import External</Container>
		</Container>
	);
};
export default ImportExternalBackup;
