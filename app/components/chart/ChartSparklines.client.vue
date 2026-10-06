<script setup lang="ts">
import VChart from 'vue-echarts'
import type { EChartsCoreOption } from 'echarts/core'
import type { ChartMode, ChartThemePalete, GridPadding, IChartSeries, Strokestyle } from '~/types/chart'

const {
  chartId = 'chart-radar-id',
  height = '160',
  width = 'auto',
  mode = 'light',
  palette = 'palette1',
  series,
  colors,
  categories,
  strokeWidth = 1.5,
  opacity = 0.3,
  tooltipEnable = true,
  type = 'area',
  strokestyle = 'straight',
  dark = false
} = defineProps<{
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
}>()

const { isDark } = useTheme()

const option = ref<EChartsCoreOption>({})
const themeTimer = ref<ReturnType<typeof setTimeout> | undefined>()
const effectiveDark = computed(() => resolveEchartDark(dark, mode, isDark.value))
const resolvedColors = computed(() => resolveEchartColors(colors, palette))
const parsedHeight = computed(() => parseEchartSize(height, '120px'))
const parsedWidth = computed(() => (width === 'auto' ? '100%' : width))

const buildOption = (darkMode: boolean): EChartsCoreOption => {
  const tooltipBase = echartTooltipBase(darkMode)
  const pointCount = Math.max(categories.length, ...series.map((item) => item.data.length))
  const axisCategories = Array.from(
    { length: pointCount },
    (_, index) => categories[index] ?? String(index + 1)
  )

  return {
    backgroundColor: 'transparent',
    animationDuration: 800,
    color: resolvedColors.value,
    grid: { left: 2, right: 2, top: 4, bottom: 2 },
    tooltip: {
      show: tooltipEnable,
      trigger: 'axis',
      axisPointer: { type: type === 'bar' ? 'shadow' : 'line' },
      formatter: (params: unknown) => {
        const list = Array.isArray(params) ? params : [params]
        const first = list[0] as { dataIndex?: number; seriesName?: string; value?: number | string } | undefined
        const dataIndex = first?.dataIndex ?? 0
        const label = categories[dataIndex] ?? '-'
        const value = first?.value ?? ''
        return `${label}: ${String(value)}`
      },
      ...tooltipBase
    },
    xAxis: {
      type: 'category',
      show: false,
      data: axisCategories,
      boundaryGap: type === 'bar'
    },
    yAxis: { type: 'value', show: false, min: 0 },
    series: series.map((s, index) => {
      if (type === 'bar') {
        return {
          name: s.name,
          type: 'bar' as const,
          data: [...s.data],
          barMaxWidth: 8,
          itemStyle: { borderRadius: 2, opacity: 1 }
        }
      }
      return {
        name: s.name,
        type: 'line' as const,
        data: [...s.data],
        smooth: strokestyle === 'smooth',
        step: strokestyle === 'stepline' ? ('middle' as const) : false,
        showSymbol: false,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { width: strokeWidth },
        areaStyle: type === 'area'
          ? {
              opacity,
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: resolvedColors.value?.[index] ?? '#008FFB' },
                  { offset: 1, color: 'transparent' }
                ]
              }
            }
          : undefined
      }
    })
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
  () => [series, categories, colors, palette, strokeWidth, strokestyle, opacity, tooltipEnable, type],
  () => {
    refresh(effectiveDark.value)
  },
  { deep: true }
)
</script>
<template>
  <ClientOnly>
    <VChart
      :id="chartId"
      v-bind="$attrs"
      :option="option"
      :update-options="{ replaceMerge: ['series'] }"
      autoresize
      :style="{ height: parsedHeight, width: parsedWidth }"
    />
  </ClientOnly>
</template>
