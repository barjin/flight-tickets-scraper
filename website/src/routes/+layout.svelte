<script>
	import Header from './Header.svelte';
	import './styles.css';

	import { writable } from 'svelte/store';
	import { setContext } from 'svelte';

	let currencyRates = writable([]);
	let currency = writable('CZK');

	setContext('currencyRates', currencyRates);
	setContext('currency', currency);

	(async () => {
		const response = await fetch('https://raw.githubusercontent.com/barjin/flight-tickets-scraper/master/results/currency.json');
		const data = await response.json();

		currencyRates.set(data.rates);
	})();
</script>

<div class="app">
	<Header />
	<main>
		<slot />
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
