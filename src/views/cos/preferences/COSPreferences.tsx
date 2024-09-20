/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { Container, Divider, SelectItem, useSnackbar } from '@zextras/carbonio-design-system';
import { find } from 'lodash';
import { useTranslation } from 'react-i18next';

import CalendarOptions from './CalendarOptions';
import ContactOptions from './ContactOptions';
import ForwardingOptions from './ForwardingOptions';
import GeneralOptions from './GeneralOptions';
import MailOptions from './MailOptions';
import ReceivingMails from './ReceivingMails';
import SaveCancelBar from './SaveCancelBar';
import SendingMails from './SendingMails';
import { Attribute, CosAttributes, CosPrefAttributes } from '../../../../types';
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

	const locales = useMemo(() => localeList(t), [t]);
	const readonlyCOS = useMemo(() => {
		const rightsConfig: Right = find(rights, { type: COS }) || { all: [], type: COS };
		return !rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
	}, [rights]);

	const [currentCosAttributes, setCurrentCosAttributes] = useState<Partial<CosAttributes>>();
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

	const handleCosPrefAttributeChange = useCallback(
		(key: keyof CosPrefAttributes, value: SelectItem | string | null) => {
			if (value === null) return;
			const newValue = typeof value === 'object' && 'value' in value ? value.value : value;
			setDraftCosPrefAttributes((prev) => ({
				...prev,
				[key]: newValue
			}));
		},
		[]
	);

	const handleSwitchOptionChange = useCallback((key: keyof CosPrefAttributes): void => {
		setDraftCosPrefAttributes((prev: CosPrefAttributes) => ({
			...prev,
			[key]: prev[key] === 'TRUE' ? 'FALSE' : 'TRUE'
		}));
	}, []);

	const setInitialValues = useCallback((initialCosPrefAttributes: Partial<CosAttributes>) => {
		setDraftCosPrefAttributes((prev) => ({
			...DEFAULT_COS_PREF_ATTRIBUTES,
			...prev,
			...initialCosPrefAttributes
		}));
	}, []);

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
		const hasChanges = haveChangesToSave();
		setIsDirty(hasChanges);
	}, [draftCosPrefAttributes, haveChangesToSave]);

	useEffect(() => {
		if (!!cosInformation && cosInformation.length > 0) {
			const initialCosPrefAttributes: Partial<CosAttributes> = {};
			cosInformation.forEach((item: Attribute) => {
				const key = item?.n as keyof CosAttributes;
				initialCosPrefAttributes[key] = item._content;
			});
			setCurrentCosAttributes(initialCosPrefAttributes);
			setInitialValues(initialCosPrefAttributes);
		}
	}, [cosInformation, setInitialValues]);

	return (
		<Container mainAlignment="flex-start" background={'gray6'} padding={{ all: 'large' }}>
			<SaveCancelBar isDirty={isDirty} onSave={handleSave} onCancel={handleCancel} />
			<Divider />
			<Container
				mainAlignment="flex-start"
				width="100%"
				orientation="vertical"
				style={{ overflow: 'auto' }}
				padding={{ top: 'large' }}
			>
				<GeneralOptions
					cosPrefAttributes={draftCosPrefAttributes}
					locales={locales}
					onPrefLocaleChange={(selectedItem: string): void =>
						handleCosPrefAttributeChange('zimbraPrefLocale', selectedItem)
					}
					readonlyCOS={readonlyCOS}
				/>
				<Divider />
				<MailOptions
					changeSwitchOption={handleSwitchOptionChange}
					cosPrefAttributes={draftCosPrefAttributes}
					onFileUploadMaxSizePerFileChange={(v): void =>
						handleCosPrefAttributeChange('zimbraFileUploadMaxSizePerFile', v)
					}
					onCharactorSetChange={(v): void =>
						handleCosPrefAttributeChange('zimbraPrefMailDefaultCharset', v)
					}
					onGroupByChange={(v): void => handleCosPrefAttributeChange('zimbraPrefGroupMailBy', v)}
					isReadonlyCOSEntry={readonlyCOS}
				/>
				<Divider />
				<ReceivingMails
					cosPrefAttributes={draftCosPrefAttributes}
					isReadonlyCOSEntry={readonlyCOS}
					onPollingIntervalChange={(v): void =>
						handleCosPrefAttributeChange('zimbraPrefMailPollingInterval', v)
					}
					onMailMinPollingIntervalChange={(v): void =>
						handleCosPrefAttributeChange('zimbraMailMinPollingInterval', v)
					}
				/>
				<Divider />
				<ForwardingOptions
					changeSwitchOption={handleSwitchOptionChange}
					cosPrefAttributes={draftCosPrefAttributes}
					isReadonlyCOSEntry={readonlyCOS}
				/>
				<Divider />
				<SendingMails
					cosPrefAttributes={draftCosPrefAttributes}
					readonlyCOS={readonlyCOS}
					onCosAttributeChanged={(attribute, value): void =>
						handleCosPrefAttributeChange(attribute, value)
					}
					changeSwitchOption={handleSwitchOptionChange}
				/>
				<Divider />
				<ContactOptions
					cosPrefAttributes={draftCosPrefAttributes}
					readonlyCOS={readonlyCOS}
					changeSwitchOption={handleSwitchOptionChange}
				/>
				<Divider />
				<CalendarOptions
					cosPrefAttributes={draftCosPrefAttributes}
					isReadonlyCOSEntry={readonlyCOS}
					onCosAttributeChanged={(attribute, value): void =>
						handleCosPrefAttributeChange(attribute, value)
					}
					onSwitchOptionChanged={handleSwitchOptionChange}
				/>
			</Container>
		</Container>
	);
};

export default COSPreferences;
