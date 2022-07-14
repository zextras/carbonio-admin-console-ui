/* eslint-disable no-shadow */
/* eslint-disable @typescript-eslint/no-use-before-define */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import {
	Container,
	Input,
	Row,
	IconButton,
	Divider,
	Padding,
	PasswordInput,
	Button,
	Text,
	Table,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { find } from 'lodash';
import { BucketRegions, BucketTypeItems } from '../utility/utils';
import { fetchSoap } from '../../services/bucket-service';

const DetailsHeaders = [
	{
		id: 'service',
		label: 'Service',
		width: '40%',
		bold: true
	},
	{
		id: 'version',
		label: 'Version',
		width: '30%',
		bold: true
	},
	{
		id: 'rtstatus',
		label: 'RT Status',
		width: '30%',
		bold: true
	},
	{
		id: 'type',
		label: 'Type',
		width: '30%',
		bold: true
	},
	{
		id: 'samrtstatus',
		label: 'SmartStaus',
		width: '20%',
		bold: true
	}
];
const serverItems = [
	{
		id: '1',
		name: 'myserver.name',
		version: '4.0.0',
		rtstatus: 'Stopped',
		type: 'local',
		samrtstatus: 'disbled'
	},
	{
		id: '1',
		name: 'myserver.name',
		version: '4.0.0',
		rtstatus: 'Enabled',
		type: 'local',
		samrtstatus: 'disbled'
	},
	{
		id: '1',
		name: 'myserver.name',
		version: '4.0.0',
		rtstatus: 'Stopped',
		type: 'local',
		samrtstatus: 'disbled'
	},
	{
		id: '1',
		name: 'myserver.name',
		version: '4.0.0',
		rtstatus: 'Enabled',
		type: 'local',
		samrtstatus: 'disbled'
	},
	{
		id: '1',
		name: 'myserver.name',
		version: '4.0.0',
		rtstatus: 'Stopped',
		type: 'local',
		samrtstatus: 'disbled'
	}
];

const ServerListTabel: FC<{ volumes: Array<any>; selectedRows: any; onSelectionChange: any }> = ({
	volumes,
	selectedRows,
	onSelectionChange
}) => {
	const tableRows = useMemo(
		() =>
			volumes.map((v, i) => ({
				id: v.id,
				columns: [
					<Text key={i}>{v.name}</Text>,
					<Text color="text" key={i}>
						{v.version}
					</Text>,
					<Text color="text" key={i}>
						{v.rtstatus}
					</Text>,
					<Text style={{ textTransform: 'capitalize' }} key={i}>
						{v.type}
					</Text>,
					<Text color="text" key={i}>
						{v.samrtstatus}
					</Text>
				],
				clickable: true
			})),
		[volumes]
	);

	return (
		<Container crossAlignment="flex-start">
			<Table
				headers={DetailsHeaders}
				rows={tableRows}
				showCheckbox={false}
				multiSelect={false}
				selectedRows={selectedRows}
				onSelectionChange={onSelectionChange}
			/>
			{tableRows.length === 0 && (
				<Row padding={{ top: 'extralarge', horizontal: 'extralarge' }} width="fill">
					<Text>Empty Table</Text>
				</Row>
			)}
		</Container>
	);
};

const DetailsPanel: FC<{
	setDetailsBucket: any;
	title: string;
	BucketDetail: any;
}> = ({ setDetailsBucket, title, BucketDetail }) => {
	const [t] = useTranslation();

	const [severSelection, setServerSelection] = useState([]);
	const [bucketType, setBucketType] = useState();
	const [regionData, setRegionData] = useState();
	const [verify, setVerify] = useState('primary');

	const [ButtonLabel, setButtonLabel] = useState(t('label.verify_connector', 'VERIFY CONNECTOR'));
	const [buttonIcon, setButtonIcon] = useState<string>('ActivityOutline');

	const createSnackbar = useSnackbar();
	const server = document.location.hostname; // 'nbm-s02.demo.zextras.io';

	const verifyConnector = useCallback(() => {
		fetchSoap('zextras', {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxCore',
			action: 'testS3Connection',
			targetServers: server,
			bucketId: BucketDetail.uuid
		}).then((res) => {
			const response = JSON.parse(res.response.content);
			if (response.ok && response.response[server] && response.response[server].ok) {
				setVerify('success');
			} else {
				setVerify('error');
				setButtonLabel(t('label.verify_connector_fail', ' VERIFICATION FAILED'));
				setButtonIcon('alert-triangle');
				createSnackbar({
					key: '1',
					type: 'error',
					label: t('label.verify_error', '{{name}}', {
						name: response.response[server].error
					})
				});
			}
		});
	}, [BucketDetail.uuid, createSnackbar, server, t]);

	useEffect(() => {
		const volumeObject: any = find(
			BucketTypeItems,
			(o) => o.value === BucketDetail.storeType
		)?.label;
		const regionValue: any = find(BucketRegions, (o) => o.value === BucketDetail.region)?.label;

		setBucketType(volumeObject);
		setRegionData(regionValue);
	}, [BucketDetail]);

	return (
		<Container background="gray6">
			<Row mainAlignment="flex-start" crossAlignment="center" width="100%" height="auto">
				<Row mainAlignment="flex-start" padding={{ all: 'large' }} takeAvailableSpace>
					<Text size="extralarge" weight="bold">
						{title}
					</Text>
				</Row>
				<Row padding={{ horizontal: 'small' }}>
					<IconButton
						icon="CloseOutline"
						color="gray1"
						onClick={(): any => setDetailsBucket(false)}
					/>
				</Row>
			</Row>
			<Divider />
			<Container padding={{ all: 'large' }} mainAlignment="flex-start" crossAlignment="flex-start">
				<Row padding={{ top: 'extralarge' }} width="100%">
					<Input label={t('buckets.bucket_type', 'Buckets Type')} value={bucketType} readOnly />
				</Row>
				<Row padding={{ top: 'large' }} width="100%">
					<Input
						label={t('label.descriptive_name', 'Descriptive Name')}
						value={BucketDetail.bucketName}
						readOnly
					/>
				</Row>
				<Row padding={{ top: 'large' }} width="100%">
					<Input label="Region" showCheckbox={false} value={regionData} readOnly />
				</Row>
				<Row width="100%" padding={{ top: 'large' }}>
					<Row width="48%" mainAlignment="flex-start">
						<PasswordInput
							label={t('label.access_key', 'Access Key')}
							value={BucketDetail.accessKey}
							readOnly
						/>
					</Row>
					<Padding width="4%" />
					<Row width="48%" mainAlignment="flex-end">
						<PasswordInput
							label={t('label.secret_key', 'Secret Key')}
							value={BucketDetail.secret}
							readOnly
						/>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'large' }}>
					<Button
						type="outlined"
						label={ButtonLabel}
						icon={buttonIcon}
						iconPlacement="right"
						size="fill"
						color={verify}
						onClick={verifyConnector}
					/>
				</Row>

				<Divider color="gray2" />
			</Container>
		</Container>
	);
};

export default DetailsPanel;
function setDetailsBucket(arg0: boolean): any {
	throw new Error('Function not implemented.');
}
