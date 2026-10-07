<script setup lang="ts">
import VChart from 'vue-echarts'
import type { EChartsCoreOption } from 'echarts/core'
import type { ChartMode, ChartPosition, ChartThemePalete, GridPadding, IChartSeries } from '~/types/chart'

const {
  chartId = 'chart-radar-id',
  height = '350',
  width = 'auto',
  showLegend = true,
  mode = 'light',
  palette = 'palette1',
  series,
  colors,
  showDataLabels = false,
  categories,
  yaxisTickamount = 5,
  gridColors,
  yaxisMax,
  yaxisMin,
  markers = 0,
  strokeWidth = 2,
  opacity = 0.2,
  dark = false
} = defineProps<{
  chartId?: string
  height?: string
  width?: string
  labelunit?: string
  showLegend?: boolean
  legendUseSeriesColors?: boolean
  legendPosition?: ChartPosition
  mode?: ChartMode
  palette?: ChartThemePalete
  series: IChartSeries[]
  colors?: string[]
  showDataLabels?: boolean
  labelRotate?: number
  categories: string[]
  yaxisShow?: boolean
  yaxisTickamount?: number
  xaxisTickamount?: number
  gridPadding?: GridPadding
  yaxisMax?: number
  yaxisMin?: number
  markers?: number
  strokeWidth?: number
  gridColors?: string[]
  opacity?: number
  dark?: boolean
}>()

const { isDark } = useTheme()

const effectiveDark = computed(() => resolveEchartDark(dark, mode, isDark.value))
const resolvedColors = computed(() => resolveEchartColors(colors, palette))
const parsedHeight = computed(() => parseEchartSize(height, '350px'))
const parsedWidth = computed(() => parseEchartSize(width, '100%'))

const resolveMax = (): number => {
  if (typeof yaxisMax === 'number') {
    return yaxisMax
  }
  let max = 0
  for (const s of series) {
    for (const v of s.data) {
      if (typeof v === 'number' && v > max) {
        max = v
      }
    }
  }
  return max > 0 ? Math.ceil(max * 1.1) : 100
}

const buildOption = (darkMode: boolean): EChartsCoreOption => {
  const max = resolveMax()
  const splitColor = echartSplitLineColor(darkMode)
  const labelColor = echartAxisLabelColor(darkMode)
  const tooltipBase = echartTooltipBase(darkMode)
  return {
    backgroundColor: 'transparent',
    animationDuration: 800,
    color: resolvedColors.value,
    legend: buildEchartLegend('bottom', showLegend, darkMode),
    tooltip: {
      show: true,
      trigger: 'item',
      ...tooltipBase
    },
    radar: {
      indicator: categories.map((name) => ({ name, max, min: yaxisMin })),
      shape: 'polygon',
      splitNumber: yaxisTickamount > 0 ? yaxisTickamount : 5,
      axisName: { color: labelColor },
      splitLine: { lineStyle: { color: splitColor } },
      splitArea: {
        show: true,
        areaStyle: gridColors && gridColors.length > 0 ? { color: gridColors } : undefined
      },
      axisLine: { lineStyle: { color: splitColor } }
    },
    series: [
      {
        type: 'radar',
        data: series.map((s) => ({ name: s.name, value: [...s.data] })),
        symbolSize: markers,
        symbol: 'circle',
        lineStyle: { width: strokeWidth },
        areaStyle: { opacity },
        label: { show: showDataLabels, color: labelColor }
      }
    ]
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
