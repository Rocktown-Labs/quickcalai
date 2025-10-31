import { UserProfile } from '@clerk/nextjs'


export default function UserProfilePage() {
  return (
    <div className='min-h-screen w-full'>
      <UserProfile />
    </div>
  )
}
