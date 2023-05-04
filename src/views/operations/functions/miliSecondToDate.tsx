/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AM, PM } from '../../../constants';

const MiliSecondToDate: any = (time: any) => {
	const date = new Date(time).toLocaleDateString();
	let hours = new Date(time).getHours();
	const amOrPm = hours >= 12 ? PM : AM;
	hours = hours % 12 || 12;
	const minutes = new Date(time).getMinutes();
	const finalTime = `${hours}:${minutes} ${amOrPm}`;

	return `${date} - ${finalTime}`;
};

export default MiliSecondToDate;
