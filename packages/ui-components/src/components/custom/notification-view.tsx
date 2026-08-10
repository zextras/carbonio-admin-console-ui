/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getAllNotifications, readUnreadNotification, useSnackbar } from '@zextras/ui-shared';
import { format } from 'date-fns';
import { orderBy } from 'lodash-es';
import {
  type FC,
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import { Table } from '../display/Table';
import { Container } from '../layout/Container';
import { DefaultTabBarItem, TabBar } from '../navigation/TabBar';
import { CustomHeaderFactory } from './custom-table-header-factory';
import HoverableRowFactory from './hoverable-row-factory';
import { ListRow } from './list-row';
import { ModalOverlay } from './modal-overlay';
import { NotificationDetail } from './notification-detail';
import { Paging } from './paging';
import { TrackNumberPerPage } from './track-number-per-page';

const DESC = 'desc';
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

type Notification = {
  ack: boolean;
  date: number;
  group: string;
  id: string;
  level: string;
  operationId: string;
  server: string;
  subject: string;
  text: string;
};

const ReusedDefaultTabBar: FC<{
  item: any;
  index: any;
  selected: any;
  onClick: any;
}> = ({ item, selected, onClick }): ReactElement => (
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
        <ds-icon icon={item?.icon} color={selected ? 'primary' : 'gray1'}></ds-icon>
      </Container>
      <Container mainAlignment="flex-start" crossAlignment="flex-start" width="auto">
        <ds-text as="span" size="small" weight="regular" color={selected ? 'primary' : 'gray1'}>
          {item.label} ({item?.count})
        </ds-text>
      </Container>
    </Container>
  </DefaultTabBarItem>
);

type NotificationViewProps = {
  isShowTitle: boolean;
  isAddPadding?: boolean;
};

const NotificationView: FC<NotificationViewProps> = ({ isShowTitle, isAddPadding = false }) => {
  const [t] = useTranslation();
  const [change, setChange] = useState(NOTIFICATION_ALL);
  const createSnackbar = useSnackbar();
  const [notificationList, setNotificationList] = useState<Array<Notification>>([]);
  const [filterdNotification, setFilterdNotification] = useState<Array<Notification>>([]);
  const [notificationRows, setNotificationRows] = useState<Array<any>>([]);
  const [showNotificationDetail, setShowNotificationDetail] = useState<boolean>(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification>(
    {} as Notification,
  );
  const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
  const [notificationCount, setNotificationCount] = useState<any>({
    warning: 0,
    error: 0,
    information: 0,
    all: 0,
  });
  const [selectedRow, setSelectedRow] = useState<any>([]);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [offset, setOffset] = useState(0);
  const timer = useRef<any>(null);

  function handlePageSizeChange(newLimit: number): void {
    setLimit(newLimit);
    setOffset(0);
  }

  const items = useMemo(
    () => [
      {
        id: NOTIFICATION_ALL,
        icon: 'KeypadOutline',
        label: t('notification.all', 'ALL'),
        count: notificationCount?.all,
        CustomComponent: ReusedDefaultTabBar,
      },
      {
        id: NOTIFICATION_INFORMATION,
        icon: 'InfoOutline',
        label: t('notification.information', 'INFORMATION'),
        count: notificationCount?.information,
        CustomComponent: ReusedDefaultTabBar,
      },
      {
        id: NOTIFICATION_WARNING,
        icon: 'AlertTriangleOutline',
        label: t('notification.warning', 'WARNING'),
        count: notificationCount?.warning,
        CustomComponent: ReusedDefaultTabBar,
      },
      {
        id: NOTIFICATION_ERROR,
        icon: 'CloseCircleOutline',
        label: t('notification.error', 'ERROR'),
        count: notificationCount?.error,
        CustomComponent: ReusedDefaultTabBar,
      },
    ],
    [t, notificationCount],
  );

  const headers: any[] = useMemo(
    () => [
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
    ],
    [t],
  );

  const allNotifications = useCallback(() => {
    getAllNotifications()
      .then((res) => {
        if (res?.Body?.response?.content) {
          const content = JSON.parse(res?.Body?.response?.content);
          if (content?.response) {
            const notificationItems: Array<Notification> = [];
            let infoCount = 0;
            let allCount = 0;
            let warningCount = 0;
            let errorCount = 0;
            if (content?.response && content?.response?.notifications) {
              const allNotification = content?.response?.notifications;
              notificationItems.push(...allNotification);
              const info = allNotification.filter(
                (item: Notification) => item?.level === NOTIFICATION_INFORMATION,
              );
              const warn = allNotification.filter(
                (item: Notification) => item?.level === NOTIFICATION_WARNING,
              );
              const error = allNotification.filter(
                (item: Notification) => item?.level === NOTIFICATION_ERROR,
              );
              allCount += allNotification.length;
              infoCount += info.length;
              warningCount += warn.length;
              errorCount += error.length;
            }
            setNotificationList(
              orderBy(notificationItems, (item: Notification) => new Date(item?.date), [DESC]),
            );
            setNotificationCount({
              all: allCount,
              information: infoCount,
              warning: warningCount,
              error: errorCount,
            });
          }
        }
      })
      .catch((error: any) => {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: error
            ? error?.error
            : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      });
  }, [t, createSnackbar]);

  useEffect(() => {
    allNotifications();
  }, [allNotifications]);

  useEffect(() => {
    if (notificationList.length > 0) {
      if (change === NOTIFICATION_ALL) {
        setFilterdNotification(notificationList);
      } else if (change === NOTIFICATION_INFORMATION) {
        const list = notificationList.filter(
          (item: Notification) => item?.level === NOTIFICATION_INFORMATION,
        );
        setFilterdNotification(list);
      } else if (change === NOTIFICATION_WARNING) {
        const list = notificationList.filter(
          (item: Notification) => item?.level === NOTIFICATION_WARNING,
        );
        setFilterdNotification(list);
      } else if (change === NOTIFICATION_ERROR) {
        const list = notificationList.filter(
          (item: Notification) => item?.level === NOTIFICATION_ERROR,
        );

        setFilterdNotification(list);
      }
    } else {
      setFilterdNotification([]);
    }
  }, [change, notificationList]);

  const doClickAction = useCallback((): void => {
    setShowNotificationDetail(true);
  }, []);

  const doDoubleClickAction = useCallback((): void => {
    setShowNotificationDetail(true);
  }, []);

  const handleClick = useCallback(
    (event: any) => {
      clearTimeout(timer.current);
      if (event.detail === 1) {
        timer.current = setTimeout(doClickAction, 300);
      } else if (event.detail === 2) {
        doDoubleClickAction();
      }
    },

    [doClickAction, doDoubleClickAction],
  );

  const markAsReadUnread = useCallback(
    (item: any, isShowMessage = true) => {
      setIsRequestInProgress(true);
      readUnreadNotification(item?.id, !item?.ack)
        .then((res) => {
          const content = JSON.parse(res?.Body?.response?.content);
          if (content?.ok) {
            setIsRequestInProgress(false);
            const message = item?.ack
              ? t(
                  'notification.notification_mark_unread_successfully',
                  'Notification mark as unread successfully',
                )
              : t(
                  'notification.notification_mark_read_successfully',
                  'Notification mark as read successfully',
                );
            if (isShowMessage) {
              createSnackbar({
                key: 'success',
                severity: 'success',
                label: message,
                autoHideTimeout: 3000,
                hideButton: true,
                replace: true,
              });
            }
            const allData = notificationList.map((nf: Notification) => {
              if (nf?.id === item?.id) {
                nf.ack = !item?.ack;
              }
              return nf;
            });
            setNotificationList(allData);
          }
        })
        .catch((error: any) => {
          setIsRequestInProgress(false);
          createSnackbar({
            key: 'error',
            severity: 'error',
            label: error
              ? error?.error
              : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
        });
    },
    [createSnackbar, t, notificationList],
  );

  useEffect(() => {
    if (filterdNotification.length > 0) {
      const allRows = filterdNotification.map((item: Notification) => ({
        id: item?.id,
        columns: [
          <ds-text
            as="span"
            size="small"
            color="gray0"
            weight="regular"
            key={item.id}
            onClick={(event: any): void => {
              setSelectedNotification(item);
              handleClick(event);
              setSelectedRow([item?.id]);
              if (item?.ack === false) {
                markAsReadUnread(item, false);
              }
            }}
          >
            {item?.server}
          </ds-text>,
          <ds-text
            as="span"
            size="small"
            color="gray0"
            weight={item?.ack ? 'light' : 'medium'}
            key={item.id}
            onClick={(event: { stopPropagation: () => void }): void => {
              setSelectedNotification(item);
              handleClick(event);
              setSelectedRow([item?.id]);
              if (item?.ack === false) {
                markAsReadUnread(item, false);
              }
            }}
          >
            {format(item?.date, 'dd-MM-yyyy - HH:mm a')}
          </ds-text>,
          <ds-text
            as="span"
            size="small"
            color="gray0"
            weight={item?.ack ? 'light' : 'medium'}
            key={item.id}
            onClick={(event: { stopPropagation: () => void }): void => {
              setSelectedNotification(item);
              handleClick(event);
              setSelectedRow([item?.id]);
              if (item?.ack === false) {
                markAsReadUnread(item, false);
              }
            }}
          >
            {item?.level}
          </ds-text>,
          <ds-text
            as="span"
            size="small"
            color="gray0"
            weight={item?.ack ? 'light' : 'medium'}
            key={item.id}
            onClick={(event: { stopPropagation: () => void }): void => {
              setSelectedNotification(item);
              handleClick(event);
              setSelectedRow([item?.id]);
              if (item?.ack === false) {
                markAsReadUnread(item, false);
              }
            }}
          >
            {item?.subject}
          </ds-text>,
        ],
      }));
      setNotificationRows(allRows);
    } else {
      setNotificationRows([]);
    }
  }, [filterdNotification, handleClick, markAsReadUnread]);

  const copyNotificationOperation = useCallback(
    (notificationSelected: Notification) => {
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
    },
    [t, createSnackbar],
  );

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
            // @ts-expect-error - fix this
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
          <Table
            selectedRows={selectedRow}
            rows={notificationRows.slice(offset, offset + limit)}
            headers={headers}
            showCheckbox={false}
            multiSelect={false}
            RowFactory={HoverableRowFactory}
            HeaderFactory={CustomHeaderFactory}
          />
        </Container>
      </ListRow>
      {notificationRows.length > 0 && (
        <Container orientation="horizontal" mainAlignment="space-between" width="fill">
          <Paging
            key={`${change}-${limit}`}
            totalItem={notificationRows.length}
            setOffset={setOffset}
            pageSize={limit}
          />
          <TrackNumberPerPage setPageSize={handlePageSizeChange} />
        </Container>
      )}
      {showNotificationDetail && (
        <ModalOverlay open={showNotificationDetail}>
          <NotificationDetail
            notification={selectedNotification}
            setShowNotificationDetail={setShowNotificationDetail}
            copyNotificationOperation={copyNotificationOperation}
            markAsReadUnread={markAsReadUnread}
            isRequestInProgress={isRequestInProgress}
          />
        </ModalOverlay>
      )}
    </Container>
  );
};

export { NotificationView, type NotificationViewProps };
