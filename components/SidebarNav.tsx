'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderOpen, Bell, Calendar, Settings  } from 'lucide-react';


export default function SidebarNav() {
  const pathname = usePathname();

  function isActive(path: string) {
    if (path === '/') return pathname === '/';
    return pathname === path || pathname.startsWith(path + '/');
  }

  function navClass(path: string) {
    return `flex flex-col items-center gap-1 px-2 py-2.5 text-xs rounded-lg mx-4 transition-colors ${
      isActive(path)
        ? 'bg-gray-bar font-bold text-white'
        : 'text-white hover:bg-gray-bar hover:text-white'
    }`;
  }

  return (
    <aside className="w-30 bg-gray-bg border-r border-slate-200 flex flex-col shrink-0">

      {/* Brand */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center justify-center">
          <Link href="/"><img src="/favicon.ico" alt="lito.ai" className="w-12 h-12" /></Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 py-3 flex-1">
        <Link href="/" className={navClass('/')}><FolderOpen /> Dashboard</Link>
        <Link href="/inprogress" className={navClass('/inprogress')}><Bell /> Analytics</Link>
        <Link href="/exported" className={navClass('/exported')}><Calendar /> Portfolio</Link>
        <Link href="/exported" className={navClass('/exported')}><Calendar /> Data Library</Link>

        <div className="flex-1" />

        <Link href="/settings" className={navClass('/settings')}><Settings /> Settings</Link>
        <Link href="/settings" className={navClass('/settings')}><Settings /> Get Help</Link>
        <Link href="/settings" className={navClass('/settings')}><Settings /> Team</Link>
        <Link href="/settings" className={navClass('/settings')}><Settings /> Icon</Link>
      </nav>

    </aside>
  );
}
