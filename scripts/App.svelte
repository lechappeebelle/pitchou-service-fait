<script>
	import {fillOdtTemplate} from 'ods-xlsx'

	/** @type {HTMLInputElement} */
    let templateInput;
	
	/** @type {FileList | undefined} */
    let templateFiles;
    $: template = templateFiles && templateFiles[0]

	let nomComplet;
	let responsableOpérationnel = ''; // à faire un jour
	let libellé;
	let mois;
	let année;
	let nombreJoursFacturés;
	let réalisations


	/** @type {FileList | undefined} */
    let réalisationFiles;
    $: réalisationFile = réalisationFiles && réalisationFiles[0]

	let réalisationsString;
	$: réalisationFile && réalisationFile.text().then(jsonString => { réalisationsString = jsonString })

	$: réalisations = typeof réalisationsString === 'string' && JSON.parse(réalisationsString)

	const maintenant = new Date()

	mois = maintenant.toLocaleDateString('fr-FR', {month: 'long'})
	année = maintenant.toLocaleDateString('fr-FR', {year: 'numeric'})

	const documentTypeURL = './data/lbc-service-fait.odt'


	// pré-charger le bon template
	fetch(documentTypeURL)
        .then(r => r.blob())
        .then(blob => {
            //console.log('blob', blob)
            const file = new File([blob], 'lbc-service-fait.odt')
            let container = new DataTransfer(); 
            container.items.add(file);
            templateInput.files = container.files;
            templateFiles = templateInput.files
        })

	async function créerServiceFait(e){
		e.preventDefault()

		const data = {
			nomComplet,
			responsableOpérationnel, // à faire un jour
			libellé, 
			mois,
			année,
			nombreJoursFacturés,
			réalisations: réalisations || {
				produit: [],
				déploiement: [],
				autre: []
			}
		}

		const templateAB = await template.arrayBuffer()

		const serviceFaitOdtArrayBuffer = await fillOdtTemplate(templateAB, data)

		télécharger(
			new Blob([serviceFaitOdtArrayBuffer], {type: 'application/vnd.oasis.opendocument.text'}), 
			`service-fait.odt`
		)
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
		<span>Template .odt</span>
		<input bind:this={templateInput} bind:files={templateFiles} accept=".odt" type="file">
		<small><a href={documentTypeURL}>Document-type</a> (déjà chargé par défaut)</small>
	</label>
	
	<label>
		<span>Nom complet</span>
		<input bind:value={nomComplet} type="text" autocomplete="on" name="nomComplet">
	</label>
	<label>
		<span>Libellé de la prestation</span>
		<input bind:value={libellé} type="text" autocomplete="on" name="libellé">
	</label>
	<label>
		<span>Période de prestation</span>
		<select bind:value={mois}>
			<option>janvier</option>
			<option>février</option>
			<option>mars</option>
			<option>avril</option>
			<option>mai</option>
			<option>juin</option>
			<option>juillet</option>
			<option>août</option>
			<option>septembre</option>
			<option>octobre</option>
			<option>novembre</option>
			<option>décembre</option>
		</select>
		<input bind:value={année} type="number" min="2020" step="1">
	</label>
	<label>
		<span>Nombre de jours facturés</span>
		<input bind:value={nombreJoursFacturés} type="number" step="0.5" min="0">
	</label>
	<label>
		<span>Livrables et prestations réalisées</span>
		<textarea bind:value={réalisationsString}></textarea>
		Remplir via un fichier (réalisations.json)
		<input type="file" bind:files={réalisationFiles}>
	</label>
	
	<button type="submit">Créer le service-fait !</button>
</form>



<style lang="scss">
	
	:global(main) {
		display: flex;

		text-align: left;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;

		@media (min-width: 640px) {
			max-width: 80rem;
			
			
		}
	}

	form{
		display: flex;
		flex-direction: column;


		label{
			display: flex;
			flex-direction: column;

			margin-bottom: 0.7rem;

			span{
				font-weight: bold;
			}

			&:last-of-type{
				margin-bottom: 2rem;
			}
		}

		button{
			font-size: 1.2rem;
			width: 10rem;
			padding: 0.7rem;
		}
	}
	
</style>
