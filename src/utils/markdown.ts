import DOMPurify from 'dompurify'
import MarkdownIt from 'markdown-it'
import type { Options } from 'markdown-it'
import type Renderer from 'markdown-it/lib/renderer.mjs'

const markdown = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
  typographer: false,
})

markdown.renderer.rules.link_open = (tokens, idx, options: Options, _env: unknown, self: Renderer) => {
  const token = tokens[idx]
  token.attrSet('target', '_blank')
  token.attrSet('rel', 'noopener noreferrer nofollow')
  return self.renderToken(tokens, idx, options)
}

export function renderMarkdownToHtml(source: string) {
  return DOMPurify.sanitize(markdown.render(source || ''), {
    USE_PROFILES: { html: true },
  })
}

export function sanitizeHighlightHtml(html: string) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['em'],
    ALLOWED_ATTR: [],
  })
}
