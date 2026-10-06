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

const option = ref<EChartsCoreOption>({})
const themeTimer = ref<ReturnType<typeof setTimeout> | undefined>()
const effectiveDark = computed(() => resolveEchartDark(dark, mode, isDark.value))
const resolvedColors = computed(() => resolveEchartColors(colors, palette))
const parsedHeight = computed(() => parseEchartSize(height, '350px'))
const parsedWidth = computed(() => (width === 'auto' ? '100%' : width))

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
        label: { show: showDataLabels },
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
  () => [series, categories, colors, palette, type, showLegend, legendPosition, showDataLabels, strokeWidth],
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
