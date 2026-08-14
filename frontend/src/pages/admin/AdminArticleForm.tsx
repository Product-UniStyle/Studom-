import { useState } from 'react'
import { Plus, Trash2, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react'
import TextField from '../../components/form/TextField'
import ImageUploadField from './ImageUploadField'
import { updateArticle, uploadArticleCoverImage, uploadArticleSectionImage } from '../../lib/adminApi'
import type { ArticleDetail, ArticleKind, ArticleSection } from '../../lib/adminApi'

interface AdminArticleFormProps {
  kind: ArticleKind
  article: ArticleDetail
  onSaved: () => void
  onCancel: () => void
}

export default function AdminArticleForm({ kind, article, onSaved, onCancel }: AdminArticleFormProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sections, setSections] = useState<ArticleSection[]>(
    article.sections.map((s) => ({ ...s }))
  )

  function updateSection(index: number, patch: Partial<ArticleSection>) {
    setSections((list) => list.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  }

  function addSection() {
    setSections((list) => [...list, { order: list.length + 1, title: '', image: '', content: '' }])
  }

  function removeSection(index: number) {
    setSections((list) => list.filter((_, i) => i !== index))
  }

  function moveSection(index: number, direction: -1 | 1) {
    setSections((list) => {
      const target = index + direction
      if (target < 0 || target >= list.length) return list
      const next = [...list]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

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
      sourceLink: str('sourceLink'),
      sections: sections
        .filter((s) => s.title?.trim() || s.content.trim())
        .map((s, i) => ({ ...s, order: i + 1 })),
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
          onUpload={(file) => uploadArticleCoverImage(file, article.title, kind)}
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

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Sections ({sections.length})
          </p>
          <button
            type="button"
            onClick={addSection}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-3.5 w-3.5" /> Add Section
          </button>
        </div>

        {sections.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-xs text-gray-400">
            No sections yet.
          </p>
        ) : (
          <div className="max-h-[28rem] space-y-3 overflow-y-auto rounded-lg border border-gray-100 p-3">
            {sections.map((s, i) => (
              <div key={i} className="rounded-lg border border-gray-100 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Section {i + 1}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveSection(i, -1)}
                      disabled={i === 0}
                      className="rounded p-1 text-gray-400 hover:text-black disabled:opacity-30"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(i, 1)}
                      disabled={i === sections.length - 1}
                      className="rounded p-1 text-gray-400 hover:text-black disabled:opacity-30"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSection(i)}
                      className="rounded p-1 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <input
                    value={s.title || ''}
                    onChange={(e) => updateSection(i, { title: e.target.value })}
                    placeholder="Section title (optional)"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
                  />
                  <ImageUploadField
                    label="Section Image (optional)"
                    name={`section-image-${i}`}
                    defaultValue={s.image}
                    onUpload={(file) => uploadArticleSectionImage(file, article.title, kind)}
                    onChange={(url) => updateSection(i, { image: url })}
                  />
                  <textarea
                    value={s.content}
                    onChange={(e) => updateSection(i, { content: e.target.value })}
                    rows={3}
                    placeholder="Section content"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TextField
        label="Source Link"
        name="sourceLink"
        type="url"
        defaultValue={article.sourceLink}
        hint="Original article URL."
        rightIcon={
          article.sourceLink ? (
            <a href={article.sourceLink} target="_blank" rel="noreferrer" title="Open source link">
              <ExternalLink className="h-4 w-4 hover:text-black" />
            </a>
          ) : undefined
        }
      />

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
