<script>
	import {fillOdtTemplate} from 'ods-xlsx'

	/** @type {HTMLInputElement} */
    let templateInput;
	
	/** @type {FileList | undefined} */
    let templateFiles;
    $: template = templateFiles && templateFiles[0]

	let nomComplet;

	// pré-charger le bon template
	fetch('./data/lbc-service-fait.odt')
        .then(r => r.blob())
        .then(blob => {
            //console.log('blob', blob)
            const file = new File([blob], 'template-service-fait.odt')
            let container = new DataTransfer(); 
            container.items.add(file);
            templateInput.files = container.files;
            templateFiles = templateInput.files
        })

	async function créerServiceFait(e){
		e.preventDefault()

		const data = {
			nomComplet
		}

		const templateAB = await template.arrayBuffer()

		const serviceFaitOdtArrayBuffer = await fillOdtTemplate(templateAB, data)

		console.log('serviceFaitOdtArrayBuffer', serviceFaitOdtArrayBuffer)

		télécharger(new Blob(serviceFaitOdtArrayBuffer), `service-fait.odt`)
	}

	async function télécharger(blob, nomFichier){
        const link = document.createElement("a");
        link.download = nomFichier;
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

</script>

<h1>Pitchou - service fait</h1>

<form on:submit={créerServiceFait}>
	<label>
		Template .odt
		<input bind:this={templateInput} bind:files={templateFiles} accept=".odt" type="file">
	</label>
	<label>
		Prénom Nom
		<input bind:value={nomComplet} type="text" autocomplete="name">
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
	
	<button type="submit">Créer le service-fait !</button>
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

		button{
			font-size: 1.2rem;
			width: 10rem;
			padding: 0.7rem;
		}
	}
	
</style>
