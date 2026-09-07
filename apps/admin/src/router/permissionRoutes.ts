export default [
  1,
  101,
  10101,
  10102,
  10103,
  '10103:add',
  10104,
  1010401,
  1010402,
  '1010401:add', // 按钮权限
  // '1010401:update',
  '1010401:delete',
  '1010401:query',
  1010403,
  2,
  201,
  202,
  203,
];

// 以路由名作为权限路由匹配字段
export const permissionRouteNames = [
  'autoroutes',
  'autoroutes_router',
  'autoroutes_router_introduce',
  'autoroutes_router_config',
  'autoroutes_router_meta',
  'autoroutes_router_meta:add',
  'autoroutes_router_group',
  'autoroutes_router_group_permission',
  'autoroutes_router_group_permission:add',
  // 'autoroutes_router_group_permission:delete',
  'autoroutes_router_group_permission:update', // 按钮权限
  'autoroutes_router_group_permission:query',
  'myAsyncPage',
  'autoroutes_router_group_hidden',
  'packages',
  'packages_jsonschema',
  'packages_neural',
  'packages_grittyui',
];
