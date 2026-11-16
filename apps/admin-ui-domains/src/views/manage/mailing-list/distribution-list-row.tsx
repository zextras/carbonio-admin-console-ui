/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

function findAttrContent(item: any, name: string): string | undefined {
	return item?.a?.find((attribute: any) => attribute?.n === name)?._content;
}

type CellProps = {
	weight: 'regular' | 'light';
	onCellClick: (e: { stopPropagation: () => void }) => void;
	children: string | undefined;
};

/**
 * Rendered straight into the table cell (no flex wrapper) so the block-level ds-text takes the
 * fixed column width and truncates with an ellipsis instead of spilling into the next column.
 */
const DistributionListCell = ({ weight, onCellClick, children }: CellProps) => (
	<ds-text
		as="span"
		size="small"
		weight={weight}
		color="gray0"
		onClick={(e: { stopPropagation: () => void }): void => {
			e.stopPropagation();
			onCellClick(e);
		}}
	>
		{children || '\u00a0'}
	</ds-text>
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
				weight="regular"
				onCellClick={onCellClick}
			>
				{findAttrContent(item, 'displayName')}
			</DistributionListCell>,
			<DistributionListCell
				key={`${item?.id}-address-child`}
				weight="light"
				onCellClick={onCellClick}
			>
				{item?.name}
			</DistributionListCell>,
			<DistributionListCell
				key={`${item?.id}-status-child`}
				weight="light"
				onCellClick={onCellClick}
			>
				{findAttrContent(item, 'zimbraMailStatus') === 'enabled'
					? deps.canReceiveLabel
					: deps.cantReceiveLabel}
			</DistributionListCell>,
			<DistributionListCell
				key={`${item?.id}-dynamic-child`}
				weight="light"
				onCellClick={onCellClick}
			>
				{item?.dynamic ? deps.yesLabel : deps.noLabel}
			</DistributionListCell>,
			<DistributionListCell
				key={`${item?.id}-gal-child`}
				weight="light"
				onCellClick={onCellClick}
			>
				{findAttrContent(item, 'zimbraHideInGal') === 'TRUE' ? deps.noLabel : deps.yesLabel}
			</DistributionListCell>,
			<DistributionListCell
				key={`${item?.id}-description-child`}
				weight="light"
				onCellClick={onCellClick}
			>
				{findAttrContent(item, 'description')}
			</DistributionListCell>
		]
	};
}
