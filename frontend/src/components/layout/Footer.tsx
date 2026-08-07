import { Globe } from 'lucide-react'

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-7.5h2.5l.5-3H13.5V8.5c0-.9.25-1.5 1.53-1.5H16.5V4.35C16.2 4.31 15.2 4.22 14 4.22c-2.44 0-4.11 1.49-4.11 4.22V10.5H7.5v3H9.89V21h3.61Z" />
    </svg>
  )
}
function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 3H21l-6.44 7.36L22 21h-6.14l-4.8-6.28L5.6 21H3.5l6.9-7.88L2.5 3h6.3l4.34 5.74L18.9 3Zm-1.08 16.2h1.17L7.24 4.7H6l11.82 14.5Z" />
    </svg>
  )
}
function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="w-full bg-black text-white">
      <div className="mx-auto max-w-[1440px] px-6 py-14 lg:px-10">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div>
            <div className="font-script text-3xl font-bold">Studom</div>
            <div className="mt-4 max-w-xs text-sm leading-relaxed text-gray-300">
              Studom
              <br />
              BIZ Nest Co-Working, Sunteck Kanika Park,
              <br />
              Panjim, Goa - India 403001
              <br />
              response@commonform.com
            </div>
          </div>

          <div className="flex gap-16">
            <div className="flex flex-col gap-4 text-sm text-gray-200">
              <span>ABOUT</span>
              <span>CAREER</span>
              <span>FAQS</span>
            </div>
            <div className="flex flex-col gap-4 text-sm text-gray-200">
              <span>PRIVACY</span>
              <span>T&amp;C</span>
              <span>CONTACT</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-[1440px] px-6 py-6 text-center lg:px-10">
          <p className="text-sm text-gray-300">
            © Copyright 2026-27 STUDOM – All Rights Reserved.
          </p>
          <p className="mt-1 text-sm text-gray-500">Your paragraph text</p>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-6 py-4 text-xs text-gray-400 lg:flex-row lg:px-10">
          <div className="flex items-center gap-4">
            <span>Privacy</span>
            <span>·</span>
            <span>Terms</span>
            <span>·</span>
            <span>Sitemap</span>
            <span>·</span>
            <span>Company details</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" /> English (IN)
            </span>
            <span className="rounded border border-gray-600 px-1.5 py-0.5">₹ INR</span>
            <FacebookIcon className="h-3.5 w-3.5" />
            <TwitterIcon className="h-3.5 w-3.5" />
            <InstagramIcon className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </footer>
  )
}
