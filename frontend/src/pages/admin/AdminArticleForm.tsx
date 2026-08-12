import { useState } from 'react'
import TextField from '../../components/form/TextField'
import ImageUploadField from './ImageUploadField'
import { updateArticle, uploadArticleCoverImage } from '../../lib/adminApi'
import type { ArticleDetail, ArticleKind } from '../../lib/adminApi'

interface AdminArticleFormProps {
  kind: ArticleKind
  article: ArticleDetail
  onSaved: () => void
  onCancel: () => void
}

export default function AdminArticleForm({ kind, article, onSaved, onCancel }: AdminArticleFormProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const fd = new FormData(e.currentTarget)
    const str = (key: string) => (fd.get(key) as string) || undefined

    const payload = {
      title: str('title'),
      content: str('content'),
      coverImage: str('coverImage'),
      author: str('author'),
      source: str('source'),
      destination: str('destination'),
      type: str('type'),
      publishedDate: str('publishedDate'),
    }

    try {
      await updateArticle(kind, article._id, payload)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField label="Title" name="title" defaultValue={article.title} required />

      <div className="grid grid-cols-2 gap-4">
        <ImageUploadField
          label="Cover Image"
          name="coverImage"
          defaultValue={article.coverImage}
          onUpload={(file) => uploadArticleCoverImage(file, article.title)}
        />
        <div className="space-y-4">
          <TextField label="Author" name="author" defaultValue={article.author} />
          <TextField label="Source" name="source" defaultValue={article.source} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <TextField label="Destination" name="destination" defaultValue={article.destination} />
        <TextField label="Type" name="type" defaultValue={article.type} />
        <TextField
          label="Published Date"
          name="publishedDate"
          type="date"
          defaultValue={article.publishedDate ? article.publishedDate.slice(0, 10) : undefined}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-900">Content</label>
        <textarea
          name="content"
          rows={6}
          defaultValue={article.content}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {article.sections.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Sections ({article.sections.length}, from sheet import — read-only for now)
          </p>
          <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-gray-100 p-3">
            {article.sections.map((s) => (
              <div key={s.order} className="border-b border-gray-50 pb-2 text-xs last:border-0">
                <span className="font-medium text-gray-800">
                  {s.order}. {s.title || '(untitled)'}
                </span>
                <p className="mt-0.5 line-clamp-2 text-gray-500">{s.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {article.sourceLink && (
        <p className="text-xs text-gray-400">
          Source:{' '}
          <a href={article.sourceLink} target="_blank" rel="noreferrer" className="text-blue-600">
            {article.sourceLink}
          </a>
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
