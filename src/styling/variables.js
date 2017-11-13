const color = {
  accent: {
    deepOrange: '#EB7422',
    lightOrange: '#F2A83F',
  },
  base: {
    darkGrey: '#212121',
    lightGrey: '#B1B1B1',
    white: '#FFFFFF',
    black: '#0b0b0b',
    light: '#f9f7f5',
  },
  custom: {
    smoothGrey: '#dad7d0',
    highlight: '#FFFF00',
  },
};

const fontSizeHTML = 16;
const px2rem = px => (px / fontSizeHTML) + 'rem';

export const font = {
  size: {
    html: fontSizeHTML+'px',
    xlarge: px2rem(19.2),
    large: px2rem(16),
    regular: px2rem(12.8),
    small: px2rem(11.2),
  },
  lineHeight: {
    large: '1.45em',
    regular: '1.2em',
  },
  color: {
    white: color.base.white,
    dark: color.base.darkGrey,
    light: color.base.lightGrey,
    accentDark: color.accent.deepOrange,
    accentLight: color.accent.lightOrange,
  },
  family: {
    logo: 'Century Gothic',
    prose: 'Lato, sans-serif',
    code: 'Hack, monospace',
  }
};

export const background = {
  main: color.base.white,
  dark: color.base.black,
  highlight: color.custom.highlight,
  light: color.base.light,
  lightGrey: color.base.lightGrey,
  accent: color.accent.deepOrange,
};

export const border = {
  light: color.base.lightGrey,
  smooth: color.custom.smoothGrey,
  accent: color.accent.deepOrange,
};

export const shadow = {
  dark: 'rgba(138, 128, 115, 0.8)',
  topbar: 'rgba(138, 128, 115, 0.14)',
  primaryButton: 'rgba(191, 76, 50, 0.48)',
};
