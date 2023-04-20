<script>
    import Offer from "./Offer.svelte";
	export let offers;

    let open = false;

    
</script>

<div> 
    <Offer {...{...offers[0], onClick: () => { open = !open }}} />
    {#if open}        
        <div class="other-offers" >
            {#each offers.slice(1,5) as nextoffer }
                <Offer {...nextoffer} />
            {/each} 
        </div>
    {/if}
</div>   
