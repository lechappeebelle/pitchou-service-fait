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
		Template .odt
		<input bind:this={templateInput} bind:files={templateFiles} accept=".odt" type="file">
	</label>
	<label>
		Prénom Nom
		<input bind:value={nomComplet} type="text" autocomplete="on" name="nomComplet">
	</label>
	<label>
		Libellé de la prestation
		<input bind:value={libellé} type="text" autocomplete="on" name="libellé">
	</label>
	<label>
		Période de prestation
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
		Nombre de jours facturés
		<input bind:value={nombreJoursFacturés} type="number" step="0.5" min="0" max="31">
	</label>
	<label>
		Livrables et prestations réalisées
		<textarea bind:value={réalisationsString}></textarea>
		Remplir via un fichier 
		<input type="file" bind:files={réalisationFiles}>
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
