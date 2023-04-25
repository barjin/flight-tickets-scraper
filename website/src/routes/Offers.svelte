<script>
	import Destination from "./Destination.svelte";

	function normalizeRecords(airportRecord) {
		const { flightprices } = airportRecord;
		
		return flightprices.map((flightprice) => {
			const x = {
				...flightprice,
				...airportRecord,
			};

			delete x.flightprices;

			return x;
		});
	}

	const url = "https://raw.githubusercontent.com/barjin/flight-tickets-scraper/master/results/recent.json";

	let sortMode = 'price';
	let query = '';
	let dateStart = 0;
	let dateEnd = +Date.now() + 1000 * 60 * 60 * 24 * 365;

	function sorter(a,b) {
		if (sortMode === 'price') {
			return a.price - b.price;
		} else if (sortMode === 'priceforkm') {
			return (a.price / a.distance) - (b.price / b.distance);
		} else if (sortMode === 'distance') {
			return a.distance - b.distance;
		} else if (sortMode === 'distance_des') {
			return b.distance - a.distance;
		}
	}

	let destinations = (async () => {
		const response = await fetch(url);
    	const data = await response.json();

		return data
			.map(normalizeRecords)
			.filter(x => x.length > 0)
	})();

	$: filteredData = (async () => {
		if(sortMode){} // to trick svelte into reordering on sortMode change

		const data = (await destinations)
			.map(destination => {
				return destination.filter(x => {
					return new Date(x.dateFrom) >= new Date(dateStart) && new Date(x.dateTo) <= new Date(dateEnd);
				})
			})
			.filter(x => x.length > 0)
			.map(x => x.sort(sorter))
			.sort((a,b) => sorter(a[0], b[0]));

		if (query === '') {
			return data;
		}

		return data.filter(x => 
			x[0].label.toLowerCase().includes(query.toLowerCase()) 
			|| x[0].iata.toLowerCase().includes(query.toLowerCase()) 
			|| x[0].e.toLowerCase().includes(query.toLowerCase()));
	})();
</script>

<pre>Last update at {(new Date().toLocaleDateString())}, 00:00</pre>
<div class="inputs">
	<div>Flying from: 
		<select>
			<option value="PRG">Prague (PRG)</option>
		</select>
	</div>
	<input bind:value={query} placeholder="Search..." />
	<div class="country-buttons">
		{#await filteredData}
			<div></div>
		{:then filteredData} 
			{#each filteredData.slice(0,5).map(x => x[0].e).filter((x,i,a) => a.findIndex(b => b === x) === i) as emoji}
				<button on:click={() => {query = emoji}}>{emoji}</button>
			{/each}
		{/await}
	</div>
	<div class="dateRow">
		Search from:
		<input type="date" bind:value={dateStart}>
	</div>
	<div class="dateRow">
		Search to:
		<input type="date" bind:value={dateEnd}/>
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
{#await filteredData}
	<p>Loading destinations...</p>
{:then filteredData}
	<div style="display: flex; flex-direction: column; width">
		{#each filteredData.slice(0,10) as offers}
			<Destination {offers}/>
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

	.dateRow {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 80%
	}
</style>