<
<script setup lang="ts">
import type {
  FaceRecognitionDetechResponse,
  FaceRecognitionRegisterResponse,
  FileManager,
} from "~/types/models";

useSeoMeta({
  title: "Face detection page",
});

const { onUploadChunk } = useUpload();
const { auth } = useAuth();
const toast = useToast();
const api = useApi();
const form = reactive({
  userId: auth.value?.id as string,
});

const capturedImage = ref<string | null>(null);
const capturedImageBlob = ref<Blob | File | null>(null);
const isSubmitting = ref(false);

const uploadChunk = async (): Promise<FileManager | null> => {
  if (!capturedImageBlob.value) {
    return null;
  }
  const uniqueId = generateSnowflakeID();
  const f = await blobToFile(
    capturedImageBlob.value,
    `capture_${uniqueId}.jpg`,
  );
  const response = await onUploadChunk(f, {
    setProgress: false,
    metaData: {
      resizeImage: false,
      createThumbnail: false,
    },
  });
  console.log("uploadChunk", response);
  return response;
};
const onRegister = async () => {
  if (!capturedImageBlob.value) {
    return;
  }
  isSubmitting.value = true;
  const fileManager = await uploadChunk();
  if (!fileManager || !fileManager.id) {
    isSubmitting.value = false;
    return;
  }

  const data = {
    userId: form.userId,
    fileManagerId: fileManager.id,
  };
  console.log("body", data);

  try {
    await api.raw<FaceRecognitionRegisterResponse>(
      "/api/faceRegconition/register",
      {
        method: "POST",
        body: data,
      },
    );
    toast.add({
      description: "Face registered successfully",
      icon: "i-lucide-check",
      color: "success",
    });
  } catch (error) {
    console.error("Failed to register face ", error);
  } finally {
    isSubmitting.value = false;
  }
};
const handlePhotoCapture = (file: Blob, url: string) => {
  console.log("handlePhotoCapture", { file, url });
  capturedImageBlob.value = file;
  capturedImage.value = url;
};
//detect
const scanResult = ref<{
  success: boolean;
  title: string;
  desc: string;
} | null>(null);

const scanResultItem = ref<FaceRecognitionDetechResponse | null>(null);

const submitCheckIn = async (imageBlob: Blob, url: string) => {
  if (!imageBlob) return;
  const uniqueId = generateSnowflakeID();
  const formData = new FormData();
  formData.append("image", imageBlob, `capture_${uniqueId}.jpg`);
  formData.append("deviceId", "WEB_CLIENT_01");

  try {
    const response = await api.raw<FaceRecognitionDetechResponse>(
      "/api/faceRegconition/detection",
      {
        method: "POST",
        body: formData,
      },
    );

    if (response && response.status == 200 && response._data) {
      const data = response._data;
      scanResultItem.value = data;
      scanResult.value = {
        success: true,
        title: "บันทึกเวลาสำเร็จ",
        desc: `สวัสดีคุณ ${data.email} (ความแม่นยำ: ${data.similarityScore}%)`,
      };
    }
  } catch (error: any) {
    scanResultItem.value = null;
    scanResult.value = {
      success: false,
      title: "ไม่สามารถยืนยันตัวตนได้",
      desc: error.data?.message || "ใบหน้าไม่ตรงกับระบบ",
    };
  }
};
</script>

<template>
  <BaseDashboardPanel id="example-face-detection" title="Face detection page">
    <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <UCard title="Register face">
          <UForm :state="form" @submit="onRegister" class="space-y-4">
            <UFormField label="User ID" name="userId" class="w-full">
              <UInput v-model="form.userId" class="w-full" />
            </UFormField>

            <UFormField :label="$t('faceDetection.takePictureFace')">
              <BaseCameraCaptureModal
                @capture="handlePhotoCapture"
                :check-liveness="false"
              >
                <template #trigger="{ open }">
                  <UButton
                    color="neutral"
                    icon="i-heroicons-camera"
                    @click="open"
                  >
                    {{ $t("faceDetection.takePicture") }}
                  </UButton>
                </template>
              </BaseCameraCaptureModal>
            </UFormField>
            <UFormField label="Capture image">
              <BaseImage
                v-if="capturedImage"
                :src="capturedImage"
                fit="cover"
                style="height: 250px; max-width: 250px"
                class="bg-neutral-950"
              />
            </UFormField>

            <UButton
              type="submit"
              color="primary"
              block
              :loading="isSubmitting"
              :disabled="!capturedImageBlob"
            >
              {{ $t("faceDetection.registerFace") }}
            </UButton>
          </UForm>
        </UCard>
      </div>
      <div>
        <UCard>
          <template #header>
            <h2 class="text-xl font-bold">ลงเวลาเข้างาน (Face Recognition)</h2>
          </template>

          <div v-if="scanResult" class="mt-6">
            <div v-if="scanResultItem">
              <BaseImage
                v-if="scanResultItem.image"
                :src="scanResultItem.image.image"
                fit="cover"
                style="height: 250px; max-width: 250px"
                class="bg-neutral-950"
              />
            </div>
            <UAlert
              :title="scanResult.title"
              :description="scanResult.desc"
              :color="scanResult.success ? 'success' : 'error'"
              variant="subtle"
              :icon="
                scanResult.success
                  ? 'i-heroicons-check-circle'
                  : 'i-heroicons-x-circle'
              "
            />
          </div>

          <template #footer>
            <div class="flex justify-between">
              <BaseCameraCaptureModal
                @capture="submitCheckIn"
                :check-liveness="true"
              >
                <template #trigger="{ open }">
                  <UButton
                    color="neutral"
                    icon="i-heroicons-camera"
                    @click="open"
                  >
                    Scan
                  </UButton>
                </template>
              </BaseCameraCaptureModal>
            </div>
          </template>
        </UCard>
      </div>
    </div>
  </BaseDashboardPanel>
</template>
