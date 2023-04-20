<script>
    import Offer from "./Offer.svelte";
	export let offers;
</script>

<div class="other-dates">
    {#each offers as offer}
        <Offer {...offer} />
    {/each}
</div>