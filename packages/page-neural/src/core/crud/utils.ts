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
 * @returns
 */
export function generateContainer({
  id,
  name,
  subType,
  parentId = '',
}: {
  id?: string;
  name?: string;
  subType: string;
  parentId?: string;
}): Container {
  return {
    id: id || generateId(),
    name: name || '容器',
    type: 'container',
    subType,
    parentId,
    props: {
      borderWidth: 0,
      borderStyle: 'none',
      borderColor: '',
    },
    children: [],
  };
}
