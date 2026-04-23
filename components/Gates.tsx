'use client';

import { UserContext } from '@/providers/CurrentUserProvider';
import { Roles, permissions, hierarchy } from '@/rbac/permissions';
import { ReactNode, useContext } from 'react';

interface GateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface RoleGateProps extends GateProps {
  role?: string;
  minRole?: Roles;
}

// interface PermissionGateProps extends GateProps {
//   requires?: permissions | permissions[];
//   requiresAny?: permissions | permissions[];
// }

export default function RoleGate({
  children,
  fallback = null,
  role,
  minRole,
}: RoleGateProps) {
  const user = useContext(UserContext);
  if (!user) return <>{fallback}</>;
  if (role !== undefined) {
    if (hierarchy.indexOf(role) < hierarchy.indexOf(Roles[minRole!]))
      return <>{fallback}</>;
  }
  return <>{children}</>;
}

// export function PermissionGate({
//   children,
//   fallback = null,
//   requires,
//   requiresAny,
// }: PermissionGateProps) {
//   if (requires !== undefined) {
//     const perms = Array.isArray(requires) ? requires : [requires];
//   }
//   return <>{children}</>;
// }
