/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Padding, Row, Text } from '@zextras/ui-components';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import styles from './breadcrumb.module.css';

type BreadcrumbItem = {
  label: string | React.ReactNode;
  path: string;
  homePath: string;
};

type BreadcrumbProps = {
  dashboardRoute: string;
  lastLoginTimestamp?: string;
};

export const BreadcrumbComponent = ({ dashboardRoute, lastLoginTimestamp }: BreadcrumbProps) => {
  const [t] = useTranslation();
  const loc = useLocation();
  const navigate = useNavigate();
  const [splitRoutes, setSplitRoutes] = useState<Array<BreadcrumbItem>>([]);

  useEffect(() => {
    if (loc?.pathname) {
      const currentRoute = loc?.pathname.substring(1);
      const splitRoute = currentRoute?.split('/');
      const _storeTempRoute: Array<BreadcrumbItem> = [];
      splitRoute.forEach((item: string, index: number) => {
        if (index === 0) {
          _storeTempRoute.push({
            label: <icon-wc icon="HomeOutline" size="large"></icon-wc>,
            path: `/${item}`,
            homePath: `/${dashboardRoute}`,
          });
        } else {
          const path = _storeTempRoute.map((i) => i?.path);
          _storeTempRoute.push({
            /* i18next-extract-disable-next-line */
            label: t(`label.${item}`),
            path: `${path[index - 1]}/${item}`,
            homePath: `/${dashboardRoute}`,
          });
          if (
            _storeTempRoute.find(
              (sr) => typeof sr?.label === 'string' && sr?.label.startsWith('label.'),
            )
          ) {
            _storeTempRoute.splice(index, 1);
          }
        }
      });

      setSplitRoutes(_storeTempRoute);
    }
  }, [loc, t, dashboardRoute]);

  const navigationClick = useCallback(
    (item: BreadcrumbItem, index: number) => {
      if (index === 0) {
        navigate(item?.homePath);
      } else {
        navigate(item?.path);
      }
    },
    [navigate],
  );

  const isLast = (index: number): boolean => splitRoutes.length - 1 === index;

  return (
    <Container height="fit" crossAlignment="baseline" mainAlignment="baseline">
      <Container
        orientation="horizontal"
        background="gray5"
        crossAlignment="center"
        mainAlignment="flex-start"
        height="44px"
        padding={{ left: 'large', right: 'large' }}
      >
        {splitRoutes.map((item: BreadcrumbItem, index) => (
          <Row key={item?.path}>
            {isLast(index) ? (
              <Text size="medium" weight="regular" className={styles.lastBreadcrumbText}>
                {item?.label}
              </Text>
            ) : (
              <Text
                size="medium"
                weight="regular"
                className={styles.breadcrumbText}
                data-is-last="false"
                onClick={(): void => {
                  navigationClick(item, index);
                }}
              >
                {item?.label}
              </Text>
            )}

            {index !== splitRoutes.length - 1 && (
              <Padding left="extrasmall" right="extrasmall">
                <Text
                  size="medium"
                  weight="regular"
                  className={styles.breadcrumbText}
                  data-is-last="false"
                >
                  &nbsp;/&nbsp;
                </Text>
              </Padding>
            )}
          </Row>
        ))}
        {splitRoutes.length === 1 && (
          <Container mainAlignment="center" crossAlignment="flex-start" padding={{ left: 'small' }}>
            {t('label.home', 'Home')}
          </Container>
        )}
        {lastLoginTimestamp && (
          <Container
            mainAlignment="center"
            crossAlignment="flex-end"
            width="50%"
            padding={{ right: 'small' }}
            margin={{ left: 'auto' }}
          >
            <Text color="secondary" overflow="break-word" weight="light">
              {t('label.last_access', 'Last access')} {lastLoginTimestamp}
            </Text>
          </Container>
        )}
      </Container>
    </Container>
  );
};
