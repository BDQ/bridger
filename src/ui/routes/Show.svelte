<script>
  import Edit from "../components/Edit.svelte";
  import Events from "../components/Events.svelte";

  export let listenerId = null;

  function handleChangeListener(event) {
    ({ listenerId } = event.detail);
  }
</script>

<div class="uk-grid">
  <div class="uk-width-1-4">
    <Edit {listenerId} on:changeListener={handleChangeListener} />
  </div>
  <div class="uk-width-3-4">
    <Events {listenerId} />
  </div>
</div>
