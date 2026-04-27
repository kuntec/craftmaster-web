import Image from 'next/image'
import Link from 'next/link'

export default function Logo({
  size = 36,
  showText = false,
  href = '/',
}: {
  size?:     number
  showText?: boolean
  href?:     string
}) {
  return (
    <Link href={href} className="flex items-center gap-2.5">
      <Image
        src="/logo.png"
        alt="Studio42"
        width={size}
        height={size}
        className="object-contain"
        priority
      />
      {showText && (
        <span className="font-black text-white text-lg tracking-tight">
          Studio42
          <span style={{ color: '#00C2FF' }}>.ai</span>
        </span>
      )}
    </Link>
  )
}