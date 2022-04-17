<script lang="ts">
	import axios from "axios"
	import type { AxiosResponse } from "axios"
	import { writable } from 'svelte/store'
	import { _ } from 'svelte-i18n'
	import { useMutation } from "@sveltestack/svelte-query"
	import Button, { Icon } from "@smui/button"
	import Checkbox from '@smui/checkbox'
	import DataTable, { Head, Body, Row, Cell as TableCell } from '@smui/data-table'
	import IconButton from '@smui/icon-button'
	import LinearProgress from '@smui/linear-progress'
	import LayoutGrid, { Cell } from '@smui/layout-grid'
	import Snackbar, { Label } from '@smui/snackbar'
	import type { SnackbarComponentDev } from '@smui/snackbar'
	import Textfield from "@smui/textfield"
	import Ripple from '@smui/ripple'

	import Dropzone from "./components/dropzone/Dropzone.svelte"
	import { getConfig } from "./config"
	import { getNpmInstallCommand } from "./getNpmInstallCommand"
	import placeholder from "./placeholder"
	import type { UpdateMode, Package, ParseResult } from "../types"

	const config = getConfig({ isDev: import.meta.env.DEV })

	const form = {
		text: placeholder,
	};

	let updateInfo = writable<ParseResult>(undefined)
	$: npmInstallCommand = getNpmInstallCommand($updateInfo)
	$: isAllChecked = ($updateInfo?.allDependencies || []).every((dep) => dep.meta.isUpdating)
	$: isAllUnchecked = ($updateInfo?.allDependencies || []).every((dep) => !dep.meta.isUpdating)

	let snackbarNpmCommandCopied: SnackbarComponentDev;
	let snackbarSomeUploadError: SnackbarComponentDev;
	let snackbarAPIError: SnackbarComponentDev;
	let snackbarFrontendError: SnackbarComponentDev;

	function handleResponse(data: ParseResult) {
		// TODO remove data mutation
		data.allDependencies = data.allDependencies.filter((pkg) => !!pkg.after.semver && pkg.before.raw !== pkg.after.semver)

		// Mark update mode (semver by default)
		data.allDependencies = data.allDependencies.map((pkg) => {
			pkg.meta.updateMode = 'SEMVER'
			return pkg
		})

		updateInfo.set(data)
	}

	function setPackageUpdateMode(pkg: Package, updateMode: UpdateMode) {
		for (let i = 0; i < $updateInfo.allDependencies.length; i++) {
			const currentPkg = $updateInfo.allDependencies[i]
			if (currentPkg.name === pkg.name) {
				$updateInfo.allDependencies[i].meta.updateMode = updateMode
			}
		}
	}

	function setPackagesUpdateMode(updateMode: UpdateMode) {
		for (let i = 0; i < $updateInfo.allDependencies.length; i++) {
			$updateInfo.allDependencies[i].meta.updateMode = updateMode
		}
	}

	const mutation = useMutation(async (packageJsonText) => {
		updateInfo.set(undefined)

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
			try {
				handleResponse(response.data);
			} catch (exception) {
				snackbarFrontendError.open()
			}
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

	function handleCheckPackage(packageInfo: Package) {
		const newUpdateInfo = $updateInfo
		newUpdateInfo.allDependencies = newUpdateInfo.allDependencies.map((d) => ({
			...d,
			meta: {
				...d.meta,
				isUpdating: packageInfo.name === d.name ? !d.meta.isUpdating : d.meta.isUpdating,
			}
		}))

		updateInfo.set(newUpdateInfo)
	}

	function handleTotalCheckboxClick(event) {
		event.preventDefault()

		const newUpdateInfo = $updateInfo

		newUpdateInfo.allDependencies = newUpdateInfo.allDependencies.map((d) => ({
			...d,
			meta: {
				...d.meta,
				isUpdating: !isAllChecked,
			}
		}))

		updateInfo.set(newUpdateInfo)
	}
</script>

<main>
	<h2>{$_('step1.header')}</h2>
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
					label={$_('step1.textfield.label')}
					style="min-height: 128px; width: 100%;"
					textarea
					bind:value={form.text}
				/>
				<br>
				<br>
				<Button variant="raised">
					{$_('step1.submit')}
				</Button>
			</form>
		</Cell>
	</LayoutGrid>

	{#if $mutation.isLoading}
		<LinearProgress indeterminate />
	{:else}
		<div style="height: 4px;"></div>
	{/if}

	{#if $updateInfo}
		<h2>2. Select packages versions</h2>

		<DataTable stickyHeader style="max-width: 100%;">
			<Head>
				<Row>
					<TableCell checkbox={false}>
						<Checkbox
							checked={isAllChecked}
							indeterminate={isAllUnchecked ? false : !isAllChecked}
							on:change={handleTotalCheckboxClick}
						/>
					</TableCell>
					<TableCell>Name</TableCell>
					<TableCell>Now</TableCell>
					<TableCell>
						<Button on:click="{() => setPackagesUpdateMode('SEMVER')}">
							<Label>Semver</Label>
						</Button>
					</TableCell>
					<TableCell>
						<Button on:click="{() => setPackagesUpdateMode('LATEST')}">
							<Label>Latest</Label>
						</Button>
					</TableCell>
					<TableCell>
						<Button on:click="{() => setPackagesUpdateMode('LATEST_FIXED')}">
							<Label>Latest Fixed</Label>
						</Button>
					</TableCell>
				</Row>
			</Head>
			<Body>
				{#each $updateInfo.allDependencies as packageInfo (packageInfo.name)}
					<Row checkbox={false}>
						<TableCell checkbox={false}>
							<Checkbox
								checked={packageInfo.meta.isUpdating}
								on:change={() => { handleCheckPackage(packageInfo) }}
							/>
						</TableCell>
						<TableCell>
							<a href={`https://www.npmjs.com/package/${packageInfo.name}`} target="_blank" rel="nofollow noopener">
								{packageInfo.name}
							</a>
						</TableCell>
						<TableCell>{packageInfo.before.raw}</TableCell>
						<TableCell>
							{#if packageInfo.meta.updateMode === 'SEMVER'}
								<div class="cellfixed">
									<Button>
										<Icon class="material-icons">check</Icon>
										<Label>{packageInfo.after.semver}</Label>
									</Button>
								</div>
							{:else}
								<div class="cellfixed">
									<Button class="cellfixed" color="secondary" on:click="{() => setPackageUpdateMode(packageInfo, 'SEMVER')}">
										<Label>{packageInfo.after.semver}</Label>
									</Button>
								</div>
							{/if}
						</TableCell>
						<TableCell>
							{#if packageInfo.meta.updateMode === 'LATEST'}
								<div class="cellfixed">
									<Button>
										<Icon class="material-icons">check</Icon>
										<Label>{packageInfo.after.latest}</Label>
									</Button>
								</div>
							{:else}
								<div class="cellfixed">
									<Button color="secondary" on:click="{() => setPackageUpdateMode(packageInfo, 'LATEST')}">
										<Label>{packageInfo.after.latest}</Label>
									</Button>
								</div>
							{/if}
						</TableCell>
						<TableCell>
							{#if packageInfo.meta.updateMode === 'LATEST_FIXED'}
								<div class="cellfixed">
									<Button>
										<Icon class="material-icons">check</Icon>
										<Label>{packageInfo.after.latestFixed}</Label>
									</Button>
								</div>
							{:else}
								<div class="cellfixed">
									<Button color="secondary" on:click="{() => setPackageUpdateMode(packageInfo, 'LATEST_FIXED')}">
										<Label>{packageInfo.after.latestFixed}</Label>
									</Button>
								</div>
							{/if}
						</TableCell>
					</Row>
				{/each}
			</Body>
		</DataTable>

		<h2>3. Run this command (or dont)</h2>

		<p
			use:Ripple={{ surface: true, color: 'primary' }}
			tabindex="0"
			on:click={handleNpmCommandClick}
		>
			<IconButton
				class="material-icons" on:click={handleNpmCommandClick}
			>
				content_copy
			</IconButton>
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

	<Snackbar bind:this={snackbarFrontendError}>
		<Label>Some FrontEnd Error</Label>
	</Snackbar>
</main>

<style>
	.cellfixed {
		min-width: 128px;
	}
</style>