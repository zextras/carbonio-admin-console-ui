/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useEffect,useState } from 'react';

import { useCombinedRefs } from '../useCombinedRefs';
import { useIntersectionObserver } from '../useIntersectionObserver/useIntersectionObserver';

const useIsVisible = <T extends HTMLElement>(
	containerRef?: React.RefObject<HTMLDivElement | Document | null>,
	itemRef?: React.Ref<T>,
	intersectionObserverInitOptions?: IntersectionObserverInit
): [boolean, React.RefObject<T | null>] => {
	const [visible, setVisible] = useState(false);
	const ref = useCombinedRefs(itemRef ?? null);

	const onIntersect = useCallback((entry: IntersectionObserverEntry) => {
		setVisible(entry.isIntersecting);
	}, []);

	const { observe, unobserve } = useIntersectionObserver(
		containerRef,
		onIntersect,
		intersectionObserverInitOptions
	);

	useEffect(() => {
		const element = ref.current;
		if (element) {
			observe(element);
		}

		return (): void => {
			if (element) {
				unobserve(element);
			}
		};
	}, [observe, ref, unobserve]);

	return [visible, ref];
};

export { useIsVisible };
