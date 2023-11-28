/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { useCosStore } from '../../store/cos/store';
import ListItems from '../list/list-items';
import ListPanelItem from '../list/list-panel-item';

const GeneralListPanel: FC<any> = ({ generalOptionItems }) => {
	const [t] = useTranslation();
	const [isGeneralListExpanded, setIsGeneralListExpanded] = useState(true);
	const { cosView, setCosView } = useCosStore();

	const toggleGeneralView = (): void => {
		if (isGeneralListExpanded) {
			setIsGeneralListExpanded(false);
			localStorage.setItem('isGeneralListExpanded', 'false');
		} else {
			setIsGeneralListExpanded(true);
			localStorage.removeItem('isGeneralListExpanded');
		}
	};

	useEffect(() => {
		const storedValue = localStorage.getItem('isGeneralListExpanded');
		if (storedValue === 'false') {
			setIsGeneralListExpanded(false);
		} else {
			setIsGeneralListExpanded(true);
		}
	}, []);

	return (
		<>
			<ListPanelItem
				title={t('label.general', 'General')}
				isListExpanded={isGeneralListExpanded}
				setToggleView={toggleGeneralView}
			/>
			{isGeneralListExpanded && (
				<ListItems
					items={generalOptionItems}
					selectedOperationItem={cosView}
					setSelectedOperationItem={setCosView}
				/>
			)}
		</>
	);
};

export default GeneralListPanel;
