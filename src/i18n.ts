import { init, addMessages } from 'svelte-i18n'

import en from './locales/en.json'

addMessages('en', en)

export const initLocales = () => {
    init({
        fallbackLocale: 'en',
        initialLocale: 'en',
    })
}
