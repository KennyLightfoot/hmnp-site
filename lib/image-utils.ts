/**
 * Generates a responsive image sizes attribute based on the container width
 * @param containerWidth The width of the container as a percentage or fixed value
 * @returns A sizes attribute string for the Image component
 */
export function getResponsiveSizes(containerWidth: string): string {
  // Convert percentage to decimal
  if (containerWidth.endsWith("%")) {
    const percentage = Number.parseInt(containerWidth) / 100
    return `
      (max-width: 640px) 100vw,
      (max-width: 768px) 100vw,
      (max-width: 1024px) ${Math.round(percentage * 100)}vw,
      ${Math.round(percentage * 1280)}px
    `.trim()
  }

  // Handle fixed width
  const width = Number.parseInt(containerWidth)
  return `
    (max-width: 640px) 100vw,
    (max-width: 768px) 100vw,
    (max-width: 1024px) ${width}px,
    ${width}px
  `.trim()
}

/**
 * Calculates the aspect ratio for an image
 * @param width Image width
 * @param height Image height
 * @returns CSS aspect-ratio value
 */
export function getAspectRatio(width: number, height: number): string {
  return `${width} / ${height}`
}

