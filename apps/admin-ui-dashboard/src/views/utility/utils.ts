/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { SelectItem, type THeader } from '@zextras/carbonio-design-system';
import { TFunction } from 'i18next';
import { divide, multiply } from 'lodash';
import { useState } from 'react';

import { TwoFactorPolicy } from '../../../types';
import {
	ABQ_DISABLED,
	ACTIVE,
	CLOSED,
	INTERACTIVE,
	LOCKED,
	MAINTENANCE,
	MANAGE_NO_SEND,
	PENDING,
	PERMISSIVE,
	READ_MAILS_ONLY,
	SEND_MAILS_ONLY,
	SEND_READ_MAILS,
	SEND_READ_MANAGE_MAILS,
	STRICT
} from '../../constants';
import { Right, Rights } from '../../store/rights/store';

export const AccountStatus = (t: TFunction): Array<{ value: string; label: string }> => [
	{
		label: t('label.active', 'Active'),
		value: ACTIVE
	},
	{
		label: `${t('label.in_maintenance', 'In maintenance')} (${t(
			'label.login_is_disabled',
			'Login is disabled'
		)})`,
		value: MAINTENANCE
	},
	{
		label: `${t('label.locked', 'Locked')} (${t('label.login_is_disabled', 'Login is disabled')})`,
		value: LOCKED
	},
	{
		label: `${t('label.closed', 'Closed')} (${t('label.soft_deleted', 'Soft-deleted')})`,
		value: CLOSED
	},
	{
		label: `${t('label.pending', 'Pending')} (${t(
			'label.not_ready_to_be_active',
			'Not ready to be active'
		)})`,
		value: PENDING
	}
];

export const ABQStatus = (t: TFunction): Array<{ value: string; label: string }> => [
	{
		label: t('label.permissive', 'Permissive'),
		value: PERMISSIVE
	},
	{
		label: t('label.interactive', 'Interactive'),
		value: INTERACTIVE
	},
	{
		label: t('label.strict', 'Strict'),
		value: STRICT
	},
	{
		label: t('label.disabled', 'Disabled'),
		value: ABQ_DISABLED
	}
];

export const backupEnabledStatus = (t: TFunction): Array<{ value: boolean; label: string }> => [
	{
		label: t('account_details.yes', 'Yes'),
		value: true
	},
	{
		label: t('account_details.no', 'No'),
		value: false
	}
];

export const MeasureUnitItems = (t: TFunction): Array<{ value: string; label: string }> => [
	{
		label: t('domain.unit_measure_days', 'Days'),
		value: 'd'
	},
	{
		label: t('domain.unit_measure_hours', 'Hours'),
		value: 'h'
	},
	{
		label: t('domain.unit_measure_minutes', 'Minutes'),
		value: 'm'
	},
	{
		label: t('domain.unit_measure_seconds', 'Seconds'),
		value: 's'
	},
	{
		label: t('domain.unit_measure_milliseconds', 'Milliseconds'),
		value: 'ms'
	}
];
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

export const delegateDomainHeaders = (
	t: TFunction
): Array<{
	id: string;
	label: string;
	width: string;
	bold: boolean;
	align: string;
}> => [
	{
		id: 'id',
		label: t('label.account', 'Account'),
		width: '100%',
		bold: true,
		align: 'left'
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

export const GalServerTableheaders = (t: TFunction): Array<any> => [
	{
		id: 'server',
		label: t('label.server', 'Server'),
		bold: true,
		width: '30%'
	},
	{
		id: 'galsync_account',
		label: t('label.galsync_account', 'GALSync Account'),
		bold: true
	}
];

export const volumeConfigHeader = (
	t: TFunction
): Array<{
	id: string;
	label: string;
	width: string;
	bold: boolean;
	align: string;
}> => [
	{
		id: 'name',
		label: t('volume.volume_config_header.name', 'Name'),
		width: '33%',
		bold: true,
		align: 'left'
	},
	{
		id: 'hsm_scheduled',
		label: t('volume.volume_config_header.hsm_scheduled', 'HSM Scheduled'),
		width: '33%',
		align: 'center',
		bold: true
	},
	{
		id: 'status',
		label: t('volume.volume_config_header.status', 'Status'),
		width: '33%',
		align: 'center',
		bold: true
	}
];

export const MessageTableHeaders = (t: TFunction): Array<object> => [
	{
		id: 'date_time',
		label: t('label.date_time', 'Date & Time'),
		bold: true,
		width: '15%'
	},
	{
		id: 'sender',
		label: t('label.sender', 'Sender'),
		bold: true,
		width: '25%'
	},
	{
		id: 'subject',
		label: t('label.subject', 'Subject'),
		bold: true,
		width: '25%'
	},
	{
		id: 'score',
		label: t('label.score', 'Score'),
		bold: true,
		width: '10%'
	},
	{
		id: 'reason',
		label: t('label.reason', 'Reason'),
		bold: true,
		width: '25%'
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

export const headerCE = (
	t: TFunction
): Array<{
	id: string;
	label: string;
	width: string;
	bold: boolean;
	i18nAllLabel: string;
}> => [
	{
		id: 'server_name',
		label: t('volume.server_list_header.server_name', 'Server Name'),
		i18nAllLabel: 'All',
		width: '260px',
		bold: true
	},
	{
		id: 'primary',
		label: t('volume.server_list_header.primary', 'Primary'),
		i18nAllLabel: 'All',
		width: '120px',
		bold: true
	},
	{
		id: 'index',
		label: t('volume.server_list_header.index', 'Index'),
		i18nAllLabel: 'All',
		width: '120px',
		bold: true
	},
	{
		id: 'description',
		label: t('volume.server_list_header.description', 'Description'),
		i18nAllLabel: 'All',
		width: '169px',
		bold: true
	}
];

export const OperationsHeader = (
	t: TFunction
): Array<{
	id: string;
	label: string;
	width: string;
	bold: boolean;
	i18nAllLabel: string;
	align: string;
}> => [
	{
		id: 'Server',
		label: t('operations.operations_list_header.server', 'Server'),
		i18nAllLabel: 'All',
		width: '127px',
		bold: true,
		align: 'left'
	},
	{
		id: 'Operation',
		label: t('operations.operations_list_header.operation', 'Operation'),
		i18nAllLabel: 'All',
		width: '127px',
		bold: true,
		align: 'left'
	},
	{
		id: 'Secondary',
		label: t('operations.operations_list_header.author', 'Author'),
		i18nAllLabel: 'All',
		width: '177px',
		bold: true,
		align: 'left'
	},
	{
		id: 'Index',
		label: t('operations.operations_list_header.submit_date', 'Submit date'),
		i18nAllLabel: 'All',
		width: '138px',
		bold: true,
		align: 'center'
	},
	{
		id: 'HSM Scheduling',
		label: t('operations.operations_list_header.start_date', 'Start date'),
		i18nAllLabel: 'All',
		width: '138px',
		bold: true,
		align: 'center'
	}
];

export const OperationsDoneHeader = (
	t: TFunction
): Array<{
	id: string;
	label: string;
	width: string;
	bold: boolean;
	i18nAllLabel: string;
	align: string;
}> => [
	{
		id: 'Server',
		label: t('operations.operations_list_header.server', 'Server'),
		i18nAllLabel: 'All',
		width: '177px',
		bold: true,
		align: 'left'
	},
	{
		id: 'Operation',
		label: t('operations.operations_list_header.operation', 'Operation'),
		i18nAllLabel: 'All',
		width: '77px',
		bold: true,
		align: 'left'
	},
	{
		id: 'Operation',
		label: t('operations.operations_list_header.status', 'Status'),
		i18nAllLabel: 'All',
		width: '57px',
		bold: true,
		align: 'center'
	},
	{
		id: 'Secondary',
		label: t('operations.operations_list_header.author', 'Author'),
		i18nAllLabel: 'All',
		width: '177px',
		bold: true,
		align: 'left'
	},
	{
		id: 'Index',
		label: t('operations.operations_list_header.submit_date', 'Submit date'),
		i18nAllLabel: 'All',
		width: '138px',
		bold: true,
		align: 'left'
	},
	{
		id: 'HSM Scheduling',
		label: t('operations.operations_list_header.start_date', 'Start date'),
		i18nAllLabel: 'All',
		width: '138px',
		bold: true,
		align: 'left'
	}
];

export const localeList = (t: TFunction): SelectItem[] => [
	{
		label: t('locale.label_english', { value: 'English', defaultValue: 'English - {{value}}' }),
		value: 'en'
	},
	{
		label: t('locale.label_dutch', { value: 'Nederlands', defaultValue: 'Dutch - {{value}}' }),
		value: 'nl'
	},
	{
		label: t('locale.label_german', { value: 'Deutsch', defaultValue: 'German - {{value}}' }),
		value: 'de'
	},
	{
		label: t('locale.label_hindi', { value: 'हिंदी', defaultValue: 'Hindi - {{value}}' }),
		value: 'hi'
	},
	{
		label: t('locale.label_hungarian', { value: 'Magyar', defaultValue: 'Hungarian - {{value}}' }),
		value: 'hu'
	},
	{
		label: t('locale.label_indonesian', {
			value: 'Bahasa Indonesia',
			defaultValue: 'Indonesian - {{value}}'
		}),
		value: 'id'
	},
	{
		label: t('locale.label_italian', { value: 'italiano', defaultValue: 'Italian - {{value}}' }),
		value: 'it'
	},
	{
		label: t('locale.label_japanese', { value: '日本語', defaultValue: 'Japanese - {{value}}' }),
		value: 'ja'
	},
	{
		label: t('locale.label_kyrgyz', { value: 'Кыргызча', defaultValue: 'Kyrgyz - {{value}}' }),
		value: 'ky'
	},
	{
		label: t('locale.label_portuguese', {
			value: 'português',
			defaultValue: 'Portuguese - {{value}}'
		}),
		value: 'pt'
	},
	{
		label: 'Polish - polski',
		value: 'pl'
	},
	{
		label: t('locale.label_romanian', { value: 'română', defaultValue: 'Romanian - {{value}}' }),
		value: 'ro'
	},
	{
		label: t('locale.label_russian', { value: 'русский', defaultValue: 'Russian - {{value}}' }),
		value: 'ru'
	},
	{
		label: t('locale.label_spanish', { value: 'español', defaultValue: 'Spanish - {{value}}' }),
		value: 'es'
	},
	{
		label: t('locale.label_thai', { value: 'ไทย', defaultValue: 'Thai - {{value}}' }),
		value: 'th'
	},
	{
		label: t('locale.label_turkish', { value: 'Türkçe', defaultValue: 'Turkish - {{value}}' }),
		value: 'tr'
	},
	{
		label: t('locale.label_french', { value: 'français', defaultValue: 'French - {{value}}' }),
		value: 'fr'
	},
	{
		label: 'Vietnamese - Tiếng Việt',
		value: 'vi'
	},
	{
		label: t('locale.label_bosnian', { value: 'bosanski', defaultValue: 'Bosnian - {{value}}' }),
		value: 'bs'
	},
	{
		label: t('locale.label_slovenian', {
			value: 'Slovenščina',
			defaultValue: 'Slovenian - {{value}}'
		}),
		value: 'sl'
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

export const CertificateTypes = (t: TFunction): Array<{ value: string; label: string }> => [
	{
		label: t(
			'domain.certificate_type_use_letsencrypt_long_chain',
			'I want to use a Let’s Encrypt (longChain) certificate'
		),
		value: '1'
	},
	{
		label: t(
			'domain.certificate_type_use_letsencrypt_short_chain',
			'I want to use a Let’s Encrypt (shortChain) certificate'
		),
		value: '2'
	},
	{
		label: t('domain.certificate_type_use_custom', 'I want to use a Custom Certificate'),
		value: '3'
	}
];

export const getDateFromStr = (serverStr: string): any => {
	if (serverStr === null || serverStr === undefined) return null;
	const d = new Date();
	const yyyy = parseInt(serverStr.substr(0, 4), 10);
	const MM = parseInt(serverStr.substr(4, 2), 10);
	const dd = parseInt(serverStr.substr(6, 2), 10);
	d.setFullYear(yyyy);
	d.setMonth(MM - 1);
	d.setMonth(MM - 1);
	d.setDate(dd);
	return d;
};

export const getFormatedDate = (date: Date): any => {
	if (date === null || date === undefined) return null;
	const dd = date.getDate();
	const mm = date.getMonth() + 1; // January is 0!
	const yyyy = date.getFullYear();
	const hour = date.getHours();
	const minutes = date.getMinutes();
	const seconds = date.getSeconds();
	return `${yyyy}/${mm}/${dd} | ${hour}:${minutes}:${seconds}`;
};

export const EMAIL_VALIDATION_REGEX =
	/(^|\s)([\p{L}\p{N}._%+-]+@(?:[\p{L}\p{N}.-]+\.[\p{L}\p{N}]{2,}|\[[^\]\s<>]+\]))/gu;

export const isValidEmail = (email: string): boolean => {
	const match = email.trim().match(EMAIL_VALIDATION_REGEX);
	return match !== null && match[0].trim() === email.trim();
};

export const isValidIpRange = (ipRange: string): boolean => {
	const re = /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/gim;
	return re.test(ipRange);
};

export const isValidLdapBaseUrl = (url: string): boolean => {
	const reqex =
		/^(?:ldap)s?:\/\/(([a-z0-9]|[a-z0-9][a-z0-9\\-]*[a-z0-9])\.)*([a-z0-9]|[a-z0-9][a-z0-9\\-]*[a-z0-9])(:[0-9]+)?$/;
	return reqex.test(url);
};

export const getAllEmailFromString = (str: string): any => {
	const matches = str.matchAll(EMAIL_VALIDATION_REGEX);
	return Array.from(matches, (match) => match[2]);
};

export const getEmailDisplayNameFromString = (str: string): any => str.match(/".*?"|'.*?'/g);

export const isValidLdapQuery = (query: string): boolean => {
	const re = /\([^\\(\\)\\=]+=[^\\(\\)\\=]+\)/;
	return re.test(query);
};

export const isValidLdapBaseDN = (basedn: string): boolean => {
	const reqex =
		/(?:(?<cn>CN=(?<name>[^,]*)),)?(?:(?<path>(?:(?:CN|OU)=[^,]+,?)+),)?(?<domain>(?:DC=[^,]+,?)+)$/gi;
	return reqex.test(basedn);
};

export const isValidHttpsUrl = (url: string): boolean => {
	const reqex = /^(https:\/\/)[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/;
	return reqex.test(url);
};

export const isValidUrl = (url: string): boolean => {
	const reqex = /^((http|https):\/\/)[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/;
	return reqex.test(url);
};

export const isValidPhoneNumber = (str: string): boolean => {
	const reqex = /^[0-9-+()/,. ]*$/;
	return reqex.test(str);
};

export const conversationGroupBy = (t: TFunction): Array<{ value: string; label: string }> => [
	{
		label: t('label.message', 'Message'),
		value: 'message'
	},
	{
		label: t('label.conversation', 'Conversation'),
		value: 'conversation'
	}
];

export const deligateSendSettings = (
	t: TFunction,
	email: string
): Array<{ value: string; label: string }> => [
	{
		label: t('label.save_it_only_in_folder', 'Save it only in {{email}} folder', {
			email
		}),
		value: 'owner'
	},
	{
		label: t(
			'label.save_it_only_in_sender_folder',
			'Save it in {{email}} and the Delegate`s folder',
			{
				email
			}
		),
		value: 'sender'
	},
	{
		label: t('label.save_it_only_deligates_folder', 'Save it only in the Delegate`s folder'),
		value: 'both'
	},
	{
		label: t('label.dont_save_it', `Don't save it`),
		value: 'none'
	}
];

export const delegateType = (t: TFunction): Array<{ value: string; label: string }> => [
	{
		label: t('account_details.a_user', 'A User'),
		value: 'usr'
	},
	{
		label: t('account_details.an_existing_group', 'An Existing Group'),
		value: 'grp'
	}
];

export const delegateRightsType = (t: TFunction): Array<{ value: string; label: string }> => [
	{
		label: t('account_details.send_mails_only', 'Send Mails only (no rights to read folders)'),
		value: SEND_MAILS_ONLY
	},
	{
		label: t('account_details.read_mails_only', 'Read Mails only (no rights to send mails)'),
		value: READ_MAILS_ONLY
	},
	{
		label: t(
			'account_details.send_read_mails',
			'Send and Read Mails (no rights to create folders / manage mails)'
		),
		value: SEND_READ_MAILS
	},
	{
		label: t('account_details.manage_no_rights_to_send_mails', 'Manage (no rights to send mails)'),
		value: MANAGE_NO_SEND
	},
	{
		label: t(
			'account_details.send_read_manage_mails',
			'Send, Read and Manage Mails (all of the above)'
		),
		value: SEND_READ_MANAGE_MAILS
	}
];

export const appointmentReminder = (t: TFunction): Array<{ value: string; label: string }> => [
	{
		label: t('label.never', 'Never'),
		value: '0'
	},
	{
		label: '1',
		value: '1'
	},
	{
		label: '5',
		value: '5'
	},
	{
		label: '10',
		value: '10'
	},
	{
		label: '15',
		value: '15'
	},
	{
		label: '20',
		value: '20'
	},
	{
		label: '25',
		value: '25'
	},
	{
		label: '30',
		value: '30'
	},
	{
		label: '45',
		value: '45'
	},
	{
		label: '50',
		value: '50'
	},
	{
		label: '55',
		value: '55'
	},
	{
		label: '60',
		value: '60'
	}
];

export const charactorSet = (): Array<{ value: string; label: string }> => [
	{ label: 'Big5', value: 'Big5' },
	{ label: 'Big5-HKSCS', value: 'Big5-HKSCS' },
	{ label: 'EUC-JP', value: 'EUC-JP' },
	{ label: 'EUC-KR', value: 'EUC-KR' },
	{ label: 'GB18030', value: 'GB18030' },
	{ label: 'GB2312', value: 'GB2312' },
	{ label: 'GBK', value: 'GBK' },
	{ label: 'IBM-Thai', value: 'IBM-Thai' },
	{ label: 'IBM00858', value: 'IBM00858' },
	{ label: 'IBM01140', value: 'IBM01140' },
	{ label: 'IBM01141', value: 'IBM01141' },
	{ label: 'IBM01142', value: 'IBM01142' },
	{ label: 'IBM01143', value: 'IBM01143' },
	{ label: 'IBM01144', value: 'IBM01144' },
	{ label: 'IBM01145', value: 'IBM01145' },
	{ label: 'IBM01146', value: 'IBM01146' },
	{ label: 'IBM01147', value: 'IBM01147' },
	{ label: 'IBM01148', value: 'IBM01148' },
	{ label: 'IBM01149', value: 'IBM01149' },
	{ label: 'IBM037', value: 'IBM037' },
	{ label: 'IBM1026', value: 'IBM1026' },
	{ label: 'IBM1047', value: 'IBM1047' },
	{ label: 'IBM273', value: 'IBM273' },
	{ label: 'IBM277', value: 'IBM277' },
	{ label: 'IBM278', value: 'IBM278' },
	{ label: 'IBM280', value: 'IBM280' },
	{ label: 'IBM284', value: 'IBM284' },
	{ label: 'IBM285', value: 'IBM285' },
	{ label: 'IBM297', value: 'IBM297' },
	{ label: 'IBM420', value: 'IBM420' },
	{ label: 'IBM424', value: 'IBM424' },
	{ label: 'IBM437', value: 'IBM437' },
	{ label: 'IBM500', value: 'IBM500' },
	{ label: 'IBM775', value: 'IBM775' },
	{ label: 'IBM850', value: 'IBM850' },
	{ label: 'IBM852', value: 'IBM852' },
	{ label: 'IBM855', value: 'IBM855' },
	{ label: 'IBM857', value: 'IBM857' },
	{ label: 'IBM860', value: 'IBM860' },
	{ label: 'IBM861', value: 'IBM861' },
	{ label: 'IBM862', value: 'IBM862' },
	{ label: 'IBM863', value: 'IBM863' },
	{ label: 'IBM864', value: 'IBM864' },
	{ label: 'IBM865', value: 'IBM865' },
	{ label: 'IBM866', value: 'IBM866' },
	{ label: 'IBM868', value: 'IBM868' },
	{ label: 'IBM869', value: 'IBM869' },
	{ label: 'IBM870', value: 'IBM870' },
	{ label: 'IBM871', value: 'IBM871' },
	{ label: 'IBM918', value: 'IBM918' },
	{ label: 'imap-utf-7', value: 'imap-utf-7' },
	{ label: 'ISO-2022-CN', value: 'ISO-2022-CN' },
	{ label: 'ISO-2022-JP', value: 'ISO-2022-JP' },
	{ label: 'ISO-2022-KR', value: 'ISO-2022-KR' },
	{ label: 'ISO-8859-1', value: 'ISO-8859-1' },
	{ label: 'ISO-8859-13', value: 'ISO-8859-13' },
	{ label: 'ISO-8859-15', value: 'ISO-8859-15' },
	{ label: 'ISO-8859-2', value: 'ISO-8859-2' },
	{ label: 'ISO-8859-3', value: 'ISO-8859-3' },
	{ label: 'ISO-8859-4', value: 'ISO-8859-4' },
	{ label: 'ISO-8859-5', value: 'ISO-8859-5' },
	{ label: 'ISO-8859-6', value: 'ISO-8859-6' },
	{ label: 'ISO-8859-7', value: 'ISO-8859-7' },
	{ label: 'ISO-8859-8', value: 'ISO-8859-8' },
	{ label: 'ISO-8859-9', value: 'ISO-8859-9' },
	{ label: 'JIS_X0201', value: 'JIS_X0201' },
	{ label: 'JIS_X0212-1990', value: 'JIS_X0212-1990' },
	{ label: 'KOI8-R', value: 'KOI8-R' },
	{ label: 'macintosh', value: 'macintosh' },
	{ label: 'macintosh_ce', value: 'macintosh_ce' },
	{ label: 'Shift_JIS', value: 'Shift_JIS' },
	{ label: 'TIS-620', value: 'TIS-620' },
	{ label: 'US-ASCII', value: 'US-ASCII' },
	{ label: 'UTF-16', value: 'UTF-16' },
	{ label: 'UTF-16BE', value: 'UTF-16BE' },
	{ label: 'UTF-16LE', value: 'UTF-16LE' },
	{ label: 'utf-7', value: 'utf-7' },
	{ label: 'UTF-8', value: 'UTF-8' },
	{ label: 'windows-1250', value: 'windows-1250' },
	{ label: 'windows-1251', value: 'windows-1251' },
	{ label: 'windows-1252', value: 'windows-1252' },
	{ label: 'windows-1253', value: 'windows-1253' },
	{ label: 'windows-1254', value: 'windows-1254' },
	{ label: 'windows-1255', value: 'windows-1255' },
	{ label: 'windows-1256', value: 'windows-1256' },
	{ label: 'windows-1257', value: 'windows-1257' },
	{ label: 'windows-1258', value: 'windows-1258' },
	{ label: 'windows-31j', value: 'windows-31j' }
];

export const getFormatedShortDate = (date: Date): any => {
	if (date === null || date === undefined) return null;
	const dd = date.getDate();
	const mm = date.getMonth() + 1; // January is 0!
	const yyyy = date.getFullYear();
	const hour = date.getHours();
	const minutes = date.getMinutes();
	const seconds = date.getSeconds();
	return `${mm}/${dd}/${yyyy}`;
};

export const bytesToSize = (bytes: number): string => {
	const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	if (bytes === 0) return 'n/a';
	const i: number = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString(), 10);
	if (i === 0) return `${bytes} ${sizes[i]}`;
	return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
};

export const copyTextToClipboard = (text: string): void => {
	if (navigator) {
		navigator.clipboard.writeText(text);
	}
};

export const download = (content: BlobPart, fileName: string, contentType: string): void => {
	const a = document.createElement('a');
	const file = new Blob([content], { type: contentType });
	a.href = URL.createObjectURL(file);
	a.download = fileName;
	a.click();
};

export const getSPEntityId = (
	protocol: string,
	publicServerHostName: string,
	domain: string
): string => {
	let url = '';
	if (publicServerHostName) {
		url = `${protocol || 'https'}://${publicServerHostName}/zx/auth/samlMetadata?domain=${domain}`;
	}
	return url;
};

export const getServiceUrl = (protocol: string, publicServerHostName: string): string => {
	let url = '';
	if (publicServerHostName) {
		url = `${protocol || 'https'}://${publicServerHostName}/zx/auth/saml`;
	}
	return url;
};

export const ServicesPassphraseStatus = (
	t: TFunction
): Array<{ value: boolean; label: string }> => [
	{
		label: t('label.active', 'Active'),
		value: true
	},
	{
		label: t('label.inactive', 'Inactive'),
		value: false
	}
];

export const TwoFactorWhatToTrust = (t: TFunction): Array<{ value: number; label: string }> => [
	{
		label: t('label.disable_2fa', 'Disable 2FA'),
		value: 0
	},
	{
		label: t('label.trust_ip', 'Trust the IP'),
		value: 1
	},
	{
		label: t('label.trust_the_device', 'Trust the device'),
		value: 2
	}
];

export const ServicesPassphraseServices = (): Array<{ value: string; label: string }> => [
	{
		label: 'Dav(Web/Card/Cal)',
		value: 'DAV'
	},
	{
		label: 'EAS',
		value: 'EAS'
	},
	{
		label: 'WebUI',
		value: 'WebUI'
	},
	{
		label: 'WebAdminUI',
		value: 'WebAdminUI'
	},
	{
		label: 'MobileApp',
		value: 'MobileApp'
	},
	{
		label: 'DesktopApp',
		value: 'DesktopApp'
	},
	{
		label: 'ZmWebUI',
		value: 'ZmWebUI'
	},
	{
		label: 'CLI',
		value: 'CLI'
	},
	{
		label: 'SMTP',
		value: 'SMTP'
	},
	{
		label: 'IMAP',
		value: 'IMAP'
	},
	{
		label: 'POP3',
		value: 'POP3'
	}
];

export const getRights = (rights: Rights, type: string): Array<Record<string, string>> => {
	let right: Array<Record<string, string>> = [];
	const filteredType = rights.filter((item: Right) => item?.type === type);

	if (filteredType && filteredType.length > 0) {
		if (
			filteredType[0]?.all &&
			Array.isArray(filteredType[0]?.all) &&
			filteredType[0]?.all.length > 0
		) {
			right = filteredType[0]?.all[0].right || [];
		}
	}
	return right;
};

export const getAllRights = (rights: Rights, type: string): Right[] =>
	rights.filter((item: Right) => item?.type === type);

export function useLocalStorage<T>(key: string, initialValue: T): any {
	const [storedValue, setStoredValue] = useState<T>(() => {
		try {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			return initialValue;
		}
	});
	const setValue = (value: T | ((val: T) => T)): any => {
		const valueToStore = value instanceof Function ? value(storedValue) : value;
		setStoredValue(valueToStore);
		localStorage.setItem(key, JSON.stringify(valueToStore));
	};
	return [storedValue, setValue] as const;
}

export const TwoFactorPolicyArray = (t: TFunction): TwoFactorPolicy[] => [
	{
		label: t('domain.admin_api', 'Admin API'),
		keyToGet: 'WebAdminUI'
	},
	{
		label: t('domain.web_ui', 'WebUI'),
		keyToGet: 'WebUI'
	},
	{
		label: t('domain.mobile_apps', 'Mobile Apps'),
		keyToGet: 'MobileApp'
	},
	{
		label: t('domain.active_sync', 'ActiveSync'),
		keyToGet: 'EAS'
	},
	{
		label: t('domain.desktop_sync', 'DesktopSync'),
		keyToGet: 'DesktopApp'
	},
	{
		label: t('domain.dav', 'DAV'),
		keyToGet: 'Dav'
	},
	{
		label: t('domain.pop', 'POP'),
		keyToGet: 'Pop3'
	},
	{
		label: t('domain.imap', 'IMAP'),
		keyToGet: 'Imap'
	},
	{
		label: t('domain.smtp', 'SMTP'),
		keyToGet: 'Smtp'
	}
];

export const RandomString = (): string => (Math.random() + 1).toString(36).substring(2);

export const IsValidFQDN = (value: string): boolean => {
	const fqdnRegex = /^(?!:\/\/)(?=.{1,255}$)([a-zA-Z0-9]+([-]+[a-zA-Z0-9]+)*\.)*[a-zA-Z0-9]{2,}$/;
	return fqdnRegex.test(value);
};

export const isValidProxy = (value: string): boolean => {
	const pattern = '(proxy|pcre|regexp|inline):(ldap:)?[/\\w.-]+';
	const validProxyRegex = new RegExp(`^${pattern}(( ,|, | , |,)${pattern})*$`);
	return validProxyRegex.test(value);
};
export const isSpaceAvailableInString = (value: string): boolean => {
	const spaceRegex = /^\S*$/;
	return !spaceRegex.test(value);
};

export const isValidHostname = (hostname: string): boolean => {
	const hostnameRegex = /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z0-9-]{1,63})*(?<!-)$/;
	return hostnameRegex.test(hostname);
};

export const BytesToGB = (data: any): any => divide(data || 0, 1024 ** 3);

export const GbToBytes = (data: any): any => multiply(data, 1024 ** 3);

export const isValidHexColor = (value: string): boolean => {
	const regex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
	return regex.test(value);
};

export const validateIpAddress = (value: string): boolean => {
	const ipv4Regex =
		/^(!?)(\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}\/([0-9]|[12][0-9]|3[0-2])$/;
	const ipv6Regex =
		/^(!?)\[(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\]\/([0-9]|[1-9][0-9]|1[01][0-9]|12[0-8])$/;

	return ipv4Regex.test(value) || ipv6Regex.test(value);
};

export const getModifiedName = (name: string): string => name?.replace(/ /g, '')?.toLowerCase();
export const checkValidUserName = (name: string): boolean => /^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(name);
export const convertToAscii = (inputString: string): string => {
	const normalizedString = inputString.normalize('NFKD');
	return normalizedString.replace(/[^\p{ASCII}]/gu, '');
};

export const isValidDecimalNumber = (value: string): boolean => {
	const regex = /^\d*\.?\d*$/;
	return regex.test(value);
};

export const isValidVirtualHostname = (hostname: string): boolean => {
	const hostnamePartRegex = /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)$/;
	const tldRegex = /^[A-Za-z]{2,}$/;
	const parts = hostname.split('.');
	if (parts.length < 2) {
		return false;
	}
	const tld = parts.pop();
	return tldRegex.test(tld!) && parts.every((part) => hostnamePartRegex.test(part));
};

type Details = {
	[key: string]: string;
};

type ErrorResponse = {
	code: string;
	details: Details;
	message: string;
	time: number;
};

export const formatedErrorMessage = (response: ErrorResponse): ErrorResponse => {
	if (response.details) {
		Object.entries(response.details).forEach(([key, value]) => {
			const placeholder = `{${key}}`;
			response.message = response.message.replace(placeholder, value);
		});
	}
	return response;
};

export function bytesToHumanReadable(bytes: number): string {
	if (bytes === 0) return '0 Bytes';
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'BB'];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	const sizeIndex = Math.min(i, sizes.length - 1);
	return `${parseFloat((bytes / 1024 ** sizeIndex).toFixed(2))} ${sizes[sizeIndex]}`;
}

export function bytesToMB(bytes: number): number {
	return parseFloat((bytes / 1024 / 1024).toFixed(2));
}

export function mbToBytes(mb: number): number {
	return mb * 1024 * 1024;
}
