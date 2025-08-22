import { Fragment, Node, Schema, Slice } from "@tiptap/pm/model"
import { EXTENSION_NAME } from "./name"

/**
 * Adds external trailing breaks to given document (or other content) as needed to prop up empty paragraphs and lines.
 */
export function addExternalTrailingBreaks(node: Node): Node
export function addExternalTrailingBreaks(fragment: Fragment): Fragment
export function addExternalTrailingBreaks(slice: Slice): Slice
export function addExternalTrailingBreaks(
  content: Node | Fragment | Slice
): Node | Fragment | Slice {
  if (content instanceof Node) return addExternalTrailingBreaksNode(content)
  else if (content instanceof Fragment) return addExternalTrailingBreaksFragment(content)
  else if (content instanceof Slice) return addExternalTrailingBreaksSlice(content)
  else throw new Error("Not an instance of Node | Fragment | Slice: " + content)
}

function addExternalTrailingBreaksNode(node: Node): Node {
  if (node.isTextblock) {
    // Block node with inline content. Add an external trailing break to node if needed.
    // We mimic ProseMirror's addTextblockHacks
    // (https://github.com/ProseMirror/prosemirror-view/blob/master/src/viewdesc.ts),
    // adding an external trailing break ~whenever that function adds a BR hack node
    // (`<br class="ProseMirror-trailingBreak">`).

    let doAdd = false
    if (node.lastChild === null) {
      // Empty node, e.g., `<p></p>`.
      doAdd = true
    } else if (!node.lastChild.isText) {
      // Node ending in non-text inline content such as an empty line or an image.
      // E.g. `<p>First line<br /></p>`.
      doAdd = true
    } else if (/\n$/.test(node.lastChild.text!)) {
      // Node ending in \n.
      doAdd = true
    }

    if (!doAdd) return node

    const trailingBreak = getCachedTrailingBreak(node.type.schema)
    const newContent = node.content.addToEnd(trailingBreak)
    // Defend against nodes like <pre> that don't allow arbitrary inline content.
    if (!node.type.validContent(newContent)) return node

    return node.copy(newContent)
  } else {
    // Recurse.
    if (!node.content) {
      return node
    }

    const newContent = addExternalTrailingBreaksFragment(node.content)
    if (newContent !== node.content) {
      return node.copy(newContent)
    } else return node
  }
}

function addExternalTrailingBreaksFragment(fragment: Fragment): Fragment {
  const newContent: Node[] = []
  let isChanged = false
  fragment.forEach((child) => {
    const processedChild = addExternalTrailingBreaksNode(child)
    newContent.push(processedChild)
    if (processedChild !== child) isChanged = true
  })

  if (isChanged) return Fragment.from(newContent)
  else return fragment
}

function addExternalTrailingBreaksSlice(slice: Slice): Slice {
  const newContent = addExternalTrailingBreaksFragment(slice.content)
  if (newContent !== slice.content) {
    return new Slice(newContent, slice.openStart, slice.openEnd)
  } else return slice
}

const cacheKey = `${EXTENSION_NAME}.instance`
function getCachedTrailingBreak(schema: Schema): Node {
  let existing = schema.cached[cacheKey] as Node | undefined
  if (!existing) {
    existing = schema.nodes[EXTENSION_NAME].create()
    schema.cached[cacheKey] = existing
  }
  return existing
}

/**
 * Removes all external trailing breaks from a document (or other content).
 */
export function removeExternalTrailingBreaks(node: Node): Node
export function removeExternalTrailingBreaks(fragment: Fragment): Fragment
export function removeExternalTrailingBreaks(slice: Slice): Slice
export function removeExternalTrailingBreaks(
  content: Node | Fragment | Slice
): Node | Fragment | Slice {
  if (content instanceof Node) return removeExternalTrailingBreaksNode(content)
  else if (content instanceof Fragment) return removeExternalTrailingBreaksFragment(content)
  else if (content instanceof Slice) return removeExternalBreaksSlice(content)
  else throw new Error("Not an instance of Node | Fragment | Slice: " + content)
}

function removeExternalTrailingBreaksNode(node: Node): Node {
  // If this node is an ExternalTrailingBreak, it should be filtered out
  // We'll handle this at the parent level by not including such nodes

  // If the node has no content, return it as-is
  if (!node.content) {
    return node
  }

  const newContent = removeExternalTrailingBreaksFragment(node.content)
  if (newContent !== node.content) {
    return node.copy(newContent)
  } else return node
}

function removeExternalTrailingBreaksFragment(fragment: Fragment): Fragment {
  const newContent: Node[] = []
  let isChanged = false
  fragment.forEach((child) => {
    // Skip ExternalTrailingBreak nodes
    if (child.type.name === EXTENSION_NAME) {
      isChanged = true
      return
    }

    // Recursively process other nodes
    const processedChild = removeExternalTrailingBreaksNode(child)
    newContent.push(processedChild)
    if (processedChild !== child) isChanged = true
  })

  if (isChanged) return Fragment.from(newContent)
  else return fragment
}

function removeExternalBreaksSlice(slice: Slice): Slice {
  const newContent = removeExternalTrailingBreaksFragment(slice.content)
  if (newContent !== slice.content) {
    return new Slice(newContent, slice.openStart, slice.openEnd)
  } else return slice
}
