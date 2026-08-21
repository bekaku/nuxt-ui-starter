<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";

const props = withDefaults(
  defineProps<{
    checkLiveness?: boolean;
  }>(),
  {
    checkLiveness: false,
  },
);

const emit = defineEmits<{
  (e: "capture", file: Blob, dataUrl: string): void;
}>();
const isOpen = ref(false);
const open = () => {
  isOpen.value = true;
};
const confirmAndSend = (file: Blob, url: string) => {
  if (file && url) {
    emit("capture", file, url);
    closeModal();
  }
};
const closeModal = () => {
  isOpen.value = false;
};
onBeforeUnmount(() => {
  closeModal();
});
</script>
<template>
  <div>
    <slot name="trigger" v-bind="{ open }">
      <UButton color="primary" @click="isOpen = true" icon="i-heroicons-camera">
        {{ $t("faceDetection.takePictureFace") }}
      </UButton>
    </slot>

    <UModal v-if="isOpen" v-model:open="isOpen" :dismissible="false">
      <template #content>
        <LazyBaseCameraCapture
          v-model:open="isOpen"
          :check-liveness="checkLiveness"
          @close="closeModal"
          @capture="confirmAndSend"
        />
      </template>
    </UModal>
  </div>
</template>
