export const useCamera = () => {
  const videoRef = ref<HTMLVideoElement | null>(null)
  const stream = ref<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      stream.value = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      })
      if (videoRef.value) {
        videoRef.value.srcObject = stream.value
      }
    } catch (err) {
      console.error('Error accessing webcam: ', err)
      throw new Error('The camera is inaccessible.')
    }
  }

  const stopCamera = () => {
    if (stream.value) {
      stream.value.getTracks().forEach(track => track.stop())
    }
  }

  const captureImage = (): Blob | null => {
    if (!videoRef.value) return null

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.value.videoWidth
    canvas.height = videoRef.value.videoHeight
    const ctx = canvas.getContext('2d')

    if (!ctx) return null

    ctx.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)

    // Safety check for data URL format
    const parts = dataUrl.split(',')
    if (parts.length !== 2) {
      console.error('Invalid data URL format')
      return null
    }

    const base64Data = parts[1]
    if (!base64Data) {
      console.error('No base64 data found in data URL')
      return null
    }

    try {
      const byteString = atob(base64Data)
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      return new Blob([ab], { type: 'image/jpeg' })
    } catch (err) {
      console.error('Error converting image data:', err)
      return null
    }
  }

  // Alternative: Async version using toBlob (recommended)
  const captureImageAsync = async (): Promise<Blob | null> => {
    if (!videoRef.value) return null

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.value.videoWidth
    canvas.height = videoRef.value.videoHeight
    const ctx = canvas.getContext('2d')

    if (!ctx) return null

    ctx.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height)

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob)
      }, 'image/jpeg', 0.9)
    })
  }

  return {
    videoRef,
    startCamera,
    stopCamera,
    captureImage,
    captureImageAsync // Recommended version
  }
}
