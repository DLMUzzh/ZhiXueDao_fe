const IMAGE_TYPE_MAP: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

export const IMAGE_ACCEPT = Object.keys(IMAGE_TYPE_MAP)
export const MAX_IMAGE_COUNT = 15
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024

export function getFileExtension(file: File) {
  return IMAGE_TYPE_MAP[file.type] ?? `.${file.name.split('.').pop()?.toLowerCase() ?? 'jpg'}`
}

export function validateImageFile(file: File) {
  if (!IMAGE_ACCEPT.includes(file.type)) {
    return '仅支持 JPG、PNG、WebP 格式图片'
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return '单张图片大小不能超过 10MB'
  }

  return ''
}
