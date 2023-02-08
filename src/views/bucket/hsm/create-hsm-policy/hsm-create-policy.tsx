/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Text, Padding, Divider, Tooltip, Input } from '@zextras/carbonio-design-system';
import React, { FC, useContext, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ListRow from '../../../list/list-row';
import { HSMContext } from '../hsm-context/hsm-context';

const HSMcreatePolicy: FC<any> = () => {
	const [t] = useTranslation();
	const context = useContext(HSMContext);
	const { hsmDetail, setHsmDetail } = context;
	const [abstractString, setAbstractString] = useState<string>('');
	const [hsmQuery, setHsmQuery] = useState<string>('');
	const [sourceVolumeNames, setSourceVolumeNames] = useState<string>('');
	const [destinationVolumeNames, setDestinationVolumeNames] = useState<string>('');
	useEffect(() => {
		const enabledString: string[] = [];
		const beforeString: string[] = [];
		const afterString: string[] = [];
		const largerSmallerString: string[] = [];
		const sourceString: string[] = [];
		const destinationString: string[] = [];
		let query = '';
		const criteriaScale: string[] = [];
		if (hsmDetail?.isAllEnabled) {
			enabledString.push(t('hsm.message', 'Message'));
			enabledString.push(t('hsm.document', 'Document'));
			enabledString.push(t('hsm.event', 'Event'));
			enabledString.push(t('hsm.contact', 'Contact'));
			query += 'document,message,contact,appointment';
		} else {
			if (hsmDetail?.isDocumentEnabled) {
				enabledString.push(t('hsm.document', 'Document'));
				criteriaScale.push('document');
			}
			if (hsmDetail?.isMessageEnabled) {
				enabledString.push(t('hsm.message', 'Message'));
				criteriaScale.push('message');
			}
			if (hsmDetail?.isContactEnabled) {
				enabledString.push(t('hsm.contact', 'Contact'));
				criteriaScale.push('contact');
			}
			if (hsmDetail?.isEventEnabled) {
				enabledString.push(t('hsm.event', 'Event'));
				criteriaScale.push('appointment');
			}
		}
		if (criteriaScale.length > 0) {
			query += criteriaScale.toString();
		}
		if (hsmDetail?.policyCriteria.length > 0) {
			hsmDetail?.policyCriteria.forEach((item: any, index: number) => {
				if (item?.option === 'before') {
					query += `:${item?.option}:-${item?.dateScale}${item?.scale}`;
				} else if (item?.option === 'after') {
					query += `:${item?.option}:${item?.dateScale}${item?.scale}`;
				} else if (item?.option === 'larger') {
					query += `:${item?.option}:${item?.dateScale}${item?.scale}`;
					largerSmallerString.push(
						`${(
							<Trans
								i18nKey="hsm.larger_size_than"
								defaults="larger than <bold>{{measure}} {{scale}}</bod>"
								components={{ bold: <strong />, measure: item?.dateScale, scale: item?.scale }}
							/>
						)}`
					);
				} else if (item?.option === 'smaller') {
					query += `:${item?.option}:${item?.dateScale}${item?.scale}`;
					largerSmallerString.push(
						`${(
							<Trans
								i18nKey="hsm.smaller_size_than"
								defaults="smaller than <bold>{{measure}} {{scale}}</bod>"
								components={{ bold: <strong />, measure: item?.dateScale, scale: item?.scale }}
							/>
						)}`
					);
				}
			});
		}

		if (hsmDetail?.sourceVolume.length > 0) {
			sourceString.push(hsmDetail?.sourceVolume.map((item: any) => item?.name).toString());
			query += ` source: ${hsmDetail?.sourceVolume.map((item: any) => item?.id).toString()}`;
		}

		if (hsmDetail?.destinationVolume.length > 0) {
			destinationString.push(
				hsmDetail?.destinationVolume.map((item: any) => item?.name).toString()
			);
			query += ` destination: ${hsmDetail?.destinationVolume
				.map((item: any) => item?.id)
				.toString()}`;
		}
		setHsmQuery(query);
		if (sourceString.length > 0 || destinationString.length > 0) {
			setAbstractString(
				`${(
					<Trans
						i18nKey="hsm.abstract_msg_2"
						defaults="<b>{{enables}} {{largerSmaller}}</b> stored in {{source}} will be moved to {{destination}}. This will affect data stored in the <bold>{{previous}}</bold> and in the <bold>{{next}}</bold>."
						components={{
							bold: <strong />,
							enables: enabledString.join(', '),
							largerSmaller: largerSmallerString.join(', '),
							previous: beforeString.join(', '),
							next: afterString.join(', '),
							source: sourceString.join(', '),
							destination: destinationString.join(', ')
						}}
					/>
				)}`
			);
		} else {
			setAbstractString(
				`${(
					<Trans
						i18nKey="hsm.abstract_msg_1"
						defaults="<bold>{{enables}} {{largerSmaller}}</bod>. This will affect data stored in the <bold>{{previous}}</bold> and in the <bold>{{next}}</bold>."
						components={{
							bold: <strong />,
							enables: enabledString.join(', '),
							largerSmaller: largerSmallerString.join(', '),
							previous: beforeString.join(', '),
							next: afterString.join(', ')
						}}
					/>
				)}`
			);
		}
	}, [hsmDetail, t]);

	useEffect(() => {
		if (hsmDetail?.sourceVolume.length > 0) {
			setSourceVolumeNames(hsmDetail?.sourceVolume.map((item: any) => item?.name).join());
		}
	}, [hsmDetail?.sourceVolume]);

	useEffect(() => {
		if (hsmDetail?.destinationVolume.length > 0) {
			setDestinationVolumeNames(hsmDetail?.destinationVolume.map((item: any) => item?.name).join());
		}
	}, [hsmDetail?.destinationVolume]);
	return (
		<Container
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			height="calc(100vh - 300px)"
			background="white"
			style={{ overflow: 'auto' }}
			padding={{ all: 'large' }}
		>
			<ListRow>
				<Padding bottom="large">
					<Text size="large" weight="bold">
						{t('hsm.new_policy_summary', 'New Policy Summary')}
					</Text>
				</Padding>
			</ListRow>
			<ListRow>
				<Padding left="large">
					<Text size="small" weight="regular" color="secondry">
						{t('hsm.parameters', 'Parameters')}
					</Text>
				</Padding>
			</ListRow>
			<ListRow>
				<Padding top="extrasmall" left="large">
					<Tooltip placement="bottom" label={hsmQuery} maxWidth="auto">
						<Text size="medium" weight="regular" color="gray0">
							{hsmQuery}
						</Text>
					</Tooltip>
				</Padding>
			</ListRow>
			<ListRow>
				<Container padding={{ top: 'small' }}>
					<Divider color="gray2" />
				</Container>
			</ListRow>
			<ListRow>
				<Container padding={{ top: 'large' }}>
					<Input
						label={t('hsm.source_volume', 'Source Volume')}
						background="gray6"
						value={sourceVolumeNames}
					/>
				</Container>
			</ListRow>
			<ListRow>
				<Container padding={{ top: 'large' }}>
					<Input
						label={t('hsm.destination_volume', 'Destination Volume')}
						background="gray6"
						value={destinationVolumeNames}
					/>
				</Container>
			</ListRow>
		</Container>
	);
};

export default HSMcreatePolicy;
