import { permissions, Roles } from './permissions';

export interface ACLEntry {
  path: string;
  permissions: permissions[];
  minRole: Roles;
}

export const ACL: ACLEntry[] = [
  {
    path: '/dashboard/products',
    permissions: [permissions.createProduct],
    minRole: Roles.mod,
  },
  {
    path: '/dashboard/products/[id]',
    permissions: [
      permissions.deleteProduct,
      permissions.editProduct,
      permissions.readProduct,
    ],
    minRole: Roles.mod,
  },
  {
    path: '/dashboard/customers',
    permissions: [permissions.createCustomer],
    minRole: Roles.mod,
  },
  {
    path: '/dashboard/customers/[id]',
    permissions: [
      permissions.deleteCustomer,
      permissions.editCustomer,
      permissions.readCustomer,
    ],
    minRole: Roles.mod,
  },
  {
    path: '/dashboard/manufacturers',
    permissions: [permissions.createCustomer],
    minRole: Roles.mod,
  },
  {
    path: '/dashboard/manufacturers/[id]',
    permissions: [
      permissions.editManufacturer,
      permissions.deleteManufacturer,
      permissions.readManufacturer,
    ],
    minRole: Roles.mod,
  },
  {
    path: '/dashboard/purchaseOrders',
    permissions: [permissions.createPurchaseOrder],
    minRole: Roles.mod,
  },
  {
    path: '/dashboard/purchaseOrders/[id]',
    permissions: [
      permissions.editPurchaseOrder,
      permissions.deletePurchaseOrder,
      permissions.readPurchaseOrder,
    ],
    minRole: Roles.mod,
  },
  {
    path: '/dashboard/orders/[id]',
    permissions: [
      permissions.editOrder,
      permissions.deleteOrder,
      permissions.readOrder,
    ],
    minRole: Roles.user,
  },
  {
    path: '/dashboard/orders',
    permissions: [permissions.createOrder, permissions.readOrder],
    minRole: Roles.user,
  },
];
