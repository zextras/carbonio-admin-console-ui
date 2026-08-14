/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, IconName, Padding, Popper, Row } from '@zextras/ui-components';
import {
  type AppRoute,
  type PrimaryBarView,
  useAppStore,
  useUtilityBarStore,
} from '@zextras/ui-shared';
import { map, sortBy, trim } from 'lodash-es';
import React, { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { BadgeWrap } from './badge-wrap';
import { Collapser } from './collapser';
import styles from './shell-primary-bar.module.css';

type PrimaryBarItemProps = {
  view: PrimaryBarView;
  active: boolean;
  isExpanded: boolean;
  onClick: () => void;
};

type PrimaryBarViewItem = PrimaryBarView & { children?: Array<PrimaryBarView> };

const PrimaryBarElement = ({ view, active, isExpanded, onClick }: PrimaryBarItemProps) => {
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
                aria-label={view.label}
              />
            ) : (
              <ds-text as="span" onClick={onClick}>
                <view.component active={active} />
              </ds-text>
            )}
          </BadgeWrap>
          {isExpanded && (
            <ds-text
              as="span"
              color="text"
              weight="bold"
              onClick={onClick}
              style={{ width: '75%', height: '100%', display: 'flex', alignItems: 'center' }}
            >
              {view.label}
            </ds-text>
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

type ShellPrimaryBarProps = { activeRoute: AppRoute | undefined };

const ShellPrimaryBar = ({ activeRoute }: ShellPrimaryBarProps) => {
  const isOpen = useUtilityBarStore((s) => s.primaryBarState);

  const setIsOpen = useUtilityBarStore((s) => s.setPrimaryBarState);
  const onCollapserClick = () => {
    setIsOpen(!isOpen);
  };
  const primaryBarViews = useAppStore((s) => s.views.primaryBar);
  const primarybarSections = useAppStore((s) => s.views.primarybarSections);
  const navigate = useNavigate();
  const location = useLocation();

  const routes = primaryBarViews.reduce<Record<string, string>>((acc, v) => {
    acc[v?.id] = v.path;
    return acc;
  }, {});
  if (activeRoute) {
    routes[activeRoute?.id] = trim(location.pathname, '/');
  }

  let primaryBarViewWithSection: Array<PrimaryBarViewItem> = [];
  if (primaryBarViews.length > 0) {
    const allPrimaryBarView: Array<PrimaryBarViewItem> = primaryBarViews.filter(
      (item) => item.section === undefined || !item.section,
    );
    if (primarybarSections.length > 0) {
      primarybarSections.forEach((item) => {
        const section = {
          id: item?.id,
          position: item?.position,
          label: item?.label,
        };
        const primaryBarItems: Array<PrimaryBarView> = [];
        primaryBarViews.forEach((primaryBarItem) => {
          if (item?.id === primaryBarItem?.section?.id) {
            primaryBarItems.push(primaryBarItem);
          }
        });
        allPrimaryBarView.push({
          id: item?.id ?? '',
          app: '',
          route: '',
          path: '',
          label: item?.label ?? '',
          component: '',
          position: item?.position ?? 0,
          badge: { show: false, count: 0, showCount: false, color: 'primary' },
          visible: true,
          section,
          children: primaryBarItems,
        });
      });
    }
    primaryBarViewWithSection = sortBy(allPrimaryBarView, 'position');
  }

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
          {map(primaryBarViewWithSection, (view) =>
            view.visible ? (
              <React.Fragment key={view?.section?.id ?? view?.id ?? ''}>
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
                      <ds-text as="strong" size="small" weight="bold" color="#CFD5DC">
                        <Padding top="large" bottom="small">
                          {view?.section?.label}
                        </Padding>
                      </ds-text>
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

export { ShellPrimaryBar };
