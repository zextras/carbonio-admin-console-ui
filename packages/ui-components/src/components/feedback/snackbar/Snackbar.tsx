/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../../web-components/icon-wc';

import React, { useCallback, useEffect } from 'react';

import { resolveThemeColor } from '../../../theme/theme-utils';
import { type IconName } from '../../../web-components/icon-registry';
import { Button } from '../../basic/button/Button';
import { Text } from '../../basic/text/Text';
import { TIMERS } from '../../constants';
import { Container } from '../../layout/Container';
import { Row } from '../../layout/Row';
import { Portal } from '../../utilities/Portal';
import { Transition } from '../../utilities/Transition';
import styles from './Snackbar.module.css';

const icons: Record<'success' | 'info' | 'warning' | 'error', IconName> = {
  success: 'CheckmarkOutline',
  info: 'InfoOutline',
  warning: 'AlertTriangleOutline',
  error: 'CloseCircleOutline',
};

type SnackbarProps = {
  /** Whether to show the Snackbar or not */
  open?: boolean;
  /** Snackbar severity */
  severity?: 'success' | 'info' | 'warning' | 'error';
  /** Snackbar text message */
  label: string | React.ReactElement;
  /** Snackbar button text */
  actionLabel?: string;
  /** Button's click callback */
  onActionClick?: () => void;
  /** Callback to handle Snackbar closing */
  onClose?: () => void;
  /** Disable the autoHide functionality */
  disableAutoHide?: boolean;
  /** Hide the button in the Snackbar */
  hideButton?: boolean;
  /** zIndex of the snackbar */
  zIndex?: number;
  /** autoHide timing in milliseconds */
  autoHideTimeout?: number;
  /** Window object to use as reference to determine the screenMode */
  target?: Window;
  /** Flag to disable the Portal implementation */
  disablePortal?: boolean;
  /**
   * Show a progress bar for the auto-hide timeout counter.
   * Be sure to have uniq keys when showing the progress bar on multiple snackbars.
   */
  progressBar?: boolean;
  ref?: React.Ref<HTMLDivElement>;
};

const Snackbar = ({
  open = false,
  severity = 'info',
  label,
  disableAutoHide = false,
  hideButton = false,
  actionLabel = 'Ok',
  onActionClick,
  onClose,
  zIndex = 1000,
  autoHideTimeout = TIMERS.SNACKBAR.DEFAULT_HIDE_TIMEOUT,
  disablePortal = false,
  progressBar = true,
  ref,
}: SnackbarProps) => {
  const handleClick = useCallback(() => {
    onActionClick ? onActionClick() : onClose?.();
  }, [onActionClick, onClose]);

  const enableTimeout = open && !disableAutoHide && onClose !== undefined;

  useEffect(() => {
    let timeout: number;
    if (enableTimeout) {
      timeout = setTimeout(() => {
        onClose();
      }, autoHideTimeout) as unknown as number;
    }
    return (): void => {
      clearTimeout(timeout);
    };
  }, [onClose, autoHideTimeout, enableTimeout]);

  return (
    <Portal show={open} disablePortal={disablePortal}>
      <Transition ref={ref} type="fade-in-right">
        <div
          className={styles.snackContainer}
          style={
            {
              '--snackbar-z-index': zIndex,
              '--snackbar-background-color': resolveThemeColor(severity, 'regular'),
            } as React.CSSProperties
          }
          data-testid="snackbar"
        >
          <Container
            orientation="horizontal"
            mainAlignment="flex-start"
            gap={'1rem'}
            height="auto"
            width="auto"
            padding={{
              top: '0.5rem',
              right: hideButton ? '1.5rem' : '0.5rem',
              bottom: '0.5rem',
              left: '1.5rem',
            }}
            maxWidth={'100%'}
          >
            <Row flexShrink={0}>
              <Row flexShrink={0}>
                <icon-wc size="large" icon={icons[severity]} color="gray6"></icon-wc>
              </Row>
            </Row>
            <Container
              gap={'1rem'}
              wrap={'wrap'}
              flexBasis={'fit-content'}
              mainAlignment={'flex-start'}
              orientation={'row'}
              minWidth={0}
            >
              <Row
                mainAlignment="flex-start"
                flexBasis={'50%'}
                flexShrink={1}
                flexGrow={1}
                width={'auto'}
              >
                <Text color="gray6" size="medium" overflow={'break-word'}>
                  {label}
                </Text>
              </Row>
              {!hideButton && (
                <Row
                  margin={{ left: 'auto', right: '0' }}
                  wrap={'nowrap'}
                  flexGrow={0}
                  flexShrink={0}
                  minWidth={0}
                  flexBasis={'fit-content'}
                >
                  <Button label={actionLabel} type="ghost" color="gray6" onClick={handleClick} />
                </Row>
              )}
            </Container>
          </Container>
          {enableTimeout && progressBar && (
            <Container
              className={styles.progressBar}
              style={{ animationDuration: `${autoHideTimeout}ms` }}
              height={'0.25rem'}
              data-testid={'progress-bar'}
              background={`${severity}.active`}
              width={'100%'}
            />
          )}
        </div>
      </Transition>
    </Portal>
  );
};

export type { SnackbarProps };
export { Snackbar };
