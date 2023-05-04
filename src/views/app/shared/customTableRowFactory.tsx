/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Text, Checkbox } from '@zextras/carbonio-design-system';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CSVDownload } from 'react-csv';
import styled, { css, SimpleInterpolation } from 'styled-components';

const TableRow = styled.tr<{
	selected?: boolean;
	highlight?: boolean;
	showCheckbox?: boolean;
	clickable?: boolean;
}>`
	transition: background-color 0.2s ease-out;
	&:nth-child(odd) {
		background-color: ${({ theme }): string => theme.palette.gray6.regular};
		&:hover {
			background-color: ${({ theme }): string => theme.palette.gray6.hover};
		}
	}
	&:nth-child(even) {
		background-color: ${({ theme }): string => theme.palette.gray5.regular};
		&:hover {
			background-color: ${({ theme }): string => theme.palette.gray5.hover};
		}
	}
	${({ selected, highlight, theme }): SimpleInterpolation =>
		(selected || highlight) &&
		css`
			background-color: ${theme.palette.highlight.regular} !important;
		`};
	${({ clickable, showCheckbox }): SimpleInterpolation =>
		(clickable === true || (typeof clickable === 'undefined' && showCheckbox === false)) &&
		css`
			cursor: pointer;
		`};
`;

type TRow = {
	id: string;
	/** Each column can be a string or a React component */
	columns: Array<string | React.ReactElement>;
	/** Whether to highlight this row */
	highlight?: boolean;
	/** Whether the row is clickable */
	clickable?: boolean;
	/** Row click callback */
	onClick?: React.ReactEventHandler;
	/** Index/counter of the row shown as first column when checkboxes are hidden */
	index?: number;
};

interface TRowProps {
	index: number;
	row: TRow;
	onChange: (id: string) => void;
	selected: boolean;
	selectionMode: boolean;
	multiSelect: boolean;
	showCheckbox: boolean;
}

const CustomRowFactory = ({
	index,
	row,
	onChange,
	selected,
	selectionMode,
	multiSelect,
	showCheckbox
}: TRowProps): JSX.Element => {
	const trRef = useRef<HTMLTableRowElement>(null);
	const ckbRef = useRef<HTMLDivElement>(null);
	const [showCkb, setShowCkb] = useState<boolean>(selected || selectionMode);
	const clickableRow = useMemo(
		() => (!showCheckbox && typeof row.clickable === undefined) || row.clickable,
		[showCheckbox, row.clickable]
	);

	const _onChange = (): void => {
		!clickableRow && onChange(row.id);
	};

	const onClick = useCallback<React.ReactEventHandler>(
		(e) => {
			showCheckbox &&
				ckbRef.current &&
				e.target !== ckbRef.current &&
				!ckbRef.current.contains(e.target as Node | null) &&
				row.onClick &&
				row.onClick(e);
			clickableRow && onChange(row.id);
		},
		[row, onChange, clickableRow, showCheckbox]
	);

	const displayCheckbox = useCallback(() => {
		setShowCkb(true);
	}, []);

	const hideCheckbox = useCallback(() => {
		setShowCkb(false);
	}, []);

	useEffect(() => {
		const refSave = trRef.current;
		if (refSave && showCheckbox) {
			refSave.addEventListener('mouseenter', displayCheckbox);
			refSave.addEventListener('mouseleave', hideCheckbox);
			refSave.addEventListener('focus', displayCheckbox);
			refSave.addEventListener('blur', hideCheckbox);
		}
		return (): void => {
			if (refSave) {
				refSave.removeEventListener('mouseenter', displayCheckbox);
				refSave.removeEventListener('mouseleave', hideCheckbox);
				refSave.removeEventListener('focus', displayCheckbox);
				refSave.removeEventListener('blur', hideCheckbox);
			}
		};
	}, [displayCheckbox, hideCheckbox, showCheckbox]);

	const rowData = useMemo(
		() =>
			row.columns.map((column, i) => (
				<td style={{ height: '2.5rem', cursor: 'pointer' }} key={i}>
					{typeof column === 'string' ? <Text>{column}</Text> : column}
				</td>
			)),
		[row.columns]
	);
	return (
		<TableRow
			ref={trRef}
			onClick={onClick}
			selected={selected}
			highlight={row.highlight}
			clickable={row.clickable}
			showCheckbox={showCheckbox}
		>
			<td width="1.875rem" height="1.875rem" align="center">
				{showCheckbox && (showCkb || selected || (multiSelect && selectionMode)) ? (
					<Checkbox
						ref={ckbRef}
						size={'small'}
						value={selected}
						onClick={_onChange}
						iconColor={(multiSelect && selectionMode) || selected ? 'primary' : 'text'}
					/>
				) : (
					<Text>{index}</Text>
				)}
			</td>
			{rowData}
		</TableRow>
	);
};

export default CustomRowFactory;
