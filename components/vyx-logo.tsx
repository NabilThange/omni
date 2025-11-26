export function VyxLogo() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative w-8 h-8">
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
          <circle cx="16" cy="16" r="14" stroke="#2D4A2D" strokeWidth="2" fill="none" />
          <path d="M16 8c0 4-3 7-7 8 4 1 7 4 7 8 0-4 3-7 7-8-4-1-7-4-7-8z" fill="#2D4A2D" />
        </svg>
      </div>
      <span className="text-xl font-semibold text-vyx-dark-text tracking-tight">Vyx</span>
    </div>
  )
}
