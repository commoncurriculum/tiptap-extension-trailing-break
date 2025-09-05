import { Fragment, Node, Schema, Slice } from "@tiptap/pm/model";
import { EXTENSION_NAME } from "./name";

/**
 * Adds external trailing breaks to given document (or other content) as needed to prop up empty paragraphs and lines.
 */
export function addTrailingBreaks(node: Node): Node;
export function addTrailingBreaks(fragment: Fragment): Fragment;
export function addTrailingBreaks(slice: Slice): Slice;
export function addTrailingBreaks(
  content: Node | Fragment | Slice,
): Node | Fragment | Slice {
  if (content instanceof Node) return addTrailingBreaksNode(content);
  else if (content instanceof Fragment)
    return addTrailingBreaksFragment(content);
  else if (content instanceof Slice) return addTrailingBreaksSlice(content);
  else
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    throw new Error("Not an instance of Node | Fragment | Slice: " + content);
}

function addTrailingBreaksNode(node: Node): Node {
  if (node.isTextblock) {
    // Block node with inline content. Add an external trailing break to node if needed.
    // We mimic ProseMirror's addTextblockHacks
    // (https://github.com/ProseMirror/prosemirror-view/blob/master/src/viewdesc.ts),
    // adding an external trailing break ~whenever that function adds a BR hack node
    // (`<br class="ProseMirror-trailingBreak">`).

    let doAdd = false;
    if (node.lastChild === null) {
      // Empty node, e.g., `<p></p>`.
      doAdd = true;
    } else if (!node.lastChild.isText) {
      // Node ending in non-text inline content such as an empty line or an image.
      // E.g. `<p>First line<br /></p>`.
      doAdd = true;
    } else if (/\n$/.test(node.lastChild.text!)) {
      // Node ending in \n.
      doAdd = true;
    }

    if (!doAdd) return node;

    const trailingBreak = getCachedTrailingBreak(node.type.schema);
    const newContent = node.content.addToEnd(trailingBreak);
    // Defend against nodes like <pre> that don't allow arbitrary inline content.
    if (!node.type.validContent(newContent)) return node;

    return node.copy(newContent);
  } else {
    // Recurse.
    if (!node.content) {
      return node;
    }

    const newContent = addTrailingBreaksFragment(node.content);
    if (newContent !== node.content) {
      return node.copy(newContent);
    } else return node;
  }
}

function addTrailingBreaksFragment(fragment: Fragment): Fragment {
  const newContent: Node[] = [];
  let isChanged = false;
  fragment.forEach((child) => {
    const processedChild = addTrailingBreaksNode(child);
    newContent.push(processedChild);
    if (processedChild !== child) isChanged = true;
  });

  if (isChanged) return Fragment.from(newContent);
  else return fragment;
}

function addTrailingBreaksSlice(slice: Slice): Slice {
  const newContent = addTrailingBreaksFragment(slice.content);
  if (newContent !== slice.content) {
    return new Slice(newContent, slice.openStart, slice.openEnd);
  } else return slice;
}

const cacheKey = `${EXTENSION_NAME}.instance`;
function getCachedTrailingBreak(schema: Schema): Node {
  let existing = schema.cached[cacheKey] as Node | undefined;
  if (!existing) {
    existing = schema.nodes[EXTENSION_NAME].create();
    schema.cached[cacheKey] = existing;
  }
  return existing;
}

/**
 * Removes all external trailing breaks from a document (or other content).
 */
export function removeTrailingBreaks(node: Node): Node;
export function removeTrailingBreaks(fragment: Fragment): Fragment;
export function removeTrailingBreaks(slice: Slice): Slice;
export function removeTrailingBreaks(
  content: Node | Fragment | Slice,
): Node | Fragment | Slice {
  if (content instanceof Node) return removeTrailingBreaksNode(content);
  else if (content instanceof Fragment)
    return removeTrailingBreaksFragment(content);
  else if (content instanceof Slice) return removeExternalBreaksSlice(content);
  else
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    throw new Error("Not an instance of Node | Fragment | Slice: " + content);
}

function removeTrailingBreaksNode(node: Node): Node {
  // If this node is an TrailingBreak, it should be filtered out
  // We'll handle this at the parent level by not including such nodes

  // If the node has no content, return it as-is
  if (!node.content) {
    return node;
  }

  const newContent = removeTrailingBreaksFragment(node.content);
  if (newContent !== node.content) {
    return node.copy(newContent);
  } else return node;
}

function removeTrailingBreaksFragment(fragment: Fragment): Fragment {
  const newContent: Node[] = [];
  let isChanged = false;
  fragment.forEach((child) => {
    // Skip TrailingBreak nodes
    if (child.type.name === EXTENSION_NAME) {
      isChanged = true;
      return;
    }

    // Recursively process other nodes
    const processedChild = removeTrailingBreaksNode(child);
    newContent.push(processedChild);
    if (processedChild !== child) isChanged = true;
  });

  if (isChanged) return Fragment.from(newContent);
  else return fragment;
}

function removeExternalBreaksSlice(slice: Slice): Slice {
  const newContent = removeTrailingBreaksFragment(slice.content);
  if (newContent !== slice.content) {
    return new Slice(newContent, slice.openStart, slice.openEnd);
  } else return slice;
}
