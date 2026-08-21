<
<script setup lang="ts">
useSeoMeta({
  title: "Face detection page",
});

const { videoRef, startCamera, stopCamera, captureImage } = useCamera();

const form = reactive({
  userId: "",
  fileManagerId: "",
});

const capturedImage = ref<string | null>(null);
const capturedImageBlob = ref<Blob | null>(null);
const showCamera = ref(false);
const isSubmitting = ref(false);

const handleCapture = () => {
  const blob = captureImage();
  if (blob) {
    capturedImageBlob.value = blob;
    capturedImage.value = URL.createObjectURL(blob);
    stopCamera();
  }
};

const retake = async () => {
  capturedImage.value = null;
  capturedImageBlob.value = null;
  await startCamera();
};

const onSubmit = async () => {
  if (!capturedImageBlob.value) return;
  isSubmitting.value = true;

  // const formData = new FormData();
  // const requestBlob = new Blob(
  //   [
  //     JSON.stringify({
  //       userId: Number(form.userId),
  //       fileManagerId: Number(form.fileManagerId),
  //     }),
  //   ],
  //   { type: "application/json" },
  // );

  // formData.append("request", requestBlob);
  // formData.append("image", capturedImageBlob.value, "face.jpg");

  // try {
  //   await $fetch("/api/employees/register", {
  //     method: "POST",
  //     baseURL: "http://localhost:8080",
  //     body: formData,
  //   });
  //   alert("ลงทะเบียนสำเร็จ");
  // } catch (err: any) {
  //   alert("Error: " + err.message);
  // } finally {
  //   isSubmitting.value = false;
  // }
};

onMounted(() => {
  startCamera();
});

onBeforeUnmount(() => {
  stopCamera();
});
</script>

<template>
  <BaseDashboardPanel id="example-face-detection" title="Face detection page">
    <UCard title="Register face">
      <UForm :state="form" @submit="onSubmit" class="space-y-4">
        <UFormField label="User ID" name="userId">
          <UInput v-model="form.userId" />
        </UFormField>

        <!-- กรณีที่คุณมี fileManagerId (ตาม Database ของคุณ) อาจจะเป็น Input อัพโหลดหรือเลือกไฟล์ -->
        <UFormField label="File Manager ID" name="fileManagerId">
          <UInput v-model="form.fileManagerId" type="number" />
        </UFormField>

        <UFormField label="ภาพถ่ายใบหน้า">
          <div
            class="relative aspect-video bg-gray-200 rounded-lg overflow-hidden w-100 mb-2"
          >
            <video
              v-show="!capturedImage && showCamera"
              ref="videoRef"
              autoplay
              playsinline
              class="w-full h-full object-cover transform -scale-x-100"
            ></video>
            <img
              v-if="capturedImage"
              :src="capturedImage"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="flex gap-2">
            <UButton
              v-if="!capturedImage"
              color="primary"
              @click="handleCapture"
              type="button"
              >ถ่ายภาพ</UButton
            >
            <UButton v-else color="neutral" @click="retake" type="button"
              >ถ่ายใหม่</UButton
            >
          </div>
        </UFormField>

        <UButton
          type="submit"
          color="neutral"
          block
          :loading="isSubmitting"
          :disabled="!capturedImageBlob"
        >
          บันทึกลงทะเบียน
        </UButton>
      </UForm>
    </UCard>
  </BaseDashboardPanel>
</template>
