<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
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
  capture: [file: Blob];
  close: [];
}>();

const { t } = useLang();
const { videoRef, startCamera, stopCamera, captureImage } = useCamera();
const isOpen = defineModel<boolean>("open");

// --- Overlay Canvas Ref ---
const overlayCanvasRef = ref<HTMLCanvasElement | null>(null);

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
let blinkStartTime = 0;

let faceLandmarker: FaceLandmarker | null = null;
let animationFrameId = 0;

// =========================================================
// Camera
// =========================================================

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
  } catch (err: unknown) {
    console.error("Camera initialization failed:", err);
    error.value = t("faceDetection.cameraError");
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
  clearOverlayCanvas();
  await startCamera();
};

// =========================================================
// Face Bounds & Overlay Drawing
// =========================================================

const getFaceBounds = (landmarks: Array<{ x: number; y: number }>) => {
  if (!landmarks?.length) return null;

  let minX = 1;
  let maxX = 0;
  let minY = 1;
  let maxY = 0;

  for (const point of landmarks) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

const clearOverlayCanvas = () => {
  if (overlayCanvasRef.value) {
    const ctx = overlayCanvasRef.value.getContext("2d");
    ctx?.clearRect(0, 0, overlayCanvasRef.value.width, overlayCanvasRef.value.height);
  }
};

const drawFaceBox = (
  bounds: { minX: number; maxX: number; minY: number; maxY: number; width: number; height: number } | null,
  isSuccess: boolean
) => {
  const canvas = overlayCanvasRef.value;
  const video = videoRef.value;

  if (!canvas || !video) return;

  // Sync canvas dimensions with video
  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!bounds) return;

  const vw = canvas.width;
  const vh = canvas.height;

  // Padding around face
  const padX = bounds.width * 0.15;
  const padY = bounds.height * 0.2;

  const minX = Math.max(0, bounds.minX - padX);
  const maxX = Math.min(1, bounds.maxX + padX);
  const minY = Math.max(0, bounds.minY - padY);
  const maxY = Math.min(1, bounds.maxY + padY);

  const boxWidth = (maxX - minX) * vw;
  const boxHeight = (maxY - minY) * vh;

  // Mirror X-axis coordinate to match video transform -scale-x-100
  const boxX = (1 - maxX) * vw;
  const boxY = minY * vh;

  const strokeColor = isSuccess ? "#22c55e" : "#eab308"; // เขียวเมื่อผ่าน / เหลืองระหว่างตรวจจับ

  ctx.save();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Focus Brackets (มุม 4 ด้าน)
  const cornerLength = Math.min(boxWidth, boxHeight) * 0.2;

  // Top-Left
  ctx.beginPath();
  ctx.moveTo(boxX, boxY + cornerLength);
  ctx.lineTo(boxX, boxY);
  ctx.lineTo(boxX + cornerLength, boxY);
  ctx.stroke();

  // Top-Right
  ctx.beginPath();
  ctx.moveTo(boxX + boxWidth - cornerLength, boxY);
  ctx.lineTo(boxX + boxWidth, boxY);
  ctx.lineTo(boxX + boxWidth, boxY + cornerLength);
  ctx.stroke();

  // Bottom-Left
  ctx.beginPath();
  ctx.moveTo(boxX, boxY + boxHeight - cornerLength);
  ctx.lineTo(boxX, boxY + boxHeight);
  ctx.lineTo(boxX + cornerLength, boxY + boxHeight);
  ctx.stroke();

  // Bottom-Right
  ctx.beginPath();
  ctx.moveTo(boxX + boxWidth - cornerLength, boxY + boxHeight);
  ctx.lineTo(boxX + boxWidth, boxY + boxHeight);
  ctx.lineTo(boxX + boxWidth, boxY + boxHeight - cornerLength);
  ctx.stroke();

  // Status text label
  ctx.fillStyle = strokeColor;
  ctx.font = "bold 14px sans-serif";
  const label = isSuccess ? "Verified" : "Detecting...";
  ctx.fillText(label, boxX + 6, boxY - 8 > 14 ? boxY - 8 : boxY + 20);

  ctx.restore();
};

// =========================================================
// Liveness Detection
// =========================================================

const initLivenessDetection = async () => {
  instructionText.value = `${t("ai.modelPreparing")}...`;
  livenessSuccess.value = false;
  eyeClosed.value = false;
  blinkStartTime = 0;
  clearOverlayCanvas();

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
        outputFaceBlendshapes: true,
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

const detectLivenessLoop = () => {
  if (!videoRef.value || !isOpen.value || capturedImageUrl.value) return;

  if (faceLandmarker && videoRef.value.readyState >= 2) {
    const startTimeMs = performance.now();
    const results = faceLandmarker.detectForVideo(videoRef.value, startTimeMs);
    const landmarks = results.faceLandmarks?.[0];
    const blendshapes = results.faceBlendshapes?.[0]?.categories;

    const bounds = landmarks ? getFaceBounds(landmarks) : null;
    drawFaceBox(bounds, livenessSuccess.value);

    if (blendshapes && !livenessSuccess.value) {
      const blinkLeft = blendshapes.find((b) => b.categoryName === "eyeBlinkLeft")?.score || 0;
      const blinkRight = blendshapes.find((b) => b.categoryName === "eyeBlinkRight")?.score || 0;

      const isClosed = blinkLeft > 0.45 && blinkRight > 0.45;
      const isOpenEye = blinkLeft < 0.35 && blinkRight < 0.35;

      if (isClosed && !eyeClosed.value) {
        // 1. เริ่มจับเวลาตอนหลับตา
        eyeClosed.value = true;
        blinkStartTime = performance.now();
        instructionText.value = t("faceDetection.canOpenEyes");
      } else if (isOpenEye && eyeClosed.value) {
        // 2. คำนวณระยะเวลาหลับตา
        const blinkDuration = performance.now() - blinkStartTime;

        // 3. กรองช่วงเวลาการกะพริบตาธรรมชาติ
        if (blinkDuration > 50 && blinkDuration < 1000) {
          livenessSuccess.value = true;
          drawFaceBox(bounds, true);
          instructionText.value = t("faceDetection.detectSuccess");

          setTimeout(async () => {
            await takePicture();
          }, 150);
          return;
        } else {
          eyeClosed.value = false;
          blinkStartTime = 0;
          instructionText.value = t("faceDetection.livenessError");
        }
      }
    }
  }

  animationFrameId = requestAnimationFrame(detectLivenessLoop);
};

// =========================================================
// Capture & Actions
// =========================================================

const takePicture = async () => {
  if (!videoRef.value) return;
  const blob = await captureImage();
  if (blob) {
    capturedBlob.value = blob;
    capturedImageUrl.value = URL.createObjectURL(blob);
  }
  clearOverlayCanvas();
  stopCamera();
  cancelAnimationFrame(animationFrameId);
};

const retake = async () => {
  if (capturedImageUrl.value) {
    URL.revokeObjectURL(capturedImageUrl.value);
  }
  capturedBlob.value = null;
  capturedImageUrl.value = null;
  clearOverlayCanvas();
  await initCamera();
};

const confirmAndSend = () => {
  if (capturedBlob.value && capturedImageUrl.value) {
    emit("capture", capturedBlob.value);
    onClose();
  }
};

const onClose = () => {
  if (capturedImageUrl.value) {
    URL.revokeObjectURL(capturedImageUrl.value);
  }
  capturedBlob.value = null;
  capturedImageUrl.value = null;
  clearOverlayCanvas();
  stopCamera();
  cancelAnimationFrame(animationFrameId);
  emit("close");
};

onMounted(() => {
  initCamera();
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId);
  stopCamera();
  clearOverlayCanvas();
  if (capturedImageUrl.value) {
    URL.revokeObjectURL(capturedImageUrl.value);
  }
  faceLandmarker?.close();
  faceLandmarker = null;
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

        <!-- Live streaming camera -->
        <video
          v-show="!capturedImageUrl && !error && !isLoading"
          ref="videoRef"
          autoplay
          playsinline
          @loadeddata="onVideoLoaded"
          class="w-full h-full object-cover transform -scale-x-100"
        />

        <!-- Focus Box Overlay Canvas -->
        <canvas
          v-show="checkLiveness && !capturedImageUrl && !error && !isLoading"
          ref="overlayCanvasRef"
          class="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
        />

        <!-- Preview of photos -->
        <img
          v-if="capturedImageUrl"
          :src="capturedImageUrl"
          class="w-full h-full object-cover"
        />

        <!-- Overlay for Liveness Status -->
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
