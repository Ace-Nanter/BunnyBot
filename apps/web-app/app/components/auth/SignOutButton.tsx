'use client';

import { signOut } from 'next-auth/react';

export default function SignOutButton() {
  return <button onClick={() => signOut()}>Déconnexion</button>;
}
