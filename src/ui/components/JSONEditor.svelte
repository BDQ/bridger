<script>
  import { onMount } from "svelte";
  import JSONEditor from "jsoneditor";
  import "jsoneditor/dist/jsoneditor.css";

  export let json;
  const id = Math.random();

  onMount(async () => {
    const container = document.getElementById(id);
    const editor = new JSONEditor(
      container,
      {
        mode: "view",
        maxVisibleChilds: 10,

        navigationBar: false,
        modes: ["view", "preview"]
      },
      json
    );
  });
</script>

<div class="editor" {id} />
