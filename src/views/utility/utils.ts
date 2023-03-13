/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { TFunction } from 'i18next';
import {
	ACTIVE,
	CLOSED,
	LOCKED,
	MAINTENANCE,
	PENDING,
	NOT_SET,
	SEND_MAILS_ONLY,
	READ_MAILS_ONLY,
	SEND_READ_MAILS,
	MANAGE_NO_SEND,
	SEND_READ_MANAGE_MAILS
} from '../../constants';

export const timeZoneList = (
	t: TFunction
): Array<{ value?: string; label: string; offSet?: string }> => [
	{
		value: NOT_SET,
		label: t('label.not_set', 'Not Set')
	},
	{
		value: 'Etc/GMT+12',
		label: t('timezone.etc_gmt+12', { value: 'GMT -12:00', defaultValue: '{{value}} Dateline' })
	},
	{
		value: 'Pacific/Midway',
		label: t('timezone.pacific_midway', { value: 'GMT -11:00', defaultValue: '{{value}} Samoa' })
	},
	{
		value: 'America/Adak',
		label: t('timezone.america_adak', { value: 'GMT -10:00', defaultValue: '{{value}} Adak' })
	},
	{
		value: 'Pacific/Honolulu',
		label: t('timezone.pacific_honolulu', { value: 'GMT -10:00', defaultValue: '{{value}} Hawaii' })
	},
	{
		value: 'Pacific/Marquesas',
		label: t('timezone.pacific_marquesas', {
			value: 'GMT -09:30',
			defaultValue: '{{value}} Marquesas'
		})
	},
	{
		value: 'America/Anchorage',
		label: t('timezone.america_anchorage', {
			value: 'GMT -09:00',
			defaultValue: '{{value}} Alaska'
		})
	},
	{
		value: 'America/Los_Angeles',
		label: t('timezone.america_los_angeles', {
			value: 'GMT -08:00',
			defaultValue: '{{value}} US/Canada Pacific'
		})
	},
	{
		value: 'America/Tijuana',
		label: t('timezone.america_tijuana', {
			value: 'GMT -08:00',
			defaultValue: '{{value}} Baja California'
		})
	},
	{
		value: 'America/Chihuahua',
		label: t('timezone.america_chihuahua', {
			value: 'GMT -07:00',
			defaultValue: '{{value}} Chihuahua, La Paz, Mazatlan'
		})
	},
	{
		value: 'America/Denver',
		label: t('timezone.america_denver', {
			value: 'GMT -07:00',
			defaultValue: '{{value}} US/Canada Mountain'
		})
	},
	{
		value: 'America/Fort_Nelson',
		label: t('timezone.america_fort_nelson', {
			value: 'GMT -07:00',
			defaultValue: '{{value}} Fort Nelson'
		})
	},
	{
		value: 'America/Phoenix',
		label: t('timezone.america_phoenix', { value: 'GMT -07:00', defaultValue: '{{value}} Arizona' })
	},
	{
		value: 'America/Whitehorse',
		label: t('timezone.america_whitehorse', {
			value: 'GMT -07:00',
			defaultValue: '{{value}} Yukon'
		})
	},
	{
		value: 'America/Chicago',
		label: t('timezone.america_chicago', {
			value: 'GMT -06:00',
			defaultValue: '{{value}} US/Canada Central'
		})
	},
	{
		value: 'America/Guatemala',
		label: t('timezone.america_guatemala', {
			value: 'GMT -06:00',
			defaultValue: '{{value}} Central America'
		})
	},
	{
		value: 'America/Mexico_City',
		label: t('timezone.america_mexico_city', {
			value: 'GMT -06:00',
			defaultValue: '{{value}} Guadalajara, Mexico City, Monterrey'
		})
	},
	{
		value: 'America/Regina',
		label: t('timezone.america_regina', {
			value: 'GMT -06:00',
			defaultValue: '{{value}} Saskatchewan'
		})
	},
	{
		value: 'Pacific/Easter',
		label: t('timezone.pacific_easter', { value: 'GMT -06:00', defaultValue: '{{value}} Easter' })
	},
	{
		value: 'America/Bogota',
		label: t('timezone.america_bogota', { value: 'GMT -05:00', defaultValue: '{{value}} Colombia' })
	},
	{
		value: 'America/Cancun',
		label: t('timezone.america_cancun', {
			value: 'GMT -05:00',
			defaultValue: '{{value}} Cancun, Chetumal'
		})
	},
	{
		value: 'America/Grand_Turk',
		label: t('timezone.america_grand_turk', {
			value: 'GMT -05:00',
			defaultValue: '{{value}} Turks and Caicos Islands'
		})
	},
	{
		value: 'America/Havana',
		label: t('timezone.america_havana', { value: 'GMT -05:00', defaultValue: '{{value}} Havana' })
	},
	{
		value: 'America/Indiana/Indianapolis',
		label: t('timezone.america_indiana_indianapolis', {
			value: 'GMT -05:00',
			defaultValue: '{{value}} Indiana (East)'
		})
	},
	{
		value: 'America/New_York',
		label: t('timezone.america_new_york', {
			value: 'GMT -05:00',
			defaultValue: '{{value}} US/Canada Eastern'
		})
	},
	{
		value: 'America/Port-au-Prince',
		label: t('timezone.america_port-au-prince', {
			value: 'GMT -05:00',
			defaultValue: '{{value}} Port-au-Prince'
		})
	},
	{
		value: 'America/Asuncion',
		label: t('timezone.america_asuncion', {
			value: 'GMT -04:00',
			defaultValue: '{{value}} Asuncion'
		})
	},
	{
		value: 'America/Caracas',
		label: t('timezone.america_caracas', { value: 'GMT -04:00', defaultValue: '{{value}} Caracas' })
	},
	{
		value: 'America/Cuiaba',
		label: t('timezone.america_cuiaba', { value: 'GMT -04:00', defaultValue: '{{value}} Cuiaba' })
	},
	{
		value: 'America/Guyana',
		label: t('timezone.america_guyana', {
			value: 'GMT -04:00',
			defaultValue: '{{value}} Georgetown, La Paz, Manaus, San Juan'
		})
	},
	{
		value: 'America/Halifax',
		label: t('timezone.america_halifax', {
			value: 'GMT -04:00',
			defaultValue: '{{value}} Atlantic Time (Canada)'
		})
	},
	{
		value: 'America/Santiago',
		label: t('timezone.america_santiago', {
			value: 'GMT -04:00',
			defaultValue: '{{value}} Pacific South America'
		})
	},
	{
		value: 'America/St_Johns',
		label: t('timezone.america_st_johns', {
			value: 'GMT -03:30',
			defaultValue: '{{value}} Newfoundland'
		})
	},
	{
		value: 'America/Araguaina',
		label: t('timezone.america_araguaina', {
			value: 'GMT -03:00',
			defaultValue: '{{value}} Araguaina'
		})
	},
	{
		value: 'America/Argentina/Buenos_Aires',
		label: t('timezone.america_argentina_buenos_aires', {
			value: 'GMT -03:00',
			defaultValue: '{{value}} Argentina'
		})
	},
	{
		value: 'America/Bahia',
		label: t('timezone.america_bahia', { value: 'GMT -03:00', defaultValue: '{{value}} Salvador' })
	},
	{
		value: 'America/Cayenne',
		label: t('timezone.america_cayenne', {
			value: 'GMT -03:00',
			defaultValue: '{{value}} Cayenne, Fortaleza'
		})
	},
	{
		value: 'America/Miquelon',
		label: t('timezone.america_miquelon', {
			value: 'GMT -03:00',
			defaultValue: '{{value}} Miquelon'
		})
	},
	{
		value: 'America/Montevideo',
		label: t('timezone.america_montevideo', {
			value: 'GMT -03:00',
			defaultValue: '{{value}} Montevideo'
		})
	},
	{
		value: 'America/Punta_Arenas',
		label: t('timezone.america_punta_arenas', {
			value: 'GMT -03:00',
			defaultValue: '{{value}} Punta_Arenas'
		})
	},
	{
		value: 'America/Sao_Paulo',
		label: t('timezone.america_sao_paulo', {
			value: 'GMT -03:00',
			defaultValue: '{{value}} Brasilia'
		})
	},
	{
		value: 'Atlantic/South_Georgia',
		label: t('timezone.atlantic_south_georgia', {
			value: 'GMT -02:00',
			defaultValue: '{{value}} Mid-Atlantic'
		})
	},
	{
		value: 'Atlantic/Azores',
		label: t('timezone.atlantic_azores', { value: 'GMT -01:00', defaultValue: '{{value}} Azores' })
	},
	{
		value: 'Atlantic/Cape_Verde',
		label: t('timezone.atlantic_cape_verde', {
			value: 'GMT -01:00',
			defaultValue: '{{value}} Cape Verde Is.'
		})
	},
	{
		value: 'Africa/Monrovia',
		label: t('timezone.africa_monrovia', {
			value: 'GMT +00:00',
			defaultValue: '{{value}} Monrovia'
		})
	},
	{
		value: 'Africa/Sao_Tome',
		label: t('timezone.africa_sao_tome', {
			value: 'GMT +00:00',
			defaultValue: '{{value}} Sao Tome'
		})
	},
	{
		value: 'Europe/London',
		label: t('timezone.europe_london', {
			value: 'GMT +00:00',
			defaultValue: '{{value}} Britain, Ireland, Portugal'
		})
	},
	{
		value: 'UTC',
		label: t('timezone.utc', {
			value: 'GMT/UTC',
			defaultValue: '{{value}} Coordinated Universal Time'
		})
	},
	{
		value: 'Africa/Algiers',
		label: t('timezone.africa_algiers', {
			value: 'GMT +01:00',
			defaultValue: '{{value}} West Central Africa'
		})
	},
	{
		value: 'Africa/Casablanca',
		label: t('timezone.africa_casablanca', {
			value: 'GMT +01:00',
			defaultValue: '{{value}} Casablanca'
		})
	},
	{
		value: 'Europe/Belgrade',
		label: t('timezone.europe_belgrade', {
			value: 'GMT +01:00',
			defaultValue: '{{value}} Belgrade, Bratislava, Budapest, Ljubljana, Prague'
		})
	},
	{
		value: 'Europe/Berlin',
		label: t('timezone.europe_berlin', {
			value: 'GMT +01:00',
			defaultValue: '{{value}} Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna'
		})
	},
	{
		value: 'Europe/Brussels',
		label: t('timezone.europe_brussels', {
			value: 'GMT +01:00',
			defaultValue: '{{value}} Brussels, Copenhagen, Madrid, Paris'
		})
	},
	{
		value: 'Europe/Warsaw',
		label: t('timezone.europe_warsaw', {
			value: 'GMT +01:00',
			defaultValue: '{{value}} Sarajevo, Skopje, Warsaw, Zagreb'
		})
	},
	{
		value: 'Africa/Cairo',
		label: t('timezone.africa_cairo', { value: 'GMT +02:00', defaultValue: '{{value}} Egypt' })
	},
	{
		value: 'Africa/Harare',
		label: t('timezone.africa_harare', {
			value: 'GMT +02:00',
			defaultValue: '{{value}} Harare, Pretoria'
		})
	},
	{
		value: 'Africa/Juba',
		label: t('timezone.africa_juba', { value: 'GMT +02:00', defaultValue: '{{value}} Juba' })
	},
	{
		value: 'Africa/Khartoum',
		label: t('timezone.africa_khartoum', {
			value: 'GMT +02:00',
			defaultValue: '{{value}} Khartoum'
		})
	},
	{
		value: 'Africa/Tripoli',
		label: t('timezone.africa_tripoli', { value: 'GMT +02:00', defaultValue: '{{value}} Tripoli' })
	},
	{
		value: 'Africa/Windhoek',
		label: t('timezone.africa_windhoek', { value: 'GMT +02:00', defaultValue: '{{value}} Namibia' })
	},
	{
		value: 'Asia/Amman',
		label: t('timezone.asia_amman', { value: 'GMT +02:00', defaultValue: '{{value}} Jordan' })
	},
	{
		value: 'Asia/Beirut',
		label: t('timezone.asia_beirut', { value: 'GMT +02:00', defaultValue: '{{value}} Beirut' })
	},
	{
		value: 'Asia/Damascus',
		label: t('timezone.asia_damascus', { value: 'GMT +02:00', defaultValue: '{{value}} Damascus' })
	},
	{
		value: 'Asia/Gaza',
		label: t('timezone.asia_gaza', { value: 'GMT +02:00', defaultValue: '{{value}} Gaza' })
	},
	{
		value: 'Asia/Jerusalem',
		label: t('timezone.asia_jerusalem', {
			value: 'GMT +02:00',
			defaultValue: '{{value}} Jerusalem'
		})
	},
	{
		value: 'Europe/Athens',
		label: t('timezone.europe_athens', {
			value: 'GMT +02:00',
			defaultValue: '{{value}} Athens, Beirut, Bucharest, Istanbul'
		})
	},
	{
		value: 'Europe/Bucharest',
		label: t('timezone.europe_bucharest', {
			value: 'GMT +02:00',
			defaultValue: '{{value}} Bucharest'
		})
	},
	{
		value: 'Europe/Chisinau',
		label: t('timezone.europe_chisinau', {
			value: 'GMT +02:00',
			defaultValue: '{{value}} Chisinau'
		})
	},
	{
		value: 'Europe/Helsinki',
		label: t('timezone.europe_helsinki', {
			value: 'GMT +02:00',
			defaultValue: '{{value}} Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius'
		})
	},
	{
		value: 'Europe/Kaliningrad',
		label: t('timezone.europe_kaliningrad', {
			value: 'GMT +02:00',
			defaultValue: '{{value}} Kaliningrad (RTZ 1)'
		})
	},
	{
		value: 'Africa/Nairobi',
		label: t('timezone.africa_nairobi', { value: 'GMT +03:00', defaultValue: '{{value}} Nairobi' })
	},
	{
		value: 'Asia/Baghdad',
		label: t('timezone.asia_baghdad', { value: 'GMT +03:00', defaultValue: '{{value}} Iraq' })
	},
	{
		value: 'Asia/Kuwait',
		label: t('timezone.asia_kuwait', {
			value: 'GMT +03:00',
			defaultValue: '{{value}} Kuwait, Riyadh'
		})
	},
	{
		value: 'Europe/Istanbul',
		label: t('timezone.europe_istanbul', {
			value: 'GMT +03:00',
			defaultValue: '{{value}} Istanbul'
		})
	},
	{
		value: 'Europe/Minsk',
		label: t('timezone.europe_minsk', { value: 'GMT +03:00', defaultValue: '{{value}} Minsk' })
	},
	{
		value: 'Europe/Moscow',
		label: t('timezone.europe_moscow', {
			value: 'GMT +03:00',
			defaultValue: '{{value}} Moscow, St. Petersburg, Volgograd (RTZ 2)'
		})
	},
	{
		value: 'Europe/Volgograd',
		label: t('timezone.europe_volgograd', {
			value: 'GMT +03:00',
			defaultValue: '{{value}} Volgograd'
		})
	},
	{
		value: 'Asia/Tehran',
		label: t('timezone.asia_tehran', { value: 'GMT +03:30', defaultValue: '{{value}} Tehran' })
	},
	{
		value: 'Asia/Baku',
		label: t('timezone.asia_baku', { value: 'GMT +04:00', defaultValue: '{{value}} Baku' })
	},
	{
		value: 'Asia/Muscat',
		label: t('timezone.asia_muscat', {
			value: 'GMT +04:00',
			defaultValue: '{{value}} Abu Dhabi, Muscat'
		})
	},
	{
		value: 'Asia/Tbilisi',
		label: t('timezone.asia_tbilisi', { value: 'GMT +04:00', defaultValue: '{{value}} Tbilisi' })
	},
	{
		value: 'Asia/Yerevan',
		label: t('timezone.asia_yerevan', { value: 'GMT +04:00', defaultValue: '{{value}} Yerevan' })
	},
	{
		value: 'Europe/Astrakhan',
		label: t('timezone.europe_astrakhan', {
			value: 'GMT +04:00',
			defaultValue: '{{value}} Astrakhan'
		})
	},
	{
		value: 'Europe/Samara',
		label: t('timezone.europe_samara', {
			value: 'GMT +04:00',
			defaultValue: '{{value}} Izhevsk, Samara (RTZ 3)'
		})
	},
	{
		value: 'Europe/Saratov',
		label: t('timezone.europe_saratov', { value: 'GMT +04:00', defaultValue: '{{value}} Saratov' })
	},
	{
		value: 'Indian/Mauritius',
		label: t('timezone.indian_mauritius', {
			value: 'GMT +04:00',
			defaultValue: '{{value}} Port Louis'
		})
	},
	{
		value: 'Asia/Kabul',
		label: t('timezone.asia_kabul', { value: 'GMT +04:30', defaultValue: '{{value}} Kabul' })
	},
	{
		value: 'Asia/Karachi',
		label: t('timezone.asia_karachi', {
			value: 'GMT +05:00',
			defaultValue: '{{value}} Islamabad, Karachi'
		})
	},
	{
		value: 'Asia/Qyzylorda',
		label: t('timezone.asia_qyzylorda', {
			value: 'GMT +05:00',
			defaultValue: '{{value}} Qyzylorda'
		})
	},
	{
		value: 'Asia/Tashkent',
		label: t('timezone.asia_tashkent', { value: 'GMT +05:00', defaultValue: '{{value}} Tashkent' })
	},
	{
		value: 'Asia/Yekaterinburg',
		label: t('timezone.asia_yekaterinburg', {
			value: 'GMT +05:00',
			defaultValue: '{{value}} Ekaterinburg (RTZ 4)'
		})
	},
	{
		value: 'Asia/Colombo',
		label: t('timezone.asia_colombo', {
			value: 'GMT +05:30',
			defaultValue: '{{value}} Sri Jayawardenepura Kotte'
		})
	},
	{
		value: 'Asia/Kolkata',
		label: t('timezone.asia_kolkata', {
			value: 'GMT +05:30',
			defaultValue: '{{value}} Chennai, Kolkata, Mumbai, New Delhi'
		})
	},
	{
		value: 'Asia/Kathmandu',
		label: t('timezone.asia_kathmandu', {
			value: 'GMT +05:45',
			defaultValue: '{{value}} Kathmandu'
		})
	},
	{
		value: 'Asia/Almaty',
		label: t('timezone.asia_almaty', { value: 'GMT +06:00', defaultValue: '{{value}} Astana' })
	},
	{
		value: 'Asia/Dhaka',
		label: t('timezone.asia_dhaka', { value: 'GMT +06:00', defaultValue: '{{value}} Dhaka' })
	},
	{
		value: 'Asia/Omsk',
		label: t('timezone.asia_omsk', { value: 'GMT +06:00', defaultValue: '{{value}} Omsk' })
	},
	{
		value: 'Asia/Yangon',
		label: t('timezone.asia_yangon', { value: 'GMT +06:30', defaultValue: '{{value}} Yangon' })
	},
	{
		value: 'Asia/Bangkok',
		label: t('timezone.asia_bangkok', {
			value: 'GMT +07:00',
			defaultValue: '{{value}} Bangkok, Hanoi, Jakarta'
		})
	},
	{
		value: 'Asia/Barnaul',
		label: t('timezone.asia_barnaul', { value: 'GMT +07:00', defaultValue: '{{value}} Barnaul' })
	},
	{
		value: 'Asia/Hovd',
		label: t('timezone.asia_hovd', { value: 'GMT +07:00', defaultValue: '{{value}} Hovd' })
	},
	{
		value: 'Asia/Krasnoyarsk',
		label: t('timezone.asia_krasnoyarsk', {
			value: 'GMT +07:00',
			defaultValue: '{{value}} Krasnoyarsk (RTZ 6)'
		})
	},
	{
		value: 'Asia/Novosibirsk',
		label: t('timezone.asia_novosibirsk', {
			value: 'GMT +07:00',
			defaultValue: '{{value}} Novosibirsk (RTZ 5)'
		})
	},
	{
		value: 'Asia/Tomsk',
		label: t('timezone.asia_tomsk', { value: 'GMT +07:00', defaultValue: '{{value}} Tomsk' })
	},
	{
		value: 'Asia/Hong_Kong',
		label: t('timezone.asia_hong_kong', {
			value: 'GMT +08:00',
			defaultValue: '{{value}} Beijing, Chongqing, Hong Kong, Urumqi'
		})
	},
	{
		value: 'Asia/Irkutsk',
		label: t('timezone.asia_irkutsk', {
			value: 'GMT +08:00',
			defaultValue: '{{value}} Irkutsk (RTZ 7)'
		})
	},
	{
		value: 'Asia/Kuala_Lumpur',
		label: t('timezone.asia_kuala_lumpur', {
			value: 'GMT +08:00',
			defaultValue: '{{value}} Kuala Lumpur'
		})
	},
	{
		value: 'Asia/Singapore',
		label: t('timezone.asia_singapore', {
			value: 'GMT +08:00',
			defaultValue: '{{value}} Singapore'
		})
	},
	{
		value: 'Asia/Taipei',
		label: t('timezone.asia_taipei', { value: 'GMT +08:00', defaultValue: '{{value}} Taipei' })
	},
	{
		value: 'Asia/Ulaanbaatar',
		label: t('timezone.asia_ulaanbaatar', {
			value: 'GMT +08:00',
			defaultValue: '{{value}} Ulaanbaatar'
		})
	},
	{
		value: 'Australia/Perth',
		label: t('timezone.australia_perth', { value: 'GMT +08:00', defaultValue: '{{value}} Perth' })
	},
	{
		value: 'Australia/Eucla',
		label: t('timezone.australia_eucla', { value: 'GMT +08:45', defaultValue: '{{value}} Eucla' })
	},
	{
		value: 'Asia/Chita',
		label: t('timezone.asia_chita', { value: 'GMT +09:00', defaultValue: '{{value}} Chita' })
	},
	{
		value: 'Asia/Pyongyang',
		label: t('timezone.asia_pyongyang', {
			value: 'GMT +09:00',
			defaultValue: '{{value}} Pyongyang'
		})
	},
	{
		value: 'Asia/Seoul',
		label: t('timezone.asia_seoul', { value: 'GMT +09:00', defaultValue: '{{value}} Korea' })
	},
	{
		value: 'Asia/Tokyo',
		label: t('timezone.asia_tokyo', { value: 'GMT +09:00', defaultValue: '{{value}} Japan' })
	},
	{
		value: 'Asia/Yakutsk',
		label: t('timezone.asia_yakutsk', {
			value: 'GMT +09:00',
			defaultValue: '{{value}} Yakutsk (RTZ 8)'
		})
	},
	{
		value: 'Australia/Adelaide',
		label: t('timezone.australia_adelaide', {
			value: 'GMT +09:30',
			defaultValue: '{{value}} Adelaide'
		})
	},
	{
		value: 'Australia/Darwin',
		label: t('timezone.australia_darwin', { value: 'GMT +09:30', defaultValue: '{{value}} Darwin' })
	},
	{
		value: 'Asia/Vladivostok',
		label: t('timezone.asia_vladivostok', {
			value: 'GMT +10:00',
			defaultValue: '{{value}} Vladivostok, Magadan (RTZ 9)'
		})
	},
	{
		value: 'Australia/Brisbane',
		label: t('timezone.australia_brisbane', {
			value: 'GMT +10:00',
			defaultValue: '{{value}} Brisbane'
		})
	},
	{
		value: 'Australia/Hobart',
		label: t('timezone.australia_hobart', { value: 'GMT +10:00', defaultValue: '{{value}} Hobart' })
	},
	{
		value: 'Australia/Sydney',
		label: t('timezone.australia_sydney', {
			value: 'GMT +10:00',
			defaultValue: '{{value}} Canberra, Melbourne, Sydney'
		})
	},
	{
		value: 'Pacific/Guam',
		label: t('timezone.pacific_guam', {
			value: 'GMT +10:00',
			defaultValue: '{{value}} Guam, Port Moresby'
		})
	},
	{
		value: 'Australia/Lord_Howe',
		label: t('timezone.australia_lord_howe', {
			value: 'GMT +10:30',
			defaultValue: '{{value}} Lord_Howe'
		})
	},
	{
		value: 'Asia/Magadan',
		label: t('timezone.asia_magadan', { value: 'GMT +11:00', defaultValue: '{{value}} Magadan' })
	},
	{
		value: 'Asia/Sakhalin',
		label: t('timezone.asia_sakhalin', { value: 'GMT +11:00', defaultValue: '{{value}} Sakhalin' })
	},
	{
		value: 'Asia/Srednekolymsk',
		label: t('timezone.asia_srednekolymsk', {
			value: 'GMT +11:00',
			defaultValue: '{{value}} Chokurdakh (RTZ 10)'
		})
	},
	{
		value: 'Pacific/Bougainville',
		label: t('timezone.pacific_bougainville', {
			value: 'GMT +11:00',
			defaultValue: '{{value}} Bougainville Standard Time'
		})
	},
	{
		value: 'Pacific/Guadalcanal',
		label: t('timezone.pacific_guadalcanal', {
			value: 'GMT +11:00',
			defaultValue: '{{value}} Solomon Is. / New Caledonia'
		})
	},
	{
		value: 'Pacific/Norfolk',
		label: t('timezone.pacific_norfolk', { value: 'GMT +11:00', defaultValue: '{{value}} Norfolk' })
	},
	{
		value: 'Asia/Kamchatka',
		label: t('timezone.asia_kamchatka', {
			value: 'GMT +12:00',
			defaultValue: '{{value}} Anadyr, Petropavlovsk-Kamchatsky (RTZ 11)'
		})
	},
	{
		value: 'Pacific/Auckland',
		label: t('timezone.pacific_auckland', {
			value: 'GMT +12:00',
			defaultValue: '{{value}} New Zealand'
		})
	},
	{
		value: 'Pacific/Fiji',
		label: t('timezone.pacific_fiji', { value: 'GMT +12:00', defaultValue: '{{value}} Fiji' })
	},
	{
		value: 'Pacific/Chatham',
		label: t('timezone.pacific_chatham', { value: 'GMT +12:45', defaultValue: '{{value}} Chatham' })
	},
	{
		value: 'Pacific/Apia',
		label: t('timezone.pacific_apia', { value: 'GMT +13:00', defaultValue: '{{value}} Samoa' })
	},
	{
		value: 'Pacific/Tongatapu',
		label: t('timezone.pacific_tongatapu', {
			value: 'GMT +13:00',
			defaultValue: '{{value}} Nuku’alofa'
		})
	},
	{
		value: 'Pacific/Kiritimati',
		label: t('timezone.pacific_kiritimati', {
			value: 'GMT +14:00',
			defaultValue: '{{value}} Kiritimati Island'
		})
	}
];

export const AccountStatus = (t: TFunction): Array<{ value?: string; label: string }> => [
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

export const BucketTypeItems = (t: TFunction): Array<{ value?: string; label: string }> => [
	{
		label: t('buckets.s3_types.alibaba_cloud_s3', 'Alibaba Cloud S3'),
		value: 'Alibaba'
	},
	{
		label: t('buckets.s3_types.amazone_web_service_s3', 'Amazon Web Service S3'),
		value: 'S3'
	},
	{
		label: t('buckets.s3_types.ceph_s3', 'Ceph S3'),
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
	}
];

export const volTableHeader = (
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
	{
		id: 'storeType',
		label: t('volume.volume_header.storageType', 'Storage Type'),
		width: '25%',
		bold: true,
		align: 'left'
	},
	{
		id: 'path',
		label: t('volume.volume_header.path', 'Path'),
		width: '47%',
		bold: true,
		align: 'left'
	},
	{
		id: 'current',
		label: t('volume.volume_header.current', 'Current'),
		width: '12%',
		align: 'left',
		bold: true
	},
	{
		id: 'compression',
		label: t('volume.volume_header.compression', 'Compression'),
		width: '14%',
		align: 'left',
		bold: true
	}
];

export const indexerHeaders = (
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
	{
		id: 'storeType',
		label: t('volume.volume_header.storageType', 'Storage Type'),
		width: '25%',
		bold: true,
		align: 'left'
	},
	{
		id: 'path',
		label: t('volume.volume_indexer_header.path', 'Path'),
		width: '61%',
		align: 'left',
		bold: true
	},
	{
		id: 'current',
		label: t('volume.volume_indexer_header.current', 'Current'),
		width: '14%',
		align: 'left',
		bold: true
	}
];

export const volumeTypeList = (t: TFunction): Array<{ label: string; value?: number }> => [
	{
		label: t('volume.volume_type.primary', 'Primary'),
		value: 1
	},
	{
		label: t('volume.volume_type.secondary', 'Secondary'),
		value: 2
	},
	{
		label: t('volume.volume_type.index', 'Index'),
		value: 10
	}
];

export const volumeAllocationList = (t: TFunction): Array<{ label: string; value?: number }> => [
	{
		label: t('volume.volume_allocation_list.local_block_device', 'Local Block Device'),
		value: 1
	},
	{
		label: t('volume.volume_allocation_list.object_storage', 'ObjectStorage'),
		value: 2
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
		width: '127px',
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

export const localeList = (
	t: TFunction
): Array<{ id: string; name: string; localName: string; value: string; label: string }> => [
	{
		id: 'zh_CN',
		name: '中文 (中国)',
		localName: t('locale.chinese_china', 'Chinese (China)'),
		label: t('locale.label_chinese', {
			value: '中文 (中国)',
			defaultValue: 'Chinese (China) - {{value}}'
		}),
		value: 'zh_CN'
	},
	{
		id: 'nl',
		name: 'Nederlands',
		localName: t('locale.dutch', 'Dutch'),
		label: t('locale.label_dutch', { value: 'Nederlands', defaultValue: 'Dutch - {{value}}' }),
		value: 'nl'
	},
	{
		id: 'en',
		name: 'English',
		localName: t('locale.English', 'English'),
		label: t('locale.label_english', { value: 'English', defaultValue: 'English - {{value}}' }),
		value: 'en'
	},
	{
		id: 'de',
		name: 'Deutsch',
		localName: t('locale.german', 'German'),
		label: t('locale.label_german', { value: 'Deutsch', defaultValue: 'German - {{value}}' }),
		value: 'de'
	},
	{
		id: 'hi',
		name: 'हिंदी',
		localName: t('locale.hindi', 'Hindi'),
		label: t('locale.label_hindi', { value: 'हिंदी', defaultValue: 'Hindi - {{value}}' }),
		value: 'hi'
	},
	{
		id: 'it',
		name: 'italiano',
		localName: t('locale.italian', 'Italian'),
		label: t('locale.label_italian', { value: 'italiano', defaultValue: 'Italian - {{value}}' }),
		value: 'it'
	},
	{
		id: 'ja',
		name: '日本語',
		localName: t('locale.japanese', 'Japanese'),
		label: t('locale.label_japanese', { value: '日本語', defaultValue: 'Japanese - {{value}}' }),
		value: 'ja'
	},

	{
		id: 'pt',
		name: 'português',
		localName: t('locale.portuguese', 'Portuguese'),
		label: t('locale.label_portuguese', {
			value: 'português',
			defaultValue: 'Portuguese - {{value}}'
		}),
		value: 'pt'
	},
	{
		id: 'pt_BR',
		name: 'português (Brasil)',
		localName: t('locale.portuguese_brazil', 'Portuguese (Brazil)'),
		label: t('locale.label_portuguese_brazil', {
			value: 'português (Brasil)',
			defaultValue: 'Portuguese - {{value}}'
		}),
		value: 'pt_BR'
	},

	{
		id: 'ro',
		name: 'română',
		localName: t('locale.romanian', 'Romanian'),
		label: t('locale.label_romanian', { value: 'română', defaultValue: 'Romanian - {{value}}' }),
		value: 'ro'
	},
	{
		id: 'ru',
		name: 'русский',
		localName: t('locale.russian', 'Russian'),
		label: t('locale.label_russian', { value: 'русский', defaultValue: 'Russian - {{value}}' }),
		value: 'ru'
	},

	{
		id: 'es',
		name: 'español',
		localName: t('locale.spanish', 'Spanish'),
		label: t('locale.label_spanish', { value: 'español', defaultValue: 'Spanish - {{value}}' }),
		value: 'es'
	},

	{
		id: 'th',
		name: 'ไทย',
		localName: t('locale.thai', 'Thai'),
		label: t('locale.label_thai', { value: 'ไทย', defaultValue: 'Thai - {{value}}' }),
		value: 'th'
	},
	{
		id: 'tr',
		name: 'Türkçe',
		localName: t('locale.turkish', 'Turkish'),
		label: t('locale.label_turkish', { value: 'Türkçe', defaultValue: 'Turkish - {{value}}' }),
		value: 'tr'
	},
	{
		id: 'fr',
		name: 'français',
		localName: t('locale.french', 'French'),
		label: t('locale.label_french', { value: 'français', defaultValue: 'French - {{value}}' }),
		value: 'fr'
	},
	{
		id: 'vi',
		name: 'Tiếng Việt',
		localName: t('locale.vietnamese', 'Vietnamese'),
		label: 'Vietnamese - Tiếng Việt',
		value: 'vi'
	}
];

export const BucketRegions = (t: TFunction): Array<{ value?: string; label: string }> => [
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

export const BucketRegionsInAlibaba = (t: TFunction): Array<{ value?: string; label: string }> => [
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

export const CertificateTypes = (t: TFunction): Array<{ value?: string; label: string }> => [
	{
		label: t(
			'domain.certificate_type_use_letsencrypt',
			'I want to use a Let’s Encrypt Certificate'
		),
		value: '1'
	},
	{
		label: t('domain.certificate_type_use_custom', 'I want to use a Custom Certificate'),
		value: '2'
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

export const isValidEmail = (email: string): boolean => {
	const re =
		/^[_A-Za-z0-9-\\+]+(\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9]+)*(\.[A-Za-z]{2,})$/;
	return re.test(email);
};

export const isValidLdapBaseUrl = (url: string): boolean => {
	const reqex =
		// eslint-disable-next-line max-len
		/^(?:ldap)s?:\/\/(([a-z0-9]|[a-z0-9][a-z0-9\\-]*[a-z0-9])\.)*([a-z0-9]|[a-z0-9][a-z0-9\\-]*[a-z0-9])(:[0-9]+)?$/;
	return reqex.test(url);
};

export const getAllEmailFromString = (str: string): any =>
	str
		.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)
		?.map((item: any) => item.replace('>', ''));

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

export const conversationGroupBy = (t: TFunction): Array<{ value?: string; label: string }> => [
	{
		label: t('label.message', 'Message'),
		value: 'message'
	},
	{
		label: t('label.conversation', 'Conversation'),
		value: 'conversation'
	}
];

export const deligateSendSettings = (t: TFunction): Array<{ value?: string; label: string }> => [
	{
		label: t(
			'label.save_a_copy_of_sent_messages_only_in_delegates_send_folder',
			`Save a copy of sent messages only in delegate's send folder`
		),
		value: 'owner'
	},
	{
		label: t(
			'label.save_a_copy_of_sent_messages_only_in_delegateds_send_folder',
			`Save a copy of sent messages only in delegated's send folder`
		),
		value: 'sender'
	},
	{
		label: t(
			'label.save_a_copy_of_sent_messages_to_delegate_and_delegated_send_folder',
			`Save a copy of sent messages to delegate and delegated send folde`
		),
		value: 'both'
	},
	{
		label: t('label.dont_save_a_copy_of_sent_messages', `Don't save a copy of sent messages`),
		value: 'none'
	}
];

export const delegateType = (t: TFunction): Array<{ value?: string; label: string }> => [
	{
		label: t('account_details.a_user', 'A User'),
		value: 'usr'
	},
	{
		label: t('account_details.an_existing_group', 'An Existing Group'),
		value: 'grp'
	}
];

export const delegateRightsType = (t: TFunction): Array<{ value?: string; label: string }> => [
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

export const appointmentReminder = (t: TFunction): Array<{ value?: string; label: string }> => [
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

export const charactorSet = (): Array<{ value?: string; label: string }> => [
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
