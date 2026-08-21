/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Trans, useTranslation } from 'react-i18next';

import logo from '../../../../assets/gardian.svg';

/** Empty state of the administrators table. */
export const AdministratorsEmptyState = () => {
	const [t] = useTranslation();

	return (
		<div className="flex flex-col items-center justify-center">
			<div className="flex flex-wrap">
				<img src={logo} alt="logo" />
			</div>
			<div className="flex flex-col items-center pt-xl text-center">
				<ds-text as="p" weight="light" color="#828282" size="large" overflow="break-word">
					{t('label.this_list_is_empty', 'This list is empty.')}
				</ds-text>
			</div>
			<div className="flex w-[53%] flex-col items-center pt-sm text-center">
				<ds-text as="p" weight="light" color="#828282" size="large" overflow="break-word">
					<Trans
						i18nKey="label.create_account_list_msg"
						defaults="You can create a new Account by clicking on <bold>Create</bold> button (upper left corner) or on the Add (<bold>+</bold>) button up here"
						components={{ bold: <strong /> }}
					/>
				</ds-text>
			</div>
		</div>
	);
};
