<script setup lang="ts">
import type { FileManager, ImageDto } from "~/types/models";

const props = defineProps<{
  showDeleteImage?: boolean;
  fetch?: boolean;
  showArrow?: boolean;
  files?: FileManager[];
  images?: ImageDto[];
  selectedIndex?: number;
  allowKeyboard?: boolean;
  height?: string;
  width?: string;
  dark?: boolean;
  closeable?: boolean;
  showThumbnails?: boolean;
}>();

const emit = defineEmits(["close"]);

const items = ref<any[]>([]);
const carousel = useTemplateRef("carousel");
const activeIndex = ref(0);

onMounted(async () => {
  await setList();
  if (props.selectedIndex) {
    select(props.selectedIndex);
  }
});

const setList = async () => {
  if (props.files && props.files.length > 0) {
    for (const f of props.files) {
      if (props.fetch) {
        // const src = await fetchImage(f.filePath)
        // if (src) items.value.push(src)
      } else {
        items.value.push(f.filePath);
      }
    }
  } else if (props.images && props.images.length > 0) {
    for (const img of props.images) {
      if (props.fetch) {
        // const src = await fetchImage(img.image)
        // if (src) items.value.push(src)
      } else {
        items.value.push(img.image);
      }
    }
  }

  return new Promise((resolve) => {
    resolve(true);
  });
};

function onClickPrev() {
  if (activeIndex.value === 0) return;
  activeIndex.value--;
  select(activeIndex.value);
}

function onClickNext() {
  if (activeIndex.value === items.value.length - 1) return;
  activeIndex.value++;
  select(activeIndex.value);
}

function onSelect(index: number) {
  activeIndex.value = index;
}

function select(index: number) {
  activeIndex.value = index;
  carousel.value?.emblaApi?.scrollTo(index);
}

// รองรับการกดปุ่มซ้าย-ขวา และ ESC บนคีย์บอร์ด
onMounted(() => {
  if (props.allowKeyboard) {
    window.addEventListener("keydown", handleKeydown);
  }
});

onBeforeUnmount(() => {
  if (props.allowKeyboard) {
    window.removeEventListener("keydown", handleKeydown);
  }
});

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "ArrowRight") onClickNext();
  if (e.key === "ArrowLeft") onClickPrev();
  if (e.key === "Escape" && props.closeable) emit("close");
};
</script>
<template>
  <div
    class="flex flex-col w-full h-full overflow-hidden bg-gray-50/50 dark:bg-gray-900/30 rounded-md"
  >
    <div
      class="flex items-center justify-between px-4 py-3 shrink-0 border-b border-gray-200 dark:border-gray-800"
    >
      <div class="text-sm font-medium w-24 text-gray-700 dark:text-gray-300">
        Photo {{ activeIndex + 1 }}/{{ items.length }}
      </div>

      <div
        class="flex items-center justify-center gap-4 text-gray-500 dark:text-gray-400"
      >
        <button
          class="hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none"
        >
          <Icon name="lucide:plus" class="w-5 h-5" />
        </button>
        <button
          class="hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none"
        >
          <Icon name="lucide:minus" class="w-5 h-5" />
        </button>
        <button
          class="hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none disabled:opacity-30 disabled:hover:text-gray-500"
          :disabled="activeIndex === 0"
          @click="onClickPrev"
        >
          <Icon name="lucide:arrow-left" class="w-5 h-5" />
        </button>
        <button
          class="hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none disabled:opacity-30 disabled:hover:text-gray-500"
          :disabled="activeIndex === items.length - 1"
          @click="onClickNext"
        >
          <Icon name="lucide:arrow-right" class="w-5 h-5" />
        </button>
      </div>

      <div
        class="flex items-center justify-end w-24 text-gray-500 dark:text-gray-400"
      >
        <button
          class="hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none"
        >
          <Icon name="lucide:more-horizontal" class="w-5 h-5" />
        </button>
      </div>
    </div>
    <div class="flex flex-col w-full h-full">
      <div class="flex-1 min-h-0 w-full p-2">
        <UCarousel
          ref="carousel"
          v-slot="{ item }"
          :items="items"
          class="w-full h-full"
          :ui="{
            root: 'w-full h-full',
            viewport: 'h-full',
            container: 'h-full min-h-0',
            item: 'basis-full h-full min-h-0 min-w-0 flex items-center justify-center overflow-hidden',
          }"
          @select="onSelect"
        >
          <img
            :src="item"
            class="max-w-full max-h-full w-auto h-auto object-contain block"
            draggable="false"
            loading="lazy"
          />
        </UCarousel>
      </div>
    </div>
  </div>

  <!-- <div class="flex flex-col w-full h-full">
  <div class="flex-1 min-h-0 w-full p-2">
    <UCarousel
      ref="carousel"
      v-slot="{ item }"
      :items="items"
      class="w-full h-full"
      :ui="{
        root: 'w-full h-full',
        viewport: 'h-full',
        container: 'h-full min-h-0',
        item: 'basis-full h-full min-h-0 min-w-0 flex items-center justify-center overflow-hidden'
      }"
      @select="onSelect"
    >
      <img
        :src="item"
        class="max-w-full max-h-full w-auto h-auto object-contain block"
        draggable="false"
        loading="lazy"
      />
    </UCarousel>
  </div>
</div> -->
</template>
