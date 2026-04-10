/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, Padding, Text } from '@zextras/ui-components';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './scroll-component.module.css';

const ScrollContainer: FC<{
  isVisible: boolean;
}> = ({ isVisible = false }) => {
  const [t] = useTranslation();
  return isVisible ? (
    <Container className={styles.scrollingContainer} data-isShow={isVisible}>
      <Container orientation="horizontal" padding={{ top: 'large' }} width="100%">
        <ds-icon icon="ArrowheadDown" size="large"></ds-icon>
        <Padding left="small">
          <Text size="large" weight="light" color="gray">
            {t('label.scroll_down_to_view_other_items', 'Scroll down to view other items')}
          </Text>
        </Padding>
      </Container>
    </Container>
  ) : (
    <></>
  );
};

export default ScrollContainer;
