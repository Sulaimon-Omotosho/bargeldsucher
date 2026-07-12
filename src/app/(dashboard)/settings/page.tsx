import { Suspense } from 'react'
import SettingsContent from './SettingsContent'

export default function SettingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SettingsContent />
      <h2 className='text-center text-2xl font-bold'>
        Page Is Under Development
      </h2>
    </Suspense>
  )
}
