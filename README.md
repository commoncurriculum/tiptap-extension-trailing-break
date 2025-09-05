# tiptap-extension-trailing-break

Browsers render blank paragraphs and lines, like `<p></p>`, with 0 height by default. However, ProseMirror renders these as normal-sized lines so that you can type in them. Thus there is a visual discrepancy between the editor view and the output of `editor.getHTML()`.

This Tiptap extension fixes the discrepancy by adding trailing breaks to empty paragraphs and lines in exported HTML. Specifically, it adds breaks to `getHTMLWithTrailingBreaks(editor)` (a replacement for `editor.getHTML()`) and to the clipboard when copying. The extra breaks are removed during parsing so that you can "round-trip" the HTML without issue (using `editor.setContent(html)` or pasting).

> In particular, empty lines at the end of paragraphs are preserved when copying+pasting within the editor, fixing an issue seen with Tiptap's [HardBreak](https://tiptap.dev/docs/editor/extensions/nodes/hard-break) extension.

In detail, the trailing breaks are represented as `<br data-external-trailing-break />`. They are added to the end of text blocks that are either empty, end with non-text inline content (e.g. `<br />`), or end with a newline character---analogous to the `<br class="ProseMirror-trailingBreak">` elements that [ProseMirror adds to the editor view](https://discuss.prosemirror.net/t/where-can-i-read-about-prosemirror-trailingbreak/6665).

## Docs

Install:

```bash
npm i tiptap-extension-trailing-break
```

Example setup:

```ts
import TrailingBreak, {
  getHTMLWithTrailingBreaks,
} from "tiptap-extension-trailing-break";
// ...

const editor = new Editor({
  element: document.querySelector(".element"),
  extensions: [Document, Paragraph, Text, HardBreak, TrailingBreak],
  content: "<p>Hello World!</p>",
  onUpdate: updateHTMLView,
});

// To export HTML with the trailing breaks, instead of editor.getHTML(), call:
console.log(getHTMLWithTrailingBreaks(editor));
```

## Developing

- Install dependencies with `npm install`.
- Run the demo (in demo/) with `npm start`.
- Build with `npm run build`.
- Lint and check format with `npm run test`.
- Preview typedoc with `npm run docs`. (Open `docs/index.html` in a browser.)
