<template>
  <div class="editor-container container mx-auto">
    <div class="mention-container">
      <div
        class="card flex align-items-center justify-content-center mx-auto p-1 border-1 border-gray-200 rounded-md bg-gray-50"
        style="width: 50em"
      >
        <Card class="w-full bg-transparent" style="margin: 0 auto; width: 50em">
          <template #header>
            <div
              class="card my-2 text-left ps-3 p-1 border-1 border-gray-200 rounded-circle bg-gray-50"
            >
              Message
            </div>
          </template>
          <template #title> </template>
          <template #subtitle> </template>
          <template #content>
            <div
              for=""
              class="w-full"
              @dragover="dragover"
              @dragleave="dragleave"
              @drop="drop"
              ref="file_input"
            >
              <v-md-editor
                v-model="text"
                height="400px"
                @change="handleInput(text, html)"
                ref="v_md_editor"
              >
              </v-md-editor>
            </div>
            <input
              type="file"
              name="file"
              id="fileInput"
              class="hidden-input"
              @change="onChange"
              ref="file"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <footer class="bg-gray-100 shadow m-1 dark:bg-gray-800">
              <div
                class="w-full p-1 text-left text-gray-500 dark:text-gray-200 text-sm"
              >
                <label for="fileInput" class="w-full">
                  Attach file by dragging & dropping, selecting it or pasting
                  from clipboard.
                </label>
              </div>
            </footer>
          </template>
          <template #footer>
            <Button
              icon="pi pi-check"
              class="bg-violet-500 hover:bg-violet-600 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300 rounded-md text-white px-4 py-1 m-2 float-right"
              label="Save"
            />
          </template>
        </Card>
      </div>
      <!-- Mention dropdown -->
      <div
        v-if="showMentionDropdown"
        class="mention-dropdown"
        :style="dropdownStyle"
      >
        <ul role="list" class="p-6 divide-y divide-slate-200">
          <li
            class="flex py-4 first:pt-0 last:pb-0"
            @click="insertMention(user)"
            v-for="(user, index) in filteredUsers"
            :key="index"
          >
            <img
              class="h-10 w-10 rounded-full"
              src="https://images.unsplash.com/photo-1550525811-e5869dd03032"
              alt=""
            />
            <div class="ml-3 overflow-hidden text-left">
              <p class="text-sm font-medium text-slate-900">{{ user }}</p>
              <p class="text-sm text-slate-500 truncate">
                {{ user }}@gmail.com
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { UploadClient } from "@uploadcare/upload-client";
import Card from "primevue/card";
import Button from "primevue/button";

const client = new UploadClient({ publicKey: "a85de0510c1859a1d10b" });

export default {
  data() {
    return {
      markdownText: "",
      renderedMarkdown: "",
      showMentionDropdown: false,
      filteredUsers: [],
      dragAndDropCapable: false,
      files: [],
      dropdownStyle: {
        top: "0",
        left: "0",
      },
    };
  },
  props: {
    usernames: {
      type: Array,
      required: true,
    },
  },
  components: {
    Card,
    Button,
  },
  mounted() {
    this.dragAndDropCapable = this.determineDragAndDropCapable();
    if (this.dragAndDropCapable) {
      [
        "drag",
        "dragstart",
        "dragend",
        "dragover",
        "dragenter",
        "dragleave",
        "drop",
      ].forEach(
        function (evt) {
          this.$refs.file_input.addEventListener(
            evt,
            function (e) {
              e.preventDefault();
              e.stopPropagation();
            }.bind(this),
            false
          );
        }.bind(this)
      );
      this.$refs.file_input.addEventListener(
        "drop",
        function (e) {
          for (let i = 0; i < e.dataTransfer.files.length; i++) {
            this.files.push(e.dataTransfer.files[i]);
          }
        }.bind(this)
      );
    }
    this.$refs.v_md_editor.$el
      .querySelector("textarea")
      .addEventListener("paste", this.pasteFromClipboard);
  },
  computed: {
    mentionPattern() {
      const usernamesRegex = this.usernames
        .map((username) => `@${username}`)
        .join("|");
      return new RegExp(`(${usernamesRegex})`, "g");
    },
  },
  methods: {
    handleInput(text) {
      if (text == undefined) {
        this.showMentionDropdown = false;
      } else {
        const textarea = this.$refs.v_md_editor.$el.querySelector("textarea");
        const cursorPosition = textarea.selectionEnd;
        const match = text.substring(0, cursorPosition).match(/@(\w+)$/);
        if (match) {
          const typedText = match[1];
          this.filteredUsers = this.usernames.filter((username) =>
            username.toLowerCase().includes(typedText.toLowerCase())
          );

          var coordiates = this.getCaretPosition(textarea);
          this.dropdownStyle = {
            position: "absolute",
            top: coordiates.y + "px",
            left: coordiates.x + 30 + "px",
          };

          this.showMentionDropdown = true;
        } else {
          this.showMentionDropdown = false;
        }
      }
    },

    getCaretPosition(textArea) {
      var start = textArea.selectionStart;
      var end = textArea.selectionEnd;
      var copy = this.createCopy(textArea);
      var range = document.createRange();
      range.setStart(copy.firstChild, start);
      range.setEnd(copy.firstChild, end);
      var selection = document.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      var rect = range.getBoundingClientRect();
      document.body.removeChild(copy);
      textArea.selectionStart = start;
      textArea.selectionEnd = end;
      textArea.focus();
      return {
        x: rect.left - textArea.scrollLeft,
        y: rect.top - textArea.scrollTop,
      };
    },

    createCopy(textArea) {
      var copy = document.createElement("div");
      copy.textContent = textArea.value;
      var style = getComputedStyle(textArea);
      [
        "fontFamily",
        "fontSize",
        "fontWeight",
        "wordWrap",
        "whiteSpace",
        "borderLeftWidth",
        "borderTopWidth",
        "borderRightWidth",
        "borderBottomWidth",
      ].forEach(function (key) {
        copy.style[key] = style[key];
      });
      copy.style.overflow = "auto";
      copy.style.width = textArea.offsetWidth + "px";
      copy.style.height = textArea.offsetHeight + "px";
      copy.style.position = "absolute";
      copy.style.left = textArea.offsetLeft + "px";
      copy.style.top = textArea.offsetTop + "px";
      document.body.appendChild(copy);
      return copy;
    },

    getCursorPosition() {
      const textarea = this.$refs.textarea;
      return textarea.selectionEnd;
    },

    insertMention(user) {
      const textarea = this.$refs.v_md_editor.$el.querySelector("textarea");
      const cursorPosition = textarea.selectionEnd;
      let beforeMention = this.text.substring(0, cursorPosition);
      const afterMention = this.text.substring(cursorPosition);
      const mentionRegex = /@(\w+)$/;
      const mentionMatch = beforeMention.match(mentionRegex);

      if (mentionMatch) {
        beforeMention = beforeMention.replace(mentionRegex, `@${user}`);
      } else {
        const mentionText = `@${user} `;
        beforeMention += mentionText;
      }

      this.text = `${beforeMention}${afterMention}`;
      this.text = this.text.replace(
        this.mentionPattern,
        (mention) => `[${mention}](${mention.substring(1)})`
      );
      textarea.value = this.text;
      textarea.selectionEnd = cursorPosition + user.length + 5;
      this.$refs.v_md_editor.$el
        .querySelector("textarea")
        .dispatchEvent(new Event("input"));

      this.showMentionDropdown = false;
    },

    determineDragAndDropCapable() {
      const div = document.createElement("div");
      return (
        ("draggable" in div || ("ondragstart" in div && "ondrop" in div)) &&
        "FormData" in window &&
        "FileReader" in window
      );
    },

    dragover(e) {
      e.preventDefault();
      this.isDragging = true;
    },
    dragleave() {
      this.isDragging = false;
    },
    drop(e) {
      e.preventDefault();
      this.$refs.file.files = e.dataTransfer.files;
      this.onChange();
      this.isDragging = false;
    },
    async onChange() {
      const files = this.$refs.file.files;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // fileData must be `Blob` or `File` or `Buffer`
        client.uploadFile(file).then((file) => {
          this.$refs.v_md_editor.$el.querySelector(
            "textarea"
          ).value += `![${file.name}](${file.cdnUrl})`;
          this.$refs.v_md_editor.$el
            .querySelector("textarea")
            .dispatchEvent(new Event("input"));
        });
      }
    },
    pasteFromClipboard(e) {
      e.preventDefault();
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file") {
          const blob = item.getAsFile();
          client.uploadFile(blob).then((file) => {
            this.$refs.v_md_editor.$el.querySelector(
              "textarea"
            ).value += `![${file.name}](${file.cdnUrl})`;
            this.$refs.v_md_editor.$el
              .querySelector("textarea")
              .dispatchEvent(new Event("input"));
          });
        }
      }
    },
  },
};
</script>

<style>
/* Add your CSS styling for the editor here */
.editor-container {
  position: relative;
}

textarea {
  width: 100%;
  height: 200px;
}

/* Styles for the mention dropdown */
.mention-container {
  position: relative;
}

.mention-dropdown {
  position: absolute;
  background-color: white;
  border: 1px solid #ccc;
  max-height: 150px;
  overflow-y: auto;
}

.mention-dropdown ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.mention-dropdown li {
  padding: 5px;
  cursor: pointer;
}

.mention-dropdown li:hover {
  background-color: #f0f0f0;
}

.hidden-input {
  position: absolute;
  left: -9999px;
}
</style>
