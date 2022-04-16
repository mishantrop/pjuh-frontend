<script lang="ts">
	// @ts-nocheck

	import axios, { AxiosResponse } from "axios";
	// import { onMount } from "svelte";
	import { writable } from 'svelte/store';
	import { useMutation } from "@sveltestack/svelte-query";
	import Button from "@smui/button";
	import FormField from "@smui/form-field";
	import LinearProgress from '@smui/linear-progress';
	import LayoutGrid, { Cell } from '@smui/layout-grid';
	import Textfield from "@smui/textfield";
	import type { SnackbarComponentDev } from '@smui/snackbar';
  	import Snackbar, { Label } from '@smui/snackbar';
	import Radio from "@smui/radio";
	import Ripple from '@smui/ripple';

	import Dropzone from "./components/dropzone/Dropzone.svelte";
	import config from "./config";
	import placeholder from "./placeholder";
	import { getNpmInstallCommand } from "./getNpmInstallCommand";
	import type { ParseResult } from "../types";

	const form = {
		text: placeholder,
	};

	let updateInfo = writable<ParseResult>(undefined)
	$: npmInstallCommand = getNpmInstallCommand($updateInfo)

	let snackbarNpmCommandCopied: SnackbarComponentDev;
	let snackbarSomeUploadError: SnackbarComponentDev;
	let snackbarAPIError: SnackbarComponentDev;

	// onMount(() => {
	// 	console.log("Form Mount");
	// });

	function handleResponse(data: ParseResult) {
		updateInfo.set(data)
	}

	const mutation = useMutation(async (packageJsonText) => {
		try {
			const response=await axios.post(
				`${config.api.host}${config.api.endpoints.TEXT_SUBMIT}`,
				packageJsonText,
				{
					headers: {
						"content-type": "application/json; charset=utf-8",
					},
				}
			);
			handleResponse(response.data);
		} catch {
			snackbarAPIError.open();
		}
	});

	function handleSubmit(event) {
		event.preventDefault();

		$mutation.mutate(form);
	}

	function handleFilesSelect(event: { detail: { acceptedFiles: unknown[]; fileRejections: unknown[]; } }) {
		const { acceptedFiles, fileRejections } = event.detail;

		if (fileRejections.length === 1) {
			snackbarSomeUploadError.open()
		}

		if (acceptedFiles.length === 1) {
			const formData = new FormData();
			formData.append('file', acceptedFiles[0]);

			axios.post(
				`${config.api.host}${config.api.endpoints.FILE_SUBMIT}`,
				formData,
				{
					headers: {
						'content-type': 'multipart/form-data',
					},
				}
			).then((response: AxiosResponse<ParseResult>) => {
				handleResponse(response.data)
			}).catch(() => {
				snackbarAPIError.open()
			});
		}
	}

	function handleNpmCommandClick() {
		navigator.clipboard.writeText(npmInstallCommand);
		snackbarNpmCommandCopied.open()
	}
</script>

<main>
	{#if $mutation.isLoading}
		<LinearProgress indeterminate />
	{/if}

	<LayoutGrid>
		<Cell span={5}>
			<Dropzone
				accept="application/json"
				disabled={$mutation.isLoading}
				maxSize={4096}
				multiple={false}
				on:drop={handleFilesSelect}
			>
				Drop here package.json file
			</Dropzone>
		</Cell>
		<Cell span={1}>
			OR
		</Cell>
		<Cell span={6}>
			<form method="POST" on:submit={handleSubmit}>
				<Textfield
					disabled={$mutation.isLoading}
					helperLine$style="width: 100%;"
					label="Paste here package.json content"
					rows={32}
					style="width: 100%;"
					textarea
					bind:value={form.text}
				/>
				<br>
				<br>
				<Button variant="raised">Submit</Button>
			</form>
		</Cell>
	</LayoutGrid>

	<h2>Options</h2>

	{#if $updateInfo}
		<h2>Result</h2>

		<p
			use:Ripple={{ surface: true, color: 'primary' }}
			tabindex="0"
			on:click={handleNpmCommandClick}
		>
			{npmInstallCommand}
		</p>
	{/if}

	<Snackbar bind:this={snackbarNpmCommandCopied}>
		<Label>Command copied to clipboard</Label>
	</Snackbar>

	<Snackbar bind:this={snackbarSomeUploadError}>
		<Label>File uploading is rejected</Label>
	</Snackbar>

	<Snackbar bind:this={snackbarAPIError}>
		<Label>Some API Error</Label>
	</Snackbar>
</main>
