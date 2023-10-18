/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SnackbarManagerContext } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
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
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [t] = useTranslation();
	const setCos = useCosStore((state) => state.setCos);
	const setTotalAccount = useCosStore((state) => state.setTotalAccount);
	const setTotalDomain = useCosStore((state) => state.setTotalDomain);

	const getTotalDomain = useCallback(
		(id: any): any => {
			const query = `(zimbraDomainDefaultCOSId=${id})`;
			searchDirectory('', 'domains', '', query, 0, -1).then((data) => {
				const totalDomain = data?.searchTotal || 0;
				setTotalDomain(totalDomain);
			});
		},
		[setTotalDomain]
	);

	const getTotalAccount = useCallback(
		(id: any): any => {
			const query = `(&(zimbraCOSId=${id})(!(zimbraIsSystemAccount=TRUE)))`;
			searchDirectory('', 'accounts', '', query, 0, -1).then((data) => {
				const totalAccount = data?.searchTotal || 0;
				setTotalAccount(totalAccount);
			});
		},
		[setTotalAccount]
	);

	const getSelectedCosInformation = useCallback(
		(id: any): any => {
			getCosGeneralInformation(id)
				.then((data) => {
					const cos = data?.cos[0];
					if (cos) {
						setCos(cos);
						getTotalAccount(cos.id);
						getTotalDomain(cos.id);
					}
				})
				.catch((error) => {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: error.message
							? error.message
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				});
		},
		[getTotalAccount, getTotalDomain, setCos, t, createSnackbar]
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
