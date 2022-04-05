<script lang="ts">
	// @ts-nocheck

	import axios, { AxiosResponse } from "axios";
	import { onMount } from "svelte";
	// import Dropzone from "svelte-file-dropzone";
	import { useMutation } from "@sveltestack/svelte-query";
	import Button from "@smui/button";
	import Textfield from "@smui/textfield";

	import config from "./config";
	import placeholder from "./placeholder";
	import type { ParseResult } from "../types";

	const form = {
		text: placeholder,
	};

	let npmcomand = 'Hello, world'

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
		).then((response: AxiosResponse<ParseResult>) => {
			const info = response.data
			console.log(info.dependencies.map((p) => p.name).join('; '))

			npmcomand = `npm i -E ${info.dependencies.map((p) => `${p.name}@${p.after.versionFixed}`).join(' ')}`
		});
	});

	function handleSubmit(event) {
		event.preventDefault();

		$mutation.mutate(form);
	}

	// function handleFilesSelect(e) {
	// 	const { acceptedFiles, fileRejections } = e.detail;
	// 	console.log(acceptedFiles);
	// 	console.log(fileRejections);

	// 	// files.accepted = [...files.accepted, ...acceptedFiles];
	// 	// files.rejected = [...files.rejected, ...fileRejections];
	// }
</script>

<main>
	<form method="POST" on:submit={handleSubmit}>
		<!-- <Dropzone on:drop={handleFilesSelect} /> -->

		<Textfield
			disabled={$mutation.isLoading}
			style="width: 100%;"
			helperLine$style="width: 100%;"
			textarea
			bind:value={form.text}
			label="package.json content"
			rows={32}
		/>

		<Button variant="raised">Submit</Button>

		<h2>Result</h2>

		<div>
			{npmcomand}
		</div>
	</form>
</main>
