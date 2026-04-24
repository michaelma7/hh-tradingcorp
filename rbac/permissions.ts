export enum Roles {
  admin = 'admin',
  mod = 'mod',
  user = 'user',
}

export const hierarchy = ['user', 'mod', 'admin'];

export enum permissions {
  readCustomer = 'read:customer',
  createCustomer = 'create:customer',
  editCustomer = 'edit:customer',
  deleteCustomer = 'delete:customer',

  readProduct = 'read:product',
  createProduct = 'create:product',
  editProduct = 'edit:product',
  deleteProduct = 'delete:product',

  readManufacturer = 'read:manufacturer',
  createManufacturer = 'create:manufacturer',
  editManufacturer = 'edit:manufacturer',
  deleteManufacturer = 'delete:manufacturer',

  readOrder = 'read:order',
  createOrder = 'create:order',
  editOrder = 'edit:order',
  deleteOrder = 'delete:order',

  readPurchaseOrder = 'read:purchaseOrder',
  createPurchaseOrder = 'create:purchaseOrder',
  editPurchaseOrder = 'edit:purchaseOrder',
  deletePurchaseOrder = 'delete:purchaseOrder',

  readUser = 'read:user',
  createUser = 'create:user',
  editUser = 'edit:user',
  deleteUser = 'delete:user',
}

export const rolePermissions = {
  [Roles.user]: [
    permissions.readOrder,
    permissions.readUser,
    permissions.editUser,
    permissions.editOrder,
    permissions.readProduct,
  ],
  [Roles.mod]: [
    permissions.readCustomer,
    permissions.createCustomer,
    permissions.editCustomer,
    permissions.readManufacturer,
    permissions.editManufacturer,
    permissions.createManufacturer,
    permissions.readOrder,
    permissions.editOrder,
    permissions.createOrder,
    permissions.deleteOrder,
    permissions.readUser,
    permissions.editUser,
    permissions.readProduct,
    permissions.createProduct,
    permissions.editProduct,
    permissions.readPurchaseOrder,
    permissions.createPurchaseOrder,
    permissions.editPurchaseOrder,
    permissions.deletePurchaseOrder,
  ],
  [Roles.admin]: [...Object.values(permissions)],
};

export const roleRoutes = {
  [Roles.user]: ['/', '/dashboard', '/dashboard/products', '/dashboard/orders'],
  [Roles.mod]: ['/', '/dashboard', '/dashboard/products', '/dashboard/orders'],
  [Roles.admin]: ['/users'],
};

export function hasPermission(role: Roles, action: permissions): boolean {
  return rolePermissions[role]?.includes(action) ?? false;
}

export function isAtLeastRole(role: Roles, minRole: Roles): boolean {
  return hierarchy.indexOf(role) >= hierarchy.indexOf(minRole);
}

export function getPermissions(role: Roles): permissions[] {
  return rolePermissions[role] ?? [];
}
