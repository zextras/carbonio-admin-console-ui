/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AM, PM } from '../../../constants';

const MiliSecondToDate = (time: number): string => {
	const date = new Date(time);
	const formattedDate = date.toLocaleDateString();
	let hours = date.getHours();
	const amOrPm = hours >= 12 ? PM : AM;
	hours = hours % 12 || 12;
	const minutes = date.getMinutes();
	const finalTime = `${hours.toString().padStart(2, '0')}:${minutes
		.toString()
		.padStart(2, '0')} ${amOrPm}`;

	return `${formattedDate} - ${finalTime}`;
};

export default MiliSecondToDate;
