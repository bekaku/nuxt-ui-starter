<script setup lang="ts">
import VChart from 'vue-echarts'
import type { EChartsCoreOption } from 'echarts/core'
import type { ChartMode, ChartPosition, ChartThemePalete, GridPadding } from '~/types/chart'

const {
  chartId = 'chart-radial-id',
  height = 'auto',
  width = '100%',
  mode = 'light',
  palette = 'palette1',
  series,
  colors,
  categories,
  showLegend = true,
  legendUseSeriesColors = true,
  legendFloating = false,
  legendOffsetX = 0,
  legendOffsetY = 0,
  legendPosition = 'bottom',
  showDataLabels = true,
  dataLabelsSize = '14px',
  dataValueSize = '18px',
  showDataLabelsName = true,
  showDataLabelsValue = true,
  dataLabelsValueOfsetY = 0,
  startAngle = 0,
  endAngle = 360,
  stokeLineCap = 'round',
  trackBackgroud = '#f0f0f0',
  trackBackgroudDark = '#383a42',
  valUnit,
  dark = false
} = defineProps<{
  chartId?: string
  height?: string
  width?: string
  showLegend?: boolean
  legendUseSeriesColors?: boolean
  legendOffsetX?: number
  legendOffsetY?: number
  legendFloating?: boolean
  showDataLabels?: boolean
  showDataLabelsName?: boolean
  showDataLabelsValue?: boolean
  dataLabelsSize?: string
  dataValueSize?: string
  dataLabelsValueOfsetY?: number
  legendPosition?: ChartPosition
  labelunit?: string
  stokeLineCap?: 'round' | 'square' | 'butt'
  fillType?: 'fill' | 'gradient'
  endAngle?: number
  startAngle?: number
  mode?: ChartMode
  palette?: ChartThemePalete
  series: number[]
  colors?: string[]
  categories: string[]
  gridPadding?: GridPadding
  semi?: boolean
  hollowBg?: boolean
  hollowSize?: string
  valUnit?: string
  trackBackgroud?: string
  trackBackgroudDark?: string
  dark?: boolean
}>()

const { isDark } = useTheme()

const effectiveDark = computed(() => resolveEchartDark(dark, mode, isDark.value))
const resolvedColors = computed(() => resolveEchartColors(colors, palette))
const parsedHeight = computed(() => parseEchartSize(height, '300px'))
const parsedWidth = computed(() => parseEchartSize(width, '100%'))

const toFontSize = (value: string, fallback: number): number => {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

const buildOption = (darkMode: boolean): EChartsCoreOption => {
  const tooltipBase = echartTooltipBase(darkMode)
  const paletteColors = resolvedColors.value
  const trackColor = darkMode ? trackBackgroudDark : trackBackgroud
  const isSingle = series.length <= 1
  const hasSideLegend = showLegend && !isSingle && (legendPosition === 'left' || legendPosition === 'right')
  const gaugeCenterX = hasSideLegend ? (legendPosition === 'right' ? '38%' : '62%') : '50%'
  const gaugeRadiusScale = hasSideLegend ? 0.78 : 1
  const maxValue = Math.max(100, ...series)
  const ringWidth = series.length > 1 ? Math.max(8, Math.min(16, Math.floor(72 / series.length))) : 16

  const apexEndAngle = Math.min(endAngle, startAngle + 360)

  const gaugeSeries = series.map((value, index) => {
    const ringIndex = index
    const outer = (92 - ringIndex * (ringWidth + 6)) * gaugeRadiusScale
    const color = paletteColors?.[index % paletteColors.length]
    return {
      type: 'gauge' as const,
      name: categories[index] ?? `S${index + 1}`,
      startAngle: apexAngleToEchart(startAngle),
      endAngle: apexAngleToEchart(apexEndAngle),
      min: 0,
      max: maxValue,
      radius: `${Math.max(28, outer)}%`,
      center: [gaugeCenterX, '55%'],
      progress: {
        show: true,
        width: ringWidth,
        roundCap: stokeLineCap === 'round',
        itemStyle: color ? { color } : undefined
      },
      axisLine: {
        roundCap: stokeLineCap === 'round',
        lineStyle: { width: ringWidth, color: [[1, trackColor]] }
      },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      pointer: { show: false },
      anchor: { show: false },
      title: {
        show: showDataLabels && showDataLabelsName && isSingle,
        fontSize: toFontSize(dataLabelsSize, 14),
        color: echartAxisLabelColor(darkMode),
        offsetCenter: [0, '-30%']
      },
      detail: {
        show: showDataLabels && showDataLabelsValue && isSingle,
        fontSize: toFontSize(dataValueSize, 18),
        fontWeight: 'bold' as const,
        color: darkMode ? '#fafafa' : '#18181b',
        offsetCenter: [0, dataLabelsValueOfsetY ? `${dataLabelsValueOfsetY}%` : '0%'],
        formatter: `{value}${valUnit ?? ''}`
      },
      data: [{ value, name: categories[index] ?? `S${index + 1}` }]
    }
  })

  return {
    backgroundColor: 'transparent',
    animationDuration: 800,
    color: paletteColors,
    legend: buildEchartLegend(legendPosition, showLegend && series.length > 1, darkMode),
    tooltip: {
      show: true,
      trigger: 'item',
      formatter: (params: { name?: string; value?: number | string }) => {
        const label = params.name ?? ''
        const value = params.value ?? ''
        return `${label}: ${value}${valUnit ?? ''}`
      },
      ...tooltipBase
    },
    series: gaugeSeries
  }
}

const option = computed(() => buildOption(effectiveDark.value))
</script>
<template>
  <VChart
    :id="chartId"
    :option="option"
    :update-options="{ replaceMerge: ['series'] }"
    autoresize
    :style="{ height: parsedHeight, width: parsedWidth }"
  />
</template>
