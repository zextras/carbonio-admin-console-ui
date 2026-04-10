/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, IconName, Padding, Popper, Row, Text } from '@zextras/ui-components';
import {
  type AppRoute,
  type PrimaryBarView,
  useAppStore,
  useUtilityBarStore,
} from '@zextras/ui-shared';
import { map, sortBy, trim } from 'lodash-es';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import BadgeWrap from './badge-wrap';
import { Collapser } from './collapser';
import styles from './shell-primary-bar.module.css';

type PrimaryBarItemProps = {
  view: PrimaryBarView;
  active: boolean;
  isExpanded: boolean;
  onClick: () => void;
};

const PrimaryBarElement: FC<PrimaryBarItemProps> = ({ view, active, isExpanded, onClick }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  return (
    <>
      <Container
        ref={containerRef}
        onMouseEnter={(): void => setOpen(true)}
        onMouseLeave={(): void => setOpen(false)}
        height="52px"
      >
        <Row
          width="fill"
          mainAlignment="flex-start"
          className={styles.primaryBarRow}
          data-active={active}
        >
          <BadgeWrap badge={view.badge} isExpanded={isExpanded}>
            {typeof view.component === 'string' ? (
              <Button
                type="ghost"
                color={'text'}
                icon={view.component as IconName}
                onClick={onClick}
                size={'extralarge'}
                className={styles.primaryBarButton}
              />
            ) : (
              <Text onClick={onClick}>
                <view.component active={active} />
              </Text>
            )}
          </BadgeWrap>
          {isExpanded && (
            <Text color="text" weight="bold" onClick={onClick} className={styles.customText}>
              {view.label}
            </Text>
          )}
        </Row>
      </Container>

      <Popper
        open={open}
        anchorEl={containerRef}
        placement="right"
        onClose={(): void => setOpen(false)}
      >
        {view?.tooltip && <view.tooltip />}
      </Popper>
    </>
  );
};

const ShellPrimaryBar: FC<{ activeRoute: AppRoute | undefined }> = ({ activeRoute }) => {
  const isOpen = useUtilityBarStore((s) => s.primaryBarState);

  const setIsOpen = useUtilityBarStore((s) => s.setPrimaryBarState);
  const onCollapserClick = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);
  const primaryBarViews = useAppStore((s) => s.views.primaryBar);
  const primarybarSections = useAppStore((s) => s.views.primarybarSections);
  const [primaryBarViewWithSection, setPrimaryBarViewWithSection] = useState<any[]>([]);
  const [routes, setRoutes] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setRoutes((r) =>
      primaryBarViews.reduce((acc, v) => {
        acc[v?.id] = v.route;
        return acc;
      }, r),
    );
  }, [primaryBarViews]);
  useEffect(() => {
    if (activeRoute) {
      setRoutes((r) => ({ ...r, [activeRoute?.id]: trim(location.pathname, '/') }));
    }
  }, [activeRoute, location.pathname, primaryBarViews]);

  useEffect(() => {
    let allPrimaryBarView = [];
    if (primaryBarViews.length > 0) {
      allPrimaryBarView = primaryBarViews.filter(
        (item) => item.section === undefined || !item.section,
      );
      if (primarybarSections.length > 0) {
        primarybarSections.forEach((item) => {
          const section = {
            id: item?.id,
            position: item?.position,
            label: item?.label,
          };
          const parimaryBarItems: any = [];
          primaryBarViews.forEach((primaryBarItem) => {
            if (item?.id === primaryBarItem?.section?.id) {
              parimaryBarItems.push(primaryBarItem);
            }
          });
          allPrimaryBarView.push({
            position: item?.position,
            badge: { show: false, count: 0, showCount: false, color: 'primary' },
            visible: true,
            section,
            children: parimaryBarItems,
          });
        });
      }
      setPrimaryBarViewWithSection(sortBy(allPrimaryBarView, 'position'));
    }
  }, [primarybarSections, primaryBarViews]);

  return (
    <>
      <Container
        className={styles.primaryBarContainer}
        role="menu"
        width={isOpen ? 192 : 44}
        minWidth={44}
        maxWidth={192}
        height="fill"
        background="gray6"
        orientation="vertical"
        mainAlignment="space-between"
        style={{
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
        }}
      >
        <Container mainAlignment="flex-start">
          {map(primaryBarViewWithSection, (view, index) =>
            view.visible ? (
              <React.Fragment key={index}>
                {view?.section === undefined && (
                  <PrimaryBarElement
                    key={view?.id}
                    onClick={(): void => {
                      navigate(`/${routes[view?.id]}`);
                    }}
                    view={view}
                    isExpanded={isOpen}
                    active={activeRoute?.id === view?.id}
                  />
                )}
                {view?.section && isOpen && (
                  <>
                    <Row
                      mainAlignment="flex-start"
                      crossAlignment="flex-start"
                      width="100%"
                      padding={{ left: 'large', right: 'large' }}
                    >
                      <Text size="small" weight="bold" color="#CFD5DC">
                        <Padding top="large" bottom="small">
                          {view?.section?.label}
                        </Padding>
                      </Text>
                      <ds-divider></ds-divider>
                    </Row>
                  </>
                )}
                {view?.section && !isOpen && view?.children && (
                  <Container height="auto" padding={{ left: 'medium', right: 'medium' }}>
                    <ds-divider></ds-divider>
                  </Container>
                )}
                {view?.children &&
                  view?.children.length > 0 &&
                  map(view?.children, (item) => (
                    <PrimaryBarElement
                      key={item?.id}
                      onClick={(): void => {
                        navigate(`/${routes[item?.id]}`);
                      }}
                      view={item}
                      isExpanded={isOpen}
                      active={activeRoute?.id === item?.id}
                    />
                  ))}
              </React.Fragment>
            ) : null,
          )}
        </Container>
        <Container mainAlignment="flex-end" height="fit"></Container>
      </Container>
      <Collapser onClick={onCollapserClick} open={isOpen} />
    </>
  );
};

export default ShellPrimaryBar;
