<script>
	import Offers from './Offers.svelte';
	import welcome_fallback from '$lib/images/logo.svg';
</script>

<svelte:head>
	<title>✈️  FreeFlight</title>
	<meta name="description" content="Flight ticket scraper" />
	<meta name="viewport" content="width=device-width, initial-scale=0.8, user-scalable=no, minimum-scale=0.8, maximum-scale=0.8" />
</svelte:head>

<section>
	<h1>
		<span class="welcome">
			<picture>
				<img src='./logo.svg' alt="FreeFlight" />
			</picture>
		</span>
	</h1>
	<Offers />
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
