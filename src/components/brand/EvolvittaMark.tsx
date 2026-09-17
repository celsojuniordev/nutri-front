interface EvolvittaMarkProps {
  /** 'onLight' = anel na cor primária, para uso sobre fundo claro (padrão).
   *  'onDark' = anel branco, para uso sobre fundo primary-700 (painel de marca). */
  tone?: 'onLight' | 'onDark'
  size?: number
  className?: string
}

function EvolvittaMark({ tone = 'onLight', size = 40, className }: EvolvittaMarkProps) {
  const ringColor = tone === 'onDark' ? '#FFFFFF' : 'var(--color-primary-500)'
  const dotColor = tone === 'onDark' ? 'var(--color-accent-300)' : 'var(--color-accent-500)'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle
        cx="50"
        cy="50"
        r="38"
        stroke={ringColor}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray="179 60"
        transform="rotate(-90 50 50)"
      />
      <circle cx="50" cy="12" r="9" fill={dotColor} />
    </svg>
  )
}

export default EvolvittaMark
