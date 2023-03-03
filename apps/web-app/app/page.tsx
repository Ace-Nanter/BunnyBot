import { getServerSession } from 'next-auth/next';
import SignInButton from './components/auth/SignInButton';
import SignOutButton from './components/auth/SignOutButton';

export default async function Page() {
  const session = await getServerSession();

  return session?.user ? (
    <p>
      Signed in as {session.user.email ?? session.user.name} <br />
      <SignOutButton />
    </p>
  ) : (
    <p>
      Not signed in <br />
      <SignInButton />
    </p>
  );
}
