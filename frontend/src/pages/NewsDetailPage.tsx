import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FileText, User, Calendar, MapPin, ExternalLink } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import SafeImage from '../components/ui/SafeImage'
import { getPublicNewsArticle } from '../lib/publicApi'
import type { PublicArticleDetail } from '../lib/publicApi'

function fmtDate(value?: string): string {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [article, setArticle] = useState<PublicArticleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setError(null)
    getPublicNewsArticle(id)
      .then((res) => {
        if (!cancelled) setArticle(res)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load article')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  // Only sections that have an image count, so the left/right alternation
  // continues past image-less sections (cover image is always right).
  let imageIndex = 0
  const sectionsWithSide = article
    ? article.sections
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((s) => {
          if (!s.image) return { ...s, imageSide: null }
          const imageSide: 'left' | 'right' = imageIndex % 2 === 0 ? 'left' : 'right'
          imageIndex += 1
          return { ...s, imageSide }
        })
    : []

  const renderFloatingImage = (src: string | undefined, side: 'left' | 'right') => {
    if (!src) return null
    const floatClasses = side === 'left' ? 'md:float-left md:mr-8' : 'md:float-right md:ml-8'
    return (
      <div className={`mb-5 h-auto w-full overflow-hidden rounded-xl md:mb-3 md:w-[38%] lg:w-[36%] ${floatClasses}`}>
        <SafeImage
          src={src}
          alt=""
          className="block h-auto w-full cursor-pointer"
          onClick={() => setActiveImage(src)}
        />
      </div>
    )
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-[1440px] px-[6.5rem] py-10">
        <h1 className="text-3xl font-bold text-blue-600">News</h1>

        {loading ? (
          <p className="mt-10 text-center text-gray-400">Loading...</p>
        ) : error || !article ? (
          <p className="mt-10 text-center text-red-600">{error || 'Article not found.'}</p>
        ) : (
          <div className="mt-6 rounded-2xl border border-gray-100 p-6 sm:p-10">
            <Link to="/news" className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline">
              <ArrowLeft className="h-4 w-4" /> Back to News
            </Link>

            <h2 className="mt-4 text-2xl font-bold text-black sm:text-3xl">{article.title}</h2>

            <div className="mt-4 flex flex-wrap gap-3">
              {article.source && (
                <Badge icon={<FileText className="h-3.5 w-3.5" />} label="Source" value={article.source} />
              )}
              {article.author && (
                <Badge icon={<User className="h-3.5 w-3.5" />} label="Author" value={article.author} />
              )}
              {article.publishedDate && (
                <Badge icon={<Calendar className="h-3.5 w-3.5" />} label="Date" value={fmtDate(article.publishedDate)} />
              )}
              {article.destination && (
                <Badge icon={<MapPin className="h-3.5 w-3.5" />} label="Destination" value={article.destination} />
              )}
            </div>

            <div className="mt-8 flex flex-col gap-8 text-[15px] leading-relaxed text-gray-700">
              <section className="clear-both flow-root">
                {renderFloatingImage(article.coverImage, 'right')}
                <div className="space-y-4">
                  {article.content
                    .split(/\n\s*\n/)
                    .filter(Boolean)
                    .map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                </div>
              </section>

              {sectionsWithSide.map((s, i) => (
                <article key={i} className="clear-both flow-root">
                  {s.title && <h3 className="mb-4 text-lg font-semibold text-black">{s.title}</h3>}
                  {renderFloatingImage(s.image, s.imageSide ?? 'right')}
                  <p className="whitespace-pre-line">{s.content}</p>
                </article>
              ))}
            </div>

            {article.sourceLink && (
              <a
                href={article.sourceLink}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-lg border border-blue-500 px-5 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
              >
                Read Original Article <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </div>

      {activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
          onClick={() => setActiveImage(null)}
        >
          <div className="relative max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="absolute -right-3 -top-3 rounded-full bg-white px-2 py-1 text-sm font-semibold text-gray-700 shadow"
              onClick={() => setActiveImage(null)}
              aria-label="Close image preview"
            >
              ✕
            </button>
            <img src={activeImage} alt="Expanded content" className="max-h-[85vh] w-full rounded-lg object-contain shadow-xl" />
          </div>
        </div>
      )}
    </PageShell>
  )
}

function Badge({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600">
      {icon}
      <span className="font-medium text-black">{label}:</span> {value}
    </span>
  )
}
