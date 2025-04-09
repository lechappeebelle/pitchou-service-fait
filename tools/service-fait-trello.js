import { writeFile } from 'node:fs/promises';

import { TrelloClient } from 'trello.js';

/** @import {Card, Label} from 'trello.js/out/api/models' */

console.log(`Récupération des cartes Trello finies récemment pour le service fait`)

const expectedOrgDisplayName = 'DDEP'
const expectedBoardName = 'Backlog EP'
const expectedListName = '✅ Fini 🏅'
const dernierServiceFaitMarkerCardName = '🦎🌱🌿 Dernier Service fait 🦔🦞🦇'


if(!process.env.TRELLO_APP_KEY){
    console.error(`Il manque la variable d'environnement "TRELLO_APP_KEY".`)
    process.exit(1);
}

const trelloAppKey = process.env.TRELLO_APP_KEY


if(!process.env.TRELLO_APP_TOKEN){
    console.error(`Il manque la variable d'environnement "TRELLO_APP_TOKEN".`)
    process.exit(1);
}

const trelloAppToken = process.env.TRELLO_APP_TOKEN

const trelloClient = new TrelloClient({
    key: trelloAppKey,
    token: trelloAppToken,
  });

const tokenMemberData = await trelloClient.tokens.getTokenMember({token: trelloAppToken, fields: ['fullName', 'email', 'idBoards', 'idOrganizations']})

//console.log('tokenMemberData', tokenMemberData)

const idOrganizations = tokenMemberData.idOrganizations

let pitchouOrgId;

/**
 * Trouver la bonne organisation Trello
 */
for(const idOrganization of idOrganizations){
    const org = await trelloClient.organizations.getOrganization({id: idOrganization})

    if(org.displayName === expectedOrgDisplayName){
        pitchouOrgId = idOrganization
        break;
    }
    else{
        if(org.displayName.toLowerCase().includes('ddep') || org.displayName.toLowerCase().includes('pitchou')){
            console.warn(`Organisation '${expectedOrgDisplayName}' non trouvée, mais une organisation '${org.displayName}' a été trouvée`)
            pitchouOrgId = idOrganization
            break;
        }
    }
}

if(!pitchouOrgId){
    throw new Error(`Organisation '${expectedOrgDisplayName}' non trouvée`)
}

//console.log('pitchouOrgId', pitchouOrgId)

/**
 * Trouver la bon board Trello
 */
const boards = await trelloClient.organizations.getOrganizationBoards({id: pitchouOrgId, fields: ['name', 'closed'].join(',')})

//console.log('boards', boards)

const pitchouBacklogBoard = boards.find(b => b.name === expectedBoardName)

if(!pitchouBacklogBoard){
    throw new Error(`Board avec nom '${expectedBoardName}' non trouvé. Options: ${boards.map(b => b.name).join(', ')}`)
}

//console.log('pitchouBacklogBoard', pitchouBacklogBoard)


/**
 * Trouver la bonne liste dans le board Trello
 */
const lists = await trelloClient.boards.getBoardLists({id: pitchouBacklogBoard.id})

//console.log('lists', lists)

const listeFini = lists.find(l => l.name === expectedListName)

if(!listeFini){
    throw new Error(`Liste avec nom '${expectedListName}' non trouvée. Options: ${lists.map(b => b.name).join(', ')}`)
}

//console.log('listeFini', listeFini)


/**
 * Trouver les bonnes cartes Trello
 */
const cards = await trelloClient.lists.getListCards({id: listeFini.id})

//console.log('cards', cards.map(c => ({name: c.name, labels: c.labels})))

const dernierServiceFaitIndex = cards.findIndex(c => c.name === dernierServiceFaitMarkerCardName) 

//console.log('dernierServiceFaitIndex', dernierServiceFaitIndex)

if(dernierServiceFaitIndex === -1){
    console.warn(`Carte avec le nom '${dernierServiceFaitMarkerCardName}' non trouvée`)
}

let cardsDepuisDernierServiceFait = cards.slice(0, dernierServiceFaitIndex === -1 ? 100 : dernierServiceFaitIndex)


/**
 * Construction du fichier réalisations.json
 */
const AUTRE_ÉTIQUETTE = '__autre__'

/** @type {Map<Label['name'], Card[]>} */
const cardParÉtiquette = new Map()

/**
 * 
 * @param {Card} card 
 * @param {Label['name']} labelName 
 */
function addCard(card, labelName){
    const list = cardParÉtiquette.get(labelName) || []
    list.push(card)
    cardParÉtiquette.set(labelName, list)
}

for(const card of cardsDepuisDernierServiceFait){
    const {labels} = card

    if(Array.isArray(labels) && labels.length >= 1){
        for(const {name} of labels){
            addCard(card, name)
        }
    }
    else{
        addCard(card, AUTRE_ÉTIQUETTE)
    }
}

//console.log('cardParÉtiquette', cardParÉtiquette)

const PRODUIT_LABEL = 'Produit'
const DÉPLOIEMENT_LABEL = 'Déploiement'

const donnéesPourTemplateServiceFait = {}

donnéesPourTemplateServiceFait.produit = (cardParÉtiquette.get(PRODUIT_LABEL) || []).map(({name}) => name)
donnéesPourTemplateServiceFait.déploiement = (cardParÉtiquette.get(DÉPLOIEMENT_LABEL) || []).map(({name}) => name)
donnéesPourTemplateServiceFait.autre = []

for(const [label, cards] of cardParÉtiquette){
    if(label !== PRODUIT_LABEL && label !== DÉPLOIEMENT_LABEL){
        donnéesPourTemplateServiceFait.autre.push(...cards)
    }
}

donnéesPourTemplateServiceFait.autre = donnéesPourTemplateServiceFait.autre.map(({name}) => name)


await writeFile('réalisations.json', JSON.stringify(donnéesPourTemplateServiceFait, null, 2), 'utf8')

console.log('fini!')