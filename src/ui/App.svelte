<script>
  import queryString from "query-string";
  import List from "./routes/List.svelte";
  import Show from "./routes/Show.svelte";
  let queryParams;
  $: {
    queryParams = queryString.parse(location.search);
  }
</script>

<main class="uk-padding-small">
  <h2>Bridger v0.1</h2>

  {#if queryParams.listenerId}
    <Show listenerId={queryParams.listenerId} />
  {:else}
    <List />
  {/if}
</main>
