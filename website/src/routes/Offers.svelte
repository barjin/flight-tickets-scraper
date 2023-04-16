<script>
	import Offer from './Offer.svelte';
	function sanitizeData(data) {
		return data
		.filter(x => x['Price (USD)'] && x['Price (USD)'] !== 'undefined')
		.map((item) => {
			return {
				city: item.City,
				airport: item.Airport,
				price: Number(item['Price (USD)']),
				departureDate: item.From,
				returnDate: item.To,
			};
		})
		.sort((a,b) => a.price - b.price);
	}

	const url = "https://raw.githubusercontent.com/barjin/flight-tickets-scraper/master/results/recent.json";
	const fetchData = (async () => {
		const response = await fetch(url);
    	const data = await response.json();

		return sanitizeData(data);
	})();
</script>

<pre>Last update at {(new Date().toLocaleDateString())}, 00:00</pre>
{#await fetchData}
	<p>Loading data...</p>
{:then data}
	{#each data.slice(0,5) as offer}
		<Offer {...offer} />
	{/each}
{:catch error}
	<p>An error occurred!</p>
{/await}