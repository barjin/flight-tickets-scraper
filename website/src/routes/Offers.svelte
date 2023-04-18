<script>
	import Offer from './Offer.svelte';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';

	function sanitizeData(data) {
		return data
		.filter(x => x.flightprices.length > 0)
		.map((item) => {
			const bestOffer = item.flightprices.sort((a,b) => a.price - b.price)[0];
			
			return {
				city: `${item.e} ${item.label}`,
				airport: item.iata,
				price: bestOffer.price,
				departureDate: bestOffer.dateFrom,
				returnDate: bestOffer.dateTo,
				distance: item.distance
			};
		})
		.sort((a,b) => a.price - b.price);
	}

	const url = "https://raw.githubusercontent.com/barjin/flight-tickets-scraper/master/results/recent.json";
	const currencyUrl = "https://raw.githubusercontent.com/barjin/flight-tickets-scraper/master/results/currency.json";

	let currencyRates = writable(null);
	setContext('currencyRates', currencyRates);

	const fetchData = (async () => {
		const response = await fetch(url);
    	const data = await response.json();

		return sanitizeData(data);
	})();
	
	(async () => {
		const response = await fetch(currencyUrl);
		const data = await response.json();
		$currencyRates = data.rates;
	})();
</script>

<pre>Last update at {(new Date().toLocaleDateString())}, 00:00</pre>
{#await fetchData}
	<p>Loading data...</p>
{:then data}
	<div style="display: flex; flex-direction: column; width">
		{#each data.slice(0,10) as offer}
			<Offer {...offer} />
		{/each}
	</div>
{:catch error}
	<p>An error occurred!</p>
{/await}