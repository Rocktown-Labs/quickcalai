import Uploader from "@/components/uploader"
import { auth, currentUser } from "@clerk/nextjs/server"

export default async function DashboardPage() {
  const { isAuthenticated } = await auth()

  if (!isAuthenticated) {
    return <div>You are not authenticated, please sign in</div>
  }

  const user = await currentUser()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
       <h1 className="mb-20">Welcome to the dashboard {user?.firstName}!</h1>
       <Uploader />
    </div>
  )
}
