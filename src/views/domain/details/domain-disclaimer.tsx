/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import {
	Container,
	Button,
	Row,
	Padding,
	Divider,
	Text,
	useSnackbar,
	Switch,
	TextArea
} from '@zextras/carbonio-design-system';
import { useIntegratedComponent, useUserSettings } from '@zextras/carbonio-shell-ui';
import { encode } from 'html-entities';
import { isEqual } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { DomainDisclaimerType, objectType } from '../../../../types';
import {
	AMAVIS_DISCLAIMER_OPTIONS,
	FALSE,
	TRUE,
	ZIMBRA_ADMIN_URN,
	ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_HTML,
	ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_TEXT,
	ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED
} from '../../../constants';
import { flushCache } from '../../../services/flush-cache-service';
import { modifyDomain } from '../../../services/modify-domain-service';
import { useDomainStore } from '../../../store/domain/store';
import ListRow from '../../list/list-row';

const EditorWrapper = styled.div`
	width: 100%;
	height: 100%;
	overflow-y: auto;
	position: relative;
	.tox-edit-area {
		iframe {
			background: ${({ theme }): string => theme.palette.gray5.regular};
		}
	}
`;

const TextAreaEditor = styled(TextArea)`
	min-height: 20.5rem;
`;

const DomainDisclaimer: FC = () => {
	const [t] = useTranslation();
	const domainInformation = useDomainStore((state) => state.domain?.a);
	const domainId = useDomainStore((state) => state.domain?.id);
	const domainName = useDomainStore((state) => state.domain?.name);
	const setDomain = useDomainStore((state) => state.setDomain);
	const createSnackbar = useSnackbar();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [Composer] = useIntegratedComponent('composer');
	const [defaulRichTextContent, setDefaulRichTextContent] = useState<string>('');
	const [domainDisclaimerInitialDetail, setDomainDisclaimerInitialDetail] =
		useState<DomainDisclaimerType>();
	const [domainDisclaimerDetail, setDomainDisclaimerDetail] = useState<DomainDisclaimerType>();
	const setInitialValue = useCallback((key: string, value: unknown): void => {
		setDomainDisclaimerInitialDetail((prev: any) => ({ ...prev, [key]: value }));
	}, []);

	const setValue = useCallback((key: string, value: unknown): void => {
		setDomainDisclaimerDetail((prev: any) => ({ ...prev, [key]: value }));
	}, []);
	const [isGlobalAdmin, setIsGlobalAdmin] = useState<boolean>(false);
	const userSetting = useUserSettings();
	useEffect(() => {
		if (userSetting?.attrs) {
			const account = userSetting?.attrs?.zimbraIsAdminAccount;
			if (account && account === TRUE) {
				setIsGlobalAdmin(true);
			}
		}
	}, [userSetting?.attrs]);

	const setInitialAndCurrentValue = useCallback(
		(key: string, value: unknown) => {
			setInitialValue(key, value);
			setValue(key, value);
		},
		[setInitialValue, setValue]
	);

	useMemo(() => {
		if (domainInformation) {
			const zimbraDomainMandatoryMailSignatureEnabled = domainInformation.filter(
				(item) => item?.n === ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED
			);
			if (
				zimbraDomainMandatoryMailSignatureEnabled &&
				zimbraDomainMandatoryMailSignatureEnabled[0]?._content
			) {
				setInitialAndCurrentValue(
					ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED,
					zimbraDomainMandatoryMailSignatureEnabled[0]?._content === TRUE
				);
			} else {
				setInitialAndCurrentValue(ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED, false);
			}

			const zimbraAmavisDomainDisclaimerText = domainInformation.filter(
				(item) => item?.n === ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_TEXT
			);
			if (zimbraAmavisDomainDisclaimerText && zimbraAmavisDomainDisclaimerText[0]?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_TEXT,
					zimbraAmavisDomainDisclaimerText[0]?._content
				);
			} else {
				setInitialAndCurrentValue(ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_TEXT, '');
			}

			const zimbraAmavisDomainDisclaimerHtml = domainInformation.filter(
				(item) => item?.n === ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_HTML
			);
			if (zimbraAmavisDomainDisclaimerHtml && zimbraAmavisDomainDisclaimerHtml[0]?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_HTML,
					zimbraAmavisDomainDisclaimerHtml[0]?._content
				);
				setDefaulRichTextContent(zimbraAmavisDomainDisclaimerHtml[0]?._content);
			} else {
				setInitialAndCurrentValue(ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_HTML, '');
				setDefaulRichTextContent('');
			}
		}
	}, [domainInformation, setInitialAndCurrentValue]);

	useEffect(() => {
		if (domainDisclaimerDetail && !isEqual(domainDisclaimerDetail, domainDisclaimerInitialDetail)) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [domainDisclaimerDetail, domainDisclaimerInitialDetail]);

	const onCancel = useCallback(() => {
		setDefaulRichTextContent(domainDisclaimerInitialDetail?.zimbraAmavisDomainDisclaimerHTML || '');
		setDomainDisclaimerDetail(domainDisclaimerInitialDetail);
	}, [domainDisclaimerInitialDetail]);

	const onSave = useCallback(() => {
		const body: any = {};
		const attributes: Array<Record<string, string | undefined>> = [];
		body.id = domainId;
		body._jsns = ZIMBRA_ADMIN_URN;

		if (domainDisclaimerDetail?.zimbraAmavisDomainDisclaimerText) {
			// Convert accented char
			const convertDiatrictTextSignature = domainDisclaimerDetail?.zimbraAmavisDomainDisclaimerText
				.normalize('NFD')
				.replace(/\p{Diacritic}/gu, "'");
			// add new line after 996 char
			const limitTextSignature = convertDiatrictTextSignature.replace(/(.{996})/g, '$1\n');
			attributes.push({
				n: ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_TEXT,
				_content: limitTextSignature
			});
		} else {
			attributes.push({
				n: ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_TEXT,
				_content: ''
			});
		}

		if (domainDisclaimerDetail?.zimbraAmavisDomainDisclaimerHTML) {
			// Convert nonAsciiPrintableOnly entities into html entities
			const encodeHtmlSignature = encode(domainDisclaimerDetail?.zimbraAmavisDomainDisclaimerHTML, {
				mode: 'nonAsciiPrintableOnly'
			});
			// add new line after 996 char
			const limitHtmlSignature = encodeHtmlSignature.replace(/(.{996})/g, '$1\n');
			attributes.push({
				n: ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_HTML,
				_content: limitHtmlSignature
			});
		} else {
			attributes.push({
				n: ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_HTML,
				_content: ''
			});
		}

		if (domainDisclaimerDetail?.zimbraDomainMandatoryMailSignatureEnabled) {
			attributes.push({
				n: ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED,
				_content: TRUE
			});

			attributes.push({
				n: AMAVIS_DISCLAIMER_OPTIONS,
				_content: domainName
			});
		} else {
			attributes.push({
				n: ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED,
				_content: FALSE
			});

			attributes.push({
				n: AMAVIS_DISCLAIMER_OPTIONS,
				_content: ''
			});
		}

		body.a = attributes;
		modifyDomain(body)
			.then((responseData) => {
				createSnackbar({
					key: 'success',
					severity: 'success',
					label: t('label.change_save_success_msg', 'The change has been saved successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				if (isGlobalAdmin) {
					flushCache('domain', 'id', domainId);
				}
				if (domainDisclaimerDetail?.zimbraDomainMandatoryMailSignatureEnabled) {
					setTimeout(() => {
						createSnackbar({
							key: 'success',
							severity: 'success',
							label: t(
								'label.mandatory_disclaimer_is_enable_for_this_domain',
								'The mandatory disclaimers is enabled for this domain'
							),
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
					}, 2000);
				}
				const domain: objectType = responseData?.domain[0];
				if (domain) {
					setDomain(domain);
				}
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [
		domainId,
		domainDisclaimerDetail?.zimbraDomainMandatoryMailSignatureEnabled,
		domainDisclaimerDetail?.zimbraAmavisDomainDisclaimerText,
		domainDisclaimerDetail?.zimbraAmavisDomainDisclaimerHTML,
		domainName,
		createSnackbar,
		t,
		isGlobalAdmin,
		setDomain
	]);

	return (
		<Container background="gray6" mainAlignment="flex-start">
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				orientation="horizontal"
				background="gray6"
				width="fill"
				height="56px"
			>
				<Row padding={{ horizontal: 'small' }}></Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium" overflow="ellipsis" weight="bold">
						{t('label.disclaimer', 'Disclaimer')}
					</Text>
				</Row>
				<Row>
					{isDirty && (
						<Container
							orientation="horizontal"
							mainAlignment="flex-end"
							crossAlignment="flex-end"
							background="gray6"
						>
							<Padding right="small">
								{isDirty && (
									<Button
										label={t('label.cancel', 'Cancel')}
										color="secondary"
										onClick={onCancel}
									/>
								)}
							</Padding>
							<Padding right="small">
								{isDirty && (
									<Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
								)}
							</Padding>
						</Container>
					)}
				</Row>
			</Row>
			<ListRow>
				<Divider />
			</ListRow>

			<Container
				padding={{ all: 'extralarge' }}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 10.5rem)"
				style={{ overflow: 'auto' }}
			>
				<ListRow>
					<Container
						crossAlignment="flex-start"
						mainAlignment="flex-start"
						height="auto"
						padding={{
							bottom: 'extralarge'
						}}
					>
						<Switch
							label={t(
								'label.enable_disclaimers_for_this_domain',
								'Enable disclaimers for this domain'
							)}
							value={domainDisclaimerDetail?.zimbraDomainMandatoryMailSignatureEnabled}
							onClick={(): void => {
								setValue(
									ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED,
									!domainDisclaimerDetail?.zimbraDomainMandatoryMailSignatureEnabled
								);
							}}
						/>
					</Container>
					<Container
						crossAlignment="flex-start"
						mainAlignment="flex-start"
						height="auto"
						padding={{
							bottom: 'extralarge'
						}}
					></Container>
				</ListRow>
				<ListRow>
					<Container
						crossAlignment="flex-start"
						mainAlignment="flex-start"
						height="auto"
						padding={{
							bottom: 'extralarge'
						}}
					>
						<Text size="small" weight="bold" color="gray0">
							{t('label.text_editor', 'Text Editor')}
						</Text>
					</Container>
					<Container
						crossAlignment="flex-start"
						mainAlignment="flex-start"
						height="auto"
						padding={{
							bottom: 'extralarge'
						}}
					>
						<Text size="small" weight="bold" color="gray0">
							{t('label.rich_text_editor', 'Rich Text Editor')}
						</Text>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						crossAlignment="flex-start"
						mainAlignment="flex-start"
						height="auto"
						padding={{
							bottom: 'extralarge',
							right: 'extralarge'
						}}
					>
						<TextAreaEditor
							label={''}
							value={domainDisclaimerDetail?.zimbraAmavisDomainDisclaimerText}
							onChange={(event): void => {
								setValue(ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_TEXT, event.currentTarget.value);
							}}
							maxHeight="20.5rem"
						/>
					</Container>
					<Container
						crossAlignment="flex-start"
						mainAlignment="flex-start"
						height="auto"
						padding={{
							bottom: 'extralarge'
						}}
					>
						<EditorWrapper>
							<Composer
								// eslint-disable-next-line no-use-before-define, @typescript-eslint/ban-ts-comment
								// @ts-ignore
								value={defaulRichTextContent}
								onEditorChange={(ev: any): void => {
									setValue(ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_HTML, ev[1]);
								}}
							/>
						</EditorWrapper>
					</Container>
				</ListRow>
			</Container>
		</Container>
	);
};

export default DomainDisclaimer;
