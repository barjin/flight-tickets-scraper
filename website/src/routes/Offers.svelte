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
				distance: item.distance,
				e: item.e
			};
		});
	}

	const url = "https://raw.githubusercontent.com/barjin/flight-tickets-scraper/master/results/recent.json";
	const currencyUrl = "https://raw.githubusercontent.com/barjin/flight-tickets-scraper/master/results/currency.json";

	let data = Promise.resolve([]);

	let sortMode = 'price';
	let query = '';

	let currencyRates = writable(null);
	setContext('currencyRates', currencyRates);

	function sort(data, sortMode) {
		if (sortMode === 'price') {
			return data.sort((a,b) => a.price - b.price);
		} else if (sortMode === 'distance') {
			return data.sort((a,b) => a.distance - b.distance);
		} else if (sortMode === 'priceforkm') {
			return data.sort((a,b) => (a.price / a.distance) - (b.price / b.distance));
		} else if (sortMode === 'distance_des') {
			return data.sort((a,b) => (b.distance) - (a.distance));
		}
	}

	let rawData = (async () => {
		const response = await fetch(url);
    	const data = await response.json();

		return sort(sanitizeData(data), sortMode);
	})();

	$: data = rawData.then(data => {
		if (query) {
			return sort(data.filter(x => 
				x.city.toLowerCase().includes(query.toLowerCase()) || 
				x.airport.toLowerCase().includes(query.toLowerCase()) ||
				x.e.toLowerCase().includes(query.toLowerCase())
			), sortMode);
		} else {
			return sort(data, sortMode);
		}
	});
	
	(async () => {
		const response = await fetch(currencyUrl);
		const data = await response.json();
		$currencyRates = data.rates;
	})();
</script>

<pre>Last update at {(new Date().toLocaleDateString())}, 00:00</pre>
<div class="inputs">
	<input bind:value={query} placeholder="Search..." />
	<div class="country-buttons">
		{#await data}
			<div></div>
		{:then data} 
			{#each data.slice(0,5).map(x => x.e).filter((x,i,a) => a.findIndex(b => b === x) === i) as emoji}
				<button on:click={() => {query = emoji}}>{emoji}</button>
			{/each}
		{/await}
	</div>
	<div>
		Sort by: 
		<select bind:value={sortMode}>
			<option value="price">Price</option>
			<option value="priceforkm">Price for km</option>
			<option value="distance">Closest</option>
			<option value="distance_des">Furthest</option>
		</select>
	</div>
</div>
{#await data}
	<p>Loading data...</p>
{:then data}
	<div style="display: flex; flex-direction: column; width">
		{#each sort(data, sortMode).slice(0,10) as offer}
			<Offer {...offer} />
		{/each}
	</div>
{:catch error}
	<p>An error occurred!</p>
{/await}

<style>
	.inputs {
		display: flex;
		flex-direction: column;
		width: 25rem;
	}

	.inputs > * {
		margin-top: 10px;
		width: 100%
	}

	input {
		padding: 10px;
		border: 1px solid #ccc;
		border-radius: 5px;
	}

	.country-buttons {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
	}

	.country-buttons > button {
		padding: 5px;
		border: 1px solid #ccc;
		border-radius: 5px;
		margin: 5px;
		font-size: 2rem;
	}
</style>