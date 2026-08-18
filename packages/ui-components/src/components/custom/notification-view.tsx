/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  type Notification,
  useAllNotifications,
  useReadUnreadNotification,
  useSnackbar,
} from '@zextras/ui-shared';
import { format } from 'date-fns';
import { type ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type SingleItemArray } from '../../types/utils';
import { Table } from '../display/Table';
import { Container } from '../layout/Container';
import {
  DefaultTabBarItem,
  type DefaultTabBarItemProps,
  type Item,
  TabBar,
} from '../navigation/TabBar';
import { CustomHeaderFactory } from './custom-table-header-factory';
import HoverableRowFactory from './hoverable-row-factory';
import { ListRow } from './list-row';
import { ModalOverlay } from './modal-overlay';
import { NotificationDetail } from './notification-detail';
import { Paging } from './paging';
import { TrackNumberPerPage } from './track-number-per-page';

const NOTIFICATION_ALL = 'All';
const NOTIFICATION_ERROR = 'Error';
const NOTIFICATION_INFORMATION = 'Information';
const NOTIFICATION_WARNING = 'Warning';
const DEFAULT_PAGE_SIZE = 10;

const copyTextToClipboard = (text: string): void => {
  if (navigator) {
    navigator.clipboard.writeText(text);
  }
};

type NotificationViewProps = {
  isShowTitle: boolean;
  isAddPadding?: boolean;
};

const ReusedDefaultTabBar = ({
  item,
  selected,
  onClick,
}: DefaultTabBarItemProps & React.HTMLAttributes<HTMLDivElement>): ReactElement => (
  <DefaultTabBarItem
    item={item}
    selected={selected}
    onClick={onClick}
    orientation="horizontal"
    background="transparent"
    underlineColor="primary"
    forceWidthEquallyDistributed={false}
  >
    <Container
      orientation="horizontal"
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      padding={{ all: 'medium' }}
      width="fill"
    >
      <Container width="2rem" padding={{ right: 'small' }}>
        <ds-icon icon={item.icon} color={selected ? 'primary' : 'gray1'}></ds-icon>
      </Container>
      <Container mainAlignment="flex-start" crossAlignment="flex-start" width="auto">
        <ds-text as="span" size="small" weight="regular" color={selected ? 'primary' : 'gray1'}>
          {item.label} ({item.count ?? 0})
        </ds-text>
      </Container>
    </Container>
  </DefaultTabBarItem>
);

function buildNotificationCell(
  item: Notification,
  columnId: string,
  content: string,
  weight: 'light' | 'regular' | 'medium',
  onCellClick: () => void,
): ReactElement {
  return (
    <ds-text
      as="span"
      size="small"
      color="gray0"
      weight={weight}
      key={`${item.id}-${columnId}`}
      onClick={onCellClick}
    >
      {content}
    </ds-text>
  );
}

export const NotificationView = ({ isShowTitle, isAddPadding = false }: NotificationViewProps) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const [change, setChange] = useState<string>(NOTIFICATION_ALL);
  const [showNotificationDetail, setShowNotificationDetail] = useState<boolean>(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<string>('');
  const [selectedRow, setSelectedRow] = useState<SingleItemArray<string>>([]);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [offset, setOffset] = useState(0);

  const { data: notificationList = [], isPending, error } = useAllNotifications();
  const readUnreadMutation = useReadUnreadNotification();

  useEffect(() => {
    if (error) {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label:
          error?.message ||
          t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    }
  }, [error, t, createSnackbar]);

  const notificationCount = {
    all: notificationList.length,
    information: notificationList.filter((item) => item.level === NOTIFICATION_INFORMATION).length,
    warning: notificationList.filter((item) => item.level === NOTIFICATION_WARNING).length,
    error: notificationList.filter((item) => item.level === NOTIFICATION_ERROR).length,
  };

  const items: Array<Item> = [
    {
      id: NOTIFICATION_ALL,
      icon: 'KeypadOutline',
      label: t('notification.all', 'ALL'),
      count: notificationCount.all,
      CustomComponent: ReusedDefaultTabBar,
    },
    {
      id: NOTIFICATION_INFORMATION,
      icon: 'InfoOutline',
      label: t('notification.information', 'INFORMATION'),
      count: notificationCount.information,
      CustomComponent: ReusedDefaultTabBar,
    },
    {
      id: NOTIFICATION_WARNING,
      icon: 'AlertTriangleOutline',
      label: t('notification.warning', 'WARNING'),
      count: notificationCount.warning,
      CustomComponent: ReusedDefaultTabBar,
    },
    {
      id: NOTIFICATION_ERROR,
      icon: 'CloseCircleOutline',
      label: t('notification.error', 'ERROR'),
      count: notificationCount.error,
      CustomComponent: ReusedDefaultTabBar,
    },
  ];

  const headers = [
    {
      id: 'server',
      label: t('label.server', 'Server'),
      width: '20%',
      bold: true,
    },
    {
      id: 'date',
      label: t('label.date', 'Date'),
      width: '20%',
      bold: true,
    },
    {
      id: 'type',
      label: t('label.type', 'Type'),
      width: '20%',
      bold: true,
    },
    {
      id: 'whatinside',
      label: t('label.what_inside', "What's inside?"),
      width: '40%',
      bold: true,
    },
  ];

  const filteredNotifications =
    change === NOTIFICATION_ALL
      ? notificationList
      : notificationList.filter((item) => item.level === change);

  const handleCellClick = (item: Notification): void => {
    setShowNotificationDetail(true);
    setSelectedNotificationId(item.id);
    setSelectedRow([item.id]);
    if (!item.ack) {
      readUnreadMutation.mutate({ notification: item, showMessage: false });
    }
  };

  const notificationRows = filteredNotifications.map((item) => {
    const onCellClick = (): void => {
      handleCellClick(item);
    };
    return {
      id: item.id,
      columns: [
        buildNotificationCell(item, 'server', item.server, 'regular', onCellClick),
        buildNotificationCell(
          item,
          'date',
          format(item.date, 'dd-MM-yyyy - HH:mm a'),
          item.ack ? 'light' : 'medium',
          onCellClick,
        ),
        buildNotificationCell(
          item,
          'level',
          item.level,
          item.ack ? 'light' : 'medium',
          onCellClick,
        ),
        buildNotificationCell(
          item,
          'subject',
          item.subject,
          item.ack ? 'light' : 'medium',
          onCellClick,
        ),
      ],
    };
  });

  const selectedNotification = notificationList.find((item) => item.id === selectedNotificationId);

  const handlePageSizeChange = (newLimit: number): void => {
    setLimit(newLimit);
    setOffset(0);
  };

  const copyNotificationOperation = (notificationSelected: Notification): void => {
    const notificationItem = `
			${t('label.date', 'Date')} : ${format(notificationSelected?.date, 'dd-MM-yyyy - HH:mm a')} \n
			${t('label.type', 'Type')} : ${notificationSelected?.level} \n
			${t('label.what_inside', "What's inside?")} : ${notificationSelected?.subject} \n
			${t('label.content', 'Content')} : ${notificationSelected?.text}
		`;
    copyTextToClipboard(notificationItem);
    createSnackbar({
      key: 'success',
      severity: 'success',
      label:
        t('notification.copy_notification_successfully', 'Notification copied successfully') ??
        'Notification copied successfully',
      autoHideTimeout: 3000,
      hideButton: true,
      replace: true,
    });
  };

  return (
    <Container background="gray6" height="auto">
      <ListRow>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          padding={{ left: isAddPadding ? 'large' : '' }}
        >
          {isShowTitle && (
            <ds-text as="h2" size="large" weight="bold" color="gray0">
              {t('notification.notifications_list', "Notifications' List") ?? "Notifications' List"}
            </ds-text>
          )}
        </Container>
        <Container mainAlignment="flex-end" crossAlignment="flex-end">
          <TabBar
            items={items}
            selected={change}
            onChange={(_: unknown, selectedId: string): void => {
              setChange(selectedId);
              setOffset(0);
            }}
            underlineColor="primary"
          />
        </Container>
      </ListRow>
      <ListRow>
        <ds-divider></ds-divider>
      </ListRow>
      <ListRow>
        <Container
          orientation="horizontal"
          mainAlignment="space-between"
          crossAlignment="flex-start"
          width="fill"
          height="auto"
          padding={{ all: isAddPadding ? 'large' : '' }}
        >
          {isPending ? (
            <ds-page-shimmer></ds-page-shimmer>
          ) : (
            <Table
              selectedRows={selectedRow}
              rows={notificationRows.slice(offset, offset + limit)}
              headers={headers}
              showCheckbox={false}
              multiSelect={false}
              RowFactory={HoverableRowFactory}
              HeaderFactory={CustomHeaderFactory}
            />
          )}
        </Container>
      </ListRow>
      {!isPending && notificationRows.length > 0 && (
        <Container orientation="horizontal" mainAlignment="space-between" width="fill">
          <Paging
            key={`${change}-${limit}`}
            totalItem={notificationRows.length}
            setOffset={setOffset}
            pageSize={limit}
          />
          <div style={{ padding: '0.5rem 1rem' }}>
            <TrackNumberPerPage setPageSize={handlePageSizeChange} />
          </div>
        </Container>
      )}
      {showNotificationDetail && selectedNotification && (
        <ModalOverlay open={showNotificationDetail}>
          <NotificationDetail
            notification={selectedNotification}
            setShowNotificationDetail={setShowNotificationDetail}
            copyNotificationOperation={copyNotificationOperation}
            markAsReadUnread={(notification: Notification): void => {
              readUnreadMutation.mutate({ notification });
            }}
            isRequestInProgress={readUnreadMutation.isPending}
          />
        </ModalOverlay>
      )}
    </Container>
  );
};

export { type NotificationViewProps };
