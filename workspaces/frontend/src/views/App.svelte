<script lang="ts">
  import Router from 'svelte-spa-router';
  import { wrap } from 'svelte-spa-router/wrap';
  import Loading from '../components/Loading.svelte';
  import { markerStore } from '../stores/markers';
  import { markerTypeStore } from '../stores/markerTypes';
  import { locationStore } from '../stores/locations';

  const pageTitle = import.meta.env.VITE_PAGE_TITLE ?? 'Desk Compass';
  const appVersion = import.meta.env.PACKAGE_VERSION ?? '';

  const loadDataFn = async () => {
    const markerTypesInitialized = await markerTypeStore.init();
    if (markerTypesInitialized) {
      return (await locationStore.init()) && (await markerStore.init());
    }
    return false;
  };

  let routes = {
    '/': wrap({
      asyncComponent: () => import('../components/Screen.svelte'),
      loadingComponent: Loading,
      conditions: [loadDataFn],
    }),
    '/locations/:locationId': wrap({
      asyncComponent: () => import('../components/Screen.svelte'),
      loadingComponent: Loading,
      conditions: [loadDataFn],
    }),
    '/locations/:locationId/markers/:markerId': wrap({
      asyncComponent: () => import('../components/Screen.svelte'),
      loadingComponent: Loading,
      conditions: [loadDataFn],
    }),
    '/locations/:locationId/coords/:lat/:lng/:zoom': wrap({
      asyncComponent: () => import('../components/Screen.svelte'),
      loadingComponent: Loading,
      conditions: [loadDataFn],
    }),
  };
</script>

<svelte:head>
  <title>{pageTitle} {appVersion}</title>
</svelte:head>

<main>
  <Router {routes} />
</main>
