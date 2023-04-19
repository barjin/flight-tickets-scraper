<script>
    import { getContext } from "svelte";
	export let airport;
    export let city;
    export let price;
    export let departureDate;
    export let returnDate;
    export let distance;

    let rates;
    let link = (async () => {

        // source https://stackoverflow.com/a/66046176
        const base64_arraybuffer = async (data) => {
            // Use a FileReader to generate a base64 data URI
            const base64url = await new Promise((r) => {
                const reader = new FileReader()
                reader.onload = () => r(reader.result)
                reader.readAsDataURL(new Blob([data]))
            })

            /*
            The result looks like 
            "data:application/octet-stream;base64,<your base64 data>", 
            so we split off the beginning:
            */
            return base64url.split(",", 2)[1];
        }


        const iata = airport;
        const from = new Date(departureDate);
        const to = new Date(returnDate);

        const data = [
            0x08, 0x1C, 0x10, 0x02, 0x1A, 0x23, 0x6A, 0x0C, 0x08, 0x02, 0x12, 0x08,
            0x2F, 0x6D, 0x2F, 0x30, 0x35, 0x79, 0x77, 0x67, 0x12, 0x0A, ...new TextEncoder().encode(from.toISOString().split('T')[0]), 0x72, 0x07, 0x08, 0x01,
            0x12, 0x03, ...new TextEncoder().encode(iata), 0x1A, 0x23, 0x6A, 0x07, 0x08, 0x01, 0x12,
            0x03, ...new TextEncoder().encode(iata), 0x12, 0x0A, ...new TextEncoder().encode(to.toISOString().split('T')[0]), 0x72, 0x0C, 0x08, 0x02, 0x12, 0x08, 0x2F, 0x6D,
            0x2F, 0x30, 0x35, 0x79, 0x77, 0x67, 0x70, 0x01, 0x82, 0x01, 0x0B, 0x08
        ];

        const base64 = await base64_arraybuffer(new Uint8Array(data));

        return `https://www.google.com/travel/flights/search?tfs=${base64}____________AUABSAGYAQE`
    })();

    const currencyStore = getContext('currencyRates');

    currencyStore.subscribe(value => {
        rates = value;
    });

    const numberOfDays = (new Date(returnDate) - new Date(departureDate)) / (1000 * 60 * 60 * 24);
</script>

{#if rates}
    <div class="offer">
        <div style="flex: 1">
        <span>
            <span style="display: flex; flex-direction: row; justify-content: space-between; width: 100%; align-items: center">
                <h3>{city} ({airport})</h3>
                <b style="font-size:120%">{Math.ceil(price * rates['CZK'])} CZK</b>
            </span>
        </span>
        <span>
            <b>{numberOfDays} { numberOfDays > 1 ? 'days' : 'day'}</b>
            ({(new Date(departureDate)).toLocaleDateString()} - {(new Date(returnDate)).toLocaleDateString()})
        </span>
        </div>
        <div class="button-holder">
            {#await link}
                <div class="button flight" />
            {:then link}
                <a href={link} class="button flight" target="_blank">
                    
                </a>
            {/await}
            <div class="button calendar" />
        </div>
    </div>
{:else}
    <p>Loading currency rates...</p>
{/if}

<style>
    .offer {
        border-radius: 5px;
        box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.2);
        padding: 0 0 0 1rem;
        margin: 1rem 0;
        display: flex;
        flex-direction: row;
        height: 6.5rem;
        justify-content: space-between;
        width: 25rem;
    }

    .button-holder {
        height:100%;
        width: 5rem;
        margin-left: 20px;
        display: flex;
        flex-direction: column;
    }

    .button-holder > *:first-child {
        border-top-right-radius: 5px;
    }
    
    .button-holder > *:last-child {
        border-bottom-right-radius: 5px;
    }

    .button:hover {
        cursor: pointer;
    }

    .button {
        flex: 1;
        width: 100%;
        background-size: 50%;
        background-repeat: no-repeat;
        background-position: center;
        
        border: none;
    }

    .flight {
        background-image: url('/plane.svg');
        background-color: rgb(13, 53, 112);
    }

    .calendar {
        background-image: url('/calendar.svg');
        background-color: rgb(255, 187, 40);
    }
</style>