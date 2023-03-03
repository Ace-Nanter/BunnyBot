import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: async ({ req, token }) => {
      const pathname = req.nextUrl.pathname;

      if (pathname.startsWith('/_next') || pathname.startsWith('/logos')) {
        return true;
      }

      if (token) {
        return true;
      }

      return false;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
});
