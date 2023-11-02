/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useState, useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getTags } from '@zextras/carbonio-shell-ui';
import { filter, find, forEach, isArray, isNil, map, reduce, replace } from 'lodash';
import {
	Container,
	Input,
	Row,
	Text,
	Button,
	Divider,
	SnackbarManagerContext,
	Modal,
	Select,
	Table,
	IconButton,
	Padding,
	Collapse
} from '@zextras/carbonio-design-system';
import styled from 'styled-components';
import moment from 'moment';
import { createAccountRequest } from '../../services/create-account';
import { MessageTableHeaders, RandomString } from '../utility/utils';
import { getAllConfig } from '../../services/get-all-config';
import { getDelegateAuthRequest } from '../../services/get-delegate-auth-request';
import { useConfigStore } from '../../store/config/store';
import { modifyConfig } from '../../services/modify-config';
import { deleteAccount } from '../../services/delete-account-service';
import { getAccountRequest } from '../../services/get-account';
import { getQuarantineMessages } from '../../services/get-quarantine-messages-service';
import ListRow from '../list/list-row';
import logo from '../../assets/ninja_robo.svg';
import CustomRowFactory from '../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../app/shared/customTableHeaderFactory';
import ModalOverlay from '../components/ModalOverlay';
import MailMessageRenderer from './mail-message-renderer';
import AttachmentsBlock from './attachments-block';
import { batchService } from '../../services/batch-service';
import { msgActionRequest } from '../../services/message-action';
import { sendMsgRequest } from '../../services/send-message';
import OverlayDivision from '../components/overlayDivision';

const ovelayStyle = styled(Container)`
	position: fixed;
	width: 58.75rem;
	top: 0;
	right: 0;
	bottom: 0;
	height: auto;
	max-height: 100%;
	overflow: hidden;
	background: #0d0d0d;
	opacity: 0.4;
	z-index: 11;
	padding-top: 2rem;
`;

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
	score?: string;
	reason?: string;
	envelopeFrom?: string;
	envelopeTo?: string;
};
type EditorAttachmentFiles = {
	contentType: string;
	disposition?: string | undefined;
	fileName?: string | undefined;
	filename: string;
	name: string;
	size: number;
};

export type SoapEmailParticipantRole = 'f' | 't' | 'c' | 'b' | 'r' | 's' | 'n' | 'rf';
export type SoapMailParticipant = {
	/** Address */
	a: string;
	/** Display name */
	d?: string;
	/** Type:
	 * (f)rom,
	 * (t)o,
	 * (c)c,
	 * (b)cc,
	 * (r)eply-to,
	 * (s)ender,
	 * read-receipt (n)otification,
	 * (rf) resent-from
	 */
	p: string;
	t: SoapEmailParticipantRole;
	isGroup?: 0 | 1;
};
export type SoapMailMessagePart = {
	part: string;
	/**	Content Type  */ ct: 'multipart/alternative' | string;
	/**	Size  */ s?: number;
	/**	Content id (for inline images)  */ ci?: string;
	/** Content disposition */ cd?: 'inline' | 'attachment';
	/**	Parts  */ mp?: Array<SoapMailMessagePart>;
	/**	Set if is the body of the message  */ body?: true;
	filename?: string;
	// FIXME see IRIS-4029 Based on the compose settings the content could be a string or an object of type { _content: string }
	content?: string;
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
export const ParticipantRole = {
	FROM: 'f',
	TO: 't',
	CARBON_COPY: 'c',
	BLIND_CARBON_COPY: 'b',
	REPLY_TO: 'r',
	SENDER: 's',
	READ_RECEIPT_NOTIFICATION: 'n',
	RESENT_FROM: 'rf'
};
export type ParticipantRoleType = (typeof ParticipantRole)[keyof typeof ParticipantRole];
export type Participant = {
	type: ParticipantRoleType;
	address: string;
	name?: string;
	fullName?: string;
};

const getDateTime = (d: number): string => {
	const date = new Date(d);
	const formattedDate = moment(date).format('DD/MM/YY HH:mm');
	return formattedDate;
};

const MessageListTable: FC<{
	messages: { [key: string]: string }[];
	selectedRows: string[];
	requestInprogress: boolean;
	onSelectionChange: (selected: string[]) => void;
	setShowMessageView: (msgView: boolean) => void;
	setMessage: (messageId: IncompleteMessage) => void;
}> = ({
	messages,
	selectedRows,
	requestInprogress,
	onSelectionChange,
	setMessage,
	setShowMessageView
}) => {
	const [t] = useTranslation();
	const tableRows = useMemo(
		() =>
			messages.map((v: any, i: number) => ({
				id: i,
				columns: [
					<Row
						style={{ textAlign: 'left', justifyContent: 'flex-start' }}
						key={v.id}
						onClick={(): void => {
							setShowMessageView(true);
							setMessage(v);
						}}
					>
						<Text size="small" weight="regular">
							{getDateTime(v?.date)}
						</Text>
					</Row>,
					<Row
						key={i}
						style={{ textAlign: 'left', justifyContent: 'flex-start' }}
						onClick={(): void => {
							setShowMessageView(true);
							setMessage(v);
						}}
					>
						<Text size="small" weight="light">
							{v.envelopeFrom || ''}
						</Text>
					</Row>,
					<Row
						key={i}
						style={{ textAlign: 'left', justifyContent: 'flex-start' }}
						onClick={(): void => {
							setShowMessageView(true);
							setMessage(v);
						}}
					>
						<Text size="small" weight="light">
							{v.subject}
						</Text>
					</Row>,
					<Row
						key={i}
						style={{ textAlign: 'left', justifyContent: 'flex-start' }}
						onClick={(): void => {
							setShowMessageView(true);
							setMessage(v);
						}}
					>
						<Text
							size="small"
							weight="bold"
							// eslint-disable-next-line no-nested-ternary
							color={v.score > 50 ? 'secondry' : v.score > 35 ? 'warning' : 'error'}
						>
							{v.score}
						</Text>
					</Row>,
					<Row
						key={i}
						style={{ textAlign: 'left', justifyContent: 'flex-start' }}
						onClick={(): void => {
							setShowMessageView(true);
							setMessage(v);
						}}
					>
						<Text size="small" weight="light">
							{v.reason}
						</Text>
					</Row>
				],
				clickable: true
			})),
		[messages, setShowMessageView, setMessage]
	);
	return (
		<Container mainAlignment="flex-start" crossAlignment="flex-start">
			<ListRow>
				<Container mainAlignment="flex-start" crossAlignment="flex-start" height="auto">
					{/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
					{/* @ts-ignore */}
					<Table
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore // Need to fix it with custom soultion
						headers={MessageTableHeaders(t)}
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore // Need to fix it with custom soultion
						rows={tableRows}
						showCheckbox={false}
						multiSelect={false}
						selectedRows={selectedRows}
						onSelectionChange={onSelectionChange}
						RowFactory={CustomRowFactory}
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore // Need to fix it with custom soultion
						HeaderFactory={CustomHeaderFactory}
					/>
					{requestInprogress && (
						<Container
							crossAlignment="center"
							mainAlignment="center"
							height="auto"
							padding={{ top: 'large' }}
						>
							<Button type="ghost" color="primary" label="" loading onClick={(): null => null} />
						</Container>
					)}
					{tableRows.length === 0 && !requestInprogress && (
						<Container
							orientation="column"
							crossAlignment="center"
							mainAlignment="center"
							padding={{ top: 'large' }}
						>
							<Row>
								<img src={logo} alt="logo" />
							</Row>
							<Row
								padding={{ top: 'extralarge' }}
								orientation="vertical"
								crossAlignment="center"
								style={{ textAlign: 'center' }}
							>
								<Text weight="light" color="#828282" size="large" overflow="break-word">
									{t('label.this_list_is_empty', 'This list is empty.')}
								</Text>
							</Row>
						</Container>
					)}
				</Container>
			</ListRow>
			{tableRows.length === 0 && (
				<Container crossAlignment="center" mainAlignment="flex-start" style={{ marginTop: '3rem' }}>
					<Text overflow="break-word" weight="regular" size="large">
						<img src={logo} alt="logo" />
					</Text>
				</Container>
			)}
		</Container>
	);
};

const QuarantineList: FC = () => {
	const [t] = useTranslation();
	const createSnackbar = useContext(SnackbarManagerContext);
	const [quarantineAccountName, setQuarantineAccountName] = useState<string>('');
	const [quarantineAccountId, setQuarantineAccountId] = useState<string>('');
	const [quarantineDomaintName, setQuarantineDomaintName] = useState<string>('');
	const [configDataLoaded, setConfigDataLoaded] = useState<boolean>(false);
	const [deleteQuarantuneAccModal, setDeleteQuarantuneAccModal] = useState<boolean>(false);
	const [deleteMsgModal, setDeleteMsgModal] = useState<boolean>(false);
	const [showMessageView, setShowMessageView] = useState<boolean>(false);
	const [messageViewLoading, setMessageViewLoading] = useState<boolean>(false);
	const [messageListData, setMessageListData] = useState([]);
	const { config, setConfig } = useConfigStore((state) => state);
	const [messageSelection, setMessageSelection] = useState<string[]>([]);
	const [requestInprogress, setRequestInprogress] = useState<boolean>(false);
	const [showTextMsgView, setShowTextMsgView] = useState<boolean>(false);
	const [zimbraMailMessageLifetimeNum, setZimbraMailMessageLifetimeNum] = useState('');
	const [zimbraMailMessageLifetimeType, setZimbraMailMessageLifetimeType] = useState('');
	const [message, setMessage] = useState<IncompleteMessage>({
		id: '',
		did: '',
		parent: '',
		conversation: '',
		read: '',
		size: 0,
		hasAttachment: false,
		flagged: false,
		urgent: false,
		isDeleted: false,
		isSentByMe: false,
		isForwarded: false,
		isInvite: false,
		isDraft: false,
		isScheduled: false,
		date: 0,
		subject: '',
		tags: [],
		parts: [],
		body: {
			contentType: '',
			content: ''
		},
		isComplete: true,
		isReplied: false,
		score: '',
		reason: ''
	});
	const timeItems: any[] = useMemo(
		() => [
			{
				label: t('label.seconds', 'Seconds'),
				value: 's'
			},
			{
				label: t('label.minutes', 'Minutes'),
				value: 'm'
			},
			{
				label: t('label.hours', 'Hours'),
				value: 'h'
			},
			{
				label: t('label.days', 'Days'),
				value: 'd'
			}
		],
		[t]
	);
	const onViewMail = useCallback(
		(name) => {
			getDelegateAuthRequest('', name)
				.then((data) => {
					if (data?.authToken?.[0]) {
						window.open(
							`https://${window.location.hostname}/service/preauth?authtoken=${data?.authToken?.[0]._content}&isredirect=1&adminPreAuth=1&redirectURL=/carbonio/`,
							'blank'
						);
					} else {
						createSnackbar({
							key: 'error',
							type: 'error',
							label: t(
								'label.something_wrong_error_msg',
								'Something went wrong. Please try again.'
							),
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
					}
				})
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				.catch((error) => {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: error?.message
							? error?.message
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				});
		},
		[createSnackbar, t]
	);

	const getAllConfigData = useCallback((): void => {
		getAllConfig().then((res) => {
			if (res?.a) {
				setConfig(res.a);
			}
		});
	}, [setConfig]);

	const participantTypeFromSoap = (ta: SoapEmailParticipantRole): ParticipantRoleType => {
		switch (ta) {
			case 'f':
				return ParticipantRole.FROM;
			case 't':
				return ParticipantRole.TO;
			case 'c':
				return ParticipantRole.CARBON_COPY;
			case 'b':
				return ParticipantRole.BLIND_CARBON_COPY;
			case 'r':
				return ParticipantRole.REPLY_TO;
			case 's':
				return ParticipantRole.SENDER;
			case 'n':
				return ParticipantRole.READ_RECEIPT_NOTIFICATION;
			case 'rf':
				return ParticipantRole.RESENT_FROM;
			default:
				throw new Error(`Participant type not handled: '${ta}'`);
		}
	};
	const normalizeParticipantsFromSoap = useCallback(
		(e: SoapMailParticipant): Participant => ({
			type: participantTypeFromSoap(e.t),
			address: e.a,
			name: e.d || e.a,
			fullName: e.p
		}),
		[]
	);
	const getTagIdsFromName = (names: string | undefined): Array<string | undefined> => {
		const tags = getTags();
		return map(names?.split(','), (name) =>
			find(tags, { name }) ? find(tags, { name })?.id : `nil:${name}`
		);
	};

	const getTagIds = useCallback(
		(ta: string | undefined, tn: string | undefined): Array<string | undefined> => {
			if (!isNil(ta)) {
				return filter(ta.split(','), (tag) => tag !== '');
			}
			if (!isNil(tn)) {
				return getTagIdsFromName(tn);
			}
			return [];
		},
		[]
	);
	const normalizeMailPartMapFn = useCallback((v: SoapMailMessagePart): MailMessagePart => {
		const ret: MailMessagePart = {
			contentType: v.ct,
			size: v.s || 0,
			name: v.part,
			disposition: v.cd
		};
		if (v.mp) {
			ret.parts = map(v.mp || [], normalizeMailPartMapFn);
		}
		if (v.filename) ret.filename = v.filename;
		if (v.content) ret.content = v.content;
		if (v.ci) ret.ci = v.ci;
		if (v.cd) ret.disposition = v.cd;
		// console.log('==> ret', ret);
		// console.log('==> v', v);
		return ret;
	}, []);
	const findBodyPart = useCallback(
		(
			mp: Array<SoapMailMessagePart>,
			acc: { contentType: string; content: string },
			id: string
		): { contentType: string; content: string } => {
			const bodyPart = reduce(
				mp,
				(found, part) => {
					if (part.mp) return findBodyPart(part.mp, found, id);
					if (part && part.body) {
						if (!found.contentType.length) {
							return { contentType: part.ct, content: part.content ?? '' };
						}
						if (
							part.part &&
							part.part.indexOf('.') === -1 &&
							part.cd &&
							part.cd === 'inline' &&
							!part.ci &&
							!(part.ct && part.ct === 'text/plain')
						) {
							return {
								...found,
								content: found.content.concat(
									`<img src='/service/home/~/?auth=co&loc=en&id=${id}&part=${part?.part}'>` ?? ''
								)
							};
						}
						return { ...found, content: found.content.concat(part.content ?? '') };
					}
					return found;
				},
				acc
			);

			return bodyPart;
		},
		[]
	);
	const generateBody = useCallback(
		(
			mp: Array<SoapMailMessagePart>,
			id: string
		): {
			contentType: string;
			content: string;
		} => findBodyPart(mp, { contentType: '', content: '' }, id),
		[findBodyPart]
	);
	const extractAttachmentIdsFromHtmlContent = (content: string): Array<string> => {
		const matches = content.match(/cid:(.*?)(?="|&)/g);
		const result = matches ? map(matches, (match) => match.replace('cid:', '')) : [];
		return result;
	};

	// examine the multipart and return an array of ids referenced in the body of the html
	const getAttachmentsAnchoredOnHtmlBody = useCallback(
		(
			multipart: Array<SoapMailMessagePart> | undefined | AttachmentPart | Array<AttachmentPart>
		): Array<string> => {
			const result: Array<string> = [];

			const extractCid = (
				mp: Array<SoapMailMessagePart> | undefined | AttachmentPart | Array<AttachmentPart>
			): void => {
				forEach(mp, (item: SoapMailMessagePart) => {
					if (item.mp) {
						extractCid(item.mp);
					}
					if (item.content) {
						result.push(...extractAttachmentIdsFromHtmlContent(item.content));
					}
				});
			};

			extractCid(multipart);
			return result;
		},
		[]
	);
	const cleanUpCi = (id: string): string => id.slice(1, id.indexOf('@'));

	const isIgnoreAttachment = (item: AttachmentPart): boolean => {
		if ((item && item.ct === 'multipart/appledouble') || item.ct === 'application/applefile') {
			return true;
		}
		if (item.body && (item.ct === 'text/html' || item.ct === 'text/plain')) {
			return true;
		}
		if (item.ct === 'multipart/digest') {
			return true;
		}
		if (item.ci && item.ci === 'text-body') {
			return true;
		}
		if (item.ct === 'text/calendar' && !item.filename) {
			return true;
		}
		return false;
	};
	const getAttachmentsFromParts = useCallback(
		(mailParts: Array<AttachmentPart> | AttachmentPart): Array<AttachmentPart> => {
			const anchoredAttachmentsList = getAttachmentsAnchoredOnHtmlBody(mailParts);
			let results: Array<AttachmentPart> = [];
			if (mailParts) {
				if (isArray(mailParts)) {
					forEach(mailParts, (part) => {
						const attachmentParts = getAttachmentsFromParts(part);
						forEach(attachmentParts, (attachmentPart: AttachmentPart) => {
							if (!isIgnoreAttachment(attachmentPart)) {
								const item = {
									...attachmentPart,
									contentType: attachmentPart.ct,
									name: attachmentPart?.part,
									size: attachmentPart?.s
								};
								if (
									(item.cd && item.cd === 'attachment') ||
									(item.ct && (item.ct === 'message/rfc822' || item.ct === 'text/calendar')) ||
									item.filename ||
									item.ci
								) {
									if (
										item.cd &&
										item.cd === 'inline' &&
										item.ci &&
										anchoredAttachmentsList.includes(cleanUpCi(item.ci))
									) {
										item.cd = 'inline';
									} else if (
										part.ct === 'multipart/related' &&
										item.ci &&
										item.cd &&
										item.cd === 'attachment' &&
										anchoredAttachmentsList.includes(cleanUpCi(item.ci))
									) {
										item.cd = 'inline';
									} else {
										item.cd = 'attachment';
									}
									if (item.ct === 'message/rfc822' && !item.filename) {
										item.filename = 'Unknown <message/rfc822>';
									}
									if (item.ct === 'text/html' && !item.filename) {
										item.filename = 'Unknown <text/html>';
									}
									if (item.ct && item.ct !== 'application/pkcs7-signature') {
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore
										results.push(item);
									}
								}
							}
						});
					});
				} else if (
					(mailParts && mailParts.cd && mailParts.cd === 'attachment') ||
					(mailParts.ct &&
						(mailParts.ct === 'message/rfc822' || mailParts.ct === 'text/calendar')) ||
					mailParts.filename ||
					mailParts.ci
				) {
					const updatedMailPart: AttachmentPart = { ...mailParts };
					if (isIgnoreAttachment(mailParts)) {
						extractAttachmentIdsFromHtmlContent(updatedMailPart.content || '');
						if (
							updatedMailPart.cd &&
							updatedMailPart.cd === 'inline' &&
							updatedMailPart.ci &&
							anchoredAttachmentsList.includes(cleanUpCi(updatedMailPart.ci))
						) {
							updatedMailPart.cd = 'inline';
						} else if (
							updatedMailPart.ct === 'multipart/related' &&
							updatedMailPart.ci &&
							updatedMailPart.cd &&
							updatedMailPart.cd === 'attachment' &&
							anchoredAttachmentsList.includes(cleanUpCi(updatedMailPart.ci))
						) {
							updatedMailPart.cd = 'inline';
						} else {
							updatedMailPart.cd = 'attachment';
						}
					}
					results.push(updatedMailPart);
				} else if (mailParts.mp) {
					results = results.concat(getAttachmentsFromParts(mailParts.mp));
				}
			}
			return results;
		},
		[getAttachmentsAnchoredOnHtmlBody]
	);
	// const getMessage = useCallback(
	// 	(messageId): void => {
	// 		getMessageRequest(quarantineAccountId, messageId).then((response: any): void => {
	// 			// const data = response?.Body?.SearchResponse?.m;
	// 			// setMessageListData(data);
	// 			console.log('getMessageRequest ==>', response);
	// 			const m = response.Body?.GetMsgResponse?.m?.[0];
	// 			const normalizedMessage = {
	// 				conversation: m.cid,
	// 				id: m.id,
	// 				date: m.d,
	// 				size: m.s,
	// 				parent: m.l,
	// 				fragment: m.fr,
	// 				subject: m.su,
	// 				participants: m.e ? map(m.e || [], normalizeParticipantsFromSoap) : [],
	// 				tags: getTagIds(m.t, m.tn),
	// 				parts: m.mp ? map(m.mp || [], normalizeMailPartMapFn) : [],
	// 				attachments: m.mp ? getAttachmentsFromParts(m.mp) : [],
	// 				// attachments: undefined,
	// 				invite: m.inv,
	// 				shr: m.shr,
	// 				body: m.mp
	// 					? generateBody(m.mp || [], m.id)
	// 					: {
	// 							contentType: '',
	// 							content: ''
	// 					  },
	// 				isComplete: true,
	// 				isScheduled: !!m.autoSendTime,
	// 				autoSendTime: m.autoSendTime,
	// 				read: !isNil(m.f) ? !/u/.test(m.f) : true,
	// 				hasAttachment: !isNil(m.f) ? /a/.test(m.f) : false,
	// 				flagged: !isNil(m.f) ? /f/.test(m.f) : false,
	// 				urgent: !isNil(m.f) ? /!/.test(m.f) : false,
	// 				isDeleted: !isNil(m.f) ? /x/.test(m.f) : false,
	// 				isDraft: !isNil(m.f) ? /d/.test(m.f) : false,
	// 				isForwarded: !isNil(m.f) ? /w/.test(m.f) : false,
	// 				isSentByMe: !isNil(m.f) ? /s/.test(m.f) : false,
	// 				isInvite: !isNil(m.f) ? /v/.test(m.f) : false,
	// 				isReplied: !isNil(m.f) ? /r/.test(m.f) : false,
	// 				isReadReceiptRequested: !isNil(m.f) ? !/n/.test(m.f) : true
	// 			};
	// 			console.log('normalizedMessage ==>', normalizedMessage);
	// 			setMessage(normalizedMessage);
	// 			setShowMessageView(true);
	// 		});
	// 	},
	// 	[
	// 		generateBody,
	// 		getAttachmentsFromParts,
	// 		getTagIds,
	// 		normalizeMailPartMapFn,
	// 		normalizeParticipantsFromSoap,
	// 		quarantineAccountId
	// 	]
	// );
	const getQuarantineMsgData = useCallback((): void => {
		const propertiesToExtract = ['zimbraAmavisQuarantineAccount', 'zimbraDefaultDomainName'];

		const obj: { [key: string]: string | { label: string }[] } = {};
		propertiesToExtract.forEach((property) => {
			const items = filter(config, { n: property });
			const item = items[0];
			obj[property] = item?._content;
		});
		if (obj.zimbraAmavisQuarantineAccount) {
			setQuarantineAccountName(obj.zimbraAmavisQuarantineAccount.toString());
			setRequestInprogress(true);
			getAccountRequest('', obj.zimbraAmavisQuarantineAccount.toString(), 0).then((res) => {
				const zimbraMailMessageLifetimeObject = find(res?.account?.[0]?.a, {
					n: 'zimbraMailMessageLifetime'
				});
				const zimbraMailMessageLifetime = zimbraMailMessageLifetimeObject?._content;
				setZimbraMailMessageLifetimeNum(zimbraMailMessageLifetime?.slice(0, -1));
				setZimbraMailMessageLifetimeType(zimbraMailMessageLifetime?.slice(-1));
				if (res?.account?.[0]?.id) {
					setQuarantineAccountId(res?.account?.[0]?.id);
					getQuarantineMessages(res?.account?.[0]?.id).then((response: any): void => {
						const data = response?.Body?.SearchResponse?.m;
						const messageListArr: any = [];
						data.forEach((item: any): any =>
							messageListArr.push({
								_jsns: 'urn:zimbraMail',
								m: {
									html: 1,
									id: item.id,
									needExp: 1,
									header: [
										{
											n: 'X-Envelope-From'
										},
										{
											n: 'X-Envelope-To'
										},
										{
											n: 'X-Envelope-To-Blocked'
										},
										{
											n: 'X-Amavis-Alert'
										},
										{
											n: 'X-Spam-Flag'
										},
										{
											n: 'X-Spam-Score'
										},
										{
											n: 'X-Spam-Level'
										},
										{
											n: 'X-Spam-Status'
										}
									]
								}
							})
						);

						batchService({
							GetMsgRequest: messageListArr,
							_jsns: 'urn:zimbra'
						})
							.then((msgBatchData) => {
								console.log('msgBatchData ==>', msgBatchData);
								const normalizedMessageList: any = [];
								// const messageId = message.id;
								msgBatchData?.GetMsgResponse?.forEach((item: any) => {
									const m = item.m?.[0];
									console.log('==>', m?._attrs?.['X-Spam-Status']);
									if (Array.isArray(m?._attrs?.['X-Spam-Status'])) {
										m._attrs['X-Spam-Status'] = m._attrs['X-Spam-Status'].pop();
									}
									if (Array.isArray(m?._attrs?.['X-Spam-Score'])) {
										m._attrs['X-Spam-Score'] = m?._attrs?.['X-Spam-Score'].pop();
									}
									if (Array.isArray(m?._attrs?.['X-Amavis-Alert'])) {
										m._attrs['X-Amavis-Alert'] = m?._attrs?.['X-Amavis-Alert'].pop();
									}
									if (Array.isArray(m?._attrs?.['X-Envelope-From'])) {
										m._attrs['X-Envelope-From'] = m?._attrs?.['X-Envelope-From'].pop();
									}
									if (Array.isArray(m?._attrs?.['X-Envelope-To'])) {
										m._attrs['X-Envelope-To'] = m?._attrs?.['X-Envelope-To'].pop();
									}
									const scoreValueArr: any[] = (m?._attrs?.['X-Spam-Status'] || '')?.split(
										'score='
									);
									const reasonValueArr: any[] = (m?._attrs?.['X-Spam-Status'] || '')?.split(
										'tests='
									);
									let scoreValueString = '';
									let reasonValueString = '';
									if (scoreValueArr?.length > 1) {
										scoreValueString = scoreValueArr[1]?.toString() || '';
										scoreValueString = scoreValueString.split(' ')?.[0] || '';
									}
									if (reasonValueArr?.length > 1) {
										reasonValueString = reasonValueArr[1]?.toString() || '';
										reasonValueString = reasonValueString.split(' ')?.[0] || '';
									}

									const normalizedMessage: IncompleteMessage = {
										conversation: m.cid,
										id: m.id,
										date: m.d,
										size: m.s,
										parent: m.l,
										fragment: m.fr,
										subject: m.su,
										participants: m.e ? map(m.e || [], normalizeParticipantsFromSoap) : [],
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore
										tags: getTagIds(m.t, m.tn),
										parts: m.mp ? map(m.mp || [], normalizeMailPartMapFn) : [],
										attachments: m.mp ? getAttachmentsFromParts(m.mp) : [],
										// attachments: undefined,
										invite: m.inv,
										shr: m.shr,
										body: m.mp
											? generateBody(m.mp || [], m.id)
											: {
													contentType: '',
													content: ''
											  },
										isComplete: true,
										isScheduled: !!m.autoSendTime,
										autoSendTime: m.autoSendTime,
										read: !isNil(m.f) ? !/u/.test(m.f) : true,
										hasAttachment: !isNil(m.f) ? /a/.test(m.f) : false,
										flagged: !isNil(m.f) ? /f/.test(m.f) : false,
										urgent: !isNil(m.f) ? /!/.test(m.f) : false,
										isDeleted: !isNil(m.f) ? /x/.test(m.f) : false,
										isDraft: !isNil(m.f) ? /d/.test(m.f) : false,
										isForwarded: !isNil(m.f) ? /w/.test(m.f) : false,
										isSentByMe: !isNil(m.f) ? /s/.test(m.f) : false,
										isInvite: !isNil(m.f) ? /v/.test(m.f) : false,
										isReplied: !isNil(m.f) ? /r/.test(m.f) : false,
										isReadReceiptRequested: !isNil(m.f) ? !/n/.test(m.f) : true,
										score: m?._attrs?.['X-Spam-Score'] || scoreValueString || '',
										reason: m?._attrs?.['X-Amavis-Alert'] || '',
										envelopeFrom: replace(m?._attrs?.['X-Envelope-From'] || '', /[<>]/g, ''),
										envelopeTo: replace(m?._attrs?.['X-Envelope-To'] || '', /[<>]/g, '')
									};

									// if (m.id === messageId) {
									// 	console.log('==> Set', m.id, messageId);
									// 	setShowMessageView(false);
									// 	setMessage(normalizedMessage);
									// 	setShowMessageView(true);
									// }
									normalizedMessageList.push(normalizedMessage);
								});

								console.log('normalizedMessage ==>', normalizedMessageList);
								setMessageListData(normalizedMessageList);
								// console.log('message g ==>', message.id);
								// if (message.id) {
								// 	console.log('message.id ==>', message.id);
								// 	const messageFound = find(normalizedMessageList, { id: message.id });
								// 	console.log(
								// 		'messageFound find ==>',
								// 		find(normalizedMessageList, { id: message.id })
								// 	);
								// 	if (messageFound?.id) {
								// 		// setMessage({
								// 		// 	id: '',
								// 		// 	did: '',
								// 		// 	parent: '',
								// 		// 	conversation: '',
								// 		// 	read: '',
								// 		// 	size: 0,
								// 		// 	hasAttachment: false,
								// 		// 	flagged: false,
								// 		// 	urgent: false,
								// 		// 	isDeleted: false,
								// 		// 	isSentByMe: false,
								// 		// 	isForwarded: false,
								// 		// 	isInvite: false,
								// 		// 	isDraft: false,
								// 		// 	isScheduled: false,
								// 		// 	date: 0,
								// 		// 	subject: '',
								// 		// 	tags: [],
								// 		// 	parts: [],
								// 		// 	body: {
								// 		// 		contentType: '',
								// 		// 		content: ''
								// 		// 	},
								// 		// 	isComplete: true,
								// 		// 	isReplied: false,
								// 		// 	score: '',
								// 		// 	reason: ''
								// 		// });
								// 		setMessage(cloneDeep(messageFound));
								// 	}
								// }
								setRequestInprogress(false);
								// deleteOnlyDomain();
							})
							.catch((error) => setRequestInprogress(false));

						// setMessageListData(data);
					});
				}
			});
		}
		if (obj.zimbraDefaultDomainName) {
			setQuarantineDomaintName(obj.zimbraDefaultDomainName.toString());
		}
		setConfigDataLoaded(true);
	}, [
		config,
		generateBody,
		getAttachmentsFromParts,
		getTagIds,
		normalizeMailPartMapFn,
		normalizeParticipantsFromSoap
	]);
	useEffect(() => {
		getQuarantineMsgData();
	}, [getQuarantineMsgData]);

	const onChange = (): void => {
		null;
	};

	const createAccountAPI = useCallback((): void => {
		const deleteAccountName = quarantineAccountName;
		createAccountRequest(
			{
				givenName: `virus-quarantine`,
				initials: '',
				sn: '',
				amavisBypassSpamChecks: 'TRUE',
				zimbraAttachmentsIndexingEnabled: 'FALSE',
				zimbraIsSystemResource: 'TRUE',
				zimbraHideInGal: 'TRUE',
				zimbraMailMessageLifetime: '7d',
				zimbraMailQuota: 0,
				description: 'System account for Anti-virus quarantine.'
			},
			`virus-quarantine.${RandomString()}@${quarantineDomaintName}`,
			''
		)
			.then((data) => {
				if (data?.account[0]?.name) {
					modifyConfig([
						{
							n: 'zimbraAmavisQuarantineAccount',
							_content: data?.account[0]?.name
						}
					])
						.then(() => {
							createSnackbar({
								key: 'success',
								type: 'success',
								label: t(
									'label.account_created_successfully',
									'The account has been created successfully'
								),
								autoHideTimeout: 3000,
								hideButton: true,
								replace: true
							});
							getAllConfigData();
							if (deleteAccountName) {
								getAccountRequest('', deleteAccountName, 0).then((res) => {
									if (res?.account?.[0]?.id) {
										deleteAccount(res?.account?.[0]?.id).then();
									}
								});
							}
						})
						.catch((error) => {
							createSnackbar({
								key: 'error',
								type: 'error',
								label: error?.message
									? error?.message
									: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
								autoHideTimeout: 3000,
								hideButton: true,
								replace: true
							});
						});
				}

				getAllConfigData();
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [createSnackbar, getAllConfigData, quarantineAccountName, quarantineDomaintName, t]);
	const onDeleteMessage = useCallback(
		(id: string) => {
			setMessageViewLoading(true);
			setDeleteMsgModal(false);
			msgActionRequest(id, 'delete')
				.then((res) => {
					setMessageListData([]);
					getQuarantineMsgData();
					setShowMessageView(false);
					setMessageViewLoading(false);
					createSnackbar({
						key: 'info',
						type: 'info',
						label: t('quarantine.message_deleted', 'Message deleted'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				})
				.catch((error) => {
					setMessageViewLoading(false);
					createSnackbar({
						key: 'error',
						type: 'error',
						label: error?.message
							? error?.message
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				});
		},
		[createSnackbar, getQuarantineMsgData, t]
	);

	const onDeliverMessage = useCallback(
		(msg: IncompleteMessage) => {
			setMessageViewLoading(true);
			sendMsgRequest(msg)
				.then((res) => {
					setMessageListData([]);
					getQuarantineMsgData();
					setShowMessageView(false);
					setMessageViewLoading(false);
					createSnackbar({
						key: 'info',
						type: 'info',
						label: t('quarantine.message_delivered', 'Message delivered'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				})
				.catch((error) => {
					setMessageViewLoading(false);
					createSnackbar({
						key: 'error',
						type: 'error',
						label: error?.message
							? error?.message
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				});
		},
		[createSnackbar, getQuarantineMsgData, t]
	);
	const setToggleView = (): void => setShowTextMsgView(!showTextMsgView);

	return (
		<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
			<Row mainAlignment="flex-start" width="100%">
				<Container
					orientation="vertical"
					mainAlignment="space-around"
					background="gray6"
					height="3.625rem"
				>
					<Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
						<Row mainAlignment="flex-start" width="100%" crossAlignment="flex-start">
							<Text size="medium" weight="bold" color="gray0">
								{t('quarantine.quarantine', 'Quarantine')}
							</Text>
						</Row>
					</Row>
				</Container>
			</Row>
			<Row orientation="horizontal" width="100%" background="gray6">
				<Divider />
			</Row>
			<Container
				orientation="column"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				width="100%"
				height="calc(100vh - 12.5rem)"
				padding={{ top: 'large' }}
			>
				<Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
					<Container height="fit" crossAlignment="flex-start" background="gray6">
						{configDataLoaded ? (
							<>
								{!quarantineAccountName ? (
									<>
										<Row>
											<Text size="small">
												{t(
													'quarantine.not_quarantine_account',
													'There is not quarantine account in any of the domains, yet. Do you want to create a system quarantine account?'
												)}
											</Text>
										</Row>
										<Row width="100%" padding={{ top: 'large' }}>
											<Button
												type="outlined"
												label={t('quarantine.create_quarantine', 'CREATE A QUARANTINE ACCOUNT')}
												color="primary"
												width="fill"
												onClick={(): void => {
													createAccountAPI();
												}}
											/>
										</Row>
									</>
								) : (
									<>
										<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
											<Row width="100%" mainAlignment="space-between">
												<Input
													label={t('quarantine.quarantine_account', 'Quarantine Account')}
													value={quarantineAccountName}
												/>
											</Row>
										</Row>
										<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
											<Button
												type="outlined"
												label={t(
													'quarantine.delete_and_recreate_quarantine',
													'DELETE AND RE-CREATE QUARANTINE ACCOUNT'
												)}
												color="error"
												width="fill"
												onClick={(): void => {
													setDeleteQuarantuneAccModal(true);
												}}
											/>
										</Row>
										<Row padding={{ top: 'small' }} width="100%" mainAlignment="center">
											<Text size="small" color={'gray1'}>
												{t(
													'quarantine.to_make_changes_restart_the_MTA',
													'To make the changes effective, please restart the MTA.'
												)}
											</Text>
										</Row>
										<Row
											padding={{ top: 'large' }}
											orientation="horizontal"
											width="100%"
											background="gray6"
										>
											<Divider />
										</Row>
										<Row orientation="horizontal" width="100%" padding={{ vertical: 'large' }}>
											<Row mainAlignment="flex-start" width="100%" crossAlignment="flex-start">
												<Text size="medium" weight="bold" color="gray0">
													{t('label.settings', 'Settings')}
												</Text>
											</Row>
										</Row>
										<ListRow>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												orientation="horizontal"
												padding={{ right: 'small', bottom: 'small' }}
												width="79%"
											>
												<Input
													label={t('label.retention_period', 'Retention Period (value)')}
													backgroundColor="gray5"
													value={zimbraMailMessageLifetimeNum}
													readOnly
												/>
											</Container>
											<Container
												padding={{ bottom: 'small' }}
												mainAlignment="flex-start"
												orientation="horizontal"
												width="20%"
											>
												<Select
													items={timeItems}
													label="Interval"
													onChange={onChange}
													showCheckbox={false}
													selection={
														zimbraMailMessageLifetimeType === ''
															? timeItems[-1]
															: timeItems.find(
																	// eslint-disable-next-line max-len
																	(item: any) => item.value === zimbraMailMessageLifetimeType
															  )
													}
												/>
												{/* <Input
													label={t('label.interval', 'Interval')}
													backgroundColor="gray5"
													value={setZimbraMailMessageLifetimeType}
													readOnly
												/> */}
											</Container>
										</ListRow>
										<Row
											padding={{ vertical: 'extralarge' }}
											orientation="horizontal"
											width="100%"
											background="gray6"
										>
											<Divider />
										</Row>
										<Row
											orientation="horizontal"
											width="100%"
											padding={{ top: 'small', bottom: 'large' }}
										>
											<Row mainAlignment="flex-start" width="100%" crossAlignment="flex-start">
												<Text size="medium" weight="bold" color="gray0">
													{t('label.messages', 'Messages')}
												</Text>
											</Row>
										</Row>
										{/* <Row
											width="100%"
											mainAlignment="flex-end"
											style={{ gap: '1rem' }}
											orientation="horizontal"
											padding={{ bottom: 'large' }}
										>
											<Button
												type="outlined"
												label={t('label.auto_clean_up', 'AUTO CLEAN-UP')}
												color="primary"
												onClick={(): void => {
													console.log('__clicked');
												}}
												disabled
											/>
											<Button
												type="outlined"
												label={t('label.deliver', 'DELIVER')}
												color="primary"
												onClick={(): void => {
													onDeliverMessage(message);
												}}
											/>
											<Button
												type="ghost"
												label={t('label.delete', 'DELETE')}
												color="error"
												onClick={(): void => {
													onDeleteMessage(message.id);
												}}
											/>
										</Row> */}
										<Row width="100%" padding={{ bottom: 'extralarge' }}>
											<MessageListTable
												messages={messageListData}
												selectedRows={messageSelection}
												requestInprogress={requestInprogress}
												setMessage={setMessage}
												setShowMessageView={setShowMessageView}
												onSelectionChange={(selected: any): void => {
													setMessageSelection(selected);
												}}
											/>
										</Row>
										{/* <Row width="100%" padding={{ top: 'large' }}>
											<Button
												type="outlined"
												label={t('label.view_mail', 'VIEW MAIL')}
												color="primary"
												width="fill"
												onClick={(): void => {
													onViewMail(quarantineAccountName);
												}}
											/>
										</Row> */}
									</>
								)}
							</>
						) : (
							<>
								<Container
									crossAlignment="center"
									mainAlignment="center"
									height="auto"
									padding={{ top: 'medium' }}
								>
									<Button
										type="ghost"
										color="primary"
										label=""
										loading
										onClick={(): null => null}
									/>
								</Container>
							</>
						)}
					</Container>
				</Row>
			</Container>
			<Modal
				size="medium"
				title={`${t(
					'quarantine.delete_and_recrate_quarantine_account_title',
					'Delete and re-create quarantine account'
				)}`}
				open={deleteQuarantuneAccModal}
				customFooter={
					<Container orientation="horizontal" mainAlignment="flex-end">
						<Row style={{ gap: '0.5rem' }} padding={{ right: 'medium' }}>
							<Button
								label={t('label.keep_it_button', 'NO, KEEP IT')}
								color="primary"
								type="outlined"
								onClick={(): void => setDeleteQuarantuneAccModal(false)}
							/>
							<Button
								label={t(
									'quarantine.destroy_account_recreate_button',
									'YES, DELETE AND RE-CREATE IT'
								)}
								color="error"
								type="outlined"
								onClick={(): void => {
									setDeleteQuarantuneAccModal(false);
									createAccountAPI();
								}}
							/>
						</Row>
					</Container>
				}
				showCloseIcon
				onClose={(): void => setDeleteQuarantuneAccModal(false)}
			>
				<Text
					size={'extralarge'}
					overflow="break-word"
					style={{ whiteSpace: 'pre-line', textAlign: 'center', padding: '2rem 0' }}
				>
					{t(
						'quarantine.delete_and_recrate_quarantine_account_warning',
						`Are you sure you want to delete and re-create quarantine account?`
					)}
				</Text>
			</Modal>
			<Modal
				size="small"
				title={`${t('quarantine.delete_message', 'Delete message')}`}
				open={deleteMsgModal}
				customFooter={
					<Container orientation="horizontal" mainAlignment="flex-end">
						<Row style={{ gap: '0.5rem' }} padding={{ right: 'medium' }}>
							<Button
								label={t('label.keep_it_button', 'NO, KEEP IT')}
								color="primary"
								type="outlined"
								onClick={(): void => setDeleteMsgModal(false)}
							/>
							<Button
								label={t('quarantine.yes_delete_message', 'YES, DELETE')}
								color="error"
								type="outlined"
								onClick={(): void => {
									onDeleteMessage(message.id);
								}}
							/>
						</Row>
					</Container>
				}
				showCloseIcon
				onClose={(): void => setDeleteQuarantuneAccModal(false)}
			>
				<Text
					size={'extralarge'}
					overflow="break-word"
					style={{ whiteSpace: 'pre-line', textAlign: 'center', padding: '2rem 0' }}
				>
					{t('quarantine.delete_msg_warning', `Are you sure you want to delete message?`)}
				</Text>
			</Modal>
			{showMessageView && message.id && (
				<ModalOverlay setOpen={setShowMessageView} open={showMessageView} maxWidth="58.75rem">
					{messageViewLoading && <OverlayDivision ovelayStyle={ovelayStyle} />}
					<Container background="white" mainAlignment="flex-start">
						<Row
							mainAlignment="flex-start"
							crossAlignment="center"
							orientation="horizontal"
							background="white"
							width="fill"
							height="48px"
							style={{ borderBottom: '1px solid #E6E9ED' }}
						>
							<Row padding={{ horizontal: 'small' }}></Row>
							<Row takeAvailableSpace mainAlignment="flex-start">
								<Text size="medium" overflow="ellipsis" weight="bold">
									{`${find(message?.participants, { type: 'f' })?.address} <${message?.subject}>`}
								</Text>
							</Row>
							<Row padding={{ right: 'extrasmall' }}>
								<IconButton
									size="medium"
									icon="CloseOutline"
									onClick={(): void => setShowMessageView(false)}
								/>
							</Row>
						</Row>
						<Row
							mainAlignment="flex-end"
							orientation="horizontal"
							width="fill"
							padding={{ all: 'large' }}
						>
							<Button
								label={t('quarantine.deliver', 'DELIVER')}
								type="outlined"
								onClick={(): void => {
									onDeliverMessage(message);
								}}
							/>
							<Padding left="small">
								<Button
									label={t('label.delete_button', 'DELETE')}
									color="error"
									type="ghost"
									onClick={(): void => {
										setDeleteMsgModal(true);
									}}
								/>
							</Padding>
						</Row>
						<Container
							background="white"
							mainAlignment="flex-start"
							style={{
								overflow: 'auto'
								// position: 'absolute',
								// top: '0rem',
								// height: 'auto',
								// transition: 'left 0.2s ease-in-out',
								// maxHeight: '100%'
							}}
						>
							<Row
								mainAlignment="flex-start"
								orientation="horizontal"
								width="fill"
								padding={{ all: 'large' }}
							>
								<Row borderColor="gray3" padding={{ all: 'large' }} width="fill">
									<Row
										width="50%"
										mainAlignment="flex-start"
										crossAlignment="center"
										orientation="horizontal"
									>
										<Row width="95%" mainAlignment="flex-start">
											<Text size="large" weight="bold">
												{message?.subject}
											</Text>
										</Row>
									</Row>
									<Row
										width="50%"
										mainAlignment="flex-end"
										crossAlignment="center"
										orientation="vertical"
									>
										<Row width="95%" mainAlignment="flex-end" orientation="horizontal">
											<Text size="small" weight="bold">
												{t('label.date', 'Date')} :{' '}
											</Text>
											<Text size="small">
												{' '}
												{moment(message?.date).format('DD-MM-YYYY - HH:mm A')}
											</Text>
										</Row>
										<Row width="95%" mainAlignment="flex-end" orientation="horizontal">
											<Text size="small" weight="bold">
												{t('label.received', 'Received')} :{' '}
											</Text>
											<Text size="small">
												{moment(message?.date).format('DD-MM-YYYY - HH:mm A')}
											</Text>
										</Row>
									</Row>
									<Row width="100%" padding={{ top: 'medium' }}>
										<Divider color="gray2" />
									</Row>
									<Row
										width="100%"
										mainAlignment="flex-start"
										orientation="horizontal"
										padding={{ top: 'large' }}
									>
										{/* <Text size="small" weight="bold">
										{find(message?.participants, { type: 'f' })?.name}
									</Text>
									<Text size="small">{` <${
										find(message?.participants, { type: 'f' })?.address
									}>`}</Text> */}
										<Text size="small" weight="bold">
											{t('label.from', 'From')} :{' '}
										</Text>
										<Text size="small"> {message.envelopeFrom || ''}</Text>
									</Row>
									<Row
										width="100%"
										mainAlignment="flex-start"
										orientation="horizontal"
										padding={{ top: 'medium' }}
									>
										<Text size="small" weight="bold">
											{t('label.to', 'To')} :{' '}
										</Text>
										<Text size="small"> {message.envelopeTo || ''}</Text>
									</Row>
									<Row
										width="100%"
										mainAlignment="flex-start"
										orientation="horizontal"
										padding={{ top: 'medium' }}
									>
										<AttachmentsBlock
											message={message}
											// getQuarantineMsgData={(): void => {
											// 	console.log('==> Get Msg Msg');
											// }}
											getQuarantineMsgData={getQuarantineMsgData}
											// isExternalMessage={isExternalMessage}
											// openEmlPreview={openEmlPreview}
										/>
										<MailMessageRenderer
											mailMsg={message}
											onLoadChange={(): void => {
												null;
											}}
											// msgId={message.id}
											// body={message.body}
											// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
											// // @ts-ignore
											// parts={findAttachments(message.parts ?? [], [])}
											// participants={message.participants}
										/>
									</Row>
								</Row>
								<Row mainAlignment="flex-start" padding={{ all: 'large' }} width="fill">
									<IconButton
										icon={showTextMsgView ? 'ChevronUpOutline' : 'ChevronDownOutline'}
										size="small"
										onClick={setToggleView}
										label={
											showTextMsgView
												? t('quarantine.hide_source', 'Hide source')
												: t('quarantine.show_source', 'Show source')
										}
										color="primary"
										type="ghost"
									/>
								</Row>
								<Collapse orientation="vertical" open={showTextMsgView}>
									<Row borderColor="gray3" padding={{ all: 'large' }} width="fill">
										<Text overflow="break-word" color="text" style={{ fontFamily: 'monospace' }}>
											{message?.body?.content}
										</Text>
									</Row>
								</Collapse>
							</Row>
						</Container>
					</Container>
				</ModalOverlay>
			)}
		</Container>
	);
};

export default QuarantineList;
