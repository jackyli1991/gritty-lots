/**
 * 生成容器样式
 * @param props 容器属性
 * @returns 容器样式
 */
export function generateContainerStyle(props: Record<string, any>): Record<string, any> {
  const style: Record<string, any> = {};

  // 背景颜色
  style.backgroundColor = props.backgroundColor;

  // 盒模型
  const { margin, border, padding, width, height, borderRadius, units } = props.boxModel;
  // 边框
  if (border) {
    const unit = units.border;
    const { style: borderStyle, top, right, bottom, left, color } = border;
    style.borderWidth = `${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}`;
    style.borderColor = color;
    style.borderStyle = borderStyle;
  }

  // padding
  if (padding) {
    const unit = units.padding;
    const { top, right, bottom, left } = padding;
    style.padding = `${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}`;
  }
  // margin
  if (margin) {
    const unit = units.margin;
    const { top, right, bottom, left } = margin;
    style.margin = `${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}`;
  }
  // 圆角
  if (borderRadius) {
    const unit = units.border;
    const { topLeft, topRight, bottomRight, bottomLeft } = borderRadius;
    style.borderRadius = `${topLeft}${unit} ${topRight}${unit} ${bottomRight}${unit} ${bottomLeft}${unit}`;
  }
  // 宽度
  if (width) {
    style.width = width + units.width;
  }
  // 高度
  if (height) {
    style.height = height + units.height;
  }
  return style;
}

/**
 * 生成容器类名
 * @param props 容器属性
 * @returns 容器类名
 */
export function generateContainerClass(props: Record<string, any>): string {
  return props.tailwindcss;
}
