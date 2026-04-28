// import Image from 'next/image'
// import Link from 'next/link'

// export default function Logo({
//   size = 36,
//   showText = false,
//   href = '/',
// }: {
//   size?:     number
//   showText?: boolean
//   href?:     string
// }) {
//   return (
//     <Link href={href} className="flex items-center gap-2.5">
//       <Image
//         src="/logo.png"
//         alt="Studio42"
//         width={size}
//         height={size}
//         className="object-contain"
//         priority
//       />
//       {showText && (
//         <span className="font-black text-white text-lg tracking-tight">
//           Studio42
//           <span style={{ color: '#00C2FF' }}>.ai</span>
//         </span>
//       )}
//     </Link>
//   )
// }


import Image from 'next/image'
import Link from 'next/link'

export default function Logo({
  size = 40,
  showText = false,
  href = '/',
}: {
  size?: number
  showText?: boolean
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
      {showText && (
      <div className="flex items-baseline gap-0.5 leading-none">
        <span className="font-black text-white text-xl tracking-tight">
          Studio42
        </span>
        <span
          className="text-base font-bold"
        //   style={{ color: '#00C2FF' }}
        style={{
            background:            'linear-gradient(135deg, #7B2FBE 0%, #4F8EF7 50%, #00C2FF 100%)',
            WebkitBackgroundClip:  'text',
            WebkitTextFillColor:   'transparent',
            backgroundClip:        'text',
          }}
        >
          .ai
        </span>
      </div>
       )}
    </Link>
  )
}