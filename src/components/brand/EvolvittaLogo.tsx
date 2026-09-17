import { cn } from '@/lib/utils'
import EvolvittaMark from '@/components/brand/EvolvittaMark'

interface EvolvittaLogoProps {
  tone?: 'onLight' | 'onDark'
  markSize?: number
  wordmarkClassName?: string
  className?: string
}

function EvolvittaLogo({ tone = 'onLight', markSize = 32, wordmarkClassName, className }: EvolvittaLogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <EvolvittaMark tone={tone} size={markSize} />
      <span
        className={cn(
          'font-heading text-2xl font-extrabold tracking-tight',
          tone === 'onDark' ? 'text-white' : 'text-neutral-900',
          wordmarkClassName,
        )}
      >
        Evolvitta
      </span>
    </div>
  )
}

export default EvolvittaLogo
