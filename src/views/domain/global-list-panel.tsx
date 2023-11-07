/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useState } from 'react';

import { useTranslation } from 'react-i18next';

import ListItems from '../list/list-items';
import ListPanelItem from '../list/list-panel-item';

const GlobalListPanel: FC<any> = ({
	globalOptionItems,
	selectedOperationItem,
	setSelectedOperationItem
}) => {
	const [t] = useTranslation();
	const [isGlobalListExpanded, setIsGlobalListExpanded] = useState(true);

	const toggleGlobalView = (): void => {
		setIsGlobalListExpanded(!isGlobalListExpanded);
	};

	return (
		<>
			<ListPanelItem
				title={t('label.global', 'Global')}
				isListExpanded={isGlobalListExpanded}
				setToggleView={toggleGlobalView}
			/>
			{isGlobalListExpanded && (
				<ListItems
					items={globalOptionItems}
					selectedOperationItem={selectedOperationItem}
					setSelectedOperationItem={setSelectedOperationItem}
				/>
			)}
		</>
	);
};

export default GlobalListPanel;
