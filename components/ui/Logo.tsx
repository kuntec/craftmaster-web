import Image from 'next/image'
import Link from 'next/link'

export default function Logo({
  size = 40,
  href = '/',
}: {
  size?: number
  href?: string
}) {
  return (
    <Link href={href} className="flex items-center gap-3">
      {/* Logo image */}
      <Image
        src="/logo.png"
        alt="Studio42"
        width={size}
        height={size}
        className="object-contain"
        priority
      />

      {/* Brand name */}
      <div className="flex items-baseline gap-0.5 leading-none">
        <span className="font-black text-white text-xl tracking-tight">
          Studio42
        </span>
        <span
          className="text-base font-bold"
          style={{ color: '#00C2FF' }}
        >
          .ai
        </span>
      </div>
    </Link>
  )
}