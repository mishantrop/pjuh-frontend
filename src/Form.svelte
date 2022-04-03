<script>
	import axios from "axios";
	import { onMount } from "svelte";
	import { useMutation } from "@sveltestack/svelte-query";
	import Button from "@smui/button";
	import Textfield from "@smui/textfield";

	import config from "./config";
	import placeholder from "./placeholder";

	const form = {
		text: placeholder,
	};

	onMount(() => {
		console.log("Form Mount");
	});

	const mutation = useMutation((packageJsonText) => {
		return axios.post(
			`${config.api.host}${config.api.endpoints.TEXT_SUBMIT}`,
			packageJsonText,
			{
				headers: {
					"content-type": "application/json; charset=utf-8",
				},
			}
		);
	});

	function handleSubmit(event) {
		event.preventDefault();

		$mutation.mutate(form);
	}
</script>

<main>
	<form method="POST" on:submit={handleSubmit}>
		<Textfield
			disabled={$mutation.isLoading}
			style="width: 100%;"
			helperLine$style="width: 100%;"
			textarea
			bind:value={form.text}
			label="package.json content"
		/>

		<Button variant="raised">Submit</Button>
	</form>
</main>
