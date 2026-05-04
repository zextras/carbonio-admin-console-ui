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
      light: number;
      regular: number;
      medium: number;
      bold: number;
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
      regular: '#2b73d2',
      hover: '#225ca8',
      active: '#1e5092',
      focus: '#225ca8',
      disabled: '#aac8ee',
    },
    secondary: {
      regular: '#828282',
      hover: '#696969',
      active: '#5c5c5c',
      focus: '#696969',
      disabled: '#cccccc',
    },
    header: {
      regular: '#cfd5dc',
      hover: '#b1bbc6',
      active: '#a3aebc',
      focus: '#b1bbc6',
      disabled: '#cfd5dc',
    },
    gray0: {
      regular: '#414141',
      hover: '#282828',
      active: '#1b1b1b',
      focus: '#282828',
      disabled: '#cccccc',
    },
    gray1: {
      regular: '#828282',
      hover: '#696969',
      active: '#5c5c5c',
      focus: '#696969',
      disabled: '#cccccc',
    },
    gray2: {
      regular: '#cfd5dc',
      hover: '#b1bbc6',
      active: '#a3aebc',
      focus: '#b1bbc6',
      disabled: '#cfd5dc',
    },
    gray3: {
      regular: '#e6e9ed',
      hover: '#c8cfd8',
      active: '#bac2cd',
      focus: '#c8cfd8',
      disabled: '#e6e9ed',
    },
    gray4: {
      regular: '#eeeff3',
      hover: '#d0d3de',
      active: '#c1c5d3',
      focus: '#d0d3de',
      disabled: '#eeeff3',
    },
    gray5: {
      regular: '#f5f6f8',
      hover: '#d7dbe3',
      active: '#c8ced9',
      focus: '#d7dbe3',
      disabled: '#f5f6f8',
    },
    gray6: {
      regular: '#ffffff',
      hover: '#e6e6e6',
      active: '#d9d9d9',
      focus: '#e6e6e6',
      disabled: '#ffffff',
    },
    warning: {
      regular: '#ffc107',
      hover: '#d39e00',
      active: '#ba8b00',
      focus: '#d39e00',
      disabled: '#ffe699',
    },
    error: {
      regular: '#d74942',
      hover: '#be3028',
      active: '#a92a24',
      focus: '#be3028',
      disabled: '#edaeab',
    },
    success: {
      regular: '#8bc34a',
      hover: '#71a436',
      active: '#639030',
      focus: '#71a436',
      disabled: '#cee6b2',
    },
    info: {
      regular: '#2196d3',
      hover: '#1a75a7',
      active: '#176691',
      focus: '#1a75a7',
      disabled: '#a7d7f1',
    },
    text: {
      regular: '#333333',
      hover: '#1a1a1a',
      active: '#0d0d0d',
      focus: '#1a1a1a',
      disabled: '#cccccc',
    },
    highlight: {
      regular: '#d5e3f6',
      hover: '#abc6ed',
      active: '#96b8e9',
      focus: '#abc6ed',
      disabled: '#d5e3f6',
    },
    transparent: {
      regular: 'rgba(0, 0, 0, 0)',
      hover: 'rgba(0, 0, 0, 0.05)',
      active: 'rgba(0, 0, 0, 0.1)',
      focus: 'rgba(0, 0, 0, 0.05)',
      disabled: 'rgba(0, 0, 0, 0)',
    },
    black: '#000000',
    white: '#ffffff',
    successBanner: '#e6f2d8',
    warningBanner: '#fff7de',
    infoBanner: '#d3ebf8',
    errorBanner: '#f6d6d5',
    currentColor: 'currentColor',
    avatar: {
      '1': '#ef9a9a',
      '2': '#f48fb1',
      '3': '#ce93d8',
      '4': '#b39ddb',
      '5': '#9fa8da',
      '6': '#90caf9',
      '7': '#81d4fa',
      '8': '#80deea',
      '9': '#80cbc4',
      '10': '#a5d6a7',
      '11': '#c5e1a5',
      '12': '#e6ee9c',
      '13': '#ffe082',
      '14': '#ffcc80',
      '15': '#ffab91',
      '16': '#bcaaa4',
      '17': '#e57373',
      '18': '#f06292',
      '19': '#ba68c8',
      '20': '#9575cd',
      '21': '#7986cb',
      '22': '#64b5f6',
      '23': '#4fc3f7',
      '24': '#4dd0e1',
      '25': '#4db6ac',
      '26': '#81c784',
      '27': '#aed581',
      '28': '#dce775',
      '29': '#ffd54f',
      '30': '#ffb74d',
      '31': '#ff8a65',
      '32': '#a1887f',
      '33': '#0097a7',
      '34': '#ef5350',
      '35': '#ec407a',
      '36': '#ab47bc',
      '37': '#7e57c2',
      '38': '#5c6bc0',
      '39': '#42a5f5',
      '40': '#29b6f6',
      '41': '#26c6da',
      '42': '#26a69a',
      '43': '#66bb6a',
      '44': '#9ccc65',
      '45': '#d4e157',
      '46': '#ffca28',
      '47': '#ffa726',
      '48': '#ff7043',
      '49': '#8d6e63',
      '50': '#0288d1',
    },
  },
  icon: {
    size: {
      small: '0.75rem',
      medium: '1rem',
      large: '1.5rem',
    },
  },
  font: {
    size: {
      extrasmall: '0.75rem',
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem',
      extralarge: '1.25rem',
    },
    family: "'Roboto', sans-serif",
    weight: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700,
    },
  },
  padding: {
    size: {
      extrasmall: '0.25rem',
      small: '0.5rem',
      medium: '0.75rem',
      large: '1rem',
      extralarge: '1.5rem',
    },
  },
  avatar: {
    small: {
      diameter: '1rem',
      font: '0.3125rem',
    },
    medium: {
      diameter: '2rem',
      font: '0.75rem',
    },
    large: {
      diameter: '3rem',
      font: '1.125rem',
    },
    extralarge: {
      diameter: '4rem',
      font: '1.75rem',
    },
  },
  border: {
    radius: '0.125rem',
  },
  shadow: {
    regular: '0 0 0.25rem 0 rgba(166, 166, 166, 0.5)',
    snackbar: '-2px 2px 5px 0 rgba(0, 0, 0, 0.25)',
  },
};
