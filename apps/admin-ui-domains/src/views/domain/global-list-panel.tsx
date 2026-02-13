/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { IS_GLOBAL_LIST_EXPANDED } from '../../constants';
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
		if (isGlobalListExpanded) {
			setIsGlobalListExpanded(false);
			localStorage.setItem(IS_GLOBAL_LIST_EXPANDED, 'false');
		} else {
			setIsGlobalListExpanded(true);
			localStorage.removeItem(IS_GLOBAL_LIST_EXPANDED);
		}
	};

	useEffect(() => {
		const storedValue = localStorage.getItem(IS_GLOBAL_LIST_EXPANDED);
		if (storedValue === 'false') {
			setIsGlobalListExpanded(false);
		} else {
			setIsGlobalListExpanded(true);
		}
	}, []);
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
