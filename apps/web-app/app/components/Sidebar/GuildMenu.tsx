'use client';

import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { Fragment, useState } from 'react';
import { Guild } from '../../../models/guild';

export interface GuildMenuProps {
  guilds: Guild[];
}

export default function GuildMenu({ guilds }: GuildMenuProps) {
  const [selectedGuild, setSelectedGuild] = useState(guilds[0]);

  return (
    <Listbox value={selectedGuild} onChange={setSelectedGuild}>
      {({ open }) => (
        <div className="relative mt-1">
          <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-500 bg-gray-700 py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
            <span className="flex items-center">
              <img src={selectedGuild?.iconUrl} alt="Guild icon" className="h-10 w-10 flex-shrink-0 rounded-full" />
              <span className="ml-3 block truncate font-bold">{selectedGuild?.name}</span>
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>

          <Transition
            show={open}
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {guilds.map((guild) => (
                <Listbox.Option
                  key={guild.id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-3 pr-9 ${
                      active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                    }`
                  }
                  value={guild}
                >
                  {({ selected, active }) => (
                    <>
                      <div className="flex items-center">
                        <img src={guild.iconUrl} alt={guild.name} className="h-6 w-6 flex-shrink-0 rounded-full" />
                        <span className={`${selected ? 'font-semibold' : 'font-normal'} ml-3 block truncate`}>
                          {guild.name}
                        </span>
                      </div>

                      {selected ? (
                        <span
                          className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                            active ? 'text-white' : 'text-indigo-600'
                          }`}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
}
