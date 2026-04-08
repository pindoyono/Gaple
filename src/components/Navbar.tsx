'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: '🏠 Beranda' },
  { href: '/asisten', label: '🎯 Asisten' },
  { href: '/riwayat', label: '📋 Riwayat' },
  { href: '/analitik', label: '📊 Analitik' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 h-full text-xs gap-0.5 transition-colors
                ${active ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
