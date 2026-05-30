/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCurrentUserRights, useIsAdvanced } from '@zextras/ui-shared';
import { find } from 'lodash-es';
import { useParams } from 'react-router';

import {
	COS,
	MOBILE_CALENDAR_FEATURE_SYNC,
	MOBILE_CONTACT_FEATURE_SYNC,
} from '../../../constants';
import { useCoreAttributes } from '../../../services/use-core-attributes';
import { useCosDetail } from '../../../services/use-cos-detail';
import { FeaturesForm } from './features-form';

export function CosFeatures() {
	const { cosId } = useParams();
	const { data: cosDetailData, isPending } = useCosDetail(cosId);
	const cosInformation = cosDetailData?.cos?.[0]?.a;
	const cosName = cosDetailData?.cos?.[0]?.name;
	const { data: rights = [] } = useCurrentUserRights();
	const isAdvanced = useIsAdvanced();

	const rightsConfig = find(rights, { type: COS }) || { all: [], type: COS };
	const readonlyCOS = !rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;

	const mobileFeatureBody =
		isAdvanced && cosName
			? [
					{
						configType: COS,
						configName: [cosName],
						attrName: [MOBILE_CONTACT_FEATURE_SYNC, MOBILE_CALENDAR_FEATURE_SYNC],
					},
				]
			: [];

	const { data: mobileAttributesData, isPending: isMobilePending } =
		useCoreAttributes(mobileFeatureBody);

	const isMobileLoading = isAdvanced && isMobilePending;

	if (isPending || isMobileLoading) {
		return <ds-page-shimmer></ds-page-shimmer>;
	}

	return (
		<FeaturesForm
			cosInformation={cosInformation}
			cosName={cosName}
			mobileAttributesData={mobileAttributesData}
			readonlyCOS={readonlyCOS}
			isAdvanced={isAdvanced}
		/>
	);
}
