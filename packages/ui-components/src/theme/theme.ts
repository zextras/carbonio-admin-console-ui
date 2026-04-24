/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

type ColorVariant = {
  regular: string;
  hover: string;
  active: string;
  focus: string;
  disabled: string;
};

type AvatarSize = {
  diameter: string;
  font: string;
};

export type Theme = {
  color: {
    primary: ColorVariant;
    secondary: ColorVariant;
    header: ColorVariant;
    gray0: ColorVariant;
    gray1: ColorVariant;
    gray2: ColorVariant;
    gray3: ColorVariant;
    gray4: ColorVariant;
    gray5: ColorVariant;
    gray6: ColorVariant;
    warning: ColorVariant;
    error: ColorVariant;
    success: ColorVariant;
    info: ColorVariant;
    text: ColorVariant;
    highlight: ColorVariant;
    transparent: ColorVariant;
    black: string;
    white: string;
    successBanner: string;
    warningBanner: string;
    infoBanner: string;
    errorBanner: string;
    currentColor: string;
    avatar: Record<string, string>;
  };
  icon: {
    size: {
      small: string;
      medium: string;
      large: string;
    };
  };
  font: {
    size: {
      extrasmall: string;
      small: string;
      medium: string;
      large: string;
      extralarge: string;
    };
    family: string;
    weight: {
      light: string;
      regular: string;
      medium: string;
      bold: string;
    };
  };
  padding: {
    size: {
      extrasmall: string;
      small: string;
      medium: string;
      large: string;
      extralarge: string;
    };
  };
  avatar: {
    small: AvatarSize;
    medium: AvatarSize;
    large: AvatarSize;
    extralarge: AvatarSize;
  };
  border: {
    radius: string;
  };
  shadow: {
    regular: string;
    snackbar: string;
  };
};

export const theme: Theme = {
  color: {
    primary: {
      regular: 'var(--color-primary-regular)',
      hover: 'var(--color-primary-hover)',
      active: 'var(--color-primary-active)',
      focus: 'var(--color-primary-focus)',
      disabled: 'var(--color-primary-disabled)',
    },
    secondary: {
      regular: 'var(--color-secondary-regular)',
      hover: 'var(--color-secondary-hover)',
      active: 'var(--color-secondary-active)',
      focus: 'var(--color-secondary-focus)',
      disabled: 'var(--color-secondary-disabled)',
    },
    header: {
      regular: 'var(--color-header-regular)',
      hover: 'var(--color-header-hover)',
      active: 'var(--color-header-active)',
      focus: 'var(--color-header-focus)',
      disabled: 'var(--color-header-disabled)',
    },
    gray0: {
      regular: 'var(--color-gray0-regular)',
      hover: 'var(--color-gray0-hover)',
      active: 'var(--color-gray0-active)',
      focus: 'var(--color-gray0-focus)',
      disabled: 'var(--color-gray0-disabled)',
    },
    gray1: {
      regular: 'var(--color-gray1-regular)',
      hover: 'var(--color-gray1-hover)',
      active: 'var(--color-gray1-active)',
      focus: 'var(--color-gray1-focus)',
      disabled: 'var(--color-gray1-disabled)',
    },
    gray2: {
      regular: 'var(--color-gray2-regular)',
      hover: 'var(--color-gray2-hover)',
      active: 'var(--color-gray2-active)',
      focus: 'var(--color-gray2-focus)',
      disabled: 'var(--color-gray2-disabled)',
    },
    gray3: {
      regular: 'var(--color-gray3-regular)',
      hover: 'var(--color-gray3-hover)',
      active: 'var(--color-gray3-active)',
      focus: 'var(--color-gray3-focus)',
      disabled: 'var(--color-gray3-disabled)',
    },
    gray4: {
      regular: 'var(--color-gray4-regular)',
      hover: 'var(--color-gray4-hover)',
      active: 'var(--color-gray4-active)',
      focus: 'var(--color-gray4-focus)',
      disabled: 'var(--color-gray4-disabled)',
    },
    gray5: {
      regular: 'var(--color-gray5-regular)',
      hover: 'var(--color-gray5-hover)',
      active: 'var(--color-gray5-active)',
      focus: 'var(--color-gray5-focus)',
      disabled: 'var(--color-gray5-disabled)',
    },
    gray6: {
      regular: 'var(--color-gray6-regular)',
      hover: 'var(--color-gray6-hover)',
      active: 'var(--color-gray6-active)',
      focus: 'var(--color-gray6-focus)',
      disabled: 'var(--color-gray6-disabled)',
    },
    warning: {
      regular: 'var(--color-warning-regular)',
      hover: 'var(--color-warning-hover)',
      active: 'var(--color-warning-active)',
      focus: 'var(--color-warning-focus)',
      disabled: 'var(--color-warning-disabled)',
    },
    error: {
      regular: 'var(--color-error-regular)',
      hover: 'var(--color-error-hover)',
      active: 'var(--color-error-active)',
      focus: 'var(--color-error-focus)',
      disabled: 'var(--color-error-disabled)',
    },
    success: {
      regular: 'var(--color-success-regular)',
      hover: 'var(--color-success-hover)',
      active: 'var(--color-success-active)',
      focus: 'var(--color-success-focus)',
      disabled: 'var(--color-success-disabled)',
    },
    info: {
      regular: 'var(--color-info-regular)',
      hover: 'var(--color-info-hover)',
      active: 'var(--color-info-active)',
      focus: 'var(--color-info-focus)',
      disabled: 'var(--color-info-disabled)',
    },
    text: {
      regular: 'var(--color-text-regular)',
      hover: 'var(--color-text-hover)',
      active: 'var(--color-text-active)',
      focus: 'var(--color-text-focus)',
      disabled: 'var(--color-text-disabled)',
    },
    highlight: {
      regular: 'var(--color-highlight-regular)',
      hover: 'var(--color-highlight-hover)',
      active: 'var(--color-highlight-active)',
      focus: 'var(--color-highlight-focus)',
      disabled: 'var(--color-highlight-disabled)',
    },
    transparent: {
      regular: 'var(--color-transparent)',
      hover: 'var(--color-transparent-hover)',
      active: 'var(--color-transparent-active)',
      focus: 'var(--color-transparent-focus)',
      disabled: 'var(--color-transparent-disabled)',
    },
    black: 'var(--color-black)',
    white: 'var(--color-white)',
    successBanner: 'var(--color-successBanner)',
    warningBanner: 'var(--color-warningBanner)',
    infoBanner: 'var(--color-infoBanner)',
    errorBanner: 'var(--color-errorBanner)',
    currentColor: 'var(--color-currentColor)',
    avatar: {
      '1': 'var(--color-avatar-1)',
      '2': 'var(--color-avatar-2)',
      '3': 'var(--color-avatar-3)',
      '4': 'var(--color-avatar-4)',
      '5': 'var(--color-avatar-5)',
      '6': 'var(--color-avatar-6)',
      '7': 'var(--color-avatar-7)',
      '8': 'var(--color-avatar-8)',
      '9': 'var(--color-avatar-9)',
      '10': 'var(--color-avatar-10)',
      '11': 'var(--color-avatar-11)',
      '12': 'var(--color-avatar-12)',
      '13': 'var(--color-avatar-13)',
      '14': 'var(--color-avatar-14)',
      '15': 'var(--color-avatar-15)',
      '16': 'var(--color-avatar-16)',
      '17': 'var(--color-avatar-17)',
      '18': 'var(--color-avatar-18)',
      '19': 'var(--color-avatar-19)',
      '20': 'var(--color-avatar-20)',
      '21': 'var(--color-avatar-21)',
      '22': 'var(--color-avatar-22)',
      '23': 'var(--color-avatar-23)',
      '24': 'var(--color-avatar-24)',
      '25': 'var(--color-avatar-25)',
      '26': 'var(--color-avatar-26)',
      '27': 'var(--color-avatar-27)',
      '28': 'var(--color-avatar-28)',
      '29': 'var(--color-avatar-29)',
      '30': 'var(--color-avatar-30)',
      '31': 'var(--color-avatar-31)',
      '32': 'var(--color-avatar-32)',
      '33': 'var(--color-avatar-33)',
      '34': 'var(--color-avatar-34)',
      '35': 'var(--color-avatar-35)',
      '36': 'var(--color-avatar-36)',
      '37': 'var(--color-avatar-37)',
      '38': 'var(--color-avatar-38)',
      '39': 'var(--color-avatar-39)',
      '40': 'var(--color-avatar-40)',
      '41': 'var(--color-avatar-41)',
      '42': 'var(--color-avatar-42)',
      '43': 'var(--color-avatar-43)',
      '44': 'var(--color-avatar-44)',
      '45': 'var(--color-avatar-45)',
      '46': 'var(--color-avatar-46)',
      '47': 'var(--color-avatar-47)',
      '48': 'var(--color-avatar-48)',
      '49': 'var(--color-avatar-49)',
      '50': 'var(--color-avatar-50)',
    },
  },
  icon: {
    size: {
      small: 'var(--icon-size-small)',
      medium: 'var(--icon-size-medium)',
      large: 'var(--icon-size-large)',
    },
  },
  font: {
    size: {
      extrasmall: 'var(--font-size-extrasmall)',
      small: 'var(--font-size-small)',
      medium: 'var(--font-size-medium)',
      large: 'var(--font-size-large)',
      extralarge: 'var(--font-size-extralarge)',
    },
    family: 'var(--font-family)',
    weight: {
      light: 'var(--font-weight-light)',
      regular: 'var(--font-weight-regular)',
      medium: 'var(--font-weight-medium)',
      bold: 'var(--font-weight-bold)',
    },
  },
  padding: {
    size: {
      extrasmall: 'var(--padding-size-extrasmall)',
      small: 'var(--padding-size-small)',
      medium: 'var(--padding-size-medium)',
      large: 'var(--padding-size-large)',
      extralarge: 'var(--padding-size-extralarge)',
    },
  },
  avatar: {
    small: {
      diameter: 'var(--avatar-small-diameter)',
      font: 'var(--avatar-small-font)',
    },
    medium: {
      diameter: 'var(--avatar-medium-diameter)',
      font: 'var(--avatar-medium-font)',
    },
    large: {
      diameter: 'var(--avatar-large-diameter)',
      font: 'var(--avatar-large-font)',
    },
    extralarge: {
      diameter: 'var(--avatar-extralarge-diameter)',
      font: 'var(--avatar-extralarge-font)',
    },
  },
  border: {
    radius: 'var(--border-radius)',
  },
  shadow: {
    regular: 'var(--shadow-regular)',
    snackbar: 'var(--shadow-snackbar)',
  },
};
