import { MarkdownView, Plugin, EditorPosition } from "obsidian";

export default class Superscript extends Plugin {
  async onload() {
    // console.log(this.app);

    // this.app.workspace.on('layout-change', () => {
    //   this.updateSuperscript();
    // })
    // this.app.metadataCache.on('changed', (_file) => {
    //   this.updateSuperscript();
    // })

    this.addCommand({
      id: "paste-url-into-selection",
      name: "",
      callback: () => this.urlIntoSelection(),
      hotkeys: [
        {
          modifiers: ["Mod"],
          key: "s",
        },
      ],
    });
  }

  urlIntoSelection(): void {
    let markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!markdownView) {
      return;
    }
    let editor = markdownView.editor;

    let selectedText = editor.somethingSelected() ? editor.getSelection() : "";

    function Cursor(pos: number): EditorPosition {
      return editor.offsetToPos(pos);
    }

    /* Detect whether the selected text is packed by <sup></sup>.
       If true, unpack it, else pack with <sup></sup>. */

    const fos = editor.posToOffset(editor.getCursor("from")); // from offset
    const tos = editor.posToOffset(editor.getCursor("to")); // to offset
    const len = selectedText.length;

    var beforeText = editor.getRange(Cursor(fos - 5), Cursor(tos - len));
    var afterText = editor.getRange(Cursor(fos + len), Cursor(tos + 6));
    var startText = editor.getRange(Cursor(fos), Cursor(fos + 5));
    var endText = editor.getRange(Cursor(tos - 6), Cursor(tos));

    if (beforeText === "<sup>" && afterText === "</sup>") {
      //=> undo superscript (inside selection)

      editor.setSelection(Cursor(fos - 5), Cursor(tos + 6));
      editor.replaceSelection(`${selectedText}`);
      // re-select
      editor.setSelection(Cursor(fos - 5), Cursor(tos - 5));
    } else if (startText === "<sup>" && endText === "</sup>") {
      //=> undo superscript (outside selection)
      
      editor.replaceSelection(editor.getRange(Cursor(fos + 5), Cursor(tos - 6)));
      // re-select
      editor.setSelection(Cursor(fos), Cursor(tos - 7));
    } else {
      //=> do superscript

      if (selectedText) {
        // console.log("selected");
        editor.replaceSelection(`<sup>${selectedText}</sup>`);
        // re-select
        editor.setSelection(Cursor(fos + 5), Cursor(tos + 5));
      } else {
        // console.log("not selected");
        editor.replaceSelection(`<sup></sup>`);
        let cursor = editor.getCursor();
        cursor.ch -= 6;
        editor.setCursor(cursor);
      }
    }
  }
}
