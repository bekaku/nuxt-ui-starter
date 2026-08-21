<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";

const props = withDefaults(
  defineProps<{
    checkLiveness?: boolean;
  }>(),
  {
    checkLiveness: false,
  }
);

const emit = defineEmits<{
  capture: [file: Blob, dataUrl: string];
  close: [];
}>();

const { t } = useLang();
const { videoRef, startCamera, stopCamera, captureImage } = useCamera();
const isOpen = defineModel<boolean>("open");

const isLoading = ref(false);
const error = ref<string | null>(null);
const capturedBlob = ref<Blob | null>(null);
const capturedImageUrl = ref<string | null>(null);

const devices = ref<MediaDeviceInfo[]>([]);
const currentDeviceIndex = ref(0);

// --- Liveness State ---
const isAiLoading = ref(false);
const instructionText = ref(t("faceDetection.lookAtCamera"));
const livenessSuccess = ref(false);
const eyeClosed = ref(false);
const blinkDetected = ref(false)
let faceLandmarker: FaceLandmarker | null = null;
let animationFrameId: number;

const initCamera = async () => {
  await nextTick();
  try {
    isLoading.value = true;
    error.value = null;
    await startCamera();

    if (navigator.mediaDevices?.enumerateDevices) {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      devices.value = allDevices.filter((d) => d.kind === "videoinput");
    }
  } catch (err: any) {
    error.value = t("faceDetection.cameraError") || "ไม่สามารถเปิดกล้องได้";
  } finally {
    isLoading.value = false;
  }
};

const onVideoLoaded = async () => {
  if (props.checkLiveness && !capturedImageUrl.value) {
    await initLivenessDetection();
  }
};

const switchCamera = async () => {
  if (devices.value.length < 2) return;
  currentDeviceIndex.value = (currentDeviceIndex.value + 1) % devices.value.length;
  await startCamera();
};

const calculateDistance = (p1: any, p2: any) =>
  Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

const getEAR = (landmarks: any[], eyeIndices: [number, number, number, number]) => {
  const p1 = landmarks[eyeIndices[0]];
  const p2 = landmarks[eyeIndices[1]];
  const p3 = landmarks[eyeIndices[2]];
  const p4 = landmarks[eyeIndices[3]];
  if (!p1 || !p2 || !p3 || !p4) return 0;
  return calculateDistance(p2, p3) / calculateDistance(p1, p4);
};

const initLivenessDetection = async () => {
  instructionText.value = `${t("ai.modelPreparing")}...`;
  livenessSuccess.value = false;
  eyeClosed.value = false;

  if (!faceLandmarker) {
    isAiLoading.value = true;
    try {
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm"
      );
      faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        outputFaceBlendshapes: true, // <--- เปลี่ยนจาก false เป็น true
        runningMode: "VIDEO",
        numFaces: 1,
      });
    } catch (err) {
      console.error(err);
      error.value = t("ai.modelLoadFailed");
      isAiLoading.value = false;
      return;
    }
    isAiLoading.value = false;
  }

  instructionText.value = t("faceDetection.instruction1");
  detectLivenessLoop();
};
// เพิ่ม State สำหรับจับเวลาด้านบนสุด
let blinkStartTime = 0;

const detectLivenessLoop = () => {
  if (!videoRef.value || !isOpen.value || capturedImageUrl.value) return;

  if (faceLandmarker && videoRef.value.readyState >= 2) {
    const startTimeMs = performance.now();
    const results = faceLandmarker.detectForVideo(videoRef.value, startTimeMs);
    const blendshapes = results.faceBlendshapes?.[0]?.categories;

    if (blendshapes) {
      const blinkLeft = blendshapes.find((b) => b.categoryName === "eyeBlinkLeft")?.score || 0;
      const blinkRight = blendshapes.find((b) => b.categoryName === "eyeBlinkRight")?.score || 0;

      // ใช้ Threshold ที่ลืมตาได้สบายๆ
      const isClosed = blinkLeft > 0.45 && blinkRight > 0.45;
      const isOpenEye = blinkLeft < 0.35 && blinkRight < 0.35;

      if (isClosed && !eyeClosed.value) {
        // 1. เริ่มจับเวลาตอนที่ตาเริ่มปิด
        eyeClosed.value = true;
        blinkStartTime = performance.now();
        instructionText.value = 'ดีมาก! ลืมตาขึ้นได้เลย';
      }
      else if (isOpenEye && eyeClosed.value) {
        // 2. คํานวณระยะเวลาที่หลับตาไป
        const blinkDuration = performance.now() - blinkStartTime;

        // 3. กรองการหลอก:
        // - กะพริบเร็วกว่า 50ms = สั่นรูป (Noise/Error)
        // - ค้างนานกว่า 1000ms (1 วิ) = เอารูปมาจ่อแล้วปิดกล้อง หรือไม่ใช่การกะพริบธรรมชาติ
        if (blinkDuration > 50 && blinkDuration < 1000) {
          livenessSuccess.value = true;
          instructionText.value = t('faceDetection.detectSuccess');

          setTimeout(() => {
            takePicture();
          }, 150);
          return; // สแกนผ่าน
        } else {
          // ถ้าเวลาไม่สมเหตุสมผล ให้ Reset สถานะแล้วบังคับให้กะพริบใหม่
          eyeClosed.value = false;
          blinkStartTime = 0;
          instructionText.value = 'การกะพริบตาผิดปกติ กรุณาลองอีกครั้ง';
        }
      }
    }
  }
  animationFrameId = requestAnimationFrame(detectLivenessLoop);
};

// const detectLivenessLoop = () => {
//   if (!videoRef.value || !isOpen.value || capturedImageUrl.value) return;

//   if (faceLandmarker && videoRef.value.readyState >= 2) {
//     const startTimeMs = performance.now();
//     const results = faceLandmarker.detectForVideo(videoRef.value, startTimeMs);

//     // ดึงค่า Blendshapes (วิเคราะห์กล้ามเนื้อหน้า)
//     const blendshapes = results.faceBlendshapes?.[0]?.categories;

//     if (blendshapes) {
//       // ดึงคะแนนการหลับตาซ้ายและขวา (0.0 = ลืมตาสุด, 1.0 = หลับตาสนิท)
//       const blinkLeft = blendshapes.find((b) => b.categoryName === "eyeBlinkLeft")?.score || 0;
//       const blinkRight = blendshapes.find((b) => b.categoryName === "eyeBlinkRight")?.score || 0;

//       // ปรับจูน (Tuning) Threshold ให้อ่อนลง
//       // หลับตาแค่ 35% ก็ถือว่าตั้งใจกะพริบแล้ว (เดิมอาจจะสูงไป)
//       const isClosed = blinkLeft > 0.35 && blinkRight > 0.35;
//       // ลืมตากลับมาปกติ
//       const isOpenEye = blinkLeft < 0.30 && blinkRight < 0.30;

//       if (isClosed) {
//         eyeClosed.value = true; // สถานะ: พบการหลับตา

//         // เพิ่ม Feedback แจ้งให้ผู้ใช้รู้ว่าระบบจับได้แล้ว ให้ลืมตาได้
//         instructionText.value = 'เบิกตาขึ้นอีกนิด';
//       }
//       else if (isOpenEye && eyeClosed.value) {
//         // สถานะ: หลับตาไปแล้ว และลืมตากลับขึ้นมา (สมบูรณ์)
//         livenessSuccess.value = true;
//         instructionText.value = t('faceDetection.detectSuccess');

//         // ถ่ายภาพทันที (ลดดีเลย์เหลือ 150ms เพื่อจับภาพตอนที่หน้ากำลังเป็นธรรมชาติที่สุด)
//         setTimeout(() => {
//           takePicture();
//         }, 150);
//         return; // หยุด Loop AI
//       }
//     }
//   }
//   animationFrameId = requestAnimationFrame(detectLivenessLoop);
// };

const takePicture = () => {
  if (!videoRef.value) return;
  const blob = captureImage();
  if (blob) {
    capturedBlob.value = blob;
    capturedImageUrl.value = URL.createObjectURL(blob);
  }
  stopCamera();
  cancelAnimationFrame(animationFrameId);
};

const retake = async () => {
  capturedBlob.value = null;
  capturedImageUrl.value = null;
  await initCamera();
};

const confirmAndSend = () => {
  if (capturedBlob.value && capturedImageUrl.value) {
    emit("capture", capturedBlob.value, capturedImageUrl.value);
    onClose();
  }
};

const onClose = () => {
  capturedBlob.value = null;
  capturedImageUrl.value = null;
  stopCamera();
  cancelAnimationFrame(animationFrameId);
  emit("close");
};

onMounted(() => {
  initCamera();
});

onBeforeUnmount(() => {
  onClose();
});
</script>
<template>
  <div>
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">
            {{
              checkLiveness
                ? $t("faceDetection.modeLiveness")
                : $t("faceDetection.camera")
            }}
          </h3>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            class="-my-1"
            @click="onClose"
          />
        </div>
      </template>

      <!-- Camera and photo display section -->
      <div
        class="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center"
      >
        <!-- State: Loading (Camera or AI) -->
        <div
          v-if="isLoading || isAiLoading"
          class="absolute inset-0 flex flex-col items-center justify-center gap-2 z-20 bg-gray-900/80"
        >
          <UIcon
            name="i-heroicons-arrow-path"
            class="w-8 h-8 animate-spin text-gray-400"
          />
          <span class="text-sm text-gray-300">{{
            isAiLoading
              ? $t("faceDetection.modelLoading")
              : $t("faceDetection.cameraLoading")
          }}</span>
        </div>

        <!-- State: Error -->
        <div
          v-else-if="error"
          class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-red-500 p-4 text-center bg-gray-800 z-20"
        >
          <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8" />
          <span class="text-sm">{{ error }}</span>
        </div>

        <!--  Live streaming camera -->
        <video
          v-show="!capturedImageUrl && !error && !isLoading"
          ref="videoRef"
          autoplay
          playsinline
          @loadeddata="onVideoLoaded"
          class="w-full h-full object-cover transform -scale-x-100"
        />

        <!-- Preview of photos -->
        <img
          v-if="capturedImageUrl"
          :src="capturedImageUrl"
          class="w-full h-full object-cover"
        />

        <!-- Overlay for Liveness (shown only when the mode is enabled and no photos have been taken) -->
        <div
          v-if="
            checkLiveness &&
            !capturedImageUrl &&
            !isLoading &&
            !isAiLoading &&
            !error
          "
          class="absolute inset-x-0 bottom-4 text-center z-10 w-full flex justify-center"
        >
          <UBadge
            :color="livenessSuccess ? 'success' : 'warning'"
            size="lg"
            class="animate-pulse shadow-lg px-4 py-2 text-sm"
          >
            {{ instructionText }}
          </UBadge>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-center items-center">
          <!-- Camera switch button -->
          <UButton
            v-if="!capturedImageUrl && devices.length > 1"
            color="neutral"
            variant="soft"
            icon="i-heroicons-arrow-path-rounded-square"
            @click="switchCamera"
          >
            {{ $t("faceDetection.switchCamera") }}
          </UButton>
          <div v-else></div>

          <div class="flex flex-col gap-2">
            <span class="text-xs text-muted">
              {{ $t("faceDetection.instruction2") }}
            </span>

            <div class="flex justify-center gap-2 mt-5">
              <UButton
                v-if="!checkLiveness && !capturedImageUrl"
                color="primary"
                @click="takePicture"
                :disabled="isLoading || !!error"
                icon="i-heroicons-camera"
              >
                {{ $t("faceDetection.takePicture") }}
              </UButton>

              <!-- Status: Photo taken (preview shown). Choose whether to take a new photo or confirm. -->
              <template v-if="capturedImageUrl">
                <UButton color="neutral" variant="ghost" @click="retake">
                  {{ $t("faceDetection.retake") }}</UButton
                >
                <UButton
                  color="success"
                  @click="confirmAndSend"
                  icon="i-heroicons-check"
                >
                  {{
                    checkLiveness
                      ? $t("base.confirm")
                      : $t("faceDetection.useThisImage")
                  }}
                </UButton>
              </template>
            </div>
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>
