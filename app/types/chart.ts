export type PieChartType =
  | 'pie'
  | 'donut'
  | 'bar'
  | 'area'
  | 'line'
  | 'radar'
  | 'radialBar';
export type ChartMode = 'light' | 'dark';
export type Strokestyle = 'smooth' | 'straight' | 'stepline';
export type ChartPosition = 'top' | 'bottom' | 'left' | 'right';
export type ChartThemePalete =
  | 'palette1'
  | 'palette2'
  | 'palette3'
  | 'palette4'
  | 'palette5'
  | 'palette6'
  | 'palette7'
  | 'palette8'
  | 'palette9'
  | 'palette10';
export interface IChartSeries {
  name: string
  data: number[]
  type?: string | null
  year?: string | null
  group?: string | null
}
export interface ISeriresCategories {
  series: IChartSeries[]
  categories: string[]
  colors?: string[] | undefined | null
  max?: number | undefined
}
export interface ISimpleChartSeries {
  series: number[]
  categories: string[]
  colors?: string[]
}
export interface GridPadding {
  top: number
  right: number
  bottom: number
  left: number
}
export interface SparkLineChartProps {
  chartId?: string
  height?: string
  width?: string
  labelunit?: string
  mode?: ChartMode
  palette?: ChartThemePalete
  series: IChartSeries[]
  colors?: string[]
  tooltipEnable?: boolean
  categories: string[]
  gridPadding?: GridPadding
  strokeWidth?: number
  strokestyle?: Strokestyle
  opacity?: number
  dark?: boolean
  type?: 'area' | 'line' | 'bar'
}
export interface AreaChartProps {
  chartId?: string
  height?: string
  width?: string
  labelunit?: string
  showLegend?: boolean
  legendUseSeriesColors?: boolean
  legendPosition?: ChartPosition
  type?: 'area' | 'bar' | 'line'
  mode?: ChartMode
  palette?: ChartThemePalete
  series?: IChartSeries[]
  colors?: string[]
  dark?: boolean
  showDataLabels?: boolean
  labelRotate?: number
  yaxisShow?: boolean
  yaxisTickamount?: number
  xaxisTickamount?: number
  xaxisDecimalsInFloat?: number
  yaxisDecimalsInFloat?: number
  categories: string[]
  strokestyle?: Strokestyle
  strokeWidth?: number
  sparkline?: boolean
  annotationsYaxis?: any[]
  annotationsXaxis?: any[]
  minYVal?: number
  maxYVal?: number
  showToolbar?: boolean
  zoom?: boolean
  horizontal?: boolean
  opacity?: number
}
