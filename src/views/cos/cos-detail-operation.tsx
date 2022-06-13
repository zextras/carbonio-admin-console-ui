/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GENERAL_INFORMATION, FEATURES, PREFERENCES } from '../../constants';
import { getCosGeneralInformation } from '../../services/cos-general-information-service';
import { useCosStore } from '../../store/cos/store';
import CosFeatures from './cos-features';
import CosGeneralInformation from './cos-general-information';
import CosPreference from './cos-preferences';

const CosDetailOperation: FC = () => {
	const { operation, cosId }: { operation: string; cosId: string } = useParams();
	const setCos = useCosStore((state) => state.setCos);

	const getSelectedCosInformation = useCallback(
		(id: any): any => {
			getCosGeneralInformation(id)
				.then((response) => response.json())
				.then((data) => {
					const cos = data?.Body?.GetCosResponse?.cos[0];
					if (cos) {
						setCos(cos);
					}
				});
		},
		[setCos]
	);
	useEffect(() => {
		getSelectedCosInformation(cosId);
	}, [cosId, getSelectedCosInformation]);

	return (
		<>
			{((): any => {
				switch (operation) {
					case GENERAL_INFORMATION:
						return <CosGeneralInformation />;
					case FEATURES:
						return <CosFeatures />;
					case PREFERENCES:
						return <CosPreference />;
					default:
						return null;
				}
			})()}
		</>
	);
};

export default CosDetailOperation;
