/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../../web-components/icon-wc';

import clsx from 'clsx';
import {
  CSSProperties,
  HTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useCombinedRefs } from '../../../hooks/useCombinedRefs';
import { useModal } from '../../../hooks/useModal';
import { type IconName } from '../../../web-components/icon-registry';
import { Button, ButtonProps } from '../../basic/button/Button';
import { Text } from '../../basic/text/Text';
import { Container } from '../../layout/Container';
import styles from './Banner.module.css';

type ActionButton = ButtonProps & { type?: never; color?: never; backgroundColor?: never };

type BannerProps = HTMLAttributes<HTMLDivElement> & {
  severity?: 'success' | 'warning' | 'info' | 'error';
  type?: 'standard' | 'fill' | 'outline';
  title?: string;
  description: string;
  primaryAction?: ActionButton;
  secondaryAction?: ActionButton;
  moreInfoLabel?: string;
  closeLabel?: string;
  ref?: React.Ref<HTMLDivElement>;
  children?: never;
} & (
    | {
        showClose: true;
        onClose: ButtonProps['onClick'];
      }
    | {
        showClose?: false;
        onClose?: never;
      }
  );

const BANNER_ICON: Record<NonNullable<BannerProps['severity']>, IconName> = {
  success: 'CheckmarkCircle2Outline',
  warning: 'AlertTriangleOutline',
  info: 'InfoOutline',
  error: 'CloseCircleOutline',
};

const BANNER_GAP = '1rem';
const BANNER_WIDTH = '100%';

const Banner = ({
  severity = 'success',
  type = 'fill',
  title,
  description,
  primaryAction,
  secondaryAction,
  showClose = false,
  onClose,
  moreInfoLabel = 'More info',
  closeLabel = 'Close',
  ref,
  ...rest
}: BannerProps) => {
  const bannerRef = useCombinedRefs(ref);
  const infoContainerRef = useRef<HTMLDivElement>(null);
  const actionsContainerRef = useRef<HTMLDivElement>(null);
  const closeContainerRef = useRef<HTMLDivElement>(null);

  const mainColor = useMemo(() => (type === 'fill' ? 'gray6' : severity), [type, severity]);
  const textColor = useMemo(() => (type === 'fill' ? 'gray6' : 'text'), [type]);
  const backgroundColor = useMemo(
    () => (type === 'outline' && 'gray6') || (type === 'fill' && severity) || `${severity}Banner`,
    [type, severity],
  );

  const [isMultiline, setIsMultiline] = useState<boolean>(false);
  const [isTextCropped, setIsTextCropped] = useState<boolean>(false);
  const { createModal, closeModal } = useModal();

  const onBannerResize = useCallback((bannerContentHeight: number) => {
    if (actionsContainerRef.current) {
      setIsMultiline(actionsContainerRef.current.clientHeight < bannerContentHeight);
    }
    if (infoContainerRef.current) {
      setIsTextCropped(
        infoContainerRef.current.scrollHeight > infoContainerRef.current.clientHeight,
      );
    }
  }, []);

  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (bannerRef.current) {
      resizeObserverRef.current = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          onBannerResize(entry.contentRect.height);
        });
      });

      resizeObserverRef.current.observe(bannerRef.current);
    }

    return (): void => {
      resizeObserverRef.current?.disconnect();
    };
  }, [bannerRef, onBannerResize]);

  const contentFlexBasis = useMemo(() => {
    const titleLength = title?.length ?? 0;
    const descriptionLength = description.length * 0.875;
    const numberOfCharsPerLine = Math.ceil(
      Math.max(titleLength, descriptionLength) / (titleLength > 0 && descriptionLength > 0 ? 2 : 3),
    );
    const extraChars = 4;
    return `${numberOfCharsPerLine + extraChars}ch`;
  }, [title, description?.length]);

  const showMoreInfoModal = useCallback(() => {
    const id = Date.now().toString();
    createModal({
      id,
      title,
      showCloseIcon: true,
      onClose: () => {
        closeModal(id);
      },
      confirmLabel: primaryAction?.label,
      onConfirm: primaryAction
        ? (event): void => {
            primaryAction.onClick(event);
            closeModal(id);
          }
        : undefined,
      secondaryActionLabel: secondaryAction?.label,
      onSecondaryAction: secondaryAction
        ? (event): void => {
            secondaryAction.onClick(event);
            closeModal(id);
          }
        : undefined,
      closeIconTooltip: closeLabel,
      children: (
        <Text size={'medium'} overflow={'break-word'}>
          {description}
        </Text>
      ),
    });
  }, [closeLabel, closeModal, createModal, description, primaryAction, secondaryAction, title]);
  const wrapContainerStyle = useMemo<CSSProperties>(
    () =>
      ({
        '--wrap-flex-basis': `calc(${contentFlexBasis} + var(--icon-size-large) + ${BANNER_GAP})`,
      } as CSSProperties),
    [contentFlexBasis],
  );

  const closeContainerStyle = useMemo<CSSProperties>(
    () =>
      ({
        '--close-align-self': isMultiline ? 'flex-start' : 'stretch',
      } as CSSProperties),
    [isMultiline],
  );

  return (
    <Container
      ref={bannerRef}
      className={clsx(styles.bannerContainer, isMultiline && styles.multiline)}
      background={backgroundColor}
      padding={{ vertical: '0.5rem', horizontal: '1rem' }}
      gap={BANNER_GAP}
      width={BANNER_WIDTH}
      height={'fit'}
      orientation={'horizontal'}
      borderColor={{ bottom: severity }}
      mainAlignment={'flex-start'}
      wrap={'wrap'}
      {...rest}
    >
      <Container
        className={styles.wrapAndGrowContainer}
        style={wrapContainerStyle}
        width={'auto'}
        maxWidth={
          showClose && closeContainerRef.current
            ? `calc(${BANNER_WIDTH} - ${BANNER_GAP} - ${closeContainerRef.current.clientWidth}px)`
            : undefined
        }
        minWidth={0}
        flexGrow={1}
        flexShrink={1}
        flexBasis={contentFlexBasis}
        height={'fit'}
        gap={'1rem'}
        orientation={'horizontal'}
        mainAlignment={'flex-start'}
      >
        <Container width={'fit'} minWidth={'fit'} height={'fit'} minHeight={'fit'}>
          <icon-wc icon={BANNER_ICON[severity]} color={mainColor} size="large"></icon-wc>
        </Container>
        <Container
          className={styles.infoContainer}
          orientation={'vertical'}
          height={'fit'}
          maxHeight={'4rem'}
          width={'auto'}
          maxWidth={'100%'}
          minWidth={0}
          flexGrow={1}
          ref={infoContainerRef}
        >
          {title && (
            <Text
              className={styles.bannerText}
              color={textColor}
              size={'medium'}
              weight={'bold'}
              overflow={'break-word'}
            >
              {title}
            </Text>
          )}
          <Text
            className={styles.bannerText}
            color={textColor}
            size={'small'}
            overflow={'break-word'}
          >
            {description}
          </Text>
        </Container>
      </Container>
      <Container
        className={styles.actionsContainer}
        width={'auto'}
        flexBasis={'fit-content'}
        height={'auto'}
        gap={'0.5rem'}
        orientation={'horizontal'}
        margin={{ right: '0', left: 'auto' }}
        ref={actionsContainerRef}
      >
        {secondaryAction && <Button {...secondaryAction} type={'ghost'} color={mainColor} />}
        {primaryAction && (
          <Button
            {...primaryAction}
            type={'outlined'}
            backgroundColor={'transparent'}
            color={mainColor}
          />
        )}
        {isTextCropped && (
          <Button
            type={'outlined'}
            backgroundColor={'transparent'}
            color={mainColor}
            label={moreInfoLabel}
            onClick={showMoreInfoModal}
          />
        )}
      </Container>
      {showClose && onClose && (
        <Container
          className={styles.closeContainer}
          style={closeContainerStyle}
          width={'fit'}
          height={'fit'}
          minWidth={'fit'}
          minHeight={'fit'}
          ref={closeContainerRef}
        >
          <Button
            onClick={onClose}
            icon={'Close'}
            color={textColor}
            type={'ghost'}
            size={'large'}
          />
        </Container>
      )}
    </Container>
  );
};

export { Banner, type BannerProps };
