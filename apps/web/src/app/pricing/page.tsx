import { PricingTable } from '@clerk/nextjs'

export default function PricingPage() {
  return (
    <div className='flex min-h-screen flex-row items-center justify-center max-w-2xl'>
      <PricingTable />
    </div>
  )
}
