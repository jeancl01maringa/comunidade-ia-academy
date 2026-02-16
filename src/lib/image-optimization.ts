/**
 * Utility to compress images and convert them to WebP format on the client side.
 * This reduces upload size and optimizes gallery performance.
 */
export async function compressImage(
    file: File,
    options = { maxWidth: 1920, quality: 0.8 }
): Promise<{ blob: Blob; base64: string }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (event) => {
            const img = new Image()
            img.src = event.target?.result as string
            img.onload = () => {
                const canvas = document.createElement("canvas")
                let width = img.width
                let height = img.height

                // Resize logic: maintain aspect ratio
                if (width > options.maxWidth) {
                    height = (options.maxWidth * height) / width
                    width = options.maxWidth
                }

                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext("2d")
                if (!ctx) {
                    reject(new Error("Could not get canvas context"))
                    return
                }

                ctx.drawImage(img, 0, 0, width, height)

                // Convert to WebP with specific quality
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error("Canvas toBlob failed"))
                            return
                        }

                        const readerWebp = new FileReader()
                        readerWebp.readAsDataURL(blob)
                        readerWebp.onloadend = () => {
                            resolve({
                                blob,
                                base64: readerWebp.result as string,
                            })
                        }
                    },
                    "image/webp",
                    options.quality
                )
            }
            img.onerror = (err) => reject(err)
        }
        reader.onerror = (err) => reject(err)
    })
}
