/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { useIsVisible } from '../../hooks/useIsVisible/useIsVisible';
import { resolveThemeColor } from '../../theme/theme-utils';
import { AnyColor } from '../../types/utils';
import styles from './ListItem.module.css';

/**
 * @deprecated Use ListItemProps instead
 */
type ListItemWrapperProps = {
  /** Base background color for the item */
  background?: AnyColor;
  /** Background color for the selected status */
  selectedBackground?: AnyColor;
  /** Background color for the active status */
  activeBackground?: AnyColor;
  /** Define if the item is active in order to show the activeBackground */
  active?: boolean;
  /** Define if the item is selected in order to show the selectedBackground */
  selected?: boolean;
};

type ListItemProps = {
  /** Base background color for the item */
  background?: AnyColor;
  /** Background color for the selected status */
  selectedBackground?: AnyColor;
  /** Background color for the active status */
  activeBackground?: AnyColor;
  /** Define if the item is active in order to show the activeBackground */
  active?: boolean;
  /** Define if the item is selected in order to show the selectedBackground */
  selected?: boolean;
  /**
   * Ref of the list used to set the visibility of the item.
   * The ref is set by the list itself.
   */
  listRef?: React.RefObject<HTMLDivElement>;
  /**
   * Content of the item (render prop).
   * Visible arg define if the item is visible on the screen or if is in the hidden part of the list.
   * This is useful to avoid rendering components which are not visible (virtual list), replacing
   * them with a placeholder which allow the scrollbar to have the right height.
   */
  children: (visible: boolean) => React.ReactElement;
  key: NonNullable<React.HTMLProps<HTMLDivElement>['key']>;
  ref?: React.Ref<HTMLDivElement>;
};

const ListItem = ({
  listRef,
  children,
  active,
  activeBackground,
  selected,
  selectedBackground,
  background,
  ref,
  ...rest
}: ListItemProps) => {
  const [inView, itemRef] = useIsVisible<HTMLDivElement>(listRef, ref);

  const backgroundColor =
    (active && activeBackground) || (selected && selectedBackground) || background;

  const itemStyle = useMemo<React.CSSProperties>(
    () =>
      ({
        '--item-bg': backgroundColor
          ? resolveThemeColor(backgroundColor, 'regular')
          : 'transparent',
        '--item-bg-hover': backgroundColor
          ? resolveThemeColor(backgroundColor, 'hover')
          : 'transparent',
        '--item-bg-focus': backgroundColor
          ? resolveThemeColor(backgroundColor, 'focus')
          : 'transparent',
        '--item-bg-active': backgroundColor
          ? resolveThemeColor(backgroundColor, 'active')
          : 'transparent',
      } as React.CSSProperties),
    [backgroundColor],
  );

  return (
    <div tabIndex={0} ref={itemRef} className={styles.listItem} style={itemStyle} {...rest}>
      {children(inView)}
    </div>
  );
};

export type { ListItemProps, ListItemWrapperProps };
export { ListItem };
