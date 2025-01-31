/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';

import { Container, Row, Switch, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { BACKUP_ENABLED, BACKUP_SELF_UNDELETE_ALLOWED } from '../../constants';
import ListRow from '../list/list-row';

type AdvancedBackupAttributes = {
	[BACKUP_ENABLED]: boolean | undefined;
	[BACKUP_SELF_UNDELETE_ALLOWED]: boolean | undefined;
};

type AdvancedBackupAttributesKeys = keyof AdvancedBackupAttributes;

const COSGeneralOptions: FC<{
	cosAdvancedBackupAttributes: AdvancedBackupAttributes;
	readonlyCOS: boolean;
	changeBackupAttribute: (key: AdvancedBackupAttributesKeys) => void;
}> = ({ cosAdvancedBackupAttributes, readonlyCOS, changeBackupAttribute }) => {
	const [t] = useTranslation();

	return (
		<Row
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			padding={{ all: 'large' }}
			width="100%"
		>
			<Text size="extbackupSelfUndeleteAllowedralarge" weight="bold">
				{t('cos.general_options', 'General Options')}
			</Text>
			<Row mainAlignment="flex-start" width="100%">
				<Container
					height="fit"
					crossAlignment="flex-start"
					background="gray6"
					padding={{ top: 'large' }}
				>
					<ListRow>
						<Container mainAlignment="flex-start" style={{ gap: 10 }} orientation="horizontal">
							<Container
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								width="50%"
								orientation="vertical"
							>
								<Switch
									label={t('label.backup_enabled', 'Enable / Disable Backup')}
									value={cosAdvancedBackupAttributes[BACKUP_ENABLED]}
									onClick={(): void => changeBackupAttribute(BACKUP_ENABLED)}
									iconColor="primary"
									disabled={readonlyCOS}
								/>
							</Container>
							<Container
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								width="50%"
								orientation="vertical"
							>
								<Switch
									label={t('label.allow_restore_message', 'Allow user to restore messages')}
									value={cosAdvancedBackupAttributes[BACKUP_SELF_UNDELETE_ALLOWED]}
									// eslint-disable-next-line max-len
									onClick={(): void => changeBackupAttribute(BACKUP_SELF_UNDELETE_ALLOWED)}
									iconColor="primary"
									disabled={readonlyCOS}
								/>
							</Container>
						</Container>
					</ListRow>
				</Container>
			</Row>
		</Row>
	);
};

export default COSGeneralOptions;
