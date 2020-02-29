<script>
  import { createEventDispatcher } from "svelte";
  import { baseFetch, baseURL } from "../config";
  import { client } from "../client";
  import { gql } from "apollo-boost";

  const dispatch = createEventDispatcher();

  let listenerRequest = {};
  let listenerSaveRequest = false;

  let eventPattern = "{}";
  let name = "";
  let busName = "";

  export let listenerId;

  let path = "/";
  let method = "PUT";
  let buses = [];

  const requestListener = async () => {
    const { data } = await client.query({
      query: gql`
        {
          listener(id: "${listenerId}") {
            id
            name
            eventPattern
            bus {
              name
            }
          }
          buses {
            name
          }
        }
      `
    });

    let eventPatternRaw = "";
    ({
      listener: {
        name,
        eventPattern: eventPatternRaw,
        bus: { name: busName }
      },
      buses
    } = data);

    eventPattern = JSON.stringify(eventPatternRaw, null, 2);

    return data;
  };

  const updateListener = async () => {
    const response = await fetch(`${baseURL}${path}`, {
      headers: {
        ...baseFetch.headers,
        "Content-Type": "application/json"
      },
      method,
      body: JSON.stringify({ eventPattern: JSON.parse(eventPattern) })
    });

    if (response.ok) {
      const body = await response.json();

      ({ listenerId } = body);

      dispatch("changeListener", { listenerId });

      const queryParams = new URLSearchParams();
      queryParams.set("listenerId", listenerId);
      window.history.pushState(
        {},
        "",
        `${location.pathname}?${queryParams.toString()}`
      );
      return response;
    } else {
      throw new Error("failed to save listener");
    }
  };

  const deleteListener = async () => {
    UIkit.modal("#confirm-delete").hide();

    const resp = await client.query({
      query: gql`
        mutation DeleteListener($id: ID) {
          deleteListener(id: $id)
        }
      `,
      variables: {
        id: listenerId
      }
    });
    console.log(resp);

    console.log("delete");
  };

  const handleDelete = () => (listenerSaveRequest = deleteListener());

  const handleSave = () => (listenerSaveRequest = updateListener());

  $: {
    path = listenerId ? `/${listenerId}` : "/";
    method = listenerId ? "PUT" : "POST";
  }

  $: if (listenerId && !listenerSaveRequest) {
    listenerRequest = requestListener();
  }
</script>

<form>
  <fieldset class="uk-fieldset">

    <h3>Edit</h3>
    {#await listenerRequest}
      <div uk-spinner />
      <p>Loading Listener...</p>
    {:then listener}
      <div class="uk-margin">

        <label>Name</label>
        <input
          class="uk-input"
          type="text"
          placeholder="Listener Name"
          bind:value={name} />
      </div>

      <div class="uk-margin">
        <label>Pattern</label>
        <textarea
          class="uk-textarea uk-text-small"
          rows="8"
          bind:value={eventPattern} />
      </div>

      <div class="uk-margin">
        <label>Bus</label>
        <select value={busName} class="uk-select">
          {#each buses as bus (bus.name)}
            <option>{bus.name}</option>
          {/each}
        </select>
      </div>

      <button
        class="uk-button uk-button-default uk-margin-small-right
        uk-button-danger"
        type="button"
        uk-toggle="target: #confirm-delete">
        Delete
      </button>

      <button
        on:click|preventDefault={handleSave}
        class="uk-align-right uk-button uk-button-primary uk-margin-small-bottom">
        Save
      </button>
    {:catch}
      <p style="color:red;">Error loading Listener definition.</p>
    {/await}
  </fieldset>
</form>

<!-- This is the modal -->
<div id="confirm-delete" uk-modal>
  <div class="uk-modal-dialog uk-modal-body">
    <h2 class="uk-modal-title">Are you sure?</h2>
    <p>
      Are you sure you want to delete this listenener and all captured events?
    </p>
    <p class="uk-text-right">
      <button class="uk-button uk-button-default uk-modal-close" type="button">
        Cancel
      </button>
      <button
        class="uk-button uk-button-danger"
        type="button"
        on:click|preventDefault={deleteListener}>
        Delete
      </button>
    </p>
  </div>
</div>
