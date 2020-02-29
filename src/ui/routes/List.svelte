<script>
  import { onMount } from "svelte";
  import { client } from "../client";
  import { gql } from "apollo-boost";

  let listRequest = [];

  const getListeners = async () => {
    const { data } = await client.query({
      query: gql`
        {
          listeners {
            id
            name
            bus {
              name
            }
          }
        }
      `
    });

    console.log(data);
    return data.listeners;
  };

  onMount(async () => {
    listRequest = getListeners();
  });
</script>

<h3>Listeners</h3>

{#await listRequest}
  <div uk-spinner />
  <p>Loading Listeners...</p>
{:then listeners}
  <table class="uk-table uk-table-striped">
    <thead>
      <tr>
        <th>Name</th>
        <th>Bus</th>
        <th>&nbsp;</th>
      </tr>
    </thead>
    <tbody>
      {#each listeners as listener (listener.id)}
        <tr>
          <td>{listener.name}</td>
          <td>{listener.bus.name}</td>
          <td>
            <a href="/?listenerId={listener.id}">Show</a>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  <br />
{:catch}
  <p style="color:red;">Error loading Listener definition.</p>
{/await}
