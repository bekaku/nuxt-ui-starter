<script setup lang="ts">
import VChart from 'vue-echarts'
import type { EChartsCoreOption } from 'echarts/core'
import type { ChartMode, ChartPosition, ChartThemePalete, IChartSeries, Strokestyle } from '~/types/chart'

const {
  chartId = 'chartId',
  height = 'auto',
  width = 'auto',
  showLegend = true,
  legendUseSeriesColors = true,
  legendPosition = 'bottom',
  type = 'area',
  mode = 'light',
  palette = 'palette1',
  series = [],
  colors = [],
  dark = false,
  showDataLabels = false,
  labelRotate = 0,
  yaxisShow = true,
  yaxisTickamount = 5,
  xaxisTickamount = 0,
  xaxisDecimalsInFloat = 0,
  yaxisDecimalsInFloat = 0,
  categories,
  strokestyle = 'smooth',
  strokeWidth = 1,
  sparkline = false,
  annotationsYaxis = [],
  annotationsXaxis = [],
  minYVal = 0,
  maxYVal,
  showToolbar = false,
  zoom = false,
  horizontal = false,
  opacity
} = defineProps<{
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
  annotationsYaxis?: Array<Record<string, unknown>>
  annotationsXaxis?: Array<Record<string, unknown>>
  minYVal?: number
  maxYVal?: number
  showToolbar?: boolean
  zoom?: boolean
  horizontal?: boolean
  opacity?: number
}>()

const { isDark } = useTheme()

const option = ref<EChartsCoreOption>({})
const themeTimer = ref<ReturnType<typeof setTimeout> | undefined>()
const isHorizontal = computed(() => horizontal && type === 'bar')
const effectiveDark = computed(() => resolveEchartDark(dark, mode, isDark.value))
const resolvedColors = computed(() => resolveEchartColors(colors, palette))
const parsedHeight = computed(() => parseEchartSize(height, '350px'))
const parsedWidth = computed(() => (width === 'auto' ? '100%' : width))
const categoryInterval = computed(() => {
  if (xaxisTickamount <= 0 || categories.length === 0) {
    return 'auto' as const
  }
  return Math.max(0, Math.ceil(categories.length / xaxisTickamount) - 1)
})

const toFixedNumber = (value: number | string, digits: number): string => {
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num)) {
    return String(value)
  }
  return num.toFixed(digits)
}

const buildMarkLineData = () => {
  const data: Array<Record<string, unknown>> = []
  for (const item of annotationsYaxis) {
    const y = (item as { y?: number }).y
    if (typeof y === 'number') {
      const label = (item as { label?: { text?: string } }).label
      data.push({ yAxis: y, label: { formatter: label?.text ?? String(y) } })
    }
  }
  for (const item of annotationsXaxis) {
    const x = (item as { x?: number | string }).x
    if (typeof x === 'number' || typeof x === 'string') {
      const label = (item as { label?: { text?: string } }).label
      data.push({ xAxis: x, label: { formatter: label?.text ?? String(x) } })
    }
  }
  return data
}

const buildSeriesOption = (darkMode: boolean): EChartsCoreOption['series'] => {
  const markLineData = buildMarkLineData()
  return (series ?? []).map((s, index) => {
    const base = {
      name: s.name,
      data: [...s.data]
    }
    if (type === 'bar') {
      return {
        ...base,
        type: 'bar' as const,
        barMaxWidth: 42,
        itemStyle: { borderRadius: 3, opacity: opacity ?? 1 },
        label: { show: showDataLabels, position: isHorizontal.value ? 'right' : 'top' as const, color: echartAxisLabelColor(darkMode) },
        markLine: markLineData.length > 0 ? { data: markLineData, symbol: 'none' } : undefined
      }
    }
    const color = resolvedColors.value?.[index] ?? '#008FFB'
    return {
      ...base,
      type: 'line' as const,
      smooth: strokestyle === 'smooth',
      step: strokestyle === 'stepline' ? ('middle' as const) : false,
      showSymbol: false,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: strokeWidth },
      areaStyle: type === 'area'
        ? {
            opacity: opacity ?? 0.25,
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color },
                { offset: 1, color: 'transparent' }
              ]
            }
          }
        : undefined,
      label: { show: showDataLabels, position: 'top' as const, color: echartAxisLabelColor(darkMode) },
      markLine: markLineData.length > 0 ? { data: markLineData, symbol: 'none' } : undefined
    }
  })
}

const buildOption = (darkMode: boolean): EChartsCoreOption => {
  const splitColor = echartSplitLineColor(darkMode)
  const labelColor = echartAxisLabelColor(darkMode)
  const tooltipBase = echartTooltipBase(darkMode)
  const categoryAxis = {
    type: 'category' as const,
    data: [...categories],
    show: !sparkline,
    axisLine: { lineStyle: { color: splitColor } },
    axisTick: { show: false },
    axisLabel: {
      color: labelColor,
      rotate: labelRotate,
      hideOverlap: true,
      interval: categoryInterval.value,
      formatter: (value: string) => xaxisDecimalsInFloat > 0 ? toFixedNumber(value, xaxisDecimalsInFloat) : value
    }
  }
  const valueAxis = {
    type: 'value' as const,
    show: sparkline ? false : yaxisShow,
    min: minYVal,
    max: maxYVal,
    splitNumber: yaxisTickamount > 0 ? yaxisTickamount : 5,
    splitLine: { lineStyle: { color: splitColor } },
    axisLabel: {
      color: labelColor,
      formatter: (value: number) => yaxisDecimalsInFloat > 0 ? toFixedNumber(value, yaxisDecimalsInFloat) : String(value)
    }
  }

  return {
    backgroundColor: 'transparent',
    animationDuration: 800,
    color: resolvedColors.value,
    legend: sparkline ? { show: false } : buildEchartLegend(legendPosition, showLegend, darkMode),
    grid: { left: 8, right: 12, top: showLegend && !sparkline ? 32 : 12, bottom: showLegend && !sparkline ? 32 : 12, containLabel: true },
    tooltip: {
      show: true,
      trigger: 'axis',
      axisPointer: { type: type === 'bar' ? 'shadow' : 'line' },
      valueFormatter: (value: unknown) => (typeof value === 'number' || typeof value === 'string' ? String(value) : ''),
      ...tooltipBase
    },
    xAxis: isHorizontal.value ? valueAxis : categoryAxis,
    yAxis: isHorizontal.value ? categoryAxis : valueAxis,
    dataZoom: zoom && !sparkline ? [{ type: 'inside' }, { type: 'slider', height: 20 }] : undefined,
    toolbox: showToolbar && !sparkline
      ? { show: true, feature: { saveAsImage: { show: true }, dataZoom: { show: true }, restore: { show: true } } }
      : { show: false },
    series: buildSeriesOption(darkMode)
  } as EChartsCoreOption
}

const refresh = (darkMode: boolean) => {
  option.value = buildOption(darkMode)
}

refresh(effectiveDark.value)

onUnmounted(() => {
  if (themeTimer.value) {
    clearTimeout(themeTimer.value)
    themeTimer.value = undefined
  }
})

watch(effectiveDark, (darkMode) => {
  if (themeTimer.value) {
    clearTimeout(themeTimer.value)
  }
  themeTimer.value = setTimeout(() => {
    refresh(darkMode)
  }, 50)
})

watch(
  () => [series, categories, colors, palette, type, strokestyle, strokeWidth, horizontal, sparkline, showLegend, legendUseSeriesColors, legendPosition, showDataLabels, labelRotate, yaxisShow, yaxisTickamount, xaxisTickamount, minYVal, maxYVal, showToolbar, zoom, opacity],
  () => {
    refresh(effectiveDark.value)
  },
  { deep: true }
)
</script>
<template>
  <VChart
    :id="chartId"
    v-bind="$attrs"
    :option="option"
    :update-options="{ replaceMerge: ['series'] }"
    autoresize
    :style="{ height: parsedHeight, width: parsedWidth }"
  />
</template>
