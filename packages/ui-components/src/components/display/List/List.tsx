/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { useCombinedRefs } from '../../../hooks/useCombinedRefs';
import { useIntersectionObserver } from '../../../hooks/useIntersectionObserver/useIntersectionObserver';
import { getKeyboardPreset, KeyboardPresetObj, useKeyboard } from '../../../hooks/useKeyboard';
import { AnyColor } from '../../../types/utils';
import { Container, ContainerProps } from '../../layout/Container';
import { ListItemProps } from '../ListItem';
import styles from './List.module.css';

type ListProps = ContainerProps & {
	/** intersectionObserverInitOptions of the intersectionObserver inside BottomElement */
	intersectionObserverInitOptions?: IntersectionObserverInit;
	/** callback to be executed when the bottom element is rendered */
	onListBottom?: () => void;
	/** List background color */
	background?: AnyColor;
	/** Selected list item background color */
	selectedBackground?: AnyColor;
	/** Active List item background color */
	activeBackground?: AnyColor;
	/** Disable keyboard shortcuts */
	keyboardShortcutsIsDisabled?: boolean;
	/** List items */
	children: React.ReactElement<ListItemProps>[];
};

const List = ({
	onListBottom,
	keyboardShortcutsIsDisabled,
	children,
	background = 'transparent',
	selectedBackground = 'gray5',
	activeBackground = 'highlight',
	intersectionObserverInitOptions,
	ref,
	...rest
}: ListProps) => {
	const listRef = useCombinedRefs(ref);

	const keyEvents = useMemo<KeyboardPresetObj[]>(
		() => (keyboardShortcutsIsDisabled ? [] : getKeyboardPreset('list', undefined, listRef)),
		[listRef, keyboardShortcutsIsDisabled]
	);
	useKeyboard(listRef, keyEvents);

	const bottomElementRef = useRef<HTMLDivElement>(null);

	const listItems = useMemo(
		() =>
			children.map((child) =>
				React.cloneElement(child, {
					listRef: listRef as React.RefObject<HTMLDivElement>,
					selectedBackground: child.props.selectedBackground ?? selectedBackground,
					activeBackground: child.props.activeBackground ?? activeBackground,
					background: child.props.background ?? background
				})
			),
		[activeBackground, background, children, listRef, selectedBackground]
	);

	const onListBottomRef = useRef(onListBottom);

	useEffect(() => {
		onListBottomRef.current = onListBottom;
	}, [onListBottom]);

	const onIntersect = useCallback((entry: IntersectionObserverEntry) => {
		if (entry.target === bottomElementRef.current && entry.isIntersecting) {
			onListBottomRef.current?.();
		}
	}, []);

	const { observe, unobserve } = useIntersectionObserver(
		listRef,
		onIntersect,
		intersectionObserverInitOptions
	);

	useEffect(() => {
		const bottomElement = bottomElementRef.current;
		if (bottomElement) {
			observe(bottomElement);
		}

		return (): void => {
			if (bottomElement) {
				unobserve(bottomElement);
			}
		};
	}, [children, observe, unobserve]);

	return (
		<Container ref={listRef} className={styles.externalContainer} {...rest}>
			<Container
				orientation="vertical"
				mainAlignment="flex-start"
				crossAlignment="stretch"
				className={styles.list}
			>
				{listItems}
				{onListBottom && (
					<div
						ref={bottomElementRef}
						style={{ minHeight: '4px', minWidth: '1px' }}
						data-testid={'list-bottom-element'}
					/>
				)}
			</Container>
		</Container>
	);
};

/**
 * @deprecated ListV2 has been renamed to List
 */
const ListV2 = List;
/**
 * @deprecated ListV2Props has been renamed to ListProps
 */
type ListV2Props = ListProps;

export { List, type ListProps, ListV2, type ListV2Props };
