<script setup lang="ts">
import type { FileManager } from "~/types/models";

definePageMeta({
  layout: "default",
});
useSeoMeta({
  title: "File viewer page",
});

const pdfFromServer = ref<string>();
const videoPlayerDialog = ref(false);
const videoItem: FileManager = {
  id: "9999",
  fileMime: "video/mp4",
  fileName: "View_From_A_Blue_Moon_Trailer-HD.mp4",
  filePath:
    "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4",
  fileThumbnailPath:
    "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.jpg",
  fileSize: 1925325,
  fileMimeType: "VIDEO",
  createdDate: "2025-05-31 18:31:00",
  duration: 185,
  view: 78945,
  title: "This 525sqft House Has an Amazing Floor Plan! Full Tour!",
  description: `Today I talk/walk you through 24 hours of off-grid living in a cozy cabin, alone in the woods with my dog. I talk about my off-grid systems for heating, running water, electricity, cooking and more. I also find the time for some skiing, firewood chores, banjo pickin', and a wood fired sauna. Hope you enjoy! CHECK OUT MY WEBSITE for access to my channels original music or my Norman and cabin merchandise:

https://alaskacabinadventures.com

Here's is the link to the EcoFlow fridge and power stations I use,
Check out the Delta 2 MAX and the Glacier Fridge: EcoFlow Website: https://bit.ly/3si1QDK`,
  videoSources: [
    {
      src: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4",
      type: "video/mp4",
      size: 576,
    },
    {
      src: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4",
      type: "video/mp4",
      size: 720,
    },
    {
      src: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4",
      type: "video/mp4",
      size: 1080,
    },
  ],
  videoTracks: [
    {
      kind: "captions",
      label: "English",
      srclang: "en",
      src: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.en.vtt",
      default: true,
    },
    {
      kind: "captions",
      label: "Français",
      srclang: "fr",
      src: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.fr.vtt",
      default: false,
    },
  ],
};

const imageSelectIndex = ref<number>(0);
const showImageView = ref(false);
const { data: imageItems } = await useFetch<FileManager[]>(
  "/api/mock/file/imageItemsData",
);
const showPdfView = ref(false);
const pdfSrc = ref<string>();
const pdfName = ref<string>();
const showPdfViewWatermark1 = ref(false);
const showPdfViewWatermark2 = ref(false);
const showPdfViewWatermark3 = ref(false);
const dummyPdfUrl =
  "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";
const { data: pdfItems } = await useFetch<FileManager[]>(
  "/api/mock/file/pdfItemsData",
);

const showMixFiles = ref(false);
const fileMixImageSelectIndex = ref<number>(0);
const fileImageItemsForView = ref<FileManager[]>([]);
const fileMixForView = ref<FileManager>();
const mixItems = ref<FileManager[]>([]);
mixItems.value.push(videoItem);

onMounted(() => {
  if (imageItems.value) {
    mixItems.value.push(...imageItems.value);
  }
  if (pdfItems.value) {
    mixItems.value.push(...pdfItems.value);
  }
  mixItems.value.push(videoItem);
});

const onVideoClick = (event: any, index: number) => {
  console.log("onVideoClick", index);
  videoPlayerDialog.value = true;
};
</script>

<template>
  <BaseDashboardPanel id="example-file-viewer" title="File viewer">
    <UCard title="Video" class="mb-8">
      <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div class="text-sm font-bold text-muted">Dialog</div>
          <BaseFileItem
            :item="videoItem"
            :index="0"
            layout="grid"
            image-class="h-auto"
            :show-size="false"
            :show-name="false"
            @on-click="onVideoClick"
          >
          </BaseFileItem>
        </div>
        <div>
          <div class="text-sm font-bold text-muted">List</div>
        </div>
      </div>
    </UCard>
    <UCard title="Image" class="mb-8">
      <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div class="text-sm font-bold text-muted">Grid</div>
          <BaseFileItems
            v-if="imageItems"
            :items="imageItems"
            :format-size="false"
            image-class="h-32"
          />
        </div>
        <div>
          <div class="text-sm font-bold text-muted">List</div>
          <UScrollArea class="max-h-115">
            <BaseFileItems
              v-if="imageItems"
              :items="imageItems"
              :format-size="false"
              :bordered="false"
              layout="list"
            />
          </UScrollArea>
        </div>
      </div>
    </UCard>

    <UCard title="Image slide" class="mb-8">
      <div class="h-[550px]">
        <BaseImageView :files="imageItems" />
      </div>
    </UCard>
  </BaseDashboardPanel>
</template>
