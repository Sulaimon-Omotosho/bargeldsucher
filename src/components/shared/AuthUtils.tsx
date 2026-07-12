import { CheckCircle2, Circle } from 'lucide-react'

export function PasswordRequirement({
  valid,
  children,
}: {
  valid: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={`flex items-center gap-2 text-xs transition-colors ${
        valid ? 'text-green-600' : 'text-slate-500'
      }`}
    >
      {valid ? (
        <CheckCircle2 className='h-3.5 w-3.5' />
      ) : (
        <Circle className='h-3.5 w-3.5' />
      )}

      <span>{children}</span>
    </div>
  )
}
