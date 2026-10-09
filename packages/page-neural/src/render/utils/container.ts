/**
 * 生成容器样式
 * @param props 容器属性
 * @returns 容器样式
 */
export function generateContainerStyle(props: Record<string, any>): Record<string, any> {
  const style: Record<string, any> = {};

  // 背景颜色
  style.backgroundColor = props.backgroundColor;

  // 边框
  if (props.borderWidth && props.borderStyle && props.borderColor) {
    style.borderWidth = props.borderWidth + 'px';
    style.borderStyle = props.borderStyle;
    style.borderColor = props.borderColor;
  }
  // 圆角
  if (props.borderRadius) {
    style.borderRadius = props.borderRadius + 'px';
  }

  // 宽度
  if (props.width && props.widthUnit) {
    style.width = props.width + props.widthUnit;
  }
  // 高度
  if (props.height && props.heightUnit) {
    style.height = props.height + props.heightUnit;
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
