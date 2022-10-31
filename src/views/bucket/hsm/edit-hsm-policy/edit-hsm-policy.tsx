/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	Container,
	Text,
	useSnackbar,
	DefaultTabBarItem,
	Row,
	Padding,
	Icon,
	IconButton,
	Divider,
	TabBar,
	Button
} from '@zextras/carbonio-design-system';
import React, { FC, ReactElement, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HSMContext } from '../hsm-context/hsm-context';
import EditHsmPolicyDetailSection from './edit-hsm-policy-detail-section';
import EditHsmPolicyVolumesSection from './edit-hsm-policy-volumes-section';

interface hsmDetailObj {
	allVolumes: Array<any>;
	isAllEnabled: boolean;
	isMessageEnabled: boolean;
	isEventEnabled: boolean;
	isContactEnabled: boolean;
	isDocumentEnabled: boolean;
	policyCriteria: Array<any>;
	sourceVolume: Array<any>;
	destinationVolume: Array<any>;
	isDataLoaded: boolean;
	isVolumeLoaded: boolean;
}

const EditHsmPolicy: FC<{
	setShowEditHsmPolicyView: any;
	policies: any;
	selectedPolicies: any;
	volumeList: any;
	onEditSave: any;
	isEditSaveInProgress: boolean;
}> = ({
	setShowEditHsmPolicyView,
	policies,
	selectedPolicies,
	volumeList,
	onEditSave,
	isEditSaveInProgress
}) => {
	const { t } = useTranslation();
	const createSnackbar = useSnackbar();
	const [change, setChange] = useState('details');
	const [click, setClick] = useState('');
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [currentPolicy, setCurrentPolicy] = useState<any>();
	const [hsmDetail, setHsmDetail] = useState<hsmDetailObj>({
		allVolumes: volumeList,
		isAllEnabled: false,
		isMessageEnabled: false,
		isEventEnabled: false,
		isContactEnabled: false,
		isDocumentEnabled: false,
		policyCriteria: [],
		sourceVolume: [],
		destinationVolume: [],
		isDataLoaded: false,
		isVolumeLoaded: false
	});

	useEffect(() => {
		const policy = policies.find((item: any) => item?.hsmQuery === selectedPolicies);
		if (policy) {
			setCurrentPolicy(policy);
		}
	}, [selectedPolicies, policies]);

	const ReusedDefaultTabBar: FC<{
		item: any;
		index: any;
		selected: any;
		onClick: any;
	}> = ({ item, index, selected, onClick }): ReactElement => (
		<DefaultTabBarItem
			item={item}
			index={index}
			selected={selected}
			onClick={onClick}
			orientation="horizontal"
		>
			<Row padding="small">
				<Padding horizontal="small">
					<Icon size="medium" color={selected ? 'primary' : 'gray'} icon={item.icon} />
				</Padding>
				<Text size="small" color={selected ? 'primary' : 'gray'}>
					{item.label}
				</Text>
			</Row>
		</DefaultTabBarItem>
	);
	const items = [
		{
			id: 'details',
			label: t('hsm.details', 'Details'),
			CustomComponent: ReusedDefaultTabBar,
			icon: 'InfoOutline'
		},
		{
			id: 'volumes',
			label: t('hsm.volumes', 'Volumes'),
			CustomComponent: ReusedDefaultTabBar,
			icon: 'OptionsOutline'
		}
	];

	const onSave = useCallback(() => {
		onEditSave(hsmDetail);
	}, [hsmDetail, onEditSave]);
	return (
		<>
			<Container
				background="gray5"
				mainAlignment="flex-start"
				style={{
					position: 'absolute',
					left: `${'max(calc(100% - 640px), 12px)'}`,
					top: '43px',
					height: 'auto',
					width: '640px',
					overflow: 'hidden',
					transition: 'left 0.2s ease-in-out',
					'box-shadow': '-6px 4px 5px 0px rgba(0, 0, 0, 0.1)'
				}}
			>
				<Row
					mainAlignment="flex-start"
					crossAlignment="center"
					orientation="horizontal"
					background="white"
					width="fill"
					height="48px"
				>
					<Row padding={{ horizontal: 'small' }}></Row>
					<Row takeAvailableSpace mainAlignment="flex-start">
						<Text size="medium" overflow="ellipsis" weight="bold">
							{t('hsm.editing_policy', 'Editing Policy')}
						</Text>
					</Row>
					<Row padding={{ right: 'extrasmall' }}>
						{isDirty && (
							<Row>
								<Padding right="medium">
									<Button
										label={t('label.cancel', 'Cancel')}
										color="secondary"
										onClick={(): void => setShowEditHsmPolicyView(false)}
									/>
								</Padding>

								<Button
									label={t('label.save', 'Save')}
									color="primary"
									onClick={onSave}
									disabled={isEditSaveInProgress}
									loading={isEditSaveInProgress}
								/>
							</Row>
						)}
						{!isDirty && (
							<IconButton
								size="medium"
								icon="CloseOutline"
								onClick={(): void => setShowEditHsmPolicyView(false)}
							/>
						)}
					</Row>
				</Row>
				<Row>
					<Divider color="gray3" />
				</Row>

				<Container
					padding={{ all: 'small' }}
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					height="calc(100vh - 152px)"
					background="white"
					style={{ overflow: 'auto' }}
				>
					<Row width="100%" mainAlignment="flex-end" crossAlignment="flex-end">
						<TabBar
							items={items}
							defaultSelected="details"
							onChange={setChange}
							onItemClick={setClick}
							width={540}
						/>
					</Row>
					<Row width="100%">
						<Divider color="gray2" />
					</Row>
					<HSMContext.Provider value={{ hsmDetail, setHsmDetail }}>
						<Container crossAlignment="flex-start" padding={{ all: '0px' }}>
							{change === 'details' && (
								<EditHsmPolicyDetailSection currentPolicy={currentPolicy} setIsDirty={setIsDirty} />
							)}
							{change === 'volumes' && (
								<EditHsmPolicyVolumesSection
									currentPolicy={currentPolicy}
									setIsDirty={setIsDirty}
								/>
							)}
						</Container>
					</HSMContext.Provider>
				</Container>
			</Container>
		</>
	);
};

export default EditHsmPolicy;
