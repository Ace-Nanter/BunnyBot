import { getServerSession } from 'next-auth';
import React from 'react';
import { Guild } from '../models/guild';
import AuthContext from './AuthContext';
import Header from './components/header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import { APP_MODE, APP_NAME, DISCORD_CONTENT_URL } from './config';
import DiscordClient from './DiscordClient';
import './tailwind.css';

export const dynamic = 'force-dynamic';

interface RootLayoutProps {
  children: React.ReactNode;
}

async function fetchDiscordGuilds(): Promise<Guild[]> {
  const response = await DiscordClient.get('/users/@me/guilds');

  if (!response || response.status !== 200) {
    return [];
  }

  return response.data.map(
    (guild: any) =>
      ({
        id: guild.id,
        name: guild.name,
        iconUrl: `${DISCORD_CONTENT_URL}/icons/${guild.id}/${guild.icon}`,
      } as Guild)
  );
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await getServerSession();
  const guilds = await fetchDiscordGuilds();

  return (
    <html lang="fr" className="dark h-full">
      <head>
        <meta name="description" content="Inline" />
        <link rel="icon" type="image/x-icon" href={`/logos/${APP_MODE.toLowerCase()}.png`} />
        <title>{APP_NAME}</title>
      </head>
      <body className="dark:bg-primary min-h-full bg-gray-100 dark:text-white">
        {session ? (
          <AuthContext>
            <Sidebar guilds={guilds} />
            <Header />
            <main className="mx-auto max-w-full p-6 lg:px-8">{children}</main>
          </AuthContext>
        ) : (
          <main className="mx-auto max-w-full p-6 lg:px-8">{children}</main>
        )}
      </body>
    </html>
  );
}
