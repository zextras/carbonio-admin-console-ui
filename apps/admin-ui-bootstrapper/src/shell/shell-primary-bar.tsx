/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useContext, FC, useState, useEffect, useMemo, useCallback, useRef } from 'react';

import {
	Container,
	Button,
	Row,
	Tooltip,
	Text,
	Padding,
	Divider,
	Popper
} from '@zextras/carbonio-design-system';
import { map, isEmpty, trim, filter, sortBy, find } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

// TODO: convert boards management to ts (and maybe a zustand store)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import BadgeWrap from './badge-wrap';
import { BoardValueContext, BoardSetterContext } from './boards/board-context';
import { Collapser } from './collapser';
import { AppRoute, PrimaryAccessoryView, PrimaryBarView, Right } from '../../types';
import AppContextProvider from '../boot/app/app-context-provider';
import { CONFIG } from '../constants';
import { getUsersRights } from '../network/get-user-accounts-rights';
import { useUserAccounts } from '../store/account';
import { useAppStore } from '../store/app';
import { useContextBridge } from '../store/context-bridge';
import { useUtilityBarStore } from '../utility-bar';
import { checkRoute } from '../utility-bar/utils';

const PrimaryBarContainer = styled(Container)`
	min-width: 48px;
	max-width: 192px;
	width: ${({ sidebarIsOpen }): number => (sidebarIsOpen ? 192 : 48)}px;
	transition: width 300ms;
	overflow-x: hidden;
`;

const PrimaryBarRow = styled(Row)<{ active: boolean }>`
	background-color: ${({ theme, active }): string =>
		active ? theme.palette.highlight.regular : 'gray6'};
	cursor: pointer;
	&:hover {
		background: ${({ theme, active }): string => theme.palette[active ? 'gray4' : 'gray6'].hover};
	}
`;

const PrimaryBarButton = styled(Button)`
	&:hover {
		background: transparent;
	}
`;

const CustomText = styled(Text)`
	width: 75%;
	height: 100%;
	display: flex;
	align-items: center;
`;
const ToggleBoardIcon: FC = () => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const { boards, minimized } = useContext(BoardValueContext);
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const { toggleMinimized } = useContext(BoardSetterContext);

	if (isEmpty(boards)) return null;
	return (
		<Container orientation="horizontal" mainAlignment="flex-start" background="transparent">
			<Button
				type="ghost"
				color={'primary'}
				icon={minimized ? 'BoardOpen' : 'BoardCollapse'}
				onClick={toggleMinimized}
				size="large"
			/>
		</Container>
	);
};

type PrimaryBarItemProps = {
	view: PrimaryBarView;
	active: boolean;
	isExpanded: boolean;
	onClick: () => void;
};

type PrimaryBarAccessoryItemProps = {
	view: PrimaryAccessoryView;
};

// Alternative layout for the primary bar
// const AdminPrimaryBarElement: FC<PrimaryBarItemProps> = ({ view, active, onClick }) => (
// 	<PrimaryContainer
// 		orientation="horizontal"
// 		mainAlignment="flex-start"
// 		height="48px"
// 		onClick={onClick}
// 	>
// 		<BadgeWrap badge={view.badge}>
// 			{typeof view.component === 'string' ? (
// 				<Icon icon={view.component} color={active ? 'primary' : 'text'} size="large" />
// 			) : (
// 				<view.component active={active} />
// 			)}
// 		</BadgeWrap>
// 		<Padding right="large">
// 			<Text color={active ? 'primary' : 'text'}>{view.label}</Text>
// 		</Padding>
// 	</PrimaryContainer>
// );

const PrimaryBarElement: FC<PrimaryBarItemProps> = ({ view, active, isExpanded, onClick }) => {
	const [open, setOpen] = useState(false);
	const containerRef = useRef(undefined);
	return (
		<>
			<Container
				ref={containerRef}
				// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
				onMouseEnter={(): void => setOpen(true)}
				// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
				onMouseLeave={(): void => setOpen(false)}
				height="52px"
			>
				<PrimaryBarRow width="fill" mainAlignment="flex-start" active={active}>
					<BadgeWrap badge={view.badge} isExpanded={isExpanded}>
						{typeof view.component === 'string' ? (
							<PrimaryBarButton
								type="ghost"
								color={'text'}
								icon={view.component}
								onClick={onClick}
								size={'extralarge'}
							/>
						) : (
							<Text onClick={onClick}>
								<view.component active={active} />
							</Text>
						)}
					</BadgeWrap>
					{isExpanded && (
						<CustomText color="text" weight="bold" onClick={onClick}>
							{view.label}
						</CustomText>
					)}
				</PrimaryBarRow>
			</Container>

			<Popper
				open={open}
				anchorEl={containerRef}
				placement="right"
				// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
				onClose={(): void => setOpen(false)}
				disableRestoreFocus
			>
				{!view?.tooltip ? (
					<Container
						orientation="horizontal"
						mainAlignment="flex-start"
						background="gray3"
						height="fit"
						crossAlignment="flex-start"
					>
						<Padding value="8px">
							<Text>{view.label}</Text>
						</Padding>
					</Container>
				) : (
					<view.tooltip />
				)}
			</Popper>
		</>
	);
};

const PrimaryBarAccessoryElement: FC<PrimaryBarAccessoryItemProps> = ({ view }) => (
	<Tooltip label={view.label} placement="right" key={view.id}>
		<AppContextProvider key={view.id} pkg={view.app}>
			{typeof view.component === 'string' ? (
				<Button
					type="ghost"
					color={'text'}
					icon={view.component}
					backgroundColor="gray6"
					iconColor="text"
					onClick={view.onClick}
					size="large"
				/>
			) : (
				<view.component />
			)}
		</AppContextProvider>
	</Tooltip>
);

const ShellPrimaryBar: FC<{ activeRoute: AppRoute }> = ({ activeRoute }) => {
	const isOpen = useUtilityBarStore((s) => s.primaryBarState);
	const accounts = useUserAccounts();

	const setIsOpen = useUtilityBarStore((s) => s.setPrimaryBarState);
	const onCollapserClick = useCallback(() => {
		setIsOpen(!isOpen);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, setIsOpen]);
	const primaryBarViews = useAppStore((s) => s.views.primaryBar);
	const primarybarSections = useAppStore((s) => s.views.primarybarSections);
	const [primaryBarViewWithSection, setPrimaryBarViewWithSection] = useState<any[]>([]);
	const [routes, setRoutes] = useState<Record<string, string>>({});
	const [allUserRights, setAllUserRights] = useState();
	const history = useHistory();
	const [t] = useTranslation();

	useEffect(() => {
		setRoutes((r) =>
			primaryBarViews.reduce((acc, v) => {
				// eslint-disable-next-line no-param-reassign
				acc[v?.id] = v.route;
				return acc;
			}, r)
		);
	}, [primaryBarViews]);
	useEffect(() => {
		if (activeRoute) {
			setRoutes((r) => ({ ...r, [activeRoute?.id]: trim(history.location.pathname, '/') }));
		}
	}, [activeRoute, history.location.pathname, primaryBarViews]);
	const primaryBarAccessoryViews = useAppStore((s) => s.views.primaryBarAccessories);
	const accessories = useMemo(
		() =>
			sortBy(
				filter(primaryBarAccessoryViews, (v) => checkRoute(v, activeRoute)),
				'position'
			),
		[activeRoute, primaryBarAccessoryViews]
	);

	useEffect(() => {
		let allPrimaryBarView: any = [];
		if (primaryBarViews.length > 0) {
			allPrimaryBarView = primaryBarViews.filter(
				(item) => item.section === undefined || !item.section
			);
			if (primarybarSections.length > 0) {
				primarybarSections.forEach((item) => {
					const section: any = {
						id: item?.id,
						position: item?.position,
						label: item?.label
					};
					const parimaryBarItems: any = [];
					primaryBarViews.forEach((primaryBarItem) => {
						if (item?.id === primaryBarItem?.section?.id) {
							parimaryBarItems.push(primaryBarItem);
						}
					});
					allPrimaryBarView.push({
						position: item?.position,
						badge: { show: false, count: 0, showCount: false, color: 'primary' },
						visible: true,
						section,
						children: parimaryBarItems
					});
				});
			}
			setPrimaryBarViewWithSection(sortBy(allPrimaryBarView, 'position'));
		}
	}, [primarybarSections, primaryBarViews]);

	const allowShowFeedback = useMemo(() => {
		const rightsConfig: Right = find(allUserRights, { type: CONFIG }) || { all: [], type: CONFIG };
		return !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
	}, [allUserRights]);

	useEffect(() => {
		if (!!accounts && Array.isArray(accounts) && accounts.length > 0 && accounts[0]?.name) {
			getUsersRights('name', accounts[0].name).then((res) => {
				setAllUserRights(res?.target);
			});
		}
	}, [accounts]);

	return (
		<>
			<PrimaryBarContainer
				sidebarIsOpen={isOpen}
				role="menu"
				height="fill"
				background="gray6"
				orientation="vertical"
				mainAlignment="space-between"
				style={{
					maxHeight: 'calc(100vh - 48px)',
					overflowY: 'auto'
				}}
			>
				<Container mainAlignment="flex-start">
					{map(primaryBarViewWithSection, (view, index) =>
						// eslint-disable-next-line no-nested-ternary
						view.visible ? (
							<React.Fragment key={index}>
								{view?.section === undefined && (
									<PrimaryBarElement
										key={view?.id}
										onClick={(): void => history.push(`/${routes[view?.id]}`)}
										view={view}
										isExpanded={isOpen}
										active={activeRoute?.id === view?.id}
									/>
								)}
								{view?.section && isOpen && (
									<>
										<Row
											mainAlignment="flex-start"
											crossAlignment="flex-start"
											width="100%"
											padding={{ left: 'large', right: 'large' }}
										>
											<Text size="small" weight="bold" color="#CFD5DC">
												<Padding top="large" bottom="small">
													{view?.section?.label}
												</Padding>
											</Text>
											<Divider></Divider>
										</Row>
									</>
								)}
								{view?.section && !isOpen && view?.children && (
									<Container height="auto" padding={{ left: 'medium', right: 'medium' }}>
										<Divider></Divider>
									</Container>
								)}
								{view?.children &&
									view?.children.length > 0 &&
									map(view?.children, (item) => (
										<PrimaryBarElement
											key={item?.id}
											onClick={(): void => {
												history.push(`/${routes[item?.id]}`);
											}}
											view={item}
											isExpanded={isOpen}
											active={activeRoute?.id === item?.id}
										/>
									))}
							</React.Fragment>
						) : null
					)}
				</Container>
				<Container mainAlignment="flex-end" height="fit">
					{allowShowFeedback && (
						<PrimaryBarRow
							width="fill"
							mainAlignment="flex-start"
							onClick={(): void => {
								useContextBridge.getState().packageDependentFunctions?.addBoard('feedbacks')(
									'/feedback/',
									{ title: t('label.feedback', 'Feedback') }
								);
							}}
						>
							<BadgeWrap badge={{ show: false, count: 0 }} isExpanded={isOpen}>
								<PrimaryBarButton
									type="ghost"
									color={'text'}
									icon="MessageSquareOutline"
									size="large"
									onClick={(): void => {
										null;
									}}
								/>
							</BadgeWrap>
						</PrimaryBarRow>
					)}
					{accessories.map((v) => (
						<PrimaryBarAccessoryElement view={v} key={v?.id} />
					))}
					<ToggleBoardIcon />
				</Container>
			</PrimaryBarContainer>
			<Collapser onClick={onCollapserClick} open={isOpen} />
		</>
	);
};

export default ShellPrimaryBar;
