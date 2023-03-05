import { getServerSession } from 'next-auth/next';
import SignInButton from './components/auth/SignInButton';

export async function Index() {
  const session = await getServerSession();

  return session?.user ? (
    <p>
      Signed in as {session.user.email ?? session.user.name} <br />
    </p>
  ) : (
    <p>
      Not signed in <br />
      <SignInButton />
    </p>
  );
}

export default Index;
