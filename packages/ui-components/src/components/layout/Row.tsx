/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styled, { css, SimpleInterpolation } from 'styled-components';

import { With$Prefix } from '../../types/utils';
import { Container, ContainerProps } from './Container';

type RowProps = ContainerProps & {
	display?: string;
	order?: 'unset' | number;
	takeAvailableSpace?: boolean;
	ref?: React.Ref<HTMLDivElement>;
};

const ContainerEl = styled(Container)<With$Prefix<RowProps>>`
	display: ${({ $display }): SimpleInterpolation => $display};
	order: ${({ $order }): SimpleInterpolation => $order};
	${({ $takeAvailableSpace }): SimpleInterpolation =>
		$takeAvailableSpace &&
		css`
			min-width: 0;
			flex-basis: 0;
			flex-grow: 1;
		`};
`;

const Row = ({
	display = 'flex',
	orientation = 'horizontal',
	borderRadius = 'none',
	height = 'auto',
	width = 'auto',
	wrap = 'wrap',
	flexBasis = 'unset',
	flexGrow = 'unset',
	flexShrink = 1,
	order = 'unset',
	takeAvailableSpace = false,
	maxWidth = '100%',
	children,
	ref,
	...rest
}: RowProps) => {
	return (
		<ContainerEl
			ref={ref}
			orientation={orientation}
			borderRadius={borderRadius}
			height={height}
			width={width}
			wrap={wrap}
			flexBasis={flexBasis}
			flexGrow={flexGrow}
			flexShrink={flexShrink}
			maxWidth={maxWidth}
			$display={display}
			$order={order}
			$takeAvailableSpace={takeAvailableSpace}
			{...rest}
		>
			{children}
		</ContainerEl>
	);
};

export { Row };
export type { RowProps };
