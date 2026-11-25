/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../../web-components/ds-divider';

import React from 'react';

import { DropdownItemButton } from './dropdown-item';
import { type ItemTextSize } from './dropdown-item-content';
import {
  type DropdownItem,
  type ItemClickHandler,
  resolveItemRole,
} from './dropdown-logic';
import { DropdownSubmenuItem } from './dropdown-submenu-item';

export type DropdownItemListProps = {
  items: Array<DropdownItem>;
  /** Index in `items` of the entry that owns the menu's tab stop. */
  tabStopIndex: number;
  multiple: boolean;
  itemTextSize: ItemTextSize;
  createClickHandler: (onClick: DropdownItem['onClick']) => ItemClickHandler;
  onItemFocus: (index: number) => void;
};

/** Builds the element for one dropdown item: a divider, a submenu row or a leaf item. */
function buildItemElement(
  item: DropdownItem,
  index: number,
  context: DropdownItemListProps,
): React.ReactNode {
  const {
    id,
    icon,
    label,
    onClick,
    selected,
    items: subItems,
    disabled,
    type,
    ...itemProps
  } = item;
  if (type === 'divider') {
    return <ds-divider key={id}></ds-divider>;
  }
  const rovingTabIndex = index === context.tabStopIndex ? 0 : -1;
  const handleFocus = (): void => context.onItemFocus(index);
  if (subItems) {
    return (
      <DropdownSubmenuItem
        icon={icon}
        label={label ?? ''}
        aria-haspopup="menu"
        aria-disabled={disabled ? true : undefined}
        onClick={context.createClickHandler(onClick)}
        selected={selected}
        key={id}
        disabled={disabled}
        items={subItems}
        itemTextSize={context.itemTextSize}
        data-dropdown-item=""
        tabIndex={rovingTabIndex}
        onFocus={handleFocus}
        {...itemProps}
      />
    );
  }
  return (
    <DropdownItemButton
      icon={icon}
      label={label ?? ''}
      role={resolveItemRole(selected, context.multiple)}
      aria-checked={selected}
      aria-disabled={disabled ? true : undefined}
      onClick={context.createClickHandler(onClick)}
      selected={selected}
      key={id}
      disabled={disabled}
      itemTextSize={context.itemTextSize}
      data-dropdown-item=""
      tabIndex={rovingTabIndex}
      onFocus={handleFocus}
      {...itemProps}
    />
  );
}

/** The menu's entries in order, each one keyed by its id. */
export const DropdownItemList = (props: DropdownItemListProps) => (
  <>{props.items.map((item, index) => buildItemElement(item, index, props))}</>
);
