/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
	GENERAL_INFORMATION,
	FEATURES,
	PREFERENCES,
	ADVANCED,
	SERVER_POOLS
} from '../../constants';
import { getCosGeneralInformation } from '../../services/cos-general-information-service';
import { searchDirectory } from '../../services/search-directory-service';
import { useCosStore } from '../../store/cos/store';
import CosAdvanced from './cos-advanced';
import CosFeatures from './cos-features';
import CosGeneralInformation from './cos-general-information';
import CosPreference from './cos-preferences';
import CosServerPools from './cos-server-pools';

const CosDetailOperation: FC = () => {
	const { operation, cosId }: { operation: string; cosId: string } = useParams();
	const setCos = useCosStore((state) => state.setCos);
	const setTotalAccount = useCosStore((state) => state.setTotalAccount);
	const setTotalDomain = useCosStore((state) => state.setTotalDomain);

	const getTotalDomain = useCallback(
		(id: any, isDefaultCos: boolean): any => {
			let query = `(zimbraDomainDefaultCOSId=${id})`;
			if (isDefaultCos) {
				query = `(|(!(zimbraDomainDefaultCOSId=*))(zimbraDomainDefaultCOSId=${id}))`;
			}
			searchDirectory('', 'domains', '', query, 0, -1)
				.then((response) => response.json())
				.then((data) => {
					const totalDomain = data?.Body?.SearchDirectoryResponse?.searchTotal || 0;
					setTotalDomain(totalDomain);
				});
		},
		[setTotalDomain]
	);

	const getTotalAccount = useCallback(
		(id: any, isDefaultCos: boolean): any => {
			let query = `(&(zimbraCOSId=${id})(!(zimbraIsSystemAccount=TRUE)))`;
			if (isDefaultCos) {
				query = `(&(|(&(!(zimbraCOSId=*))(!(zimbraIsExternalVirtualAccount=TRUE)))(zimbraCOSId=${id}))(!(zimbraIsSystemAccount=TRUE)))`;
			}
			searchDirectory('', 'accounts', '', query, 0, -1)
				.then((response) => response.json())
				.then((data) => {
					const totalAccount = data?.Body?.SearchDirectoryResponse?.searchTotal || 0;
					setTotalAccount(totalAccount);
				});
		},
		[setTotalAccount]
	);

	const getSelectedCosInformation = useCallback(
		(id: any): any => {
			getCosGeneralInformation(id)
				.then((response) => response.json())
				.then((data) => {
					const cos = data?.Body?.GetCosResponse?.cos[0];
					if (cos) {
						setCos(cos);
						getTotalAccount(cos.id, !!cos?.isDefaultCos);
						getTotalDomain(cos.id, !!cos?.isDefaultCos);
					}
				});
		},
		[getTotalAccount, getTotalDomain, setCos]
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
					case ADVANCED:
						return <CosAdvanced />;
					case SERVER_POOLS:
						return <CosServerPools />;
					default:
						return null;
				}
			})()}
		</>
	);
};

export default CosDetailOperation;
