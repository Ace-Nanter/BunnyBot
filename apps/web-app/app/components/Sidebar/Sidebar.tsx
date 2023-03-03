'use client';

import { Bars4Icon, ClockIcon, HomeIcon } from '@heroicons/react/24/outline';
import { Guild } from '../../../models/guild';
import { APP_MODE, APP_NAME } from '../../config';
import GuildMenu from '../header/GuildMenu';
import MobileSidebar from './MobileSidebar';

export type Navigation = {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
  current: boolean;
};

const navigation: Navigation[] = [
  { name: 'Home', href: '#', icon: HomeIcon, current: true },
  { name: 'My tasks', href: '#', icon: Bars4Icon, current: false },
  { name: 'Recent', href: '#', icon: ClockIcon, current: false },
];

export interface SidebarProps {
  guilds: Guild[];
}

export default function Sidebar({ guilds }: SidebarProps) {
  return (
    <>
      <MobileSidebar navigation={navigation} />

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-menu lg:pt-5 lg:pb-4">
        <a href="/" className="flex flex-shrink-0 items-center justify-center space-x-5 px-6">
          <img className="h-8 w-auto" src={`/logos/${APP_MODE.toLowerCase()}.png`} alt={APP_NAME} />
          <span className="text-center text-lg font-semibold">{APP_NAME}</span>
        </a>
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="mt-5 flex h-0 flex-1 flex-col overflow-y-auto pt-1">
          {/* User account dropdown */}

          {/* Navigation */}
          <nav className="mt-6 px-3">
            <GuildMenu guilds={guilds} />
            <div className="mt-5 space-y-1">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`${
                    item.current ? 'bg-gray-200 text-gray-900' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center rounded-md px-2 py-2 text-sm font-medium`}
                  aria-current={item.current ? 'page' : undefined}
                >
                  <item.icon
                    className={`${
                      item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 h-6 w-6 flex-shrink-0`}
                    aria-hidden="true"
                  />
                  {item.name}
                </a>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
