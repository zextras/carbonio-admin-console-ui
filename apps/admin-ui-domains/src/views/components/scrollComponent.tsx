/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, Padding, Text } from '@zextras/ui-components';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface ScrollContainerProps {
  isVisible: boolean;
}

const containerStyle: React.CSSProperties = {
  position: 'sticky',
  bottom: '0',
  background: 'linear-gradient(to top, var(--color-gray6-regular) 0%, transparent 100%)',
};

const ScrollContainer: FC<ScrollContainerProps> = ({ isVisible = false }) => {
  const [t] = useTranslation();

  return isVisible ? (
    <Container style={containerStyle}>
      <Container orientation="horizontal" padding={{ top: 'large' }} width="100%">
        <icon-wc color="gray" icon-name="ArrowheadDown" size="large"></icon-wc>
        <Padding left="small">
          <Text size="large" weight="light" color="gray">
            {t('label.scroll_down_to_view_other_items', 'Scroll down to view other items')}
          </Text>
        </Padding>
      </Container>
    </Container>
  ) : null;
};

export default ScrollContainer;
