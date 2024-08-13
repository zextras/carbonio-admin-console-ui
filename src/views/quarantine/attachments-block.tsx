/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback, useMemo, useRef, useState } from 'react';

import {
	Button,
	Container,
	getColor,
	Icon,
	Link,
	Padding,
	Row,
	Text,
	Tooltip,
	useSnackbar,
	useTheme
} from '@zextras/carbonio-design-system';
import { getBridgedFunctions, getIntegratedFunction, soapFetch } from '@zextras/carbonio-shell-ui';
import { filter, find, map, includes, isNil, uniqBy } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled, { DefaultTheme, SimpleInterpolation } from 'styled-components';

import {
	MailMessage,
	EditorAttachmentFiles,
	Conversation,
	AttachmentPart
} from './mail-message-renderer';
import { removeAttachmentsRequest } from '../../services/remove-attachments';

type OpenEmlPreviewType = (
	parentMessageId: string,
	attachmentName: string,
	emlMessage: MailMessage
) => void;

type GetQuarantineMsgData = () => void;
type SetShowMessageView = (v: boolean) => void;
type SetMessageViewLoading = (v: boolean) => void;

export type MailEditHeaderType = {
	folderId: string | number;
	header: string | undefined;
};

export type IconColors = Array<{
	color: string;
	extension: string;
}>;

export type AttachmentType = {
	filename?: string;
	size: number;
	link: string;
	downloadlink: string;
	message: MailMessage;
	isExternalMessage?: boolean;
	part: string;
	iconColors: IconColors;
	att: EditorAttachmentFiles;
	openEmlPreview?: OpenEmlPreviewType;
	getQuarantineMsgData: GetQuarantineMsgData;
	setShowMessageView: SetShowMessageView;
	setMessageViewLoading: SetMessageViewLoading;
};

export type PreviewPanelActionsType = {
	item: Conversation;
	folderId: string;
	isMessageView: boolean;
	conversation: Conversation;
};

export type CopyToFileResponse = {
	status?: string;
	value?: Record<string, unknown>;
};
export type GetAttachmentsDownloadLinkProps = {
	messageId: string;
	messageSubject: string;
	attachments: Array<string | undefined>;
};
type GetAttachmentsLinkProps = {
	messageId: string;
	messageSubject: string;
	attachments: Array<string | undefined>;
	attachmentType: string | undefined;
};
const FileExtensionRegex = /^.+\.([^.]+)$/;
const getFileExtension = (
	file: EditorAttachmentFiles | AttachmentPart
): { value: string; displayName?: string } => {
	// eslint-disable-next-line sonarjs/max-switch-cases
	switch (file.contentType) {
		case 'text/html':
			return { value: 'html' };
		case 'text/css':
			return { value: 'css' };
		case 'text/xml':
			return { value: 'xml' };
		case 'image/gif':
			return { value: 'gif' };
		case 'image/jpeg':
			return { value: 'jpg' };
		case 'application/x-javascript':
			return { value: 'js' };
		case 'application/atom+xml':
			return { value: 'atom' };
		case 'application/rss+xml':
			return { value: 'rss' };
		case 'text/mathml':
			return { value: 'mml' };
		case 'text/plain':
			return { value: 'txt' };
		case 'text/vnd.sun.jme.app-descriptor':
			return { value: 'jad' };
		case 'text/vnd.wap.wml':
			return { value: 'wml' };
		case 'text/x-component':
			return { value: 'htc' };
		case 'image/png':
			return { value: 'png' };
		case 'image/tiff':
			return { value: 'tif,tiff', displayName: 'tif' };
		case 'image/vnd.wap.wbmp':
			return { value: 'wbmp' };
		case 'image/x-icon':
			return { value: 'ico' };
		case 'image/x-jng':
			return { value: 'jng' };
		case 'image/x-ms-bmp':
			return { value: 'bmp' };
		case 'image/svg+xml':
			return { value: 'svg' };
		case 'image/webp':
			return { value: 'webp' };
		case 'application/java-archive':
			return { value: 'jar,war,ear' };
		case 'application/mac-binhex':
			return { value: 'hqx' };
		case 'application/msword':
			return { value: 'doc' };
		case 'application/pdf':
			return { value: 'pdf' };
		case 'application/postscript':
			return { value: 'ps,eps,ai' };
		case 'application/rtf':
			return { value: 'rtf' };
		case 'application/vnd.ms-excel':
			return { value: 'xls' };
		case 'application/vnd.ms-powerpoint':
			return { value: 'ppt' };
		case 'application/vnd.wap.wmlc':
			return { value: 'wmlc' };
		case 'application/vnd.google-earth.kml+xml':
			return { value: 'kml' };
		case 'application/vnd.google-earth.kmz':
			return { value: 'kmz' };
		case 'application/x-z-compressed':
			return { value: 'z' };
		case 'application/x-cocoa':
			return { value: 'cco' };
		case 'application/x-java-archive-diff':
			return { value: 'jardiff' };
		case 'application/x-java-jnlp-file':
			return { value: 'jnlp' };
		case 'application/x-makeself':
			return { value: 'run' };
		case 'application/x-perl':
			return { value: 'pl,pm' };
		case 'application/x-pilot':
			return { value: 'prc,pdb' };
		case 'application/x-rar-compressed':
			return { value: 'rar' };
		case 'application/x-redhat-package-manager':
			return { value: 'rpm' };
		case 'application/x-sea':
			return { value: 'sea' };
		case 'application/x-shockwave-flash':
			return { value: 'swf' };
		case 'application/x-stuffit':
			return { value: 'sit' };
		case 'application/x-tcl':
			return { value: 'tcl' };
		case 'application/x-x-ca-cert':
			return { value: 'der' };
		case 'application/x-xpinstall':
			return { value: 'xpi' };
		case 'application/xhtml+xml':
			return { value: 'xhtml' };
		case 'application/zip':
			return { value: 'zip' };
		case 'audio/midi':
			return { value: 'midi' };
		case 'audio/mpeg':
			return { value: 'mp' };
		case 'audio/ogg':
			return { value: 'ogg' };
		case 'audio/x-realaudio':
			return { value: 'ra' };
		case 'video/gpp':
			return { value: 'gp' };
		case 'video/mpeg':
			return { value: 'mpeg' };
		case 'video/quicktime':
			return { value: 'mov' };
		case 'video/x-flv':
			return { value: 'flv' };
		case 'video/x-mng':
			return { value: 'mng' };
		case 'video/x-ms-asf':
			return { value: 'asf' };
		case 'video/x-ms-wmv':
			return { value: 'wmv' };
		case 'video/x-msvideo':
			return { value: 'avi' };
		case 'video/mp':
			return { value: 'mp' };
		case 'message/rfc822':
			return { value: 'EML' };
		default:
			return {
				value: isNil(FileExtensionRegex.exec(file?.filename ?? ''))
					? '?'
					: FileExtensionRegex.exec(file?.filename ?? '')?.[1] ?? ''
			};
	}
};
export const calcColor = (label: string, theme: DefaultTheme): string => {
	let sum = 0;
	for (let i = 0; i < label.length; i += 1) {
		sum += label.charCodeAt(i);
	}
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return theme.avatarColors[`avatar_${(sum % 50) + 1}`];
};
const getLocationOrigin = (): string => window.location.origin;
const getAttachmentsLink = ({
	messageId,
	messageSubject,
	attachments,
	attachmentType
}: GetAttachmentsLinkProps): string => {
	if (attachments.length > 1) {
		return `${getLocationOrigin()}/service/home/~/?auth=co&id=${messageId}&filename=${messageSubject}&charset=UTF-8&part=${attachments.join(
			','
		)}&disp=a&fmt=zip`;
	}
	if (includes(['image/gif', 'image/png', 'image/jpeg', 'image/jpg'], attachmentType)) {
		return `${getLocationOrigin()}/service/preview/image/${messageId}/${
			attachments[0]
		}/0x0/?quality=high`;
	}
	if (includes(['application/pdf'], attachmentType)) {
		return `${getLocationOrigin()}/service/preview/pdf/${messageId}/${
			attachments[0]
		}/?first_page=1`;
	}
	if (
		includes(
			[
				'text/csv',
				'text/plain',
				'application/msword',
				'application/vnd.ms-excel',
				'application/vnd.ms-powerpoint',
				'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				'application/vnd.openxmlformats-officedocument.presentationml.presentation',
				'application/vnd.oasis.opendocument.spreadsheet',
				'application/vnd.oasis.opendocument.presentation',
				'application/vnd.oasis.opendocument.text'
			],
			attachmentType
		)
	) {
		return `${getLocationOrigin()}/service/preview/document/${messageId}/${attachments.join(',')}`;
	}
	return `${getLocationOrigin()}/service/home/~/?auth=co&id=${messageId}&part=${attachments.join(
		','
	)}&disp=a`;
};

const getAttachmentsDownloadLink = ({
	messageId,
	messageSubject,
	attachments
}: GetAttachmentsDownloadLinkProps): string => {
	if (attachments?.length > 1) {
		return `${getLocationOrigin()}/service/home/~/?auth=co&id=${messageId}&filename=${messageSubject}&charset=UTF-8&part=${attachments.join(
			','
		)}&disp=a&fmt=zip`;
	}
	return `${getLocationOrigin()}/service/home/~/?auth=co&id=${messageId}&part=${attachments?.join(
		','
	)}&disp=a`;
};

const getAttachmentIconColors = ({
	attachments,
	theme
}: {
	attachments: AttachmentPart[] | EditorAttachmentFiles[];
	theme: DefaultTheme;
}): IconColors =>
	uniqBy(
		attachments.map((att: AttachmentPart | EditorAttachmentFiles) => {
			const fileExtn = getFileExtension(att).value;
			const color = calcColor(att.contentType ?? '', theme);

			return {
				extension: fileExtn,
				color
			};
		}),
		'extension'
	);

const AttachmentHoverBarContainer = styled(Container)`
	display: none;
	height: 0;
`;

const AttachmentContainer = styled(Container)`
	border-radius: 0.125rem;
	width: calc(50% - 0.25rem);
	transition: 0.2s ease-out;
	margin-bottom: ${({ theme }): string => theme.sizes.padding.small};
	&:hover {
		background-color: ${({ theme, background }): SimpleInterpolation =>
			background && getColor(`${background.toString()}.hover`, theme)};
		& ${AttachmentHoverBarContainer} {
			display: flex;
		}
	}
	&:focus {
		background-color: ${({ theme, background }): SimpleInterpolation =>
			background && getColor(`${background.toString()}.focus`, theme)};};
	}
	cursor: pointer;
`;

const AttachmentLink = styled.a`
	margin-bottom: ${({ theme }): string => theme.sizes.padding.small};
	position: relative;
	text-decoration: none;
`;

const AttachmentExtension = styled(Text)<{
	background: { color: string };
}>`
	display: flex;
	justify-content: center;
	align-items: center;
	width: 2rem;
	height: 2rem;
	border-radius: ${({ theme }): string => theme.borderRadius};
	background-color: ${({ background }): string => background.color};
	color: ${({ theme }): string => theme.palette.gray6.regular};
	font-size: calc(${({ theme }): string => theme.sizes.font.small} - 0.125rem);
	text-transform: uppercase;
	margin-right: ${({ theme }): string => theme.sizes.padding.small};
`;
export const humanFileSize = (inputSize: number): string => {
	if (inputSize === 0) {
		return '0 B';
	}
	const i = Math.floor(Math.log(inputSize) / Math.log(1024));
	return `${(inputSize / 1024 ** i).toFixed(2).toString()} ${['B', 'KB', 'MB', 'GB', 'TB'][i]}`;
};
const Attachment: FC<AttachmentType> = ({
	filename,
	size,
	downloadlink,
	message,
	isExternalMessage = false,
	part,
	iconColors,
	att,
	getQuarantineMsgData,
	setShowMessageView,
	setMessageViewLoading
}) => {
	const extension = getFileExtension(att).value;

	const sizeLabel = useMemo(() => humanFileSize(size), [size]);
	const inputRef = useRef<HTMLAnchorElement>(null);
	const inputRef2 = useRef<HTMLAnchorElement>(null);
	const createSnackbar = useSnackbar();
	const [t] = useTranslation();

	const downloadAttachment = useCallback(() => {
		if (inputRef.current) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			inputRef2.current.value = null;
			inputRef.current.click();
		}
	}, [inputRef]);

	const isEML = extension === 'EML';

	const actionTooltipText = isEML
		? t('action.click_open', 'Click to open')
		: t('action.click_preview', 'Click to preview');

	const onDeleteAttachment = useCallback(() => {
		setMessageViewLoading(true);
		removeAttachmentsRequest(message.id, part)
			.then(() => {
				createSnackbar({
					key: 'info',
					severity: 'info',
					label: t('quarantine.attachment_deleted', 'Attachment deleted'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				getQuarantineMsgData();
				setShowMessageView(false);
			})
			.catch((error) => {
				setMessageViewLoading(false);
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
		createSnackbar,
		getQuarantineMsgData,
		message.id,
		part,
		setShowMessageView,
		setMessageViewLoading,
		t
	]);

	return (
		<AttachmentContainer
			orientation="horizontal"
			mainAlignment="flex-start"
			height="fit"
			background="gray3"
			data-testid={`attachment-container-${filename}`}
		>
			<Tooltip key={`${message.id}-Preview`} label={actionTooltipText}>
				<Row
					padding={{ all: 'small' }}
					mainAlignment="flex-start"
					// onClick={preview}
					takeAvailableSpace
				>
					<AttachmentExtension
						background={find(iconColors, (ic) => ic.extension === extension) ?? { color: '' }}
					>
						{extension}
					</AttachmentExtension>
					<Row orientation="vertical" crossAlignment="flex-start" takeAvailableSpace>
						<Padding style={{ width: '100%' }} bottom="extrasmall">
							<Text>
								{filename ||
									t('label.attachment_unknown', {
										mimeType: att?.contentType,
										defaultValue: 'Unknown <{{mimeType}}>'
									})}
							</Text>
						</Padding>
						<Text color="gray1" size="small">
							{sizeLabel}
						</Text>
					</Row>
				</Row>
			</Tooltip>
			<Row orientation="horizontal" crossAlignment="center">
				<AttachmentHoverBarContainer orientation="horizontal">
					<Padding right="small">
						<Tooltip
							key={`${message.id}-DownloadOutline`}
							label={t('label.download_one', 'Download')}
						>
							<Button
								type="ghost"
								color={'text'}
								size="medium"
								icon="DownloadOutline"
								onClick={downloadAttachment}
							/>
						</Tooltip>
					</Padding>
					{!isExternalMessage && (
						<Padding right="small">
							<Tooltip
								key={`${message.id}-DeletePermanentlyOutline`}
								label={t('label.delete', 'Delete')}
							>
								<Button
									type="ghost"
									color={'text'}
									size="medium"
									icon="DeletePermanentlyOutline"
									onClick={onDeleteAttachment}
								/>
							</Tooltip>
						</Padding>
					)}
				</AttachmentHoverBarContainer>
			</Row>
			<AttachmentLink
				rel="noopener"
				ref={inputRef2}
				target="_blank"
				href={`${getLocationOrigin()}/service/home/~/?auth=co&id=${message.id}&part=${part}`}
			/>
			<AttachmentLink ref={inputRef} rel="noopener" target="_blank" href={downloadlink} />
		</AttachmentContainer>
	);
};

const copyToFiles = (
	att: AttachmentPart,
	message: MailMessage,
	nodes: any
): Promise<CopyToFileResponse> =>
	soapFetch('CopyToFiles', {
		_jsns: 'urn:zimbraMail',
		mid: message.id,
		part: att.name,
		destinationFolderId: nodes?.[0]?.id
	});

const AttachmentsBlock: FC<{
	message: MailMessage;
	isExternalMessage?: boolean;
	openEmlPreview?: OpenEmlPreviewType;
	getQuarantineMsgData: GetQuarantineMsgData;
	setShowMessageView: SetShowMessageView;
	setMessageViewLoading: SetMessageViewLoading;
}> = ({
	message,
	isExternalMessage = false /* openEmlPreview */,
	getQuarantineMsgData,
	setShowMessageView,
	setMessageViewLoading
	// eslint-disable-next-line sonarjs/cognitive-complexity
}): ReactElement => {
	const [t] = useTranslation();
	const [expanded, setExpanded] = useState(false);
	const attachments = useMemo(
		() => filter(message?.attachments, { cd: 'attachment' }),
		[message?.attachments]
	);

	const attachmentsCount = useMemo(() => attachments?.length || 0, [attachments]);
	const attachmentsParts = useMemo(() => map(attachments, 'name'), [attachments]);
	const theme = useTheme();
	const actionsDownloadLink = useMemo(
		() =>
			getAttachmentsDownloadLink({
				messageId: message.id,
				messageSubject: message.subject,
				attachments: attachmentsParts
			}),
		[message, attachmentsParts]
	);

	const getLabel = useCallback(
		({ allSuccess, allFails }: { allSuccess: boolean; allFails: boolean }): string => {
			if (allSuccess) {
				return t(
					'message.snackbar.all_att_saved',
					'Attachments successfully saved in the selected folder'
				);
			}
			if (allFails) {
				return t(
					'message.snackbar.att_err',
					'There seems to be a problem when saving, please try again'
				);
			}
			return t(
				'message.snackbar.some_att_fails',
				'There seems to be a problem when saving some files, please try again'
			);
		},
		[t]
	);

	const confirmAction = useCallback(
		(nodes) => {
			const promises = map(attachments, (att) => copyToFiles(att, message, nodes));
			Promise.allSettled(promises).then((res: CopyToFileResponse[]) => {
				const isFault = res.length === filter(res, (r) => r?.value?.Fault)?.length;
				const allSuccess = isFault
					? false
					: res.length === filter(res, ['status', 'fulfilled'])?.length;
				const allFails = res.length === filter(res, ['status', 'rejected'])?.length;
				const type = allSuccess ? 'info' : 'warning';
				const label = getLabel({ allSuccess, allFails });
				getBridgedFunctions()?.createSnackbar({
					key: `calendar-moved-root`,
					replace: true,
					type,
					hideButton: true,
					label,
					autoHideTimeout: 4000
				});
			});
		},
		[attachments, getLabel, message]
	);

	const isAValidDestination = useCallback((node) => node?.permissions?.can_write_file, []);

	const actionTarget = useMemo(
		() => ({
			title: t('label.select_folder', 'Select folder'),
			confirmAction,
			confirmLabel: t('label.save', 'Save'),
			disabledTooltip: t('label.invalid_destination', 'This node is not a valid destination'),
			allowFiles: false,
			allowFolders: true,
			isValidSelection: isAValidDestination,
			canSelectOpenedFolder: true,
			maxSelection: 1
		}),
		[confirmAction, isAValidDestination, t]
	);

	const [uploadIntegration, isUploadIntegrationAvailable] = getIntegratedFunction('select-nodes');

	const getSaveToFilesLink = useCallback((): ReactElement | null => {
		if (!isUploadIntegrationAvailable) {
			return null;
		}

		return (
			<Link
				size="medium"
				onClick={(): void => {
					uploadIntegration && uploadIntegration(actionTarget);
				}}
				style={{ paddingLeft: '0.5rem' }}
			>
				{t('label.save_to_files', 'Save to Files')}
			</Link>
		);
	}, [actionTarget, isUploadIntegrationAvailable, t, uploadIntegration]);

	return attachmentsCount > 0 ? (
		<Container crossAlignment="flex-start">
			<Container orientation="horizontal" mainAlignment="space-between" wrap="wrap">
				{map(expanded ? attachments : attachments?.slice(0, 2), (att, index) => (
					<Attachment
						key={`att-${att.filename}-${index}`}
						filename={att?.filename}
						size={att?.size ?? 0}
						link={getAttachmentsLink({
							messageId: message.id,
							messageSubject: message.subject,
							attachments: [att.name],
							attachmentType: att.contentType
						})}
						downloadlink={getAttachmentsDownloadLink({
							messageId: message.id,
							messageSubject: message.subject,
							attachments: [att.name]
						})}
						message={message}
						isExternalMessage={isExternalMessage}
						part={att?.name ?? ''}
						iconColors={getAttachmentIconColors({ attachments, theme })}
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						att={att}
						getQuarantineMsgData={getQuarantineMsgData}
						setShowMessageView={setShowMessageView}
						setMessageViewLoading={setMessageViewLoading}
					/>
				))}
			</Container>
			<Row mainAlignment="flex-start" padding={{ top: 'extrasmall', bottom: 'medium' }}>
				<Padding right="small">
					{attachmentsCount === 1 && (
						<Text color="gray1">{`1 ${t('label.attachment_one', 'Attachment')}`}</Text>
					)}
					{attachmentsCount === 2 && (
						<Text color="gray1">
							{
								// eslint-disable-next-line sonarjs/no-duplicate-string
								`${attachmentsCount} ${t('label.attachment_other', 'Attachments')}`
							}
						</Text>
					)}
					{attachmentsCount > 2 &&
						(expanded ? (
							<Row
								data-testid="attachment-list-collapse-link"
								onClick={(): void => setExpanded(false)}
								style={{ cursor: 'pointer' }}
							>
								<Padding right="small">
									<Text color="primary">
										{`${attachmentsCount} ${t('label.attachment_other', 'Attachments')}`}
									</Text>
								</Padding>
								<Icon icon="ArrowIosUpward" color="primary" />
							</Row>
						) : (
							<Row
								data-testid="attachment-list-expand-link"
								onClick={(): void => setExpanded(true)}
								style={{ cursor: 'pointer' }}
							>
								<Padding right="small">
									<Text color="primary">
										{`${t('label.show_all', 'Show all')} ${attachmentsCount} ${t(
											'label.attachment_other',
											'attachments'
										)}`}
									</Text>
								</Padding>
								<Icon icon="ArrowIosDownward" color="primary" />
							</Row>
						))}{' '}
				</Padding>

				<Link target="_blank" size="medium" href={actionsDownloadLink}>
					{t('label.download', {
						count: attachmentsCount,
						defaultValue_one: 'Download',
						defaultValue_other: 'Download all'
					})}
				</Link>
				{getSaveToFilesLink()}
			</Row>
		</Container>
	) : (
		<></>
	);
};
export default AttachmentsBlock;
