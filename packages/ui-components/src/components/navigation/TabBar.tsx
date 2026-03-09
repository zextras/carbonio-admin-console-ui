/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { map } from 'lodash-es';
import React, { HTMLAttributes, useCallback, useMemo } from 'react';

import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { getKeyboardPreset, useKeyboard } from '../../hooks/useKeyboard';
import { AnyColor } from '../../types/utils';
import { Text } from '../basic/text/Text';
import { Container, ContainerProps } from '../layout/Container';
import styles from './TabBar.module.css';

function getThemeColorVar(colorName: string, state: string): string {
  if (!colorName) return '';
  const hexPattern = /^#([a-fA-F0-9]{3,4}|[a-fA-F0-9]{6}|[a-fA-F0-9]{8})$/;
  if (hexPattern.test(colorName)) {
    return colorName;
  }
  const sanitized = colorName.replace(/[^a-zA-Z0-9-]/g, '');
  return `var(--color-${sanitized}-${state}, var(--color-${sanitized}-regular, ${colorName}))`;
}

interface Item {
  id: string;
  label: string | React.ReactElement;
  CustomComponent?: React.ComponentType<DefaultTabBarItemProps & HTMLAttributes<HTMLDivElement>>;
  disabled?: boolean;
}

type TabBarProps = Omit<ContainerProps, 'onChange'> & {
  items: Array<Item>;
  selected: string;
  onChange: (ev: React.MouseEvent<HTMLDivElement> | KeyboardEvent, selectedId: string) => void;
  background?: AnyColor;
  underlineColor?: AnyColor;
  forceWidthEquallyDistributed?: boolean;
};

type DefaultTabBarItemProps = ContainerProps & {
  item: Item;
  selected: boolean;
  background?: AnyColor;
  onClick: (ev: React.MouseEvent<HTMLDivElement> | KeyboardEvent) => void;
  underlineColor: AnyColor;
  forceWidthEquallyDistributed: boolean;
};

function getTabItemStyleVars(
  underlineColor: AnyColor,
  background?: AnyColor,
  disabled?: boolean,
): React.CSSProperties {
  const bgColorBase = background ?? 'transparent';
  return {
    '--tab-underline-color': getThemeColorVar(underlineColor, 'regular'),
    '--tab-bg-regular': getThemeColorVar(bgColorBase, 'regular'),
    '--tab-bg-hover': disabled ? 'transparent' : getThemeColorVar(bgColorBase, 'hover'),
    '--tab-bg-focus': disabled ? 'transparent' : getThemeColorVar(bgColorBase, 'focus'),
  } as React.CSSProperties;
}

const DefaultTabBarItem = (
  {
    item,
    selected,
    background,
    onClick,
    underlineColor = 'primary',
    forceWidthEquallyDistributed = false,
    children,
    style,
    ...rest
  }: DefaultTabBarItemProps,
  ref?: React.Ref<HTMLDivElement>,
) => {
  const activationCb = useCallback(
    (ev: React.MouseEvent<HTMLDivElement> | KeyboardEvent) => {
      if (!item.disabled) {
        onClick(ev);
      }
    },
    [item.disabled, onClick],
  );

  const combinedRef = useCombinedRefs<HTMLDivElement>(ref);

  const keyEvents = useMemo(() => getKeyboardPreset('button', activationCb), [activationCb]);
  useKeyboard(combinedRef, keyEvents);

  const tabItemClassName = [
    styles.tabItem,
    forceWidthEquallyDistributed && styles.tabItemEquallyDistributed,
    selected && styles.tabItemSelected,
    item.disabled && styles.tabItemDisabled,
  ]
    .filter(Boolean)
    .join(' ');

  const tabItemStyle = {
    ...getTabItemStyleVars(underlineColor, background, item.disabled),
    ...style,
  };

  return (
    <Container
      padding={{ horizontal: 'small' }}
      onClick={activationCb}
      borderRadius="none"
      ref={combinedRef}
      style={tabItemStyle}
      className={tabItemClassName}
      {...rest}
    >
      {children || (
        <Text
          overflow="ellipsis"
          size="small"
          color={selected ? 'text' : 'secondary'}
          disabled={item.disabled}
          className={styles.labelText}
        >
          {item.label}
        </Text>
      )}
    </Container>
  );
};

const TabBar = ({
  items,
  selected,
  onChange,
  background,
  underlineColor = 'primary',
  forceWidthEquallyDistributed = false,
  ref,
  ...rest
}: TabBarProps) => {
  const onItemClickCb = useCallback(
    (id: string) =>
      (ev: React.MouseEvent<HTMLDivElement> | KeyboardEvent): void => {
        onChange(ev, id);
      },
    [onChange],
  );
  return (
    <Container
      ref={ref}
      orientation="horizontal"
      background={background}
      mainAlignment="flex-start"
      {...rest}
    >
      {map(items, (item, index) =>
        item.CustomComponent ? (
          <item.CustomComponent
            data-testid={`tab${index}`}
            key={item.id}
            item={item}
            selected={item.id === selected}
            onClick={onItemClickCb(item.id)}
            tabIndex={item.disabled ? undefined : 0}
            background={background}
            underlineColor={underlineColor}
            forceWidthEquallyDistributed={forceWidthEquallyDistributed}
          />
        ) : (
          <DefaultTabBarItem
            data-testid={`tab${index}`}
            key={item.id}
            item={item}
            selected={item.id === selected}
            background={background}
            onClick={onItemClickCb(item.id)}
            tabIndex={item.disabled ? undefined : 0}
            underlineColor={underlineColor}
            forceWidthEquallyDistributed={forceWidthEquallyDistributed}
          />
        ),
      )}
    </Container>
  );
};

export { DefaultTabBarItem, TabBar };
export type { DefaultTabBarItemProps, TabBarProps };
