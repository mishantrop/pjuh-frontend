<script lang="ts">
	import axios from "axios"
	import type { AxiosResponse } from "axios"
	import { writable } from 'svelte/store'
	import { useMutation } from "@sveltestack/svelte-query"
	import Button from "@smui/button"
	import LinearProgress from '@smui/linear-progress'
	import LayoutGrid, { Cell } from '@smui/layout-grid'
	import type { SnackbarComponentDev } from '@smui/snackbar'
	import DataTable, { Head, Body, Row, Cell as TableCell } from '@smui/data-table'
	import Textfield from "@smui/textfield"
  	import Snackbar, { Label } from '@smui/snackbar'
	import Ripple from '@smui/ripple';


	import Dropzone from "./components/dropzone/Dropzone.svelte"
	import config from "./config"
	import { getNpmInstallCommand } from "./getNpmInstallCommand"
	import placeholder from "./placeholder"
	import { DependencyCategory, UpdateMode, type Package, type ParseResult } from "../types"

	const form = {
		text: placeholder,
	};

	let updateInfo = writable<ParseResult>(undefined)
	$: npmInstallCommand = getNpmInstallCommand($updateInfo)

	let snackbarNpmCommandCopied: SnackbarComponentDev;
	let snackbarSomeUploadError: SnackbarComponentDev;
	let snackbarAPIError: SnackbarComponentDev;

	function handleResponse(data: ParseResult) {
		// TODO remove data mutation
		Object.values(DependencyCategory).forEach((category) => {
			data[category] = data[category].filter((pkg) => !!pkg.after.semver && pkg.before.raw !== pkg.after.semver)
		})

		// Mark update mode (semver by default)
		Object.values(DependencyCategory).forEach((category) => {
			data[category] = data[category].map((pkg) => {
				pkg.after.selected = UpdateMode.SEMVER
				return pkg
			})
		})


		updateInfo.set(data)
	}

	function setPackageUpdateMode(pkg: Package, updateMode: UpdateMode) {
		Object.values(DependencyCategory).forEach((category) => {
			for (let i = 0; i < $updateInfo[category].length; i++) {
				const currentPkg = $updateInfo[category][i]

				if (currentPkg.name === pkg.name) {
					console.log(currentPkg.name, '===', pkg.name);

					$updateInfo[category][i].after.selected = updateMode
				}
			}
		})
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

		// @ts-ignore
		$mutation.mutate(form);
	}

	function handleFilesSelect(event: { detail: { acceptedFiles: Array<string | Blob>; fileRejections: Array<string | Blob>; } }) {
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
					style="height: 64px; width: 100%;"
					textarea
					bind:value={form.text}
				/>
				<br>
				<br>
				<Button variant="raised">Submit</Button>
			</form>
		</Cell>
	</LayoutGrid>

	{#if $mutation.isLoading}
		<LinearProgress indeterminate />
	{:else}
		<div style="height: 4px;"></div>
	{/if}

	{#if $updateInfo}
		<h2>Result</h2>

		<DataTable style="max-width: 100%;">
			<Head>
				<Row>
				<TableCell>Name</TableCell>
				<TableCell>Now</TableCell>
				<TableCell>Semver</TableCell>
				<TableCell>Latest</TableCell>
				<TableCell>Latest Fixed</TableCell>
				</Row>
			</Head>
			<Body>
				{#each $updateInfo.dependencies as packageInfo (packageInfo.name)}
					<Row>
						<TableCell>{packageInfo.name}</TableCell>
						<TableCell>{packageInfo.before.raw}</TableCell>
						<TableCell>
							<button
								class="{packageInfo.after.selected === 'SEMVER' ? 'cell-checked' : ''}"
								on:click="{() => setPackageUpdateMode(packageInfo, UpdateMode.SEMVER)}"
							>
								{packageInfo.after.semver}
							</button>
						</TableCell>
						<TableCell>
							<button
								class="{packageInfo.after.selected === 'LATEST' ? 'cell-checked' : ''}"
								on:click="{() => setPackageUpdateMode(packageInfo, UpdateMode.LATEST)}"
							>
								{packageInfo.after.latest}
							</button>
						</TableCell>
						<TableCell>
							<button
								class="{packageInfo.after.selected === 'LATEST_FIXED' ? 'cell-checked' : ''}"
								on:click="{() => setPackageUpdateMode(packageInfo, UpdateMode.LATEST_FIXED)}"
							>
								{packageInfo.after.latestFixed}
							</button>
						</TableCell>
					</Row>
				{/each}
				{#each $updateInfo.devDependencies as packageInfo (packageInfo.name)}
					<Row>
						<TableCell>{packageInfo.name}</TableCell>
						<TableCell>{packageInfo.before.raw}</TableCell>
						<TableCell>
							<button
								class="{packageInfo.after.selected === 'SEMVER' ? 'cell-checked' : ''}"
								on:click="{() => setPackageUpdateMode(packageInfo, UpdateMode.SEMVER)}"
							>
								{packageInfo.after.semver}
							</button>
						</TableCell>
						<TableCell>
							<button
								class="{packageInfo.after.selected === 'LATEST' ? 'cell-checked' : ''}"
								on:click="{() => setPackageUpdateMode(packageInfo, UpdateMode.LATEST)}"
							>
								{packageInfo.after.latest}
							</button>
						</TableCell>
						<TableCell>
							<button
								class="{packageInfo.after.selected === 'LATEST_FIXED' ? 'cell-checked' : ''}"
								on:click="{() => setPackageUpdateMode(packageInfo, UpdateMode.LATEST_FIXED)}"
							>
								{packageInfo.after.latestFixed}
							</button>
						</TableCell>
					</Row>
				{/each}
				{#each $updateInfo.peerDependencies as packageInfo (packageInfo.name)}
					<Row>
						<TableCell>{packageInfo.name}</TableCell>
						<TableCell>{packageInfo.before.raw}</TableCell>
						<TableCell>
							<button
								class="{packageInfo.after.selected === 'SEMVER' ? 'cell-checked' : ''}"
								on:click="{() => setPackageUpdateMode(packageInfo, UpdateMode.SEMVER)}"
							>
								{packageInfo.after.semver}
							</button>
						</TableCell>
						<TableCell>
							<button
								class="{packageInfo.after.selected === 'LATEST' ? 'cell-checked' : ''}"
								on:click="{() => setPackageUpdateMode(packageInfo, UpdateMode.LATEST)}"
							>
								{packageInfo.after.latest}
							</button>
						</TableCell>
						<TableCell>
							<button
								class="{packageInfo.after.selected === 'LATEST_FIXED' ? 'cell-checked' : ''}"
								on:click="{() => setPackageUpdateMode(packageInfo, UpdateMode.LATEST_FIXED)}"
							>
								{packageInfo.after.latestFixed}
							</button>
						</TableCell>
					</Row>
				{/each}
			</Body>
		</DataTable>

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

<style>
	.cell-checked {
		color: rgb(6, 107, 40);
	}
</style>