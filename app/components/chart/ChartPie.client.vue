<script lang="ts" setup>
import VChart from 'vue-echarts'
import type { EChartsCoreOption } from 'echarts/core'
import type { ChartMode, ChartPosition, ChartThemePalete, Strokestyle } from '~/types/chart'

const {
  chartId = 'chart-pie-id',
  height = 'auto',
  width = 'auto',
  showLegend = true,
  legendPosition = 'bottom',
  type = 'pie',
  mode = 'light',
  palette = 'palette1',
  series,
  colors,
  showDataLabels = true,
  categories,
  strokeWidth = 1,
  dark = false
} = defineProps<{
  chartId?: string
  height?: string
  width?: string
  labelunit?: string
  showLegend?: boolean
  legendUseSeriesColors?: boolean
  legendPosition?: ChartPosition
  type?: 'pie' | 'donut'
  mode?: ChartMode
  palette?: ChartThemePalete
  series: number[]
  colors?: string[]
  dark?: boolean
  showDataLabels?: boolean
  labelRotate?: number
  categories: string[]
  strokestyle?: Strokestyle
  strokeWidth?: number
}>()

const { isDark } = useTheme()

const effectiveDark = computed(() => resolveEchartDark(dark, mode, isDark.value))
const resolvedColors = computed(() => resolveEchartColors(colors, palette))
const parsedHeight = computed(() => parseEchartSize(height, '350px'))
const parsedWidth = computed(() => parseEchartSize(width, '100%'))

const buildOption = (darkMode: boolean): EChartsCoreOption => {
  const tooltipBase = echartTooltipBase(darkMode)
  const data = series.map((value, index) => ({
    value,
    name: categories[index] ?? `S${index + 1}`
  }))
  return {
    backgroundColor: 'transparent',
    animationDuration: 800,
    color: resolvedColors.value,
    legend: buildEchartLegend(legendPosition, showLegend, darkMode),
    tooltip: {
      show: true,
      trigger: 'item',
      ...tooltipBase
    },
    series: [
      {
        type: 'pie',
        data,
        radius: type === 'donut' ? ['42%', '70%'] : '65%',
        center: ['50%', showLegend && (legendPosition === 'top' || legendPosition === 'bottom') ? '46%' : '50%'],
        label: { show: showDataLabels, color: echartAxisLabelColor(darkMode) },
        labelLine: { show: showDataLabels },
        itemStyle: {
          borderWidth: strokeWidth,
          borderColor: darkMode ? '#18181b' : '#ffffff'
        },
        emphasis: { scale: true, scaleSize: 4 }
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
