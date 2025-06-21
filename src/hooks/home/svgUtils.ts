// src/components/SuperBannerFor/utils/svgUtils.ts

/**
 * Tạo một chuỗi path SVG cho một đường cong bậc hai (Quadratic Bézier curve).
 * @param startX Tọa độ X điểm bắt đầu.
 * @param startY Tọa độ Y điểm bắt đầu.
 * @param endX Tọa độ X điểm kết thúc.
 * @param endY Tọa độ Y điểm kết thúc.
 * @param arcIntensity Độ cong của đường bay, số âm sẽ cong "lên trên" cho bản đồ.
 * @returns Chuỗi path data cho thuộc tính `d` của thẻ <path>.
 */
export const createArcPath = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  arcIntensity: number = -0.2
): string => {
  const midX = (startX + endX) / 2
  const midY = (startY + endY) / 2
  const dx = endX - startX
  const dy = endY - startY
  const controlX = midX + arcIntensity * dy
  const controlY = midY - arcIntensity * dx
  return `M ${startX},${startY} Q ${controlX},${controlY} ${endX},${endY}`
}