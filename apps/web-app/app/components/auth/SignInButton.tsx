'use client';

import { signIn } from 'next-auth/react';
import DISCORD_SVG from '../../../public/logos/discord-logo.svg';
import Image from 'next/image';

export default function SignInButton() {
  return (
    <button
      className="group relative flex w-1/2 justify-center rounded-md border border-transparent bg-indigo-600 py-4 px-4 font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      onClick={() => signIn('discord')}
    >
      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
        <Image src={DISCORD_SVG} alt="Discord logo" className="h-5 w-5" />
      </span>
      Se connecter à Discord
    </button>
  );
}
