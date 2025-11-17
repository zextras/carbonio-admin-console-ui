/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useUserSettings } from '@zextras/admin-ui-bootstrap';
import { Button, Container, Icon, Padding, Row, Text } from '@zextras/carbonio-design-system';
import { filter, forEach, isArray, isNull, reduce, some } from 'lodash';
import React, { FC, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

export const _CI_REGEX = /^<(.*)>$/;
export const _CI_SRC_REGEX = /^cid:(.*)$/;
const LINK_REGEX =
	/(?:https?:\/\/|www\.)+(?![^\s]*?")([\w.,@?!^=%&amp;:()/~+#-]*[\w@?!^=%&amp;()/~+#-])?/gi;
const LINE_BREAK_REGEX = /(?:\r\n|\r|\n)/g;

export const plainTextToHTML = (str: string): string => {
	if (str !== undefined && str !== null) {
		return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(LINE_BREAK_REGEX, '<br />');
	}
	return '';
};

export type MailMessagePart = {
	contentType: string;
	size: number;
	content?: string;
	name: string;
	filename?: string;
	parts?: Array<MailMessagePart>;
	ci?: string;
	cd?: string;
	disposition?: 'inline' | 'attachment';
};
export type EditorAttachmentFiles = {
	contentType: string;
	disposition?: string;
	fileName?: string;
	filename: string;
	name: string;
	size: number;
};
export type Participant = {
	type: any;
	address: string;
	name?: string;
	fullName?: string;
};

export type IncompleteMessage = {
	id: string;
	did?: string;
	parent: string;
	conversation: string;
	read: boolean | string;
	size: number;
	hasAttachment: boolean;
	flagged: boolean;
	urgent: boolean;
	isDeleted: boolean;
	isSentByMe: boolean;
	isForwarded: boolean;
	isInvite: boolean;
	isDraft: boolean;
	isScheduled: boolean;
	autoSendTime?: number;
	attachments?: Array<AttachmentPart>;
	participants?: Array<Participant>;
	date: number;
	subject: string;
	fragment?: string;
	tags: string[];
	parts: Array<MailMessagePart>;
	body: {
		contentType: string;
		content: string;
	};
	invite?: any;
	shr?: any;
	isComplete: boolean;
	isReplied: boolean;
	isReadReceiptRequested?: boolean;
};
export type MailMessage = IncompleteMessage & {
	parts: Array<MailMessagePart>;
	body: {
		contentType: string;
		content: string;
	};
	parent: string;
	isReadReceiptRequested?: boolean;
};

export type AttachmentPart = {
	part?: string;
	ct?: string;
	s?: number;
	size?: number;
	filename?: string;
	body?: boolean;
	contentType?: string;
	content?: string;
	name?: string;
	parts?: Array<AttachmentPart>;
	ci?: string;
	disposition?: 'inline' | 'attachment';
	cd?: 'inline' | 'attachment';
	mp?: Array<AttachmentPart>;
};
export type ConvMessage = {
	id: string;
	parent: string;
	date: number;
	isDraft?: boolean;
};
export type Conversation = {
	readonly id: string;
	date: number;
	messages: Array<ConvMessage>;
	participants: Participant[];
	subject: string;
	fragment: string;
	read: boolean;
	hasAttachment: boolean;
	flagged: boolean;
	urgent: boolean;
	tags: string[];
	parent: string;
	messagesInConversation: number;
};
const ParticipantRole = {
	FROM: 'f',
	TO: 't',
	CARBON_COPY: 'c',
	BLIND_CARBON_COPY: 'b',
	REPLY_TO: 'r',
	SENDER: 's',
	READ_RECEIPT_NOTIFICATION: 'n',
	RESENT_FROM: 'rf'
};
const BannerContainer = styled(Container)`
	border-bottom: 0.0625rem solid ${(props): string => props.theme.palette.warning.regular};
	padding: 0.5rem 1rem;
	display: flex;
	flex-direction: row;
	align-items: center;
	height: 3.625rem;
	border-radius: 0.125rem 0.125rem 0 0;
`;

const replaceLinkToAnchor = (content: string): string => {
	if (content === '' || content === undefined) {
		return '';
	}
	return content.replace(LINK_REGEX, (url) => {
		const wrap = document.createElement('div');
		const anchor = document.createElement('a');
		let href = url.replace(/&amp;/g, '&');
		if (!url.startsWith('http') && !url.startsWith('https')) {
			href = `http://${url}`;
		}
		anchor.href = href.replace(/&#64;/g, '@').replace(/&#61;/g, '=');
		anchor.target = '_blank';
		anchor.innerHTML = url;
		wrap.appendChild(anchor);
		return wrap.innerHTML;
	});
};

const TextMessageRenderer: FC<{ body: { content: string; contentType: string } }> = ({ body }) => {
	const [showQuotedText, setShowQuotedText] = useState(false);
	const orignalText = body.content; // getOriginalContent(body.content, false);

	const contentToDisplay = useMemo(
		() => (showQuotedText ? body.content : orignalText),
		[showQuotedText, body.content, orignalText]
	);

	const convertedHTML = useMemo(
		() => replaceLinkToAnchor(plainTextToHTML(contentToDisplay)),
		[contentToDisplay]
	);
	return (
		<>
			<Text
				overflow="break-word"
				color="text"
				style={{ fontFamily: 'monospace' }}
				dangerouslySetInnerHTML={{
					__html: convertedHTML
				}}
			/>
		</>
	);
};

type _HtmlMessageRendererType = {
	msgId: string;
	body: { content: string; contentType: string };
	parts: MailMessagePart[];
	participants: Participant[] | undefined;
};
const HtmlMessageRenderer: FC<_HtmlMessageRendererType> = ({
	msgId,
	body,
	parts,
	participants
}) => {
	const divRef = useRef<HTMLDivElement>(null);
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [showQuotedText, setShowQuotedText] = useState(false);

	const settingsPref = useUserSettings()?.prefs;
	const from = filter(participants, { type: ParticipantRole.FROM })[0]?.address;
	const [showExternalImage, setShowExternalImage] = useState(false);
	const [displayBanner, setDisplayBanner] = useState(true);

	const orignalText = body.content; // getOriginalContent(body.content, false);
	const contentToDisplay = useMemo(
		() => (showQuotedText ? body.content : orignalText),
		[showQuotedText, body.content, orignalText]
	);

	const hasExternalImages = useMemo(() => {
		const parser = new DOMParser();
		const htmlDoc = parser.parseFromString(contentToDisplay, 'text/html');
		const images = htmlDoc.body.getElementsByTagName('img');

		return some(images, (i) => i.hasAttribute('dfsrc'));
	}, [contentToDisplay]);
	const isAvailableInTrusteeList = (
		trusteeList: string | number | Array<number | string>,
		address: string
	): boolean => {
		let trusteeAddress: Array<string> = [];
		let availableInTrusteeList = false;
		if (trusteeList) {
			 
			trusteeAddress = isArray(trusteeList)
				? (trusteeList as string[])
				: typeof trusteeList === 'string'
					? trusteeList?.split(',')
					: [`${trusteeList}`];
		}
		if (trusteeAddress.length > 0) {
			const domainName = address.substring(address.lastIndexOf('@') + 1);
			trusteeAddress.forEach((ta) => {
				if (ta === domainName || ta === address) {
					availableInTrusteeList = true;
				}
			});
		}
		return availableInTrusteeList;
	};
	const showBanner = useMemo(
		() =>
			hasExternalImages &&
			!isAvailableInTrusteeList(settingsPref.zimbraPrefMailTrustedSenderList ?? '', from) &&
			displayBanner,
		[from, hasExternalImages, settingsPref.zimbraPrefMailTrustedSenderList, displayBanner]
	);
	useEffect(() => {
		if (isAvailableInTrusteeList(settingsPref.zimbraPrefMailTrustedSenderList ?? '', from))
			setShowExternalImage(true);
	}, [from, settingsPref.zimbraPrefMailTrustedSenderList]);

	const calculateHeight = (): void => {
		if (!isNull(iframeRef.current)) {
			iframeRef.current.style.height = '0';
			iframeRef.current.style.height = `${
				(iframeRef?.current?.contentDocument?.body?.scrollHeight || 0) / 16 + 24 / 16
			}rem`;
		}
	};

	const showImage = useMemo(
		() => showExternalImage && displayBanner,
		[displayBanner, showExternalImage]
	);

	 
	useLayoutEffect(() => {
		if (!isNull(iframeRef.current) && !isNull(iframeRef.current.contentDocument)) {
			iframeRef.current.contentDocument.open();
			iframeRef.current.contentDocument.write(contentToDisplay);
			iframeRef.current.contentDocument.close();
		}
		const styleTag = document.createElement('style');
		const styles = `
			max-width: 100% !important;
			body {
				max-width: 100% !important;
				margin: 0;
				overflow-y: hidden;
				font-family: Roboto, sans-serif;
				font-size: 0.875rem;
				${/* visibility: ${darkMode && darkMode !== 'disabled' ? 'hidden' : 'visible'}; */ ''}
				background-color: #ffffff;
			}
			body pre, body pre * {
				white-space: pre-wrap;
				word-wrap: anywhere !important;
				text-wrap: suppress !important;
			}
			img {
				max-width: 100%
			}
			tbody{position:relative !important}
			td{
				max-width: 100% !important;
				overflow-wrap: anywhere !important;
			}
			#bodyTable {
				height: fit-content
			}
		`;
		styleTag.textContent = styles;
		if (!isNull(iframeRef.current) && !isNull(iframeRef.current.contentDocument))
			iframeRef.current.contentDocument.head.append(styleTag);

		calculateHeight();

		const imgMap = reduce(
			parts,
			(r, v) => {
				if (!_CI_REGEX.test(v.ci ?? '')) return r;
				 
				r[_CI_REGEX.exec(v.ci ?? '')?.[1] ?? ''] = v;
				return r;
			},
			{} as any
		);

		const images =
			iframeRef.current &&
			iframeRef.current.contentDocument &&
			iframeRef.current.contentDocument.body.getElementsByTagName('img');
		if (images)
			forEach(images, (p: HTMLImageElement) => {
				if (p.hasAttribute('dfsrc') && showImage) {
					p.setAttribute('src', p.getAttribute('dfsrc') ?? '');
				}
				if (!_CI_SRC_REGEX.test(p.src)) return;
				const ci = _CI_SRC_REGEX.exec(p.getAttribute('src') ?? '')?.[1] ?? '';
				if (imgMap[ci]) {
					const part = imgMap[ci];
					p.setAttribute('pnsrc', p.getAttribute('src') ?? '');
					p.setAttribute('src', `/service/home/~/?auth=co&id=${msgId}&part=${part.name}`);
				}
			});

		const resizeObserver = new ResizeObserver(calculateHeight);
		divRef.current && resizeObserver.observe(divRef.current);

		return () => resizeObserver.disconnect();
	}, [contentToDisplay, msgId, parts, showImage]);
	const [t] = useTranslation();
	return (
		<div ref={divRef} className="force-white-bg" style={{ width: '100%' }}>
			{showBanner && !showExternalImage && (
				<BannerContainer
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="center"
					padding={{ all: 'large' }}
					height="3.625rem"
					background="#FFF7DE"
					width="100%"
				>
					<Row
						height="fit"
						orientation="vertical"
						display="flex"
						wrap="nowrap"
						mainAlignment="flex-start"
						style={{
							flexGrow: 1,
							flexDirection: 'row'
						}}
					>
						<Padding right="large">
							<Icon icon="AlertTriangleOutline" color="warning" size="large" />
						</Padding>
						<Text overflow="break-word" size="small">
							{t(
								'message.external_images_blocked',
								'External images have been blocked to protect you against potential spam'
							)}
						</Text>
					</Row>
					<Row
						height="fit"
						orientation="vertical"
						display="flex"
						wrap="nowrap"
						mainAlignment="flex-end"
						padding={{ left: 'small' }}
						style={{
							flexGrow: 1,
							flexDirection: 'row'
						}}
					>
						<Button
							backgroundColor="transparent"
							type="outlined"
							label={t('quarantine.show_images', 'Show Images')}
							color="warning"
							onClick={(): void => {
								setShowExternalImage(true);
							}}
						/>
						<Button
							type="ghost"
							color={'text'}
							icon="CloseOutline"
							onClick={(): void => setDisplayBanner(false)}
							size="small"
						/>
					</Row>
				</BannerContainer>
			)}
			<iframe
				data-testid="message-renderer-iframe"
				title={msgId}
				ref={iframeRef}
				onLoad={calculateHeight}
				style={{
					border: 'none',
					width: '100%',
					display: 'block',
					maxWidth: '100%'
				}}
			/>
		</div>
	);
};

const EmptyBody: FC = () => {
	const [t] = useTranslation();
	return (
		<Container padding={{ bottom: 'medium' }}>
			<Text>{`(${t('messages.no_content', 'This message has no text content')}.)`}</Text>
		</Container>
	);
};
const findAttachments = (
	parts: MailMessagePart[],
	acc: Array<EditorAttachmentFiles>
): Array<EditorAttachmentFiles> =>
	reduce(
		parts,
		(found, part: any) => {
			if (part && (part.disposition === 'attachment' || part.disposition === 'inline')) {
				// removed condition from above If "&& part.ci"
				found.push(part);
			}
			if (part.parts) return findAttachments(part.parts, found);
			return acc;
		},
		acc
	);
const MailMessageRenderer: FC<{ mailMsg: MailMessage }> = ({ mailMsg }) => {
	const parts = findAttachments(mailMsg.parts ?? [], []);

	if (!mailMsg.body?.content?.length && !mailMsg.fragment) {
		return <EmptyBody />;
	}

	if (mailMsg.body?.contentType === 'text/html') {
		return (
			<HtmlMessageRenderer
				msgId={mailMsg.id}
				body={mailMsg.body}
				 
				// @ts-ignore
				parts={parts}
				participants={mailMsg.participants}
			/>
		);
	}
	if (mailMsg.body?.contentType === 'text/plain') {
		return <TextMessageRenderer body={mailMsg.body} />;
	}
	return <EmptyBody />;
};
export default MailMessageRenderer;
