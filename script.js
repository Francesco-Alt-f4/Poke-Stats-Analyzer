// Oggetto globale che fa da "memoria" per l'applicazione.
// Memorizza i dati completi dei due Pokémon attualmente caricati nei due slot.
// Inizialmente sono vuoti (null).
let pokeData = { 1: null, 2: null };

/**
 * FUNZIONE HELPER: makeHttpRequest
 * Questa funzione prende il vecchio sistema XMLHttpRequest (AJAX classico)
 * e lo "avvolge" in una Promise moderna. In questo modo possiamo usare
 * le parole chiave 'async' e 'await' nel resto del codice, mantenendo
 * la sintassi pulita ma rispettando la richiesta di usare le HTTP Request.
 */
function makeHttpRequest(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest(); // Crea una nuova richiesta HTTP
        xhr.open("GET", url); // Imposta il metodo GET e l'URL di destinazione
        
        // Cosa succede quando il server risponde:
        xhr.onload = () => {
            // Se lo status code è tra 200 e 299, la richiesta è andata a buon fine (es. 200 OK)
            if (xhr.status >= 200 && xhr.status < 300) {
                // Trasforma la risposta testuale (stringa JSON) in un oggetto JavaScript e risolve la Promise
                resolve(JSON.parse(xhr.response));
            } else {
                // Se c'è un errore (es. 404 Not Found), rifiuta la Promise
                reject(new Error(`Errore: ${xhr.status}`));
            }
        };
        
        // Cosa succede se cade la connessione o c'è un errore di rete fisico:
        xhr.onerror = () => reject(new Error("Errore di rete"));
        
        // Invia fisicamente la richiesta al server
        xhr.send();
    });
}

/**
 * FUNZIONE PRINCIPALE: analyzePokemon
 * Viene chiamata quando si clicca il pulsante "SCAN" nello slot 1 o 2.
 * Gestisce tutte le chiamate di rete in sequenza per recuperare i dati.
 */
async function analyzePokemon(slot) {
    // Recupera l'elemento di input e il suo valore (rimuovendo spazi vuoti e mettendo tutto minuscolo)
    const input = document.getElementById(`input-${slot}`);
    const query = input.value.trim().toLowerCase();
    const display = document.getElementById(`result-${slot}`);

    // Se l'utente non ha scritto nulla, blocca l'esecuzione
    if (!query) return;

    try {
        // Mostra un messaggio di caricamento all'utente
        display.innerHTML = `<p class="placeholder-text">SCANNING...</p>`;
        
        // CHIAMATA 1: Recupera i dati base del Pokémon (statistiche, mosse, sprite base)
        const data = await makeHttpRequest(`https://pokeapi.co/api/v2/pokemon/${query}`);
        
        // Salva i dati appena scaricati nell'oggetto globale nella posizione corretta (1 o 2)
        pokeData[slot] = data;

        // Passa i dati alla funzione che disegna l'interfaccia HTML del Pokémon
        renderPokeCard(slot, data);

        // CHIAMATA 2: Usa l'URL contenuto nei dati base per recuperare le informazioni della "Specie"
        // Questo serve per scoprire l'habitat e l'URL della catena evolutiva
        const speciesData = await makeHttpRequest(data.species.url);
        
        // Aggiorna la riga dell'habitat se esiste l'elemento nel DOM
        const habitatEl = document.getElementById(`habitat-${slot}`);
        if(habitatEl) {
            // Se l'habitat esiste nell'API, mostralo, altrimenti scrivi 'Unknown'
            habitatEl.textContent = `H: ${speciesData.habitat ? speciesData.habitat.name : 'Unknown'}`;
        }

        // CHIAMATA 3: Passa l'URL della catena evolutiva alla funzione dedicata
        fetchEvolutionChain(speciesData.evolution_chain.url);

        // CONTROLLO FINALE: Se nell'oggetto globale ci sono i dati per ENTRAMBI gli slot,
        // significa che l'arena è piena e possiamo avviare il confronto delle statistiche.
        if (pokeData[1] && pokeData[2]) {
            compareStats();
        }

    } catch (err) {
        // Se una qualsiasi delle chiamate HTTP fallisce (es. nome scritto male), mostra un errore
        display.innerHTML = `<p style="color:red; font-size:8px;">ERRORE: NOT FOUND</p>`;
        // Resetta i dati per questo slot a null per evitare falsi positivi nel confronto
        pokeData[slot] = null;
    }
}

/**
 * FUNZIONE UI: renderPokeCard
 * Genera l'HTML dinamico per mostrare l'immagine, le statistiche e le mosse nello schermo verde.
 */
function renderPokeCard(slot, data) {
    const container = document.getElementById(`result-${slot}`);
    
    // Estrae solo le prime 4 mosse dall'array lunghissimo fornito dall'API.
    // .map() trasforma ogni mossa in un tag <li>, .join('') unisce tutto in una stringa unica.
    const movesHtml = data.moves.slice(0, 4).map(m => `<li>${m.move.name}</li>`).join('');

    // Inietta l'HTML strutturato nel contenitore
    container.innerHTML = `
        <div class="card-inner">
            <img src="${data.sprites.other['official-artwork'].front_default}" class="poke-img">
            <h2 class="poke-name">#${data.id} ${data.name.toUpperCase()}</h2>
            
            <div id="habitat-${slot}" class="habitat">...</div>
            
            <div class="stats-box">
                ${data.stats.slice(0, 3).map((s, i) => `
                    <div class="stat-group" id="stat-${slot}-${i}">
                        <label>${s.stat.name.toUpperCase().substring(0,3)}</label>
                        <div class="bar-bg">
                            <div class="bar-fill" style="width: ${Math.min(s.base_stat, 100)}%"></div>
                        </div>
                        <span class="stat-val">${s.base_stat}</span>
                    </div>
                `).join('')}
            </div>

            <div class="moves-container">
                <p class="moves-title">MOVES LEARNED:</p>
                <ul class="moves-list">${movesHtml}</ul>
            </div>
        </div>
    `;
}

/**
 * FUNZIONE LOGICA: compareStats
 * Mette a confronto le 3 statistiche base tra i due Pokémon e assegna
 * una classe CSS '.winner' per far illuminare di verde chi ha il valore più alto.
 */
function compareStats() {
    // Il ciclo for itera 3 volte: i=0 (HP), i=1 (Attack), i=2 (Defense)
    for (let i = 0; i < 3; i++) {
        // Recupera i valori numerici dai dati salvati globalmente
        const val1 = pokeData[1].stats[i].base_stat;
        const val2 = pokeData[2].stats[i].base_stat;

        // Recupera le righe HTML (DOM) relative a questa specifica statistica
        const row1 = document.getElementById(`stat-1-${i}`);
        const row2 = document.getElementById(`stat-2-${i}`);

        // Rimuove la classe 'winner' per pulire risultati precedenti (es. se sovrascrivo un Pokémon)
        row1.classList.remove('winner');
        row2.classList.remove('winner');

        // Assegna la classe 'winner' al valore maggiore
        // (Se c'è pareggio, nessuno dei due prende la classe)
        if (val1 > val2) row1.classList.add('winner');
        else if (val2 > val1) row2.classList.add('winner');
    }
}

/**
 * FUNZIONE RETE/LOGICA: fetchEvolutionChain
 * Richiede la complessa struttura nidificata delle evoluzioni all'API
 * e la "appiattisce" in un semplice array sequenziale.
 */
async function fetchEvolutionChain(url) {
    const evoDisplay = document.getElementById('evolution-display');
    try {
        const data = await makeHttpRequest(url);
        const evoChain = []; // Qui salveremo l'elenco pulito
        let evoData = data.chain; // Il punto di partenza dell'albero evolutivo fornito dall'API
        
        // Ciclo do-while per percorrere l'albero evolutivo finché ci sono "figli"
        do {
            // Aggiungi il nome della specie corrente al nostro array pulito
            evoChain.push({ "name": evoData.species.name });
            
            // L'API restituisce evolves_to come un array (perché alcuni Pokémon come Eevee hanno evoluzioni multiple).
            // Noi per semplicità prendiamo sempre il ramo principale (indice 0).
            evoData = evoData.evolves_to[0];
            
        } while (evoData); // Continua finché exists un evolves_to[0]

        // Passa l'array pulito alla funzione che disegnerà fisicamente la catena
        renderEvolutionChain(evoChain);
        
    } catch (e) { 
        console.error("Errore evoluzioni"); 
    }
}

/**
 * FUNZIONE UI: renderEvolutionChain
 * Prende l'array di nomi delle evoluzioni (es. ["bulbasaur", "ivysaur", "venusaur"]),
 * cerca le immagini per ognuno e li disegna a schermo uno sotto l'altro con le freccette.
 */
async function renderEvolutionChain(chain) {
    const evoDisplay = document.getElementById('evolution-display');
    evoDisplay.innerHTML = ''; // Pulisce il testo "Caricamento..." o le catene precedenti
    
    // Itera per ogni elemento della catena evolutiva
    for (let i = 0; i < chain.length; i++) {
        // Fa una chiamata HTTP per ottenere il mini-sprite del Pokémon specifico
        const pData = await makeHttpRequest(`https://pokeapi.co/api/v2/pokemon/${chain[i].name}`);
        
        // Aggiunge la riga con l'immagine e il nome
        evoDisplay.innerHTML += `
            <div class="evo-stage">
                <img src="${pData.sprites.front_default}" class="evo-img">
                <span class="evo-name">${chain[i].name}</span>
            </div>
        `;
        
        // Se non siamo arrivati all'ultimo Pokémon della catena, aggiunge la freccia verso il basso
        if (i < chain.length - 1) {
            evoDisplay.innerHTML += `<div class="evo-arrow">⬇</div>`;
        }
    }
}