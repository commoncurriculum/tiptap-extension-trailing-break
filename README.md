# tiptap-extension-trailing-break

A [Tiptap](https://tiptap.dev/) extension that makes empty lines look the same in generated HTML and the editor.

When rendering in the editor, ProseMirror will "prop up" empty paragraphs and lines with a
trailing break (`<br class="ProseMirror-trailingBreak">`).
This extension lets you add analogous trailing breaks to externally-visible HTML.

TODO: motivation/example

Specifically:

- `getHTMLWithExternalTrailingBreaks(editor)` is a replacement for `editor.getHTML()` that adds
  trailing breaks to the serialized HTML.
- The extension sets `transformCopied` so that the same happens to copied HTML.

Internally, the extension defines a node type, "externalTrailingBreak", that is never present in the editor
but added just before serializing to HTML. It serializes to `<br data-external-trailing-break />`,
which is ignored during parsing so that you don't get extra BRs in the actual editor.

## Docs

Example setup:

```ts
TODO;
```

## Developing

- Install dependencies with `npm install`.
- Run the demo (in demo/) with `npm start`.
- Build with `npm run build`.
- Lint and check format with `npm run test`.
- Preview typedoc with `npm run docs`. (Open `docs/index.html` in a browser.)
- Publish with `npm publish`.
