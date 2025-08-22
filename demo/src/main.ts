import "./style.css";

import { Editor } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import HardBreak from "@tiptap/extension-hard-break";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";

// Setup editor

const editor = new Editor({
  element: document.querySelector(".element"),
  extensions: [Document, Paragraph, Text, HardBreak],
  content: "<p>Hello World!</p>",
});

// TODO
