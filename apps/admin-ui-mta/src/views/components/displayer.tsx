/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';

import { Row, Button, Padding, Tooltip } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

const Displayer: FC<{ buttons: Array<any>; pinIcon: boolean }> = ({ buttons, pinIcon }): any => {
	const { t } = useTranslation();
	const rightAlignButtons = buttons.filter((button): any => button.align === 'right');
	const leftIcons = buttons.filter((button): any => button.align === 'left');
	return (
		<Row
			orientation="horizontal"
			mainAlignment="space-between"
			width="100%"
			background="white"
			padding={{ all: 'large' }}
			style={{ position: pinIcon ? 'sticky' : 'relative', top: '0', zIndex: '1' }}
		>
			<Row orientation="horizontal" mainAlignment="flex-end">
				{leftIcons?.map((button, i) => (
					<Tooltip
						placement="bottom"
						label={
							pinIcon
								? t(
										'label.click_to_make_the_button_bar_scroll_with_the_page',
										'Click to make the button bar scroll with the page'
								  )
								: t(
										'label.click_to_make_the_button_bar_sticky',
										'Click to make the button bar sticky'
								  )
						}
						key={i}
					>
						<Button
							type="ghost"
							color={'text'}
							size={'extralarge'}
							icon={button?.icon}
							onClick={(): void => {
								button?.onClick();
							}}
						/>
					</Tooltip>
				))}
			</Row>

			<Row orientation="horizontal" mainAlignment="flex-end">
				{rightAlignButtons?.map((button, i) => (
					<Padding key={i} left="large">
						<Tooltip placement="bottom" label={button.tooltiplabel} disabled={!button.tooltiplabel}>
							<Button
								loading={button?.loading ? button?.loading : false}
								icon={button?.icon ? button?.icon : ''}
								size={button?.size ? button?.size : 'extralarge'}
								disabled={button?.disabled ? button?.disabled : false}
								type={button?.type ? button?.type : 'outlined'}
								label={button?.label ? button?.label : ''}
								color={button?.color ? button?.color : 'primary'}
								onClick={(): void => {
									button?.onClick();
								}}
							/>
						</Tooltip>
					</Padding>
				))}
			</Row>
		</Row>
	);
};

export default Displayer;
