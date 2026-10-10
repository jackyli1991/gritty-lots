import { CONTAINER_TYPE } from '@neural/const';
import type { Container } from '@neural/types';
import { v4 as uuidv4 } from 'uuid';

export function generateId() {
  return uuidv4();
}

/**
 * 生成容器
 * @param id  容器id
 * @param name  容器名称
 * @param subType  容器子类型
 * @param parentId  容器父id
 * @param props  容器属性
 * @returns
 */
export function generateContainer({
  id,
  name,
  subType,
  parentId = '',
  props,
}: {
  id?: string;
  name?: string;
  subType: string;
  parentId?: string;
  props?: Container['props'];
}): Container {
  return {
    id: id || generateId(),
    name: name || '容器',
    type: CONTAINER_TYPE,
    subType,
    parentId,
    props: {
      boxModel: {
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        border: { top: 0, right: 0, bottom: 0, left: 0, style: 'solid', color: '' },
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        width: 50,
        height: 50,
        borderRadius: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 },
        units: { margin: 'px', border: 'px', padding: 'px', width: '%', height: '%' },
        ...props,
      },
    },
    children: [],
  };
}
