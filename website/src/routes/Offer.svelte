<script>
	export let airport;
    export let city;
    export let price;
    export let departureDate;
    export let returnDate;
</script>

<div>
    <h3>{city} ({airport}) - {price} USD</h3>
    <p>{(new Date(departureDate)).toLocaleDateString()} - {(new Date(returnDate)).toLocaleDateString()}</p>
</div>