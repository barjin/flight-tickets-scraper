<script>
    import { getContext } from "svelte";
	export let airport;
    export let city;
    export let price;
    export let departureDate;
    export let returnDate;
    export let distance;

    let rates;

    const currencyStore = getContext('currencyRates');

    currencyStore.subscribe(value => {
        rates = value;
    });
</script>

{#if rates}
    <div>
        <h3>{city} ({airport}) - {Math.ceil(price * rates['CZK'])} CZK</h3>
        <p>{(new Date(departureDate)).toLocaleDateString()} - {(new Date(returnDate)).toLocaleDateString()}</p>
    </div>
{:else}
    <p>Loading currency rates...</p>
{/if}