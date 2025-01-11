import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      address: string
    };
  }

  interface User {
    id: string;
    address: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    address: string;
  }
} 