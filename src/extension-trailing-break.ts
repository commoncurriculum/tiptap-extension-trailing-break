import { Editor, getHTMLFromFragment, Node } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import { addTrailingBreaks } from "./add-remove";
import { EXTENSION_NAME } from "./name";

// Based on https://github.com/ueberdosis/tiptap/blob/main/packages/extension-hard-break/src/hard-break.ts

/**
 * When rendering in the editor, ProseMirror will "prop up" empty paragraphs and lines with a
 * trailing break (`<br class="ProseMirror-trailingBreak">`).
 * This extension lets you add analogous trailing breaks to externally-visible HTML.
 *
 * Specifically:
 * - `getHTMLWithTrailingBreaks(editor)` is a replacement for `editor.getHTML()` that adds
 * trailing breaks to the serialized HTML.
 * - The extension sets `transformCopied` so that the same happens to copied HTML.
 *
 * Internally, the extension defines a node type, "externalTrailingBreak", that is never present in the editor
 * but added just before serializing to HTML. It serializes to `<br data-external-trailing-break />`,
 * which is ignored during parsing so that you don't get extra BRs in the actual editor.
 */
export const TrailingBreak = Node.create({
  name: EXTENSION_NAME,

  inline: true,

  group: "inline",

  selectable: false,

  // Higher priority than HardBreak so that we get to parse our BRs.
  priority: 200,

  parseHTML() {
    // Ignore so that our external trailing break can never be inserted into the editor's actual state.
    return [{ tag: "br[data-external-trailing-break]", ignore: true }];
  },

  renderHTML() {
    return ["br", { "data-external-trailing-break": true }];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          transformCopied(slice) {
            // Add external trailing breaks to clipboard HTML.
            // Marijn thinks these are bad HTML, but they appear necessary to get empty lines to paste
            // into various editors (including ProseMirror itself?).
            // See https://github.com/ProseMirror/prosemirror/issues/1511#issuecomment-2967806051
            // and earlier comments in that issue.
            return addTrailingBreaks(slice);
          },
        },
      }),
    ];
  },
});

export function getHTMLWithTrailingBreaks(editor: Editor): string {
  // Modified from Editor.getHTML,
  // https://github.com/ueberdosis/tiptap/blob/next/packages/core/src/Editor.ts
  return getHTMLFromFragment(
    addTrailingBreaks(editor.state.doc.content),
    editor.schema,
  );
}
