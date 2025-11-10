/**
 * Create a cropped image from the source image and crop area
 * @param {string} imageSrc - Source image URL (data URL)
 * @param {Object} pixelCrop - Crop area in pixels {x, y, width, height}
 * @param {number} maxWidth - Maximum width for the output
 * @param {number} maxHeight - Maximum height for the output
 * @param {number} quality - JPEG quality (0-1)
 * @returns {Promise<Blob>} - Cropped image as Blob
 */
export const getCroppedImg = (imageSrc, pixelCrop, maxWidth = 1200, maxHeight = 1200, quality = 0.9) => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.src = imageSrc

    image.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      // Calculate dimensions maintaining aspect ratio
      let outputWidth = pixelCrop.width
      let outputHeight = pixelCrop.height

      // Scale down if larger than max dimensions
      if (outputWidth > maxWidth || outputHeight > maxHeight) {
        const scale = Math.min(maxWidth / outputWidth, maxHeight / outputHeight)
        outputWidth = Math.floor(outputWidth * scale)
        outputHeight = Math.floor(outputHeight * scale)
      }

      canvas.width = outputWidth
      canvas.height = outputHeight

      // Draw the cropped image
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        outputWidth,
        outputHeight
      )

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Canvas to Blob conversion failed'))
          }
        },
        'image/jpeg',
        quality
      )
    }

    image.onerror = () => {
      reject(new Error('Failed to load image'))
    }
  })
}
