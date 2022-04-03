<script>
	import Form from "./Form.svelte";

	import { onMount } from "svelte";
	import {
		QueryClient,
		QueryClientProvider,
	} from "@sveltestack/svelte-query";

	const queryClient = new QueryClient();

	onMount(() => {
		console.log("App Mount");
	});
</script>

<QueryClientProvider client={queryClient}>
	<h1>package.json updater</h1>

	<Form />
</QueryClientProvider>
