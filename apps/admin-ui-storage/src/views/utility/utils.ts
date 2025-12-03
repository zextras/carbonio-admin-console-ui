/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { type THeader } from '@zextras/carbonio-design-system';
import { TFunction } from 'i18next';

export const BucketTypeItems = (t: TFunction): Array<{ value: string; label: string }> => [
	{
		label: t('buckets.s3_types.alibaba_cloud_s3', 'Alibaba Cloud S3'),
		value: 'Alibaba'
	},
	{
		label: t('buckets.s3_types.amazone_web_service_s3', 'Amazon Web Service S3'),
		value: 'S3'
	},
	{
		label: t('buckets.s3_types.ceph', 'Ceph'),
		value: 'Ceph'
	},
	{
		label: t('buckets.s3_types.cloudian_s3', 'Cloudian S3'),
		value: 'Cloudian'
	},
	{
		label: t('buckets.s3_types.custom_s3', 'Custom S3'),
		value: 'Custom_S3'
	},
	{
		label: t('buckets.s3_types.emc_s3', 'EMC S3'),
		value: 'EMC'
	},
	{
		label: t('buckets.s3_types.openio_s3', 'OpenIO S3'),
		value: 'OpenIO'
	},
	{
		label: t('buckets.s3_types.scality_s3', 'Scality S3'),
		value: 'ScalityS3'
	},
	{
		label: t('buckets.s3_types.yandex_s3', 'Yandex S3'),
		value: 'Yandex'
	},
	{
		label: t('buckets.s3_types.minio', 'minIO'),
		value: 'Minio'
	}
];

export const volTableHeader = (t: TFunction, isAdvanced: boolean): THeader[] =>
	[
		{
			id: 'id',
			label: t('volume.volume_header.id', 'ID'),
			width: '5%',
			bold: true,
			align: 'left'
		},
		{
			id: 'name',
			label: t('volume.volume_header.name', 'Name'),
			width: '30%',
			bold: true,
			align: 'left'
		},
		isAdvanced && {
			id: 'storeType',
			label: t('volume.volume_header.storageType', 'Storage Type'),
			width: '25%',
			bold: true,
			align: 'left'
		},
		{
			id: 'path',
			label: t('volume.volume_header.path', 'Path'),
			width: '30%',
			bold: true,
			align: 'left'
		},
		{
			id: 'current',
			label: t('volume.volume_header.current', 'Current'),
			width: '18%',
			align: 'left',
			bold: true
		},
		{
			id: 'compression',
			label: t('volume.volume_header.compression', 'Compression'),
			width: '25%',
			align: 'left',
			bold: true
		}
	].filter(Boolean) as THeader[];

export const indexerHeaders = (
	t: TFunction,
	isAdvanced: boolean
): Array<{
	id: string;
	label: string;
	width: string;
	bold: boolean;
	align: string;
}> =>
	[
		{
			id: 'id',
			label: t('volume.volume_indexer_header.id', 'ID'),
			width: '5%',
			bold: true,
			align: 'left'
		},
		{
			id: 'name',
			label: t('volume.volume_indexer_header.name', 'Name'),
			width: '30%',
			bold: true,
			align: 'left'
		},
		isAdvanced && {
			id: 'storeType',
			label: t('volume.volume_header.storageType', 'Storage Type'),
			width: '25%',
			bold: true,
			align: 'left'
		},
		{
			id: 'path',
			label: t('volume.volume_indexer_header.path', 'Path'),
			width: '30%',
			align: 'left',
			bold: true
		},
		{
			id: 'current',
			label: t('volume.volume_indexer_header.current', 'Current'),
			width: '45%',
			align: 'left',
			bold: true
		}
	].filter(Boolean) as Array<{
		id: string;
		label: string;
		width: string;
		bold: boolean;
		align: string;
	}>;

export const volumeTypeList = (
	t: TFunction,
	isAdvanced?: boolean
): Array<{ label: string; value: number }> =>
	[
		{
			label: t('volume.volume_type.primary', 'Primary'),
			value: 1
		},
		isAdvanced && {
			label: t('volume.volume_type.secondary', 'Secondary'),
			value: 2
		},
		{
			label: t('volume.volume_type.index', 'Index'),
			value: 10
		}
	].filter(Boolean) as Array<{ label: string; value: number }>;

export const volumeAllocationList = (t: TFunction): Array<{ label: string; value: number }> => [
	{
		label: t('volume.volume_allocation_list.local_block_device', 'Local Block Device'),
		value: 1
	},
	{
		label: t('volume.volume_allocation_list.object_storage', 'Object Storage'),
		value: 2
	}
];

export const headerAdvanced = (
	t: TFunction
): Array<{
	id: string;
	label: string;
	width: string;
	bold: boolean;
	i18nAllLabel: string;
}> => [
	{
		id: 'Server',
		label: t('volume.server_list_header.server', 'Server'),
		i18nAllLabel: 'All',
		width: '187px',
		bold: true
	},
	{
		id: 'Primary',
		label: t('volume.server_list_header.primary', 'Primary'),
		i18nAllLabel: 'All',
		width: '87px',
		bold: true
	},
	{
		id: 'Secondary',
		label: t('volume.server_list_header.secondary', 'Secondary'),
		i18nAllLabel: 'All',
		width: '87px',
		bold: true
	},
	{
		id: 'Index',
		label: t('volume.server_list_header.index', 'Index'),
		i18nAllLabel: 'All',
		width: '87px',
		bold: true
	},
	{
		id: 'HSM Scheduling',
		label: t('volume.server_list_header.HSM Scheduling', 'HSM Scheduling'),
		i18nAllLabel: 'All',
		width: '138px',
		bold: true
	},
	{
		id: 'Indexer',
		label: t('volume.server_list_header.indexer', 'Indexer'),
		i18nAllLabel: 'All',
		width: '100px',
		bold: true
	},
	{
		id: 'Description',
		label: t('volume.server_list_header.description', 'Description'),
		i18nAllLabel: 'All',
		width: '177px',
		bold: true
	}
];

export const BucketRegions = (t: TFunction): Array<{ value: string; label: string }> => [
	{
		label: t('buckets.amazon_regions.af_south_1', 'Africa (Cape Town)'),
		value: 'AF_SOUTH_1'
	},
	{
		label: t('buckets.amazon_regions.ap_east_1', 'Asia Pacific (Hong Kong)'),
		value: 'AP_EAST_1'
	},
	{
		label: t('buckets.amazon_regions.ap_northeast_1', 'Asia Pacific (Tokyo)'),
		value: 'AP_NORTHEAST_1'
	},
	{
		label: t('buckets.amazon_regions.ap_northeast_2', 'Asia Pacific (Seoul)'),
		value: 'AP_NORTHEAST_2'
	},
	{
		label: t('buckets.amazon_regions.ap_south_1', 'Asia Pacific (Mumbai)'),
		value: 'AP_SOUTH_1'
	},
	{
		label: t('buckets.amazon_regions.ap_southeast_1', 'Asia Pacific (Singapore)'),
		value: 'AP_SOUTHEAST_1'
	},
	{
		label: t('buckets.amazon_regions.ap_southeast_2', 'Asia Pacific (Sydney)'),
		value: 'AP_SOUTHEAST_2'
	},
	{
		label: t('buckets.amazon_regions.ca_central_1', 'Canada (Central)'),
		value: 'CA_CENTRAL_1'
	},
	{
		label: t('buckets.amazon_regions.cn_north_1', 'China (Beijing)'),
		value: 'CN_NORTH_1'
	},
	{
		label: t('buckets.amazon_regions.cn_northwest_1', 'China (Ningxia)'),
		value: 'CN_NORTHWEST_1'
	},
	{
		label: t('buckets.amazon_regions.eu_central_1', 'EU (Frankfurt)'),
		value: 'EU_CENTRAL_1'
	},
	{
		label: t('buckets.amazon_regions.eu_north_1', 'EU (Stockholm)'),
		value: 'EU_NORTH_1'
	},
	{
		label: t('buckets.amazon_regions.eu_south_1', 'EU (Milan)'),
		value: 'EU_SOUTH_1'
	},
	{
		label: t('buckets.amazon_regions.eu_west_1', 'EU (Ireland)'),
		value: 'EU_WEST_1'
	},
	{
		label: t('buckets.amazon_regions.eu_west_2', 'EU (London)'),
		value: 'EU_WEST_2'
	},
	{
		label: t('buckets.amazon_regions.eu_west_3', 'EU (Paris)'),
		value: 'EU_WEST_3'
	},
	{
		label: t('buckets.amazon_regions.eu_south_2', 'EU (Spain)'),
		value: 'EU_SOUTH_2'
	},
	{
		label: t('buckets.amazon_regions.govcloud', 'AWS GovCloud (US)'),
		value: 'GovCloud'
	},
	{
		label: t('buckets.amazon_regions.me_south_1', 'Middle East (Bahrain)'),
		value: 'ME_SOUTH_1'
	},
	{
		label: t('buckets.amazon_regions.sa_east_1', 'South America (Sao Paulo)'),
		value: 'SA_EAST_1'
	},
	{
		label: t('buckets.amazon_regions.us_east_1', 'US East (N. Virginia)'),
		value: 'US_EAST_1'
	},
	{
		label: t('buckets.amazon_regions.us_east_2', 'US East (Ohio)'),
		value: 'US_EAST_2'
	},
	{
		label: t('buckets.amazon_regions.us_gov_east_1', 'AWS GovCloud (US-East)'),
		value: 'US_GOV_EAST_1'
	},
	{
		label: t('buckets.amazon_regions.us_west_1', 'US West (N. California)'),
		value: 'US_WEST_1'
	},
	{
		label: t('buckets.amazon_regions.us_west_2', 'US West (Oregon)'),
		value: 'US_WEST_2'
	}
];

export const BucketRegionsInAlibaba = (t: TFunction): Array<{ value: string; label: string }> => [
	{
		label: t('buckets.alibaba_regions.cn_hangzhou', 'China (Hangzhou)'),
		value: 'oss-cn-hangzhou'
	},
	{
		label: t('buckets.alibaba_regions.cn_shanghai', 'China (Shanghai)'),
		value: 'oss-cn-shanghai'
	},
	{
		label: t('buckets.alibaba_regions.cn_qingdao', 'China (Qingdao)'),
		value: 'oss-cn-qingdao'
	},
	{
		label: t('buckets.alibaba_regions.cn_beijing', 'China (Beijing)'),
		value: 'oss-cn-beijing'
	},
	{
		label: t('buckets.alibaba_regions.cn_zhangjiakou', 'China (Zhangjiakou)'),
		value: 'oss-cn-zhangjiakou'
	},
	{
		label: t('buckets.alibaba_regions.cn_huhehaote', 'China (Hohhot)'),
		value: 'oss-cn-huhehaote'
	},
	{
		label: t('buckets.alibaba_regions.cn_shenzhen', 'China (Shenzhen)'),
		value: 'oss-cn-shenzhen'
	},
	{
		label: t('buckets.alibaba_regions.cn_chengdu', 'China (Chengdu)'),
		value: 'oss-cn-chengdu'
	},
	{
		label: t('buckets.alibaba_regions.cn_hongkong', 'China (Hong Kong)'),
		value: 'oss-cn-hongkong'
	},
	{
		label: t('buckets.alibaba_regions.ap_northeast_1', 'Japan (Tokyo)'),
		value: 'oss-ap-northeast-1'
	},
	{
		label: t('buckets.alibaba_regions.ap_southeast_1', 'Singapore'),
		value: 'oss-ap-southeast-1'
	},
	{
		label: t('buckets.alibaba_regions.ap_southeast_2', 'Australia (Sydney)'),
		value: 'oss-ap-southeast-2'
	},
	{
		label: t('buckets.alibaba_regions.ap_southeast_3', 'Malaysia (Kuala Lumpur)'),
		value: 'oss-ap-southeast-3'
	},
	{
		label: t('buckets.alibaba_regions.ap_southeast_5', 'Indonesia (Jakarta)'),
		value: 'oss-ap-southeast-5'
	},
	{
		label: t('buckets.alibaba_regions.ap_south_1', 'India (Mumbai)'),
		value: 'oss-ap-south-1'
	},
	{
		label: t('buckets.alibaba_regions.us_west_1', 'US (Silicon Valley)'),
		value: 'oss-us-west-1'
	},
	{
		label: t('buckets.alibaba_regions.us_east_1', 'US (Virginia)'),
		value: 'oss-us-east-1'
	},
	{
		label: t('buckets.alibaba_regions.eu_central_1', 'Germany (Frankfurt)'),
		value: 'oss-eu-central-1'
	},
	{
		label: t('buckets.alibaba_regions.eu_west_1', 'UK (London)'),
		value: 'oss-eu-west-1'
	},
	{
		label: t('buckets.alibaba_regions.me_east_1', 'UAE Dubai'),
		value: 'oss-me-east-1'
	}
];
