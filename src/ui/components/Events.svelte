<script>
  import { client } from "../client";
  import { gql } from "apollo-boost";
  import JSONEditor from "./JSONEditor.svelte";
  import Date from "./Date.svelte";

  let eventRequest = [];

  export let listenerId;

  const requestEvents = async () => {
    const { data } = await client.query({
      query: gql`
        {
          events(listenerId: "${listenerId}") {
            source
            time
            detail
            detailType
          }
        }
      `
    });

    return data.events;
  };

  $: if (listenerId) {
    eventRequest = requestEvents();
  }
</script>

<style>
  .eventHeader {
    background-color: #3883fa;
    border-bottom: 0px;
    padding: 2px 5px !important;
    color: #fff;
  }

  .eventHeader h4 {
    color: #fff !important;
    margin-bottom: 0px !important;
  }

  .eventSource {
    clear: both;
  }
  .uk-label {
    color: #3883fa;
    background-color: #fff;
  }
</style>

<div>
  <h3>Events for {listenerId}</h3>
  {#await eventRequest}
    <div uk-spinner />
    <p>Fetching Events...</p>
  {:then events}
    {#each events as event (event.sk)}
      <div class="uk-card-small uk-card-default uk-margin-small-bottom">
        <div class="eventHeader uk-card-header">
          <h4 class="uk-card-title uk-align-left ">
            <span class="uk-label">Detail Type</span>
            {event.detailType}
          </h4>
          <h4 class="eventHeaderText uk-align-right" title={event.time}>
            <Date date={event.time} />
          </h4>
          <p class="eventSource uk-align-clear">
            <span class="uk-label">Source</span>
            {event.source}
          </p>

        </div>
        <JSONEditor json={event.detail} />
      </div>
    {/each}
  {:catch}
    <p style="color:red;">Error calculating diff.</p>
  {/await}
</div>
