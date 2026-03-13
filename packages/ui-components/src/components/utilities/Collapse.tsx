/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { HTMLAttributes, useMemo } from 'react';

import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import styles from './Collapse.module.css';
import { Transition } from './Transition';

type CollapseProps = HTMLAttributes<HTMLDivElement> & {
	open: boolean;
	children: React.ReactNode | React.ReactNode[];
	ref?: React.Ref<HTMLDivElement>;
};

export const Collapse = ({ children, open, ref, ...rest }: CollapseProps) => {
	const collapseRef = useCombinedRefs<HTMLElement>(ref);

	const propToTransition = 'height';

	const propScrollLabel = useMemo<`scroll${Capitalize<typeof propToTransition>}`>(
		() =>
			`scroll${
				(propToTransition.charAt(0).toUpperCase() + propToTransition.slice(1)) as Capitalize<
					typeof propToTransition
				>
			}`,
		[propToTransition],
	);

	return (
		<Transition
			ref={collapseRef}
			apply={open}
			from={{
				[propToTransition]: '0px',
			}}
			to={{
				[propToTransition]: (): string =>
					`${collapseRef.current ? collapseRef.current[propScrollLabel] : 0}px`,
				visibility: 'visible',
			}}
			end={{
				[propToTransition]: 'auto',
				visibility: 'visible',
				pointerEvents: 'auto',
			}}
		>
			<div className={styles.collapse} {...rest}>
				{children}
			</div>
		</Transition>
	);
};
