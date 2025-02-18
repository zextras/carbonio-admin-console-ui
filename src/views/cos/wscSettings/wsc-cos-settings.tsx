/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react-hooks/rules-of-hooks */
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useMemo, useState } from 'react';

import { Button, Container } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { WscSettings } from './wsc-settings';
import PageLayout from '../../page-layout';

const WscCosSettings: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	const onSave = useCallback(() => {}, []);

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	const onCancel = useCallback(() => {}, []);

	const headerButtons = useMemo(() => {
		if (!isDirty) return null;
		return (
			<Container orientation="horizontal" width="fit" gap="1rem">
				<Button label={t('label.cancel', 'Cancel')} color="secondary" onClick={onCancel} />
				<Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
			</Container>
		);
	}, [isDirty, onCancel, onSave, t]);

	return (
		<PageLayout title={t('', 'Workstream Collaboration')} headerComponent={headerButtons}>
			<WscSettings />
		</PageLayout>
	);
};

export default WscCosSettings;
