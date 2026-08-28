/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container } from '@zextras/ui-components';

function findAttrContent(item: any, name: string): string | undefined {
	return item?.a?.find((attribute: any) => attribute?.n === name)?._content;
}

type CellProps = {
	cellKey: string;
	weight: 'regular' | 'light';
	onCellClick: (e: { stopPropagation: () => void }) => void;
	children: string | undefined;
};

const DistributionListCell = ({ cellKey, weight, onCellClick, children }: CellProps) => (
	<Container
		crossAlignment="flex-start"
		key={cellKey}
		style={{ cursor: 'pointer' }}
		onClick={(e: { stopPropagation: () => void }): void => {
			e.stopPropagation();
			onCellClick(e);
		}}
	>
		<ds-text as="span" size="small" weight={weight} color="gray0">
			{children}
		</ds-text>
	</Container>
);

export type BuildDistributionListRowDeps = {
	canReceiveLabel: string;
	cantReceiveLabel: string;
	yesLabel: string;
	noLabel: string;
	onCellClick: (item: any, e: { stopPropagation: () => void }) => void;
};

export function buildDistributionListRow(item: any, deps: BuildDistributionListRowDeps) {
	const onCellClick = (e: { stopPropagation: () => void }): void => deps.onCellClick(item, e);

	return {
		id: item?.id,
		columns: [
			<DistributionListCell
				key={`${item?.id}-display-child`}
				cellKey={item?.id}
				weight="regular"
				onCellClick={onCellClick}
			>
				{findAttrContent(item, 'displayName')}
			</DistributionListCell>,
			<DistributionListCell
				key={`${item?.id}-address-child`}
				cellKey={`${item?.id}-address`}
				weight="light"
				onCellClick={onCellClick}
			>
				{item?.name}
			</DistributionListCell>,
			<DistributionListCell
				key={`${item?.id}-status-child`}
				cellKey={`${item?.id}-status`}
				weight="light"
				onCellClick={onCellClick}
			>
				{findAttrContent(item, 'zimbraMailStatus') === 'enabled'
					? deps.canReceiveLabel
					: deps.cantReceiveLabel}
			</DistributionListCell>,
			<DistributionListCell
				key={`${item?.id}-dynamic-child`}
				cellKey={`${item?.id}-dynamic`}
				weight="light"
				onCellClick={onCellClick}
			>
				{item?.dynamic ? deps.yesLabel : deps.noLabel}
			</DistributionListCell>,
			<DistributionListCell
				key={`${item?.id}-gal-child`}
				cellKey={`${item?.id}-gal`}
				weight="light"
				onCellClick={onCellClick}
			>
				{findAttrContent(item, 'zimbraHideInGal') === 'TRUE' ? deps.noLabel : deps.yesLabel}
			</DistributionListCell>,
			<DistributionListCell
				key={`${item?.id}-description-child`}
				cellKey={`${item?.id}-description`}
				weight="light"
				onCellClick={onCellClick}
			>
				{findAttrContent(item, 'description')}
			</DistributionListCell>
		]
	};
}
