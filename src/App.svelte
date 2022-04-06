<script lang="ts">
  // import { onMount } from "svelte";
  import { QueryClient, QueryClientProvider } from "@sveltestack/svelte-query";

  import Form from "./Form.svelte";

  const queryClient = new QueryClient();

  // onMount(() => {
  //   console.log("App Mount");
  // });
</script>

<QueryClientProvider client={queryClient}>
  <main>
    <h1>package.json updater</h1>

    <Form />
  </main>
</QueryClientProvider>

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }

  main {
    text-align: center;
    padding: 0 1em;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 1.8rem;
    font-weight: 100;
    line-height: 1.2;
    margin: 1rem auto;
  }

  @media (min-width: 480px) {
    h1 {
      font-size: 1.5rem;
    }
  }
</style>
