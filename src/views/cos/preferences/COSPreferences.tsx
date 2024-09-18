/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { Container, useSnackbar } from '@zextras/carbonio-design-system';
import { find } from 'lodash';
import { useTranslation } from 'react-i18next';

import GeneralOptions from './GeneralOptions';
import MailOptions from './MailOptions';
import SaveCancelBar from './SaveCancelBar';
import { CosAttributes, CosPrefAttributes } from '../../../../types';
import { COS } from '../../../constants';
import { flushCache } from '../../../services/flush-cache-service';
import { modifyCos, ModifyCosBody } from '../../../services/modify-cos-service';
import { useCosStore } from '../../../store/cos/store';
import { Right, Rights, useRightsStore } from '../../../store/rights/store';
import { localeList } from '../../utility/utils';
import { DEFAULT_COS_PREF_ATTRIBUTES } from '../constants';

const COSPreferences: FC = () => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const cosInformation = useCosStore((state) => state.cos?.a);
	const rights: Rights = useRightsStore((state) => state.rights);
	const setCos = useCosStore((state) => state.setCos);

	const localeZone = useMemo(() => localeList(t), [t]);
	const readonlyCOS = useMemo(() => {
		const rightsConfig: Right = find(rights, { type: COS }) || { all: [], type: COS };
		return !rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
	}, [rights]);

	const [currentCosAttributes, setCurrentCosAttributes] = useState<CosAttributes>();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [draftCosPrefAttributes, setDraftCosPrefAttributes] = useState<CosPrefAttributes>(
		DEFAULT_COS_PREF_ATTRIBUTES
	);

	const haveChangesToSave = useCallback((): boolean => {
		let hasChanges = false;
		if (currentCosAttributes) {
			Object.keys(currentCosAttributes).forEach((key) => {
				const typedKey = key as keyof CosPrefAttributes;

				if (draftCosPrefAttributes[typedKey] !== currentCosAttributes[typedKey]) {
					hasChanges = true;
				}
			});
		}

		return hasChanges;
	}, [draftCosPrefAttributes, currentCosAttributes]);

	const updateCosPrefAttribute = useCallback((key: keyof CosPrefAttributes, value: string) => {
		setDraftCosPrefAttributes((prev) => ({
			...prev,
			[key]: value
		}));
	}, []);

	const changeSwitchOption = useCallback((key: keyof CosPrefAttributes): void => {
		setDraftCosPrefAttributes((prev: CosPrefAttributes) => ({
			...prev,
			[key]: prev[key] === 'TRUE' ? 'FALSE' : 'TRUE'
		}));
	}, []);

	const setInitialValues = useCallback((obj: CosPrefAttributes) => {
		setDraftCosPrefAttributes((prev) => ({
			...DEFAULT_COS_PREF_ATTRIBUTES,
			...prev,
			...obj
		}));
	}, []);

	useEffect(() => {
		const hasChanges = haveChangesToSave();
		setIsDirty(hasChanges);
	}, [draftCosPrefAttributes, haveChangesToSave]);

	const handleSave = (): void => {
		const zimbraID = currentCosAttributes?.zimbraId;
		if (!zimbraID) return;

		const body: ModifyCosBody = {
			_jsns: 'urn:zimbraAdmin',
			id: { _content: zimbraID },
			a: Object.keys(DEFAULT_COS_PREF_ATTRIBUTES).map((key) => ({
				n: key,
				_content: draftCosPrefAttributes[key as keyof CosPrefAttributes]
			}))
		};

		modifyCos(body)
			.then((data) => {
				flushCache('cos', 'id', body.id._content);
				createSnackbar({
					key: 'success',
					type: 'success',
					label: t('label.change_save_success_msg', 'The change has been saved successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				setCos(data?.cos[0]);
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label:
						error?.message ||
						t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	};

	const handleCancel = (): void => {
		currentCosAttributes && setInitialValues(currentCosAttributes);
	};

	useEffect(() => {
		if (!!cosInformation && cosInformation.length > 0) {
			const obj: Partial<CosPrefAttributes> = {};
			cosInformation.forEach((item: Attribute) => {
				obj[item?.n] = item._content;
			});
			setCurrentCosAttributes(obj);
			setInitialValues(obj);
		}
	}, [cosInformation, setInitialValues]);

	return (
		<Container mainAlignment="flex-start" background={'gray6'} padding={{ all: 'large' }}>
			<SaveCancelBar isDirty={isDirty} onSave={handleSave} onCancel={handleCancel} />
			<GeneralOptions
				cosPrefAttributes={draftCosPrefAttributes}
				localeZone={localeZone}
				onPrefLocaleChange={(v): void => updateCosPrefAttribute('zimbraPrefLocale', v)}
				readonlyCOS={readonlyCOS}
			/>
			<MailOptions
				changeSwitchOption={changeSwitchOption}
				cosPrefAttributes={draftCosPrefAttributes}
				onFileUploadMaxSizePerFileChange={(v): void =>
					updateCosPrefAttribute('zimbraFileUploadMaxSizePerFile', v)
				}
				onCharactorSetChange={(v): void =>
					updateCosPrefAttribute('zimbraPrefMailDefaultCharset', v)
				}
				onGroupByChange={(v): void => updateCosPrefAttribute('zimbraPrefGroupMailBy', v)}
				isReadonlyCOSEntry={readonlyCOS}
			/>
		</Container>
	);
};

export default COSPreferences;
