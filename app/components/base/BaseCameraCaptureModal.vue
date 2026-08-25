<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";

const props = withDefaults(
  defineProps<{
    checkLiveness?: boolean;
    autoclose?: boolean;
    walkThrough?: boolean;
  }>(),
  {
    checkLiveness: false,
    autoclose: true,
    walkThrough: false,
  },
);

const emit = defineEmits<{
  (e: "capture", file: Blob, dataUrl: string): void;
  (e: "walk-through-capture", file: Blob): void;
}>();
const isOpen = ref(false);
const open = () => {
  isOpen.value = true;
};
const confirmAndSend = (file: Blob, url: string) => {
  if (file && url) {
    emit("capture", file, url);
    if (props.autoclose) {
      closeModal();
    }
  }
};
const walkThroughCapture=(file: Blob)=>{
  console.log('walkThroughCapture', file);
  // emit('walk-through-capture', file)
}
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
        <LazyBaseCameraCapture v-if="!walkThrough"
          v-model:open="isOpen"
          :check-liveness="checkLiveness"
          @close="closeModal"
          @capture="confirmAndSend"
        />
        <LazyBaseCameraCaptureWalkThrough
        v-else
          v-model:open="isOpen"
          :check-liveness="checkLiveness"
          :walk-through="walkThrough"
          @close="closeModal"
          @capture="walkThroughCapture"
        />
      </template>
    </UModal>
  </div>
</template>
