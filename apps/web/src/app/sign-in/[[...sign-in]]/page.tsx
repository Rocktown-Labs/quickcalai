import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className='flex min-h-screen w-full flex-1 items-center justify-center p-6 md:p-10'>
      <SignIn />
    </div>
  );
}
