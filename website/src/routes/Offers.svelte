<script>
	import Offer from './Offer.svelte';
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
	{#each data.slice(0,10) as offer}
		<Offer {...offer} />
	{/each}
{:catch error}
	<p>An error occurred!</p>
{/await}