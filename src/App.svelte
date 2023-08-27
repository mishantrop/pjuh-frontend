<script lang="ts">
  import { onMount } from 'svelte'
  import { _, addMessages, init, getLocaleFromNavigator } from 'svelte-i18n'
  import { QueryClient, QueryClientProvider } from '@sveltestack/svelte-query'

  import Form from './Form.svelte'

  import en from './locales/en.json'
  import ru from './locales/ru.json'

  addMessages('en', en)
  addMessages('ru', ru)

  init({
    fallbackLocale: 'en',
    initialLocale: getLocaleFromNavigator(),
  })

  const queryClient = new QueryClient()

  onMount(() => {
    const spinner = document.getElementById('global-spinner')
    if (spinner) {
      spinner.classList.remove('global-spinner-wrapper--visible')
    }
	});
</script>

<QueryClientProvider client={queryClient}>
  <Form />
</QueryClientProvider>

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", Tahoma;
  }
</style>
