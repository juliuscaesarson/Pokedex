// Temp arrays for promise functions
const data = [];
const descriptions = [];
// URLs
const url = 'https://pokeapi.co/api/v2/pokemon/';
const urlDes = 'https://pokeapi.co/api/v2/pokemon-species/';
// Global variables 
var Pokemon; 
var Des; // Array of all Pokemon descriptions
var description; // Thing that computer will read out loud
var numPoke = 802; // The number of Pokemon you want to load into the webpage by changing this number (But for some reason Pokemon number 178 does not load anything)
// Variables for text-to-speech function
var synth = window.speechSynthesis;
var available_voices;

// Text-to-speech code snippet from https://usefulangle.com/post/98/javascript-text-to-speech
function textToSpeech() {
    // get all voices that browser offers
	if (synth.getVoices().length == 0) {
        synth.addEventListener('voiceschanged', function() {
            available_voices = synth.getVoices();
        });
    }
    else {
        available_voices = synth.getVoices();
    }

	// this will hold an english voice
	var english_voice = '';

	// find voice by language locale "en-US"
	// if not then select the first voice
	for(var i=0; i<available_voices.length; i++) {
		if(available_voices[i].lang === 'en-US') {
			english_voice = available_voices[i];
			break;
		}
	}
	if(english_voice === '') {
		english_voice = available_voices[0];
    }

	// new SpeechSynthesisUtterance object
	var utter = new SpeechSynthesisUtterance();
	utter.rate = 1;
	utter.pitch = 1;
	utter.text = description; // Change this thingy
	utter.voice = english_voice;

	// event after text has been spoken
	utter.onend = function() {
		alert('Speech has finished');
    }

	// speak
	synth.speak(utter);
}

// Fetch code from https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// Promise code from and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise

function fetchData() {
    // Loads all Pokemon data into a Promise array for asynchronous API calls in parallel
    for (let i=1;i<=numPoke;i++) {
        data.push(fetch(url + i).then(response => response.json()).catch(error => console.log(error)));
        descriptions.push(fetch(urlDes + i).then(response => response.json()).catch(error => console.log(error)));
    }
    // Array Pokemon now has every Pokemon's info readily accessible
    Promise.all(data).catch(function(err) {
        // Error log
        console.log('A promise failed to resolve', err);
        return pokemon;
        }).then(function(pokemon) {
        // Global variable
        window.Pokemon = pokemon;
        console.log(pokemon);
        listPoke(pokemon);
    });
    // Array Des now has every Pokemon's description readily accessible
    Promise.all(descriptions).catch(function(err) {
        // Error log
        console.log('A promise failed to resolve', err);
        return des;
        }).then(function(des) {
        // Global variable
        window.Des = des;
        console.log(Des);
    });

}

fetchData();

// Lists every Pokemon
function listPoke(pokemon) {
    var root = document.getElementById("ol");
    // Clear list
    root.innerHTML = '';
    for (let i=0;i<pokemon.length;i++) {
        // Get info from array pokemon and make a list object for each Pokemon
        var name = pokemon[i].name;
        name = name[0].toUpperCase() + name.slice(1);
        var id = pokemon[i].id;
        var image = pokemon[i].sprites["front_default"];
        // Mapping types in case some Pokemon 2 types
        var types = pokemon[i].types.map(slot => slot.type.name);
        $("<li class='list-group-item list-group-item-action' data-id='" + id + "' data-types='" + types + "' data-no='" + types.length + "'><div class='naruto' data-types='" + types + "'><h2 data-id='" + id + "'>" + id + ". " + name + "<img class='list-images' data-id='" + id + "' src='" + image + "'></h2><div class='list-types' data-id='" + id + "'>" + types + "</div></div></li>").appendTo(root);
        root.lastChild.addEventListener("click",getInfo);
    }
}


//Search function from https://www.w3schools.com/howto/howto_js_filter_lists.asp
function search() {
    var input = document.getElementById("search-poke");
    var filter = input.value.toUpperCase();
    var li = document.getElementById("ol").getElementsByTagName("li");
    for (var i=0;i<li.length;i++) {
        var h = li[i].getElementsByTagName("h2")[0];
        var t = li[i].getElementsByClassName("list-types")[0];
        var textVal = h.textContent || h.innerText;
        var typeVal = t.textContent || t.innerText;
        if ((textVal.toUpperCase().indexOf(filter)>-1) || (typeVal.toUpperCase().indexOf(filter)>-1)) {
            li[i].style.display = '';
        }
        else {
            li[i].style.display = 'none';
        }
    }
}

function getInfo(event) {
    // Get info from both arrays for hidden div
    var id = event.target.dataset.id;
    if (typeof Des === 'undefined') {
        alert("Data is still loading... Please wait and try again in a few seconds")
    }
    else {
        var lang = findLang(Des[id-1].flavor_text_entries);
        description = Des[id-1].flavor_text_entries[lang].flavor_text;
        var stats = Pokemon[id-1];
        // Set attributes
        document.getElementById("poke-name").innerHTML = id + ". " + stats.name.toUpperCase();
        document.getElementById("poke-size").innerHTML = "Height: " + stats.height + " Weight: " + stats.weight;
        document.getElementById("poke-image").src = stats.sprites.front_default;
        var hp = findStat(stats.stats,"hp");
        var attack = findStat(stats.stats,"attack");
        var defense = findStat(stats.stats,"defense");
        var spattack = findStat(stats.stats,"special-attack");
        var spdefense = findStat(stats.stats,"special-defense");
        var speed = findStat(stats.stats,"speed");
        document.getElementById("poke-hp").innerHTML = stats.stats[hp].base_stat;
        document.getElementById("poke-attack").innerHTML = stats.stats[attack].base_stat;
        document.getElementById("poke-defense").innerHTML = stats.stats[defense].base_stat;
        document.getElementById("poke-spattack").innerHTML = stats.stats[spattack].base_stat;
        document.getElementById("poke-spdefense").innerHTML = stats.stats[spdefense].base_stat;
        document.getElementById("poke-speed").innerHTML = stats.stats[speed].base_stat;
        document.getElementById("poke-des").innerHTML = description;
        // Show div
        document.getElementById("zoomed").classList.remove("hidden");
        // Add event listener to close button
        document.getElementById("close").addEventListener("click",close);
        // Cancels speech synthesis when div is closed
        document.getElementById("close").addEventListener("click",function(){
        synth.cancel();
        description = '';
        });
        // SPEAK
        document.getElementById("description-button").addEventListener("click",textToSpeech);
    }
    
}
// Functions to iterate through arrays
function findLang(arr) {
    for (var i=0;i<arr.length;i++) {
        if (arr[i].language.name == 'en') {
            return i;
        }
        
    }
}
function findStat(arr,nameStat) {
    for (var i=0;i<arr.length;i++) {
        if (arr[i].stat.name == nameStat) {
            return i;
        }
        
    }
}

function close() {
    document.getElementById("zoomed").classList.add("hidden");
}
