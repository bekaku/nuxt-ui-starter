<script setup lang="ts">
import type { FileManager } from "~/types/models";

definePageMeta({
  layout: "default",
});
useSeoMeta({
  title: "Upload files page",
});

const api = useApi();
const loader = useLoader();
const {
  files,
  uploading,
  uploadSuccessPercent,
  onStartUploadChunk,
  onUploadChunk,
  onClearFileUpload,
} = useUpload();
const file = ref<File | null>(null);
const previewLayout = ref<"list" | "grid">("list");
const confirm = useConfirmDialog();
const { t } = useLang();

const {
  firstLoaded,
  pages,
  dataList,
  loadData,
  onReload,
  onPageChange,
  onPerPageChange,
  sorts,
} = usePagefecth<FileManager>({
  apiEndpoint: "/api/fileManager/findAllByAdmin",
  defaultSorts: [{ column: "createdDate", mode: "desc" }],
  itemsPerPage: 8,
});

const onChange = (f: File | null | undefined) => {
  console.log("onChange", f);
};
const uploadChunk = async () => {
  if (!file.value) {
    return;
  }
  uploading.value = true;
  const response = await onUploadChunk(file.value, {
    setProgress: false,
  });
  uploading.value = false;
  console.log("uploadChunk", response);
};

const onDeleteFile = async (index: number) => {
  const item = dataList.value[index];
  if (!item) {
    return;
  }
  const conf = await confirm({
    title: t("app.monogram"),
    description: t("base.deleteConfirm"),
  });
  if (!conf) {
    return;
  }
  try {
    loader.open();
    const response = await api.raw<void>(
      `/api/fileManager/deleteFileApi/${item.id}`,
      {
        method: "DELETE",
      },
    );
    if (response && response.status == 200) {
      dataList.value.splice(index, 1);
    }

    console.log("onDeleteFile:", response);
  } catch (error) {
    console.error("An error occurred while deleting the file.:", error);
  } finally {
    loader.close();
  }
};

loadData();
</script>

<template>
  <BaseDashboardPanel id="example-upload-files" title="Upload files page">
    <div class="flex gap-2 p-4">
      Preview layout:
      <USelect v-model="previewLayout" :items="['list', 'grid']" class="w-48" />
    </div>
    <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="w-full">
        <UCard title="Nuxt UI (Single)">
          <div class="flex flex-col gap-4">
            <UFileUpload
              v-model="file"
              label="Drop your file here"
              :multiple="false"
              dropzone
              :layout="previewLayout"
              class="w-96 min-h-48 my-2"
              @update:modelValue="
                (f: File | null | undefined) => {
                  onChange(f);
                }
              "
            />
            <UButton
              :loading="uploading"
              icon="lucide:hard-drive-upload"
              class="w-fit"
              @click="uploadChunk"
            >
              Upload
            </UButton>
          </div>
        </UCard>
      </div>
      <div class="w-full">
        <UCard title="Custom components">
          <div class="flex flex-col gap-4">
            <!-- <BaseImage
              src="https://images.unsplash.com/photo-1784146930322-6e7eca40f176?q=80&w=687&auto=format&fit=crop"
              alt="image"
              class="w-96 h-96 rounded-xl"
              fit="contain"
            >
              <div class="absolute inset-0 bg-black/40"></div>

              <div
                class="relative z-10 flex flex-col items-center justify-center"
              >
                <div
                  class="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold shadow-sm mb-2"
                >
                  +
                </div>
                <span class="text-sm font-bold text-white drop-shadow-md">
                  Add Story
                </span>
              </div>
            </BaseImage>
            <BaseImage
              src="https://images.unsplash.com/photo-1782346056252-c3699920bf19?q=80&w=1170&auto=format&fit=crop"
              alt="image"
              class="w-48 rounded-xl"
              fit="cover"
            >
              <UButton
                class="absolute top-2 right-2 z-20 flex items-center justify-center w-7 h-7 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors shadow-md"
                label="Remove image"
              >
                <Icon name="lucide:x" />
              </UButton>
            </BaseImage> -->

            <BaseFileUpload
              description="Upload multiple files"
              multiple
              class="my-2"
              icon="lucide:image"
              v-model="files"
              :priview-layout="previewLayout"
              :progress="uploadSuccessPercent"
            />

            <div class="flex gap-4">
              <UButton
                :loading="uploading"
                class="w-fit"
                color="primary"
                @click="onStartUploadChunk"
              >
                Upload
              </UButton>
              <UButton
                :loading="uploading"
                class="w-fit"
                @click="
                  () => {
                    onClearFileUpload(true);
                  }
                "
              >
                Reset
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
      <div class="w-full">
        <UCard title="Custom UI">
          <UChatPrompt class="w-full">
            <template #header>
              <BaseFileItems
                :items="files"
                show-delete
                grid-class="grid-cols-2 md:grid-cols-6 gap-2"
                @on-remove="
                  (index: number) => {
                    files.splice(index, 1);
                  }
                "
              />
            </template>
            <template #footer>
              <div class="flex flex-col w-full">
                <div class="flex w-full justify-between">
                  <BaseFileUpload v-model="files" multiple>
                    <template #default="{ open }">
                      <UButton
                        icon="lucide:image"
                        variant="ghost"
                        class="rounded-full"
                        @click="open()"
                      />
                    </template>
                  </BaseFileUpload>

                  <div class="flex items-center justify-end gap-1.5">
                    <UChatPromptSubmit size="sm" />
                  </div>
                </div>
              </div>
            </template>
          </UChatPrompt>

          <div class="flex items-center gap-1 rounded-md px-2 py-1 w-full my-8">
            <UButton
              icon="lucide:laugh"
              variant="ghost"
              class="rounded-full shrink-0 mb-1"
            />

            <BaseFileUpload v-model="files" multiple class="shrink-0 mb-1">
              <template #default="{ open }">
                <UButton
                  icon="lucide:image"
                  variant="ghost"
                  class="rounded-full"
                  @click="open()"
                />
              </template>
            </BaseFileUpload>

            <UTextarea
              class="flex-1 mx-1"
              :maxrows="4"
              :rows="1"
              autoresize
              size="lg"
              placeholder="type message"
              variant="outline"
              :ui="{ base: 'focus:ring-0 ' }"
            />

            <UButton
              icon="lucide:send"
              variant="ghost"
              class="rounded-full shrink-0 mb-1"
            />
          </div>
        </UCard>
      </div>
      <div class="w-full">
        <UCard title="Fetch files from server">
          <div class="flex p-2 gap-4">
            <UButton
              class="w-fit"
              icon="lucide:refresh-cw"
              label="Reload data"
              @click="onReload"
            />
          </div>
          <UScrollArea :class="['w-full', 'h-86']">
            <template v-if="!firstLoaded">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <USkeleton
                  v-for="index in 4"
                  :key="index"
                  class="h-18 w-full"
                />
              </div>
            </template>
            <template v-else-if="dataList && dataList.length > 0">
              <BaseFileItems
                :items="dataList"
                show-delete
                grid-class="grid-cols-2 md:grid-cols-6"
                @on-remove="onDeleteFile"
              />
            </template>
            <template v-else>
              <UEmpty
                icon="i-lucide-file"
                title="No projects found"
                description="It looks like you haven't added any projects. Create one to get started."
              />
            </template>
          </UScrollArea>

          <BasePaging
            v-if="pages && pages.totalPages > 0"
            v-model="pages"
            @update-current="onPageChange"
            @update-perpage="onPerPageChange"
          />
        </UCard>
      </div>
    </div>
  </BaseDashboardPanel>
</template>
