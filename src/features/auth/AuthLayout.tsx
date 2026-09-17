import type { ReactNode } from 'react'
import EvolvittaLogo from '@/components/brand/EvolvittaLogo'

interface AuthLayoutProps {
  /** Lado em que o painel de marca aparece em telas largas (ver design.md - Layout de autenticação). */
  brandPosition: 'left' | 'right'
  brandContent: ReactNode
  children: ReactNode
}

function BrandPanel({ brandContent }: { brandContent: ReactNode }) {
  return (
    <div className="relative hidden w-[420px] shrink-0 flex-col justify-between overflow-hidden bg-primary-700 p-10 lg:flex">
      <div>
        <EvolvittaLogo tone="onDark" />
        <p className="mt-2 text-sm font-medium text-primary-300">Acompanhe cada evolução.</p>
      </div>

      <svg
        width={420}
        height={420}
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
        className="absolute top-1/2 -right-35 -translate-y-1/2 opacity-20"
      >
        <circle
          cx="50"
          cy="50"
          r="38"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="179 60"
          transform="rotate(-90 50 50)"
        />
      </svg>

      <div className="relative max-w-sm">{brandContent}</div>
    </div>
  )
}

function AuthLayout({ brandPosition, brandContent, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {brandPosition === 'left' && <BrandPanel brandContent={brandContent} />}

      <div className="flex flex-1 items-center justify-center bg-neutral-0 p-8">
        <div className="w-full max-w-sm">{children}</div>
      </div>

      {brandPosition === 'right' && <BrandPanel brandContent={brandContent} />}
    </div>
  )
}

export default AuthLayout
