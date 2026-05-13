/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import { Container } from '../layout/Container';
import { Padding } from '../layout/Padding';
import { Row } from '../layout/Row';

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
  const location = useLocation();
  const [splitRoutes, setSplitRoutes] = useState<Array<BreadcrumbItem>>([]);

  useEffect(() => {
    if (location?.pathname) {
      const currentRoute = location?.pathname.substring(1);
      const splitRoute = currentRoute?.split('/');
      const _storeTempRoute: Array<BreadcrumbItem> = [];
      splitRoute.forEach((item: string, index: number) => {
        if (index === 0) {
          _storeTempRoute.push({
            label: t('label.home', 'Home'),
            path: `/${item}`,
            homePath: `/${dashboardRoute}`,
          });
        } else {
          const path = _storeTempRoute.map((i) => i?.path);
          _storeTempRoute.push({
            /* i18next-extract-disable-next-line */
            label: t(`label.${item}`, item.charAt(0).toUpperCase() + item.slice(1)),
            path: `${path[index - 1]}/${item}`,
            homePath: `/${dashboardRoute}`,
          });
        }
      });

      if (splitRoute.length === 1) {
        _storeTempRoute.push({
          label: t('label.dashboard', 'Dashboard'),
          path: `/${splitRoute[0]}/dashboard`,
          homePath: `/${dashboardRoute}`,
        });
      }

      setSplitRoutes(_storeTempRoute);
    }
  }, [location, t, dashboardRoute]);

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
              <ds-text
                as="span"
                size="medium"
                weight="regular"
                style={{ color: 'var(--color-gray0-regular)' } as React.CSSProperties}
              >
                {item?.label}
              </ds-text>
            ) : (
              <ds-text as="span" size="medium" weight="regular" color="#cccccc">
                {item?.label}
              </ds-text>
            )}

            {index !== splitRoutes.length - 1 && (
              <Padding left="extrasmall" right="extrasmall">
                <ds-text as="span" size="medium" weight="regular" color="#cccccc">
                  &nbsp;/&nbsp;
                </ds-text>
              </Padding>
            )}
          </Row>
        ))}
        {lastLoginTimestamp && (
          <Container
            mainAlignment="center"
            crossAlignment="flex-end"
            width="50%"
            padding={{ right: 'small' }}
            margin={{ left: 'auto' }}
          >
            <ds-text as="span" color="secondary" overflow="break-word" weight="light">
              {t('label.last_access', 'Last access')} {lastLoginTimestamp}
            </ds-text>
          </Container>
        )}
      </Container>
    </Container>
  );
};
