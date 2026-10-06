import type { ChartPosition, ChartThemePalete } from '~/types/chart'

export const ECHART_GRID_BORDER = {
  dark: '#3f3f46',
  light: '#e4e4e7'
} as const

export const ECHART_TEXT_COLOR = '#52525b'

const ECHART_PALETTES: Record<ChartThemePalete, string[]> = {
  palette1: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a', '#D10CE8'],
  palette2: ['#3f51b5', '#03a9f4', '#4caf50', '#f9ce1d', '#FF9800', '#33b2df', '#546E7A', '#d4526e'],
  palette3: ['#33b2df', '#546E7A', '#d4526e', '#13d8aa', '#A5978B', '#f9ce1d', '#FF9800', '#775DD0'],
  palette4: ['#4caf50', '#f9ce1d', '#FF9800', '#33b2df', '#546E7A', '#d4526e', '#13d8aa', '#A5978B'],
  palette5: ['#f9ce1d', '#FF9800', '#33b2df', '#546E7A', '#d4526e', '#13d8aa', '#A5978B', '#4caf50'],
  palette6: ['#FF9800', '#33b2df', '#546E7A', '#d4526e', '#13d8aa', '#A5978B', '#f9ce1d', '#4caf50'],
  palette7: ['#775DD0', '#546E7A', '#26a69a', '#D10CE8', '#008FFB', '#00E396', '#FEB019', '#FF4560'],
  palette8: ['#26a69a', '#D10CE8', '#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A'],
  palette9: ['#D10CE8', '#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a'],
  palette10: ['#546E7A', '#26a69a', '#D10CE8', '#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0']
}

export const resolveEchartColors = (
  colors?: string[] | null,
  palette?: ChartThemePalete
): string[] | undefined => {
  if (colors && colors.length > 0) {
    return [...colors]
  }
  if (palette && ECHART_PALETTES[palette]) {
    return [...ECHART_PALETTES[palette]]
  }
  return undefined
}

export const resolveEchartDark = (
  dark = false,
  mode: 'light' | 'dark' = 'light',
  isDark = false
): boolean => {
  return dark || mode === 'dark' || isDark
}

export const parseEchartSize = (value?: string, fallback = '350px'): string => {
  if (!value || value === 'auto') {
    return fallback
  }
  if (/^\d+$/.test(value)) {
    return `${value}px`
  }
  return value
}

export const buildEchartLegend = (position: ChartPosition = 'bottom', show = true, darkMode = false) => {
  const textColor = darkMode ? '#e4e4e7' : ECHART_TEXT_COLOR
  if (!show) {
    return { show: false }
  }
  switch (position) {
    case 'top':
      return { show: true, top: 0, left: 'center', orient: 'horizontal' as const, textStyle: { color: textColor } }
    case 'left':
      return { show: true, left: 0, top: 'middle', orient: 'vertical' as const, textStyle: { color: textColor } }
    case 'right':
      return { show: true, right: 0, top: 'middle', orient: 'vertical' as const, textStyle: { color: textColor } }
    case 'bottom':
    default:
      return { show: true, bottom: 0, left: 'center', orient: 'horizontal' as const, textStyle: { color: textColor } }
  }
}

export const echartAxisLabelColor = (darkMode: boolean): string => {
  return darkMode ? '#d4d4d8' : '#71717a'
}

export const echartSplitLineColor = (darkMode: boolean): string => {
  return darkMode ? ECHART_GRID_BORDER.dark : ECHART_GRID_BORDER.light
}

export const echartTooltipBase = (darkMode: boolean) => {
  return {
    backgroundColor: darkMode ? '#27272a' : '#ffffff',
    borderColor: darkMode ? '#3f3f46' : '#e4e4e7',
    textStyle: { color: darkMode ? '#fafafa' : '#18181b' }
  }
}
