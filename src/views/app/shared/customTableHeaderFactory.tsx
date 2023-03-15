/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Text, Container, Select, Row, Icon, Checkbox } from '@zextras/carbonio-design-system';
import { isEmpty } from 'lodash';
import React, { FC, SVGProps, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CSVDownload } from 'react-csv';
import styled, { css, SimpleInterpolation } from 'styled-components';

export type IconComponent = (props: SVGProps<SVGSVGElement>) => JSX.Element;

export interface ThemeObj {
	icons: Record<string, IconComponent>;
}

export type DefaultTheme = ThemeObj;

type IconButtonProps = {
	icon: keyof DefaultTheme['icons'];
	onClick: (e: KeyboardEvent | React.MouseEvent<HTMLButtonElement>) => void;
};

type THeader = {
	id: string;
	label: string;
	align?: React.ThHTMLAttributes<HTMLTableHeaderCellElement>['align'];
	width?: string;
	i18nAllLabel?: string;
	bold?: boolean;
	items?: any;
	onChange: (value: string | null) => void;
};

interface THeaderProps {
	headers: THeader[];
	onChange: () => void;
	allSelected: boolean;
	selectionMode: boolean;
	multiSelect: boolean;
	showCheckbox: boolean;
}

type HeaderFactoryCustomProps = Omit<THeaderProps, 'headers'> & {
	headers: Array<
		THeaderProps['headers'][number] & {
			onClick?: IconButtonProps['onClick'];
			icon?: keyof DefaultTheme['icons'];
		}
	>;
};

const CustomHeaderFactory = ({
	headers,
	onChange,
	allSelected,
	selectionMode,
	multiSelect,
	showCheckbox
}: THeaderProps): JSX.Element => {
	const trRef = useRef<HTMLTableRowElement>(null);
	const [showCkb, setShowCkb] = useState(false);
	const LabelFactory = useCallback(
		({ label, open, focus, bold }: any) => (
			<Container
				orientation="horizontal"
				width="fill"
				crossAlignment="center"
				mainAlignment="space-between"
				borderRadius="half"
				padding={{
					vertical: 'small'
				}}
			>
				<Row
					takeAvailableSpace
					mainAlignment="unset"
					style={{ display: 'inline-table' }}
					width="auto"
				>
					<Text
						size="medium"
						weight={bold ? 'bold' : 'regular'}
						color={open || focus ? 'primary' : 'text'}
					>
						{label}
					</Text>
				</Row>
				<Container>
					<Icon
						size="medium"
						icon={open ? 'ChevronUpOutline' : 'ChevronDownOutline'}
						color={open || focus ? 'primary' : 'text'}
						style={{ alignSelf: 'center' }}
					/>
				</Container>
			</Container>
		),
		[]
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

	const headerData = useMemo(
		() =>
			headers.map((column) => {
				const hasItems = !isEmpty(column.items);
				return (
					<th
						key={column.id}
						align={column.align || 'left'}
						style={{ width: column?.width, height: '2.625rem' }}
					>
						{hasItems && (
							<Container width="4rem">
								<Select
									label={column.label}
									false
									items={column.items}
									dropdownWidth="auto"
									onChange={column.onChange}
									display={column.align ? 'inline-block' : 'block'}
									LabelFactory={(props: any): JSX.Element =>
										LabelFactory({ ...props, bold: column.bold })
									}
								/>
							</Container>
						)}
						{!hasItems && <Text weight={column.bold ? 'bold' : 'regular'}>{column.label}</Text>}
					</th>
				);
			}),
		[headers, LabelFactory]
	);
	return (
		<tr ref={trRef}>
			<th align="center" style={{ width: '30px' }}>
				{showCheckbox && multiSelect && (showCkb || selectionMode || allSelected) && (
					<Checkbox
						size={'small'}
						value={allSelected}
						onClick={onChange}
						iconColor={selectionMode ? 'primary' : 'text'}
					/>
				)}
			</th>
			{headerData}
		</tr>
	);
};

export default CustomHeaderFactory;
