import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { APP_MODE, APP_NAME } from '../../config';
import SignInButton from '../../components/auth/SignInButton';

export default async function LoginPage() {
  const session = await getServerSession();

  if (session) {
    redirect('/');
  }

  return (
    <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <img className="mx-auto h-12 w-auto" src={`/logos/${APP_MODE.toLowerCase()}.png`} alt={`${APP_NAME}`} />
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
            Bienvenue sur l'application {APP_NAME}
          </h2>
        </div>

        <div className="flex w-full justify-center">
          <SignInButton />
        </div>
      </div>
    </div>
  );
}
