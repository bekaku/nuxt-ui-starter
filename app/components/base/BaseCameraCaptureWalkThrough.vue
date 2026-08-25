<script setup lang="ts">
import {
  ref,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue";

import {
  FilesetResolver,
  FaceLandmarker,
} from "@mediapipe/tasks-vision";

const props = withDefaults(
  defineProps<{
    /**
     * Legacy prop.
     * เมื่อ true จะทำงานเป็น Walk-through Auto Capture
     * ไม่ต้อง blink
     */
    checkLiveness?: boolean;

    /**
     * Walk-through mode
     * ตรวจจับหลายคนและ capture อัตโนมัติ
     */
    walkThrough?: boolean;
  }>(),
  {
    checkLiveness: false,
    walkThrough: false,
  },
);

const emit = defineEmits<{
  /**
   * Capture ได้ Blob อย่างเดียว
   */
  capture: [file: Blob];

  close: [];
}>();

const { t } = useLang();

const {
  videoRef,
  startCamera,
  stopCamera,
  captureImage,
} = useCamera();

const isOpen = defineModel<boolean>("open");

// =========================================================
// Mode
// =========================================================

/**
 * รองรับทั้ง prop ใหม่และ prop เดิม
 *
 * walkThrough=true
 * หรือ
 * checkLiveness=true
 *
 * จะเข้า Multi Face Walk-through mode
 */
const isWalkThrough = computed(
  () =>
    props.walkThrough ||
    props.checkLiveness,
);

// =========================================================
// State
// =========================================================

const isLoading = ref(false);

const error = ref<string | null>(null);

// Normal camera mode only
const capturedBlob = ref<Blob | null>(null);
const capturedImageUrl =
  ref<string | null>(null);

const devices =
  ref<MediaDeviceInfo[]>([]);

const currentDeviceIndex = ref(0);

// =========================================================
// Walk-through / Face Detection
// =========================================================

const isAiLoading = ref(false);

const instructionText = ref(
  t("faceDetection.lookAtCamera"),
);

const livenessSuccess = ref(false);

let faceLandmarker:
  | FaceLandmarker
  | null = null;

let animationFrameId = 0;

// =========================================================
// Multi Face Tracking
// =========================================================

type FaceTrack = {
  id: number;

  centerX: number;
  centerY: number;

  width: number;
  height: number;

  /**
   * Number of consecutive stable frames
   */
  stableFrames: number;

  /**
   * Capture completed for this person
   */
  captured: boolean;

  /**
   * Prevent duplicate capture while async capture
   * is running
   */
  capturing: boolean;

  /**
   * Last time capture happened
   */
  lastCapturedAt: number;

  /**
   * Last time this face was detected
   */
  lastSeen: number;
};

const faceTracks =
  new Map<number, FaceTrack>();

let nextFaceTrackId = 1;

// =========================================================
// Configuration
// =========================================================

/**
 * Maximum faces detected simultaneously
 */
const MAX_FACES = 5;

/**
 * Distance used for matching face between frames.
 *
 * Coordinates are normalized 0-1.
 */
const FACE_MATCH_DISTANCE = 0.15;

/**
 * Remove tracking when face disappears
 */
const FACE_TRACK_TIMEOUT = 1500;

/**
 * Minimum face size.
 *
 * 0.12 = roughly 12% of camera frame
 */
const MIN_FACE_SIZE = 0.12;

/**
 * Number of continuous frames required
 * before auto capture.
 */
const REQUIRED_STABLE_FRAMES = 3;

/**
 * Minimum time before the same tracking
 * can be captured again.
 */
const CAPTURE_COOLDOWN = 2000;

// =========================================================
// Camera
// =========================================================

const initCamera = async () => {
  await nextTick();

  try {
    isLoading.value = true;
    error.value = null;

    await startCamera();

    if (
      navigator.mediaDevices?.enumerateDevices
    ) {
      const allDevices =
        await navigator.mediaDevices
          .enumerateDevices();

      devices.value =
        allDevices.filter(
          (device) =>
            device.kind ===
            "videoinput",
        );
    }
  } catch (err: unknown) {
    console.error(
      "Camera initialization failed:",
      err,
    );

    error.value =
      t("faceDetection.cameraError");
  } finally {
    isLoading.value = false;
  }
};

// =========================================================
// Video Loaded
// =========================================================

const onVideoLoaded = async () => {
  if (
    isWalkThrough.value &&
    !capturedImageUrl.value
  ) {
    await initFaceDetection();
  }
};

// =========================================================
// Switch Camera
// =========================================================

const switchCamera = async () => {
  if (devices.value.length < 2) {
    return;
  }

  currentDeviceIndex.value =
    (currentDeviceIndex.value + 1) %
    devices.value.length;

  resetFaceTracking();

  await startCamera();
};

// =========================================================
// Face Center / Bounding Box
// =========================================================

const getFaceBounds = (
  landmarks: Array<{
    x: number;
    y: number;
  }>,
) => {
  if (!landmarks?.length) {
    return {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
      centerX: 0,
      centerY: 0,
      width: 0,
      height: 0,
    };
  }

  let minX = 1;
  let maxX = 0;

  let minY = 1;
  let maxY = 0;

  for (const point of landmarks) {
    minX = Math.min(
      minX,
      point.x,
    );

    maxX = Math.max(
      maxX,
      point.x,
    );

    minY = Math.min(
      minY,
      point.y,
    );

    maxY = Math.max(
      maxY,
      point.y,
    );
  }

  const width = maxX - minX;
  const height = maxY - minY;

  return {
    minX,
    maxX,
    minY,
    maxY,

    centerX:
      (minX + maxX) / 2,

    centerY:
      (minY + maxY) / 2,

    width,
    height,
  };
};

// =========================================================
// Find Existing Face Track
// =========================================================

const getNearestFaceTrack = (
  centerX: number,
  centerY: number,
  matchedIds: Set<number>,
): FaceTrack | null => {
  let nearestTrack:
    | FaceTrack
    | null = null;

  let nearestDistance = Infinity;

  for (const track of faceTracks.values()) {
    if (matchedIds.has(track.id)) {
      continue;
    }

    const dx =
      track.centerX - centerX;

    const dy =
      track.centerY - centerY;

    const distance = Math.sqrt(
      dx * dx + dy * dy,
    );

    if (
      distance <
        nearestDistance &&
      distance <=
        FACE_MATCH_DISTANCE
    ) {
      nearestTrack = track;
      nearestDistance = distance;
    }
  }

  return nearestTrack;
};

// =========================================================
// Create Face Track
// =========================================================

const createFaceTrack = (
  centerX: number,
  centerY: number,
  width: number,
  height: number,
): FaceTrack => {
  const track: FaceTrack = {
    id: nextFaceTrackId++,

    centerX,
    centerY,

    width,
    height,

    stableFrames: 0,

    captured: false,
    capturing: false,

    lastCapturedAt: 0,

    lastSeen:
      performance.now(),
  };

  faceTracks.set(
    track.id,
    track,
  );

  console.log(
    `[WalkThrough] New face #${track.id}`,
  );

  return track;
};

// =========================================================
// Reset Face Tracking
// =========================================================

const resetFaceTracking = () => {
  faceTracks.clear();

  nextFaceTrackId = 1;
};

// =========================================================
// Capture Face Only
// =========================================================

const captureFace = async (
  landmarks: Array<{
    x: number;
    y: number;
  }>,
): Promise<Blob | null> => {
  const video = videoRef.value;

  if (!video) {
    return null;
  }

  if (
    video.videoWidth <= 0 ||
    video.videoHeight <= 0
  ) {
    return null;
  }

  if (!landmarks?.length) {
    return null;
  }

  // =======================================================
  // Calculate face bounding box
  // =======================================================

  const bounds =
    getFaceBounds(landmarks);

  const {
    minX,
    maxX,
    minY,
    maxY,
    width,
    height,
  } = bounds;

  if (
    width <= 0 ||
    height <= 0
  ) {
    return null;
  }

  // =======================================================
  // Add padding around face
  // =======================================================

  const paddingX =
    width * 0.35;

  const paddingY =
    height * 0.45;

  const cropMinX =
    Math.max(
      0,
      minX - paddingX,
    );

  const cropMaxX =
    Math.min(
      1,
      maxX + paddingX,
    );

  const cropMinY =
    Math.max(
      0,
      minY - paddingY,
    );

  const cropMaxY =
    Math.min(
      1,
      maxY + paddingY,
    );

  // =======================================================
  // Convert normalized coordinate to pixels
  // =======================================================

  const sx = Math.floor(
    cropMinX *
      video.videoWidth,
  );

  const sy = Math.floor(
    cropMinY *
      video.videoHeight,
  );

  const sw = Math.floor(
    (cropMaxX - cropMinX) *
      video.videoWidth,
  );

  const sh = Math.floor(
    (cropMaxY - cropMinY) *
      video.videoHeight,
  );

  if (
    sw <= 0 ||
    sh <= 0
  ) {
    return null;
  }

  // =======================================================
  // Canvas
  // =======================================================

  const canvas =
    document.createElement(
      "canvas",
    );

  canvas.width = sw;
  canvas.height = sh;

  const ctx =
    canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  // =======================================================
  // Draw cropped face
  // =======================================================

  ctx.drawImage(
    video,
    sx,
    sy,
    sw,
    sh,
    0,
    0,
    sw,
    sh,
  );

  // =======================================================
  // Canvas -> Blob
  // =======================================================

  return new Promise(
    (resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.92,
      );
    },
  );
};

// =========================================================
// Capture + Emit One Person
// =========================================================

const captureAndEmitFace = async (
  track: FaceTrack,
  landmarks: Array<{
    x: number;
    y: number;
  }>,
) => {
  if (
    track.captured ||
    track.capturing
  ) {
    return;
  }

  const now = performance.now();

  // =======================================================
  // Cooldown
  // =======================================================

  if (
    now - track.lastCapturedAt <
    CAPTURE_COOLDOWN
  ) {
    return;
  }

  track.capturing = true;

  try {
    const blob =
      await captureFace(
        landmarks,
      );

    if (!blob) {
      return;
    }

    // =====================================================
    // Mark captured
    // =====================================================

    track.captured = true;

    track.lastCapturedAt =
      performance.now();

    // =====================================================
    // Emit Blob only
    // =====================================================

    emit(
      "capture",
      blob,
    );

    console.log(
      `[WalkThrough] Person #${track.id} captured`,
      {
        type: blob.type,
        size: blob.size,
      },
    );
  } catch (err) {
    console.error(
      "Face capture failed:",
      err,
    );
  } finally {
    track.capturing = false;
  }
};

// =========================================================
// Face Detection Init
// =========================================================

const initFaceDetection = async () => {
  instructionText.value =
    t("ai.modelPreparing") + "...";

  livenessSuccess.value = false;

  resetFaceTracking();

  // =======================================================
  // Already initialized
  // =======================================================

  if (!faceLandmarker) {
    isAiLoading.value = true;

    try {
      const filesetResolver =
        await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm",
        );

      faceLandmarker =
        await FaceLandmarker.createFromOptions(
          filesetResolver,
          {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",

              delegate: "GPU",
            },

            /**
             * Walk-through ไม่ใช้ blink
             * ดังนั้น blendshapes ไม่จำเป็น
             */
            outputFaceBlendshapes: false,

            runningMode: "VIDEO",

            /**
             * Multiple faces
             */
            numFaces: MAX_FACES,
          },
        );
    } catch (err) {
      console.error(
        "Face Landmarker initialization failed:",
        err,
      );

      error.value =
        t("ai.modelLoadFailed");

      isAiLoading.value = false;

      return;
    }

    isAiLoading.value = false;
  }

  instructionText.value =
    t(
      "faceDetection.instruction1",
    );

  detectWalkThroughLoop();
};

// =========================================================
// Walk-through Detection Loop
// =========================================================

const detectWalkThroughLoop =
  () => {
    if (
      !videoRef.value ||
      !isOpen.value ||
      !isWalkThrough.value
    ) {
      return;
    }

    if (
      faceLandmarker &&
      videoRef.value.readyState >= 2
    ) {
      const now =
        performance.now();

      // ===================================================
      // Detect faces
      // ===================================================

      const results =
        faceLandmarker.detectForVideo(
          videoRef.value,
          now,
        );

      const faceLandmarks =
        results.faceLandmarks ??
        [];

      // Tracks matched in current frame
      const matchedTrackIds =
        new Set<number>();

      // ===================================================
      // Process every face
      // ===================================================

      for (
        let faceIndex = 0;
        faceIndex <
        faceLandmarks.length;
        faceIndex++
      ) {
        const landmarks =
          faceLandmarks[
            faceIndex
          ];

        if (!landmarks) {
          continue;
        }

        // =================================================
        // Face bounds
        // =================================================

        const bounds =
          getFaceBounds(
            landmarks,
          );

        // =================================================
        // Find existing track
        // =================================================

        let track =
          getNearestFaceTrack(
            bounds.centerX,
            bounds.centerY,
            matchedTrackIds,
          );

        // =================================================
        // Create new track
        // =================================================

        if (!track) {
          track =
            createFaceTrack(
              bounds.centerX,
              bounds.centerY,
              bounds.width,
              bounds.height,
            );
        }

        matchedTrackIds.add(
          track.id,
        );

        // =================================================
        // Update track
        // =================================================

        track.centerX =
          bounds.centerX;

        track.centerY =
          bounds.centerY;

        track.width =
          bounds.width;

        track.height =
          bounds.height;

        track.lastSeen = now;

        // =================================================
        // Already captured
        // =================================================

        if (track.captured) {
          continue;
        }

        // =================================================
        // Face quality
        // =================================================

        const faceSize =
          Math.max(
            bounds.width,
            bounds.height,
          );

        const isLargeEnough =
          faceSize >=
          MIN_FACE_SIZE;

        // =================================================
        // Face position
        //
        // ไม่จำเป็นต้องตรงกลางมากเกินไป
        // =================================================

        const isInCamera =
          bounds.centerX >
            0.05 &&
          bounds.centerX <
            0.95 &&
          bounds.centerY >
            0.05 &&
          bounds.centerY <
            0.95;

        // =================================================
        // Stable detection
        // =================================================

        if (
          isLargeEnough &&
          isInCamera
        ) {
          track.stableFrames++;
        } else {
          track.stableFrames = 0;
        }

        // =================================================
        // Capture after stable frames
        // =================================================

        if (
          track.stableFrames >=
            REQUIRED_STABLE_FRAMES &&
          !track.capturing
        ) {
          // Reset immediately to prevent
          // duplicate queueing
          track.stableFrames = 0;

          void captureAndEmitFace(
            track,
            landmarks,
          );
        }
      }

      // ===================================================
      // Remove disappeared faces
      // ===================================================

      for (
        const [
          id,
          track,
        ] of faceTracks
      ) {
        if (
          now - track.lastSeen >
          FACE_TRACK_TIMEOUT
        ) {
          faceTracks.delete(id);

          console.log(
            `[WalkThrough] Face #${id} removed`,
          );
        }
      }

      // ===================================================
      // Status
      // ===================================================

      if (
        faceLandmarks.length === 0
      ) {
        instructionText.value =
          t(
            "faceDetection.lookAtCamera",
          );

        livenessSuccess.value =
          false;
      } else {
        const waitingFaces =
          [
            ...faceTracks.values(),
          ].filter(
            (track) =>
              !track.captured &&
              now -
                track.lastSeen <
                FACE_TRACK_TIMEOUT,
          );

        if (
          waitingFaces.length > 0
        ) {
          instructionText.value =
            `${waitingFaces.length} ${
              waitingFaces.length ===
              1
                ? "person"
                : "people"
            }`;

          livenessSuccess.value =
            false;
        } else {
          instructionText.value =
            t(
              "faceDetection.detectSuccess",
            );

          livenessSuccess.value =
            true;
        }
      }
    }

    // =====================================================
    // Next frame
    // =====================================================

    animationFrameId =
      requestAnimationFrame(
        detectWalkThroughLoop,
      );
  };

// =========================================================
// Normal Camera Capture
// =========================================================

const takePicture = async () => {
  if (!videoRef.value) {
    return;
  }

  const blob =
    await captureImage();

  if (blob) {
    capturedBlob.value =
      blob;

    capturedImageUrl.value =
      URL.createObjectURL(
        blob,
      );
  }

  stopCamera();

  cancelAnimationFrame(
    animationFrameId,
  );
};

// =========================================================
// Retake
// =========================================================

const retake = async () => {
  // Revoke previous object URL
  if (
    capturedImageUrl.value
  ) {
    URL.revokeObjectURL(
      capturedImageUrl.value,
    );
  }

  capturedBlob.value =
    null;

  capturedImageUrl.value =
    null;

  resetFaceTracking();

  await initCamera();
};

// =========================================================
// Confirm Normal Capture
// =========================================================

const confirmAndSend = () => {
  if (
    capturedBlob.value
  ) {
    /**
     * Normal mode ก็ emit Blob อย่างเดียว
     */
    emit(
      "capture",
      capturedBlob.value,
    );

    onClose();
  }
};

// =========================================================
// Close
// =========================================================

const onClose = () => {
  if (
    capturedImageUrl.value
  ) {
    URL.revokeObjectURL(
      capturedImageUrl.value,
    );
  }

  capturedBlob.value = null;
  capturedImageUrl.value =
    null;

  resetFaceTracking();

  stopCamera();

  cancelAnimationFrame(
    animationFrameId,
  );

  emit("close");
};

// =========================================================
// Mounted
// =========================================================

onMounted(() => {
  initCamera();
});

// =========================================================
// Before Unmount
// =========================================================

onBeforeUnmount(() => {
  cancelAnimationFrame(
    animationFrameId,
  );

  stopCamera();

  resetFaceTracking();

  if (
    capturedImageUrl.value
  ) {
    URL.revokeObjectURL(
      capturedImageUrl.value,
    );
  }

  faceLandmarker?.close();

  faceLandmarker = null;
});
</script>

<template>
  <div>
    <UCard>
      <!-- ================================================= -->
      <!-- Header -->
      <!-- ================================================= -->

      <template #header>
        <div
          class="flex items-center justify-between"
        >
          <h3
            class="text-base font-semibold text-gray-900 dark:text-white"
          >
            {{
              isWalkThrough
                ? $t(
                    "faceDetection.modeLiveness",
                  )
                : $t(
                    "faceDetection.camera",
                  )
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

      <!-- ================================================= -->
      <!-- Camera -->
      <!-- ================================================= -->

      <div
        class="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center"
      >
        <!-- ================================================= -->
        <!-- Loading -->
        <!-- ================================================= -->

        <div
          v-if="
            isLoading ||
            isAiLoading
          "
          class="absolute inset-0 flex flex-col items-center justify-center gap-2 z-20 bg-gray-900/80"
        >
          <UIcon
            name="i-heroicons-arrow-path"
            class="w-8 h-8 animate-spin text-gray-400"
          />

          <span
            class="text-sm text-gray-300"
          >
            {{
              isAiLoading
                ? $t(
                    "faceDetection.modelLoading",
                  )
                : $t(
                    "faceDetection.cameraLoading",
                  )
            }}
          </span>
        </div>

        <!-- ================================================= -->
        <!-- Error -->
        <!-- ================================================= -->

        <div
          v-else-if="error"
          class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-red-500 p-4 text-center bg-gray-800 z-20"
        >
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="w-8 h-8"
          />

          <span
            class="text-sm"
          >
            {{ error }}
          </span>
        </div>

        <!-- ================================================= -->
        <!-- Live Camera -->
        <!-- ================================================= -->

        <video
          v-show="
            !capturedImageUrl &&
            !error &&
            !isLoading
          "
          ref="videoRef"
          autoplay
          playsinline
          @loadeddata="onVideoLoaded"
          class="w-full h-full object-cover transform -scale-x-100"
        />

        <!-- ================================================= -->
        <!-- Normal Camera Preview -->
        <!-- ================================================= -->

        <img
          v-if="
            capturedImageUrl &&
            !isWalkThrough
          "
          :src="
            capturedImageUrl
          "
          class="w-full h-full object-cover"
        />

        <!-- ================================================= -->
        <!-- Walk-through Status -->
        <!-- ================================================= -->

        <div
          v-if="
            isWalkThrough &&
            !isLoading &&
            !isAiLoading &&
            !error
          "
          class="absolute inset-x-0 bottom-4 text-center z-10 w-full flex justify-center px-4"
        >
          <UBadge
            :color="
              livenessSuccess
                ? 'success'
                : 'warning'
            "
            size="lg"
            class="shadow-lg px-4 py-2 text-sm"
          >
            {{
              instructionText
            }}
          </UBadge>
        </div>
      </div>

      <!-- ================================================= -->
      <!-- Footer -->
      <!-- ================================================= -->

      <template #footer>
        <div
          class="flex justify-center items-center gap-6"
        >
          <!-- ================================================= -->
          <!-- Switch Camera -->
          <!-- ================================================= -->

          <UButton
            v-if="
              !isWalkThrough &&
              !capturedImageUrl &&
              devices.length > 1
            "
            color="neutral"
            variant="soft"
            icon="i-heroicons-arrow-path-rounded-square"
            @click="switchCamera"
          >
            {{
              $t(
                "faceDetection.switchCamera",
              )
            }}
          </UButton>

          <!-- ================================================= -->
          <!-- Instructions -->
          <!-- ================================================= -->

          <div
            class="flex flex-col gap-2"
          >
            <span
              class="text-xs text-muted text-center"
            >
              {{
                isWalkThrough
                  ? $t(
                      "faceDetection.instruction1",
                    )
                  : $t(
                      "faceDetection.instruction2",
                    )
              }}
            </span>

            <div
              class="flex justify-center gap-2 mt-5"
            >
              <!-- ============================================= -->
              <!-- Normal Camera Mode -->
              <!-- ============================================= -->

              <UButton
                v-if="
                  !isWalkThrough &&
                  !capturedImageUrl
                "
                color="primary"
                @click="
                  takePicture
                "
                :disabled="
                  isLoading ||
                  !!error
                "
                icon="i-heroicons-camera"
              >
                {{
                  $t(
                    "faceDetection.takePicture",
                  )
                }}
              </UButton>

              <!-- ============================================= -->
              <!-- Normal Captured Image -->
              <!-- ============================================= -->

              <template
                v-if="
                  !isWalkThrough &&
                  capturedImageUrl
                "
              >
                <UButton
                  color="neutral"
                  variant="ghost"
                  @click="
                    retake
                  "
                >
                  {{
                    $t(
                      "faceDetection.retake",
                    )
                  }}
                </UButton>

                <UButton
                  color="success"
                  @click="
                    confirmAndSend
                  "
                  icon="i-heroicons-check"
                >
                  {{
                    $t(
                      "faceDetection.useThisImage",
                    )
                  }}
                </UButton>
              </template>

              <!-- ============================================= -->
              <!-- Walk-through -->
              <!-- ============================================= -->

              <template
                v-if="
                  isWalkThrough
                "
              >
                <span
                  class="text-xs text-muted text-center"
                >
                  Auto Capture
                </span>
              </template>
            </div>
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>
