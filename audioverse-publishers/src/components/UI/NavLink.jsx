'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Drop-in replacement for react-router's NavLink, backed by next/link.
 * Supports the two APIs the migrated music site uses:
 *   - `className` as a string, or as a function receiving `{ isActive }`
 *   - `to` (react-router style); `href` also accepted
 * Query strings in `to` are ignored when computing the active state.
 */
export default function NavLink({ to, href, className, children, end = false, ...rest }) {
  const target = to ?? href ?? '#';
  const pathname = usePathname();
  const targetPath = String(target).split('?')[0].split('#')[0];

  const isActive =
    targetPath === '/' || end
      ? pathname === targetPath
      : pathname === targetPath || pathname.startsWith(targetPath + '/');

  const resolvedClassName =
    typeof className === 'function' ? className({ isActive }) : className;

  return (
    <Link href={target} className={resolvedClassName} aria-current={isActive ? 'page' : undefined} {...rest}>
      {children}
    </Link>
  );
}
