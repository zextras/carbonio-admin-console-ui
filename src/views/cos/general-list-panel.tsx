/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ListPanelItem from '../list/list-panel-item';
import ListItems from '../list/list-items';
import { useCosStore } from '../../store/cos/store';

const GeneralListPanel: FC<any> = ({ generalOptionItems }) => {
	const [t] = useTranslation();
	const [isGeneralListExpanded, setIsGeneralListExpanded] = useState(true);
	const { cosView, setCosView } = useCosStore();

	const toggleGeneralView = (): void => {
		setIsGeneralListExpanded(!isGeneralListExpanded);
	};

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
