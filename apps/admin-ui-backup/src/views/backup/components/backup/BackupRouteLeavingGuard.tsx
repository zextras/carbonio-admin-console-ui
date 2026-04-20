/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FC } from 'react';

import { RouteLeavingGuard } from '../../../ui-extras/nav-guard';

interface BackupRouteLeavingGuardProps {
	isDirty: boolean;
	onSave: () => void;
	t: (key: string, fallback?: string) => string;
}

const BackupRouteLeavingGuard: FC<BackupRouteLeavingGuardProps> = ({ isDirty, onSave, t }) => (
	<RouteLeavingGuard when={isDirty} onSave={onSave}>
		<ds-text as="p">
			{t('label.unsaved_changes_line1', 'Are you sure you want to leave this page without saving?')}
		</ds-text>
		<ds-text as="p">{t('label.unsaved_changes_line2', 'All your unsaved changes will be lost')}</ds-text>
	</RouteLeavingGuard>
);

export default BackupRouteLeavingGuard;
