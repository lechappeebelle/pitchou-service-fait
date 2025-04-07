<script>
	export let name;


</script>

<h1>Pitchou - service fait</h1>

<form>
	<label>
		Template .odt
		<input type="file" >
	</label>
	<label>
		Prénom Nom
		<input type="text" autocomplete="name">
	</label>
	<label>
		Nombre de jours facturés
		<input type="number" step="0.5" min="0" max="31">
	</label>
	<label>
		Libellé de la prestation
		<input type="text" autocomplete="pitchou service-fait libéllé">
	</label>
	<label>
		Période de prestation
		<input type="month">
		<input type="year">
	</label>
	<label>
		Livrables et prestations réalisées
		<textarea>

		</textarea>
	</label>
	

</form>



<style lang="scss">
	
	:global(main) {
		text-align: left;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;

		@media (min-width: 640px) {
			max-width: none;
		}
	}

	form{
		display: flex;
		flex-direction: column;


		label{

		}
	}
	
</style>
