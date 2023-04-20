<script>
    import { getContext } from "svelte";
	export let iata;
    export let label;
    export let e;
    export let price;
    export let dateFrom;
    export let dateTo;
    export let distance;
    export let onClick;

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

        const data = [
            0x08, 0x1C, 0x10, 0x02, 0x1A, 0x23, 0x6A, 0x0C, 0x08, 0x02, 0x12, 0x08,
            0x2F, 0x6D, 0x2F, 0x30, 0x35, 0x79, 0x77, 0x67, 0x12, 0x0A, ...new TextEncoder().encode(new Date(dateFrom).toISOString().split('T')[0]), 0x72, 0x07, 0x08, 0x01,
            0x12, 0x03, ...new TextEncoder().encode(iata), 0x1A, 0x23, 0x6A, 0x07, 0x08, 0x01, 0x12,
            0x03, ...new TextEncoder().encode(iata), 0x12, 0x0A, ...new TextEncoder().encode(new Date(dateTo).toISOString().split('T')[0]), 0x72, 0x0C, 0x08, 0x02, 0x12, 0x08, 0x2F, 0x6D,
            0x2F, 0x30, 0x35, 0x79, 0x77, 0x67, 0x70, 0x01, 0x82, 0x01, 0x0B, 0x08
        ];

        const base64 = await base64_arraybuffer(new Uint8Array(data));

        return `https://www.google.com/travel/flights/search?tfs=${base64}____________AUABSAGYAQE`
    })();

    let rates = null;
    const ratesStore = getContext('currencyRates');
    ratesStore.subscribe(value => {
        rates = value;
    });

    let currency = null;
    const currencyStore = getContext('currency');
    currencyStore.subscribe(value => {
        currency = value;
    });

    const numberOfDays = (new Date(dateTo) - new Date(dateFrom)) / (1000 * 60 * 60 * 24);
</script>

{#if rates}
    <div class={`offer ${!onClick ? 'other-offer' : ''}`}>
        <div style="flex: 1">
        <span>
            <span style="display: flex; flex-direction: row; justify-content: space-between; width: 100%; align-items: center">
                <h3>{e} {label} ({iata})</h3>
                <b style="font-size:120%">{Math.ceil(price * rates[currency])} {currency}</b>
            </span>
        </span>
        <span>
            <b>{numberOfDays} { numberOfDays > 1 ? 'days' : 'day'}</b>
            ({(new Date(dateFrom)).toLocaleDateString()} - {(new Date(dateTo)).toLocaleDateString()})
        </span>
        </div>
        <div class="button-holder">
            {#await link}
                <div class="button flight" />
            {:then link}
                <a href={link} class="button flight" target="_blank">
                    
                </a>
            {/await}
            {#if onClick}
                <div class="button calendar" on:click={onClick} />
            {/if}
        </div>
    </div>
    <slot/>
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

    .other-offer {
        width: 24rem;
        margin-left: 1rem;
    }

    .button-holder {
        height:100%;
        width: 3.5rem;
        margin-left: 20px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.2);
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
        background-size: 30%;
        background-repeat: no-repeat;
        background-position: center;
        transition: background-color 0.2s ease-in-out;
        border: none;
    }

    .flight {
        background-image: url('/plane.svg');
        background-color: rgb(37, 117, 238);
    }
    
    .flight:hover {
        background-color: rgb(5, 63, 150);
    }

    .calendar {
        background-image: url('/calendar.svg');
        background-color: rgb(255, 187, 40);
    }

    .calendar:hover {
        background-color: rgb(255, 153, 0);
    }
</style>