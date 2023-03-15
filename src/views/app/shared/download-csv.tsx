/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';
import { CSVDownload } from 'react-csv';

const DownloadCSV: FC<{ data: any; header: any }> = ({ data, header }) => (
	<CSVDownload data={data} headers={header} target="_blank" />
);

export default DownloadCSV;
