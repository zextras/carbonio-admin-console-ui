/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useLastLoginTimestamp, useUserSettings } from '@zextras/admin-ui-bootstrap';
import { Container, Padding, Row, Text } from '@zextras/ui-components';
import { FC, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { DASHBOARD } from '../../constants';

function getBreadCrumbTextColor(isLast: boolean): { color: string; cursor: string } {
  return {
    color: isLast ? 'var(--color-gray0-regular)' : '#CCCCCC',
    cursor: 'pointer',
  };
}

const BreadCrumb: FC = () => {
  const [t] = useTranslation();
  const loc = useLocation();
  const navigate = useNavigate();
  const [splitRoutes, setSplitRoutes] = useState<any[]>([]);
  const userSetting = useUserSettings();
  const { data: lastLoginTimestamp } = useLastLoginTimestamp({
    accountId: userSetting?.attrs?.zimbraId?.toString(),
    enabled: Boolean(userSetting?.attrs?.zimbraId),
  });

  useEffect(() => {
    if (loc?.pathname) {
      const currentRoute = loc?.pathname.substring(1);
      const splitRoute = currentRoute?.split('/');
      const _storeTempRoute: any[] = [];
      splitRoute.forEach((item: any, index: number) => {
        if (index === 0) {
          _storeTempRoute.push({
            label: <icon-wc icon-name="HomeOutline" size="large"></icon-wc>,
            path: `/${item}`,
            homePath: `/${DASHBOARD}`,
          });
        } else {
          const path = _storeTempRoute.map((i) => i?.path);
          _storeTempRoute.push({
            /* i18next-extract-disable-next-line */
            label: t(`label.${item}`),
            path: `${path[index - 1]}/${item}`,
            homePath: `/${DASHBOARD}`,
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
  }, [loc, t]);

  const navigationClick = useCallback(
    (item: any, index: number) => {
      if (index === 0) {
        navigate(item?.homePath);
      } else {
        navigate(item?.path);
      }
    },
    [navigate],
  );
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
        {splitRoutes.map((item: any, index) => (
          <Row key={item?.path}>
            <Text
              style={getBreadCrumbTextColor(splitRoutes.length - 1 === index)}
              size="medium"
              weight="regular"
              onClick={(): void => {
                if (splitRoutes.length - 1 !== index) {
                  navigationClick(item, index);
                }
              }}
            >
              {item?.label}
            </Text>

            {index !== splitRoutes.length - 1 && (
              <Padding left="extrasmall" right="extrasmall">
                <Text size="medium" weight="regular" style={getBreadCrumbTextColor(false)}>
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

export default BreadCrumb;
