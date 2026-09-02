/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, Link, Padding, Row, Tooltip } from '@zextras/ui-components';
import { filter, find, map, uniqBy } from 'lodash-es';
import { FC, ReactElement, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useRemoveQuarantineAttachment } from '../../../services/use-quarantine-message-actions';
import styles from './attachments-block.module.css';
import { AttachmentPart, EditorAttachmentFiles, IncompleteMessage } from './quarantine-types';

type IconColors = Array<{
  color: string;
  extension: string;
}>;

type AttachmentType = {
  filename?: string;
  size: number;
  downloadlink: string;
  message: IncompleteMessage;
  isExternalMessage?: boolean;
  part: string;
  iconColors: IconColors;
  att: EditorAttachmentFiles;
  onClose: () => void;
};

type GetAttachmentsDownloadLinkProps = {
  messageId: string;
  messageSubject: string;
  attachments: Array<string | undefined>;
};

type FileExtension = { value: string; displayName?: string };

const FILE_EXTENSIONS_BY_CONTENT_TYPE: Record<string, FileExtension> = {
  'text/html': { value: 'html' },
  'text/css': { value: 'css' },
  'text/xml': { value: 'xml' },
  'image/gif': { value: 'gif' },
  'image/jpeg': { value: 'jpg' },
  'application/x-javascript': { value: 'js' },
  'application/atom+xml': { value: 'atom' },
  'application/rss+xml': { value: 'rss' },
  'text/mathml': { value: 'mml' },
  'text/plain': { value: 'txt' },
  'text/vnd.sun.jme.app-descriptor': { value: 'jad' },
  'text/vnd.wap.wml': { value: 'wml' },
  'text/x-component': { value: 'htc' },
  'image/png': { value: 'png' },
  'image/tiff': { value: 'tif,tiff', displayName: 'tif' },
  'image/vnd.wap.wbmp': { value: 'wbmp' },
  'image/x-icon': { value: 'ico' },
  'image/x-jng': { value: 'jng' },
  'image/x-ms-bmp': { value: 'bmp' },
  'image/svg+xml': { value: 'svg' },
  'image/webp': { value: 'webp' },
  'application/java-archive': { value: 'jar,war,ear' },
  'application/mac-binhex': { value: 'hqx' },
  'application/msword': { value: 'doc' },
  'application/pdf': { value: 'pdf' },
  'application/postscript': { value: 'ps,eps,ai' },
  'application/rtf': { value: 'rtf' },
  'application/vnd.ms-excel': { value: 'xls' },
  'application/vnd.ms-powerpoint': { value: 'ppt' },
  'application/vnd.wap.wmlc': { value: 'wmlc' },
  'application/vnd.google-earth.kml+xml': { value: 'kml' },
  'application/vnd.google-earth.kmz': { value: 'kmz' },
  'application/x-z-compressed': { value: 'z' },
  'application/x-cocoa': { value: 'cco' },
  'application/x-java-archive-diff': { value: 'jardiff' },
  'application/x-java-jnlp-file': { value: 'jnlp' },
  'application/x-makeself': { value: 'run' },
  'application/x-perl': { value: 'pl,pm' },
  'application/x-pilot': { value: 'prc,pdb' },
  'application/x-rar-compressed': { value: 'rar' },
  'application/x-redhat-package-manager': { value: 'rpm' },
  'application/x-sea': { value: 'sea' },
  'application/x-shockwave-flash': { value: 'swf' },
  'application/x-stuffit': { value: 'sit' },
  'application/x-tcl': { value: 'tcl' },
  'application/x-x-ca-cert': { value: 'der' },
  'application/x-xpinstall': { value: 'xpi' },
  'application/xhtml+xml': { value: 'xhtml' },
  'application/zip': { value: 'zip' },
  'audio/midi': { value: 'midi' },
  'audio/mpeg': { value: 'mp' },
  'audio/ogg': { value: 'ogg' },
  'audio/x-realaudio': { value: 'ra' },
  'video/gpp': { value: 'gp' },
  'video/mpeg': { value: 'mpeg' },
  'video/quicktime': { value: 'mov' },
  'video/x-flv': { value: 'flv' },
  'video/x-mng': { value: 'mng' },
  'video/x-ms-asf': { value: 'asf' },
  'video/x-ms-wmv': { value: 'wmv' },
  'video/x-msvideo': { value: 'avi' },
  'video/mp': { value: 'mp' },
  'message/rfc822': { value: 'EML' },
};

const FileExtensionRegex = /^.+\.([^.]+)$/;
const getFileExtension = (file: EditorAttachmentFiles | AttachmentPart): FileExtension => {
  const byContentType = FILE_EXTENSIONS_BY_CONTENT_TYPE[file.contentType ?? ''];
  if (byContentType) {
    return byContentType;
  }
  const match = FileExtensionRegex.exec(file?.filename ?? '');
  return { value: match === null ? '?' : match?.[1] ?? '' };
};
const calcColor = (label: string): string => {
  let sum = 0;
  for (let i = 0; i < label.length; i += 1) {
    sum += label.codePointAt(i) ?? 0;
  }

  return `var(--color-avatar-${(sum % 50) + 1})`;
};
const getLocationOrigin = (): string => globalThis.location.origin;
const getAttachmentsDownloadLink = ({
  messageId,
  messageSubject,
  attachments,
}: GetAttachmentsDownloadLinkProps): string => {
  if (attachments?.length > 1) {
    return `${getLocationOrigin()}/service/home/~/?auth=co&id=${messageId}&filename=${messageSubject}&charset=UTF-8&part=${attachments.join(
      ',',
    )}&disp=a&fmt=zip`;
  }
  return `${getLocationOrigin()}/service/home/~/?auth=co&id=${messageId}&part=${attachments?.join(
    ',',
  )}&disp=a`;
};

const getAttachmentIconColors = ({
  attachments,
}: {
  attachments: AttachmentPart[] | EditorAttachmentFiles[];
}): IconColors =>
  uniqBy(
    attachments.map((att: AttachmentPart | EditorAttachmentFiles) => {
      const fileExtn = getFileExtension(att).value;
      const color = calcColor(att.contentType ?? '');

      return {
        extension: fileExtn,
        color,
      };
    }),
    'extension',
  );

const humanFileSize = (inputSize: number): string => {
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
  onClose,
}) => {
  const extension = getFileExtension(att).value;

  const sizeLabel = humanFileSize(size);
  const inputRef = useRef<HTMLAnchorElement>(null);
  const inputRef2 = useRef<HTMLAnchorElement>(null);
  const [t] = useTranslation();
  const removeAttachmentMutation = useRemoveQuarantineAttachment();

  const downloadAttachment = () => {
    if (inputRef.current) {
      // @ts-expect-error - needs a fix
      inputRef2.current.value = null;
      inputRef.current.click();
    }
  };

  const isEML = extension === 'EML';

  const actionTooltipText = isEML
    ? t('action.click_open', 'Click to open')
    : t('action.click_preview', 'Click to preview');

  const onDeleteAttachment = () => {
    void removeAttachmentMutation
      .mutateAsync({ id: message.id, part })
      .then(() => {
        onClose();
      })
      .catch(() => {
        // snackbar already reported by the hook
      });
  };

  return (
    <Container
      className={styles.attachmentContainer}
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
          <span
            className={styles.attachmentExtension}
            style={{ backgroundColor: find(iconColors, (ic) => ic.extension === extension)?.color }}
          >
            {extension}
          </span>
          <Row orientation="vertical" crossAlignment="flex-start" takeAvailableSpace>
            <Padding style={{ width: '100%' }} bottom="extrasmall">
              <ds-text as="span">
                {filename ||
                  t('label.attachment_unknown', {
                    mimeType: att?.contentType,
                    defaultValue: 'Unknown <{{mimeType}}>',
                  })}
              </ds-text>
            </Padding>
            <ds-text as="small" color="gray1" size="small">
              {sizeLabel}
            </ds-text>
          </Row>
        </Row>
      </Tooltip>
      <Row orientation="horizontal" crossAlignment="center">
        <Container className={styles.attachmentHoverBarContainer} orientation="horizontal">
          {removeAttachmentMutation.isPending ? (
            <Padding right="small">
              <ds-spinner></ds-spinner>
            </Padding>
          ) : (
            <>
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
                    aria-label={t('label.download_one', 'Download')}
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
                      aria-label={t('label.delete', 'Delete')}
                    />
                  </Tooltip>
                </Padding>
              )}
            </>
          )}
        </Container>
      </Row>
      <a
        className={styles.attachmentLink}
        rel="noopener noreferrer"
        ref={inputRef2}
        target="_blank"
        href={`${getLocationOrigin()}/service/home/~/?auth=co&id=${message.id}&part=${part}`}
        aria-label={
          filename ??
          t('label.attachment_unknown', {
            mimeType: att?.contentType,
            defaultValue: 'Unknown <{{mimeType}}>',
          })
        }
      />
      <a
        className={styles.attachmentLink}
        ref={inputRef}
        rel="noopener noreferrer"
        target="_blank"
        href={downloadlink}
        aria-label={t('label.download_one', 'Download')}
      />
    </Container>
  );
};

export const AttachmentsBlock: FC<{
  message: IncompleteMessage;
  isExternalMessage?: boolean;
  onClose: () => void;
}> = ({ message, isExternalMessage = false, onClose }): ReactElement => {
  const [t] = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const attachments = filter(message?.attachments, { cd: 'attachment' });

  const attachmentsCount = attachments?.length || 0;
  const attachmentsParts = map(attachments, 'name');
  const actionsDownloadLink = getAttachmentsDownloadLink({
    messageId: message.id,
    messageSubject: message.subject,
    attachments: attachmentsParts,
  });

  return attachmentsCount > 0 ? (
    <Container crossAlignment="flex-start">
      <Container orientation="horizontal" mainAlignment="space-between" wrap="wrap">
        {map(expanded ? attachments : attachments?.slice(0, 2), (att, index) => (
          <Attachment
            key={`att-${att.filename}-${index}`}
            filename={att?.filename}
            size={att?.size ?? 0}
            downloadlink={getAttachmentsDownloadLink({
              messageId: message.id,
              messageSubject: message.subject,
              attachments: [att.name],
            })}
            message={message}
            isExternalMessage={isExternalMessage}
            part={att?.name ?? ''}
            iconColors={getAttachmentIconColors({ attachments })}
            // @ts-expect-error - needs a fix
            att={att}
            onClose={onClose}
          />
        ))}
      </Container>
      <Row mainAlignment="flex-start" padding={{ top: 'extrasmall', bottom: 'medium' }}>
        <Padding right="small">
          {attachmentsCount === 1 && (
            <ds-text as="span" color="gray1">{`1 ${t(
              'label.attachment_one',
              'Attachment',
            )}`}</ds-text>
          )}
          {attachmentsCount === 2 && (
            <ds-text as="span" color="gray1">
              {`${attachmentsCount} ${t('label.attachment_other', 'Attachments')}`}
            </ds-text>
          )}
          {attachmentsCount > 2 &&
            (expanded ? (
              <Row
                data-testid="attachment-list-collapse-link"
                onClick={(): void => setExpanded(false)}
                style={{ cursor: 'pointer' }}
              >
                <Padding right="small">
                  <ds-text as="span" color="primary">
                    {`${attachmentsCount} ${t('label.attachment_other', 'Attachments')}`}
                  </ds-text>
                </Padding>
                <ds-icon icon="ArrowIosUpward" color="primary"></ds-icon>
              </Row>
            ) : (
              <Row
                data-testid="attachment-list-expand-link"
                onClick={(): void => setExpanded(true)}
                style={{ cursor: 'pointer' }}
              >
                <Padding right="small">
                  <ds-text as="span" color="primary">
                    {`${t('label.show_all', 'Show all')} ${attachmentsCount} ${t(
                      'label.attachment_other',
                      'attachments',
                    )}`}
                  </ds-text>
                </Padding>
                <ds-icon icon="ArrowIosDownward" color="primary"></ds-icon>
              </Row>
            ))}{' '}
        </Padding>

        <Link target="_blank" size="medium" href={actionsDownloadLink}>
          {t('label.download', {
            count: attachmentsCount,
            defaultValue_one: 'Download',
            defaultValue_other: 'Download all',
          })}
        </Link>
      </Row>
    </Container>
  ) : (
    <></>
  );
};
