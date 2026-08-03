/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useQueryClient } from '@tanstack/react-query';
import { Container, ListRow, Row, Switch, TextArea } from '@zextras/ui-components';
import { domainByIdKey, flushCache, useUserSettings } from '@zextras/ui-shared';
import { encode } from 'html-entities';
import { cloneDeep, isEqual } from 'lodash-es';
import { ChangeEvent, FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { DomainDisclaimerType } from '../../../../types';
import Composer from '../../../composer/composer';
import {
	AMAVIS_DISCLAIMER_OPTIONS,
	FALSE,
	TRUE,
	ZIMBRA_ADMIN_URN,
	ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_HTML,
	ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_TEXT,
	ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED
} from '../../../constants';
import { useSelectedDomain } from '../../../hooks/use-selected-domain';
import { modifyDomain } from '../../../services/modify-domain-service';
import { DomainFormActions } from './components/domain-form-actions';
import styles from './domain-disclaimer.module.css';
import { useDomainMutation } from './hooks/use-domain-mutation';

type ModifyDomainBody = {
	id: string;
	_jsns: string;
	a: Array<{ n: string; _content: string | undefined }>;
};

function extractDisclaimerFromDomain(
	domainAttributes: Array<{ n: string; _content: string }> | undefined
): DomainDisclaimerType {
	if (!domainAttributes) {
		return {
			zimbraDomainMandatoryMailSignatureEnabled: false,
			zimbraAmavisDomainDisclaimerText: '',
			zimbraAmavisDomainDisclaimerHTML: ''
		};
	}

	const findAttribute = (name: string): string | undefined =>
		domainAttributes.find((item) => item.n === name)?._content;

	return {
		zimbraDomainMandatoryMailSignatureEnabled:
			findAttribute(ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED) === TRUE,
		zimbraAmavisDomainDisclaimerText:
			findAttribute(ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_TEXT) ?? '',
		zimbraAmavisDomainDisclaimerHTML: findAttribute(ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_HTML) ?? ''
	};
}

const DomainDisclaimer: FC = () => {
	const [t] = useTranslation();
	const queryClient = useQueryClient();
	const { domainId: routeDomainId } = useParams();
	const userSetting = useUserSettings();

	const { data: domain, isLoading } = useSelectedDomain();
	const domainInformation = domain?.a;
	const domainId = domain?.id ?? '';
	const domainName = domain?.name;

	// Derived value (no useEffect needed)
	const isGlobalAdmin = userSetting?.attrs?.zimbraIsAdminAccount === TRUE;

	// Local state
	const [disclaimerDetail, setDisclaimerDetail] = useState<DomainDisclaimerType>(
		extractDisclaimerFromDomain(undefined)
	);
	const [initialDisclaimerDetail, setInitialDisclaimerDetail] = useState<DomainDisclaimerType>(
		extractDisclaimerFromDomain(undefined)
	);
	const [richTextContent, setRichTextContent] = useState('');

	// Sync with fetched data (conditional state update pattern)
	const [prevDomainInfo, setPrevDomainInfo] = useState<typeof domainInformation>(undefined);
	if (domainInformation !== prevDomainInfo) {
		setPrevDomainInfo(domainInformation);
		const extracted = extractDisclaimerFromDomain(domainInformation);
		setInitialDisclaimerDetail(cloneDeep(extracted));
		setDisclaimerDetail(cloneDeep(extracted));
		setRichTextContent(extracted.zimbraAmavisDomainDisclaimerHTML ?? '');
	}

	// Derived dirty state
	const isDirty = !isEqual(disclaimerDetail, initialDisclaimerDetail);

	// Mutation for save
	const { mutate: saveMutation, isPending } = useDomainMutation<unknown, ModifyDomainBody>({
		mutationFn: async (body) => {
			const data = await modifyDomain(body);
			if (isGlobalAdmin) {
				flushCache('domain', 'id', body.id);
			}
			const responseDomain = data?.domain?.[0];
			if (responseDomain && routeDomainId) {
				queryClient.setQueryData(domainByIdKey(routeDomainId, 1), responseDomain);
			}
			return data;
		}
	});

	const setValue = (key: keyof DomainDisclaimerType, value: unknown): void => {
		setDisclaimerDetail((prev) => ({ ...prev, [key]: value }));
	};

	const onCancel = (): void => {
		setRichTextContent(initialDisclaimerDetail.zimbraAmavisDomainDisclaimerHTML ?? '');
		setDisclaimerDetail(cloneDeep(initialDisclaimerDetail));
	};

	const onSave = (): void => {
		const attributes: Array<{ n: string; _content: string | undefined }> = [];

		// by rfc max char per line is 998 bytes with new line
		// newline is 1 byte char as result real max char is 997 bytes
		const maxNumberOfCharsPerLine = 998 - '\n'.length;
		const longLineRg = new RegExp(`(.{${maxNumberOfCharsPerLine}})`, 'g');

		if (disclaimerDetail.zimbraAmavisDomainDisclaimerText) {
			// Convert accented char
			const convertDiatrictTextSignature = disclaimerDetail.zimbraAmavisDomainDisclaimerText
				.normalize('NFD')
				.replaceAll(/\p{Diacritic}/gu, "'");
			// add new line after 997 char
			const limitTextSignature = convertDiatrictTextSignature.replace(longLineRg, '$1\n');
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

		if (disclaimerDetail.zimbraAmavisDomainDisclaimerHTML) {
			// Convert nonAsciiPrintableOnly entities into html entities
			const encodeHtmlSignature = encode(disclaimerDetail.zimbraAmavisDomainDisclaimerHTML, {
				mode: 'nonAsciiPrintableOnly'
			});
			// add new line after 997 char
			const limitHtmlSignature = encodeHtmlSignature.replace(longLineRg, '$1\n');
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

		if (disclaimerDetail.zimbraDomainMandatoryMailSignatureEnabled) {
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

		saveMutation({
			id: domainId,
			_jsns: ZIMBRA_ADMIN_URN,
			a: attributes
		});
	};

	if (isLoading) {
		return (
			<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
				<ds-page-shimmer rows={6} />
			</Container>
		);
	}

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
					<ds-text as="h2" size="medium" overflow="ellipsis" weight="bold">
						{t('label.disclaimer', 'Disclaimer')}
					</ds-text>
				</Row>
				<DomainFormActions
					isDirty={isDirty}
					isPending={isPending}
					isValid={true}
					onCancel={onCancel}
					onSave={onSave}
				/>
			</Row>
			<ListRow>
				<ds-divider></ds-divider>
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
							value={disclaimerDetail.zimbraDomainMandatoryMailSignatureEnabled}
							onClick={(): void => {
								setValue(
									'zimbraDomainMandatoryMailSignatureEnabled',
									!disclaimerDetail.zimbraDomainMandatoryMailSignatureEnabled
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
						<ds-text as="h3" size="small" weight="bold" color="gray0">
							{t('label.text_editor', 'Text Editor')}
						</ds-text>
					</Container>
					<Container
						crossAlignment="flex-start"
						mainAlignment="flex-start"
						height="auto"
						padding={{
							bottom: 'extralarge'
						}}
					>
						<ds-text as="h3" size="small" weight="bold" color="gray0">
							{t('label.rich_text_editor', 'Rich Text Editor')}
						</ds-text>
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
						<TextArea
							label={''}
							value={disclaimerDetail.zimbraAmavisDomainDisclaimerText}
							// @ts-expect-error - needs a fix in ui-components
							onChange={(event: ChangeEvent<HTMLInputElement>): void => {
								setValue('zimbraAmavisDomainDisclaimerText', event.currentTarget.value);
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
						<div className={styles.editorWrapper}>
							<Composer
								initialValue={richTextContent}
								value={disclaimerDetail.zimbraAmavisDomainDisclaimerHTML}
								onEditorChange={(ev: [string, string]): void => {
									setValue('zimbraAmavisDomainDisclaimerHTML', ev[1]);
								}}
							/>
						</div>
					</Container>
				</ListRow>
			</Container>
		</Container>
	);
};

export default DomainDisclaimer;
