import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FileText, User, Calendar, Tag, ExternalLink } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import SafeImage from '../components/ui/SafeImage'
import { getPublicBlogPost } from '../lib/publicApi'
import type { PublicArticleDetail } from '../lib/publicApi'

function fmtDate(value?: string): string {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function BlogDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [article, setArticle] = useState<PublicArticleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setError(null)
    getPublicBlogPost(id)
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

  return (
    <PageShell>
      <div className="mx-auto max-w-[1440px] px-6 py-10 lg:px-10">
        <h1 className="text-3xl font-bold text-blue-600">Blog</h1>

        {loading ? (
          <p className="mt-10 text-center text-gray-400">Loading...</p>
        ) : error || !article ? (
          <p className="mt-10 text-center text-red-600">{error || 'Article not found.'}</p>
        ) : (
          <div className="mt-6 rounded-2xl border border-gray-100 p-6 sm:p-10">
            <Link to="/blog" className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline">
              <ArrowLeft className="h-4 w-4" /> Back to Blog
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
              {article.type && (
                <Badge icon={<Tag className="h-3.5 w-3.5" />} label="Category" value={article.type} />
              )}
            </div>

            {article.coverImage && (
              <SafeImage
                src={article.coverImage}
                alt=""
                className="mt-6 h-64 w-full rounded-xl object-cover sm:h-96"
              />
            )}

            <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-gray-700">
              {article.content
                .split(/\n\s*\n/)
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i}>{para}</p>
                ))}

              {article.sections
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((s, i) => (
                  <div key={i}>
                    {s.title && <h3 className="mb-2 mt-6 text-lg font-semibold text-black">{s.title}</h3>}
                    {s.image && <SafeImage src={s.image} alt="" className="mb-3 w-full rounded-xl object-cover" />}
                    <p>{s.content}</p>
                  </div>
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
