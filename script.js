
const container = document.getElementById("countryContainer");
const searchInput = document.getElementById("searchInput");
const regionFilter = document.getElementById("regionFilter");
const sortPopulation = document.getElementById("sortPopulation");
const countryCount = document.getElementById("countryCount");

const countryModal = document.getElementById("countryModal");
const countryDetails = document.getElementById("countryDetails");
const closeModal = document.getElementById("closeModal");

let countries = [];




const API_URL =
  "https://countries.dev/countries?fields=name,flags,flag,population,capital,region,area,borders,currencies,languages,alpha3Code";




function getSavedLikes() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("likedCountries") || "[]"
    );

    return Array.isArray(saved) ? saved : [];

  } catch (error) {
    console.error("Local Storage Error:", error);
    return [];
  }
}

let likedCountries = getSavedLikes();




function saveLikes() {

  try {

    localStorage.setItem(
      "likedCountries",
      JSON.stringify(likedCountries)
    );

  } catch (error) {
    console.error("Unable to save likes:", error);
  }

}




async function fetchCountries() {

  try {

    countryCount.textContent = "Loading countries...";

    container.innerHTML = `
      <p class="no-results">Loading countries...</p>
    `;

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid API response");
    }


   

    countries = data

      .filter(country => country.name && country.alpha3Code)

      .map(country => ({

        name: country.name,

        code: country.alpha3Code,

        population: Number(country.population) || 0,

        capital: country.capital || "N/A",

        region: country.region || "Other",

        area: Number(country.area) || 0,

        flag:
          country.flags?.svg ||
          country.flags?.png ||
          "",

        flagEmoji: country.flag || "",

        currencies: Array.isArray(country.currencies)
          ? country.currencies
          : [],

        languages: Array.isArray(country.languages)
          ? country.languages
          : [],

        borders: Array.isArray(country.borders)
          ? country.borders
          : []

      }));


    displayCountries();

    console.log("Countries loaded successfully:", countries);

  }

  catch (error) {

    console.error("API Error:", error);

    countryCount.textContent = "Failed to load countries";

    container.innerHTML = `
      <p class="no-results">
        Unable to load countries.
        Please check your internet connection and try again.
      </p>
    `;

  }

}




function isLiked(code) {

  return likedCountries.includes(code);

}




function toggleLike(code) {

  if (isLiked(code)) {

    likedCountries = likedCountries.filter(
      item => item !== code
    );

  } else {

    likedCountries.push(code);

  }

  saveLikes();

  displayCountries();

}




function displayCountries() {

  const searchValue =
    searchInput.value.toLowerCase().trim();

  const selectedRegion = regionFilter.value;

  const sortValue = sortPopulation.value;




  let filteredCountries = countries.filter(country => {

    const matchesSearch = country.name
      .toLowerCase()
      .includes(searchValue);

    const matchesRegion =
      selectedRegion === "all" ||
      country.region === selectedRegion;

    return matchesSearch && matchesRegion;

  });




  if (sortValue === "asc") {

    filteredCountries.sort(
      (a, b) => a.population - b.population
    );

  }

  else if (sortValue === "desc") {

    filteredCountries.sort(
      (a, b) => b.population - a.population
    );

  }


 

  countryCount.textContent =
    `Showing ${filteredCountries.length} countries`;


  container.innerHTML = "";


  

  if (filteredCountries.length === 0) {

    container.innerHTML = `
      <p class="no-results">No countries found!</p>
    `;

    return;

  }


  

  filteredCountries.forEach(country => {

    const card = document.createElement("article");

    card.className = "country-card";


   

    const flag = document.createElement("img");

    flag.alt = `${country.name} flag`;

    flag.loading = "lazy";

    if (country.flag) {
      flag.src = country.flag;
    } else {
      flag.alt = country.flagEmoji || "Flag unavailable";
    }

    flag.onerror = function () {

      this.removeAttribute("src");

      this.alt = country.flagEmoji || "Flag unavailable";

    };


  

    const info = document.createElement("div");

    info.className = "country-info";


    

    const heading = document.createElement("h2");

    heading.textContent = country.name;


   

    const population = document.createElement("p");

    population.textContent =
      `Population: ${country.population.toLocaleString()}`;


  

    const capital = document.createElement("p");

    capital.textContent =
      `Capital: ${country.capital}`;


  

    const region = document.createElement("p");

    region.textContent =
      `Region: ${country.region}`;


   

    const likeBtn = document.createElement("button");

    likeBtn.className = "like-btn";

    likeBtn.type = "button";

    likeBtn.textContent = isLiked(country.code)
      ? " Liked"
      : " Like";

    if (isLiked(country.code)) {
      likeBtn.classList.add("liked");
    }


   

    likeBtn.addEventListener("click", function(event) {

      event.stopPropagation();

      toggleLike(country.code);

    });


  

    info.append(
      heading,
      population,
      capital,
      region,
      likeBtn
    );

    card.append(flag, info);


   

    card.addEventListener("click", function() {

      showCountryDetails(country);

    });


    container.appendChild(card);

  });

}




function getCurrencies(currencies) {

  if (!currencies || currencies.length === 0) {
    return "N/A";
  }

  return currencies.map(currency => {

    return `${currency.name || "Unknown"} (${currency.code || ""}) - ${currency.symbol || "N/A"}`;

  }).join(", ");

}




function getLanguages(languages) {

  if (!languages || languages.length === 0) {
    return "N/A";
  }

  return languages.map(language => {

    return language.name || "Unknown";

  }).join(", ");

}




function getBorderNames(borders) {

  if (!borders || borders.length === 0) {
    return "No bordering countries";
  }

  return borders.map(code => {

    const country = countries.find(
      item => item.code === code
    );

    return country ? country.name : code;

  }).join(", ");

}




function showCountryDetails(country) {

  const details = [

    ["Population", country.population.toLocaleString()],

    ["Capital", country.capital],

    ["Region", country.region],

    ["Area", country.area
      ? `${country.area.toLocaleString()} km²`
      : "N/A"],

    ["Currencies", getCurrencies(country.currencies)],

    ["Languages", getLanguages(country.languages)],

    ["Borders", getBorderNames(country.borders)]

  ];




  countryDetails.innerHTML = "";


  

  const flag = document.createElement("img");

  flag.className = "detail-flag";

  flag.alt = `${country.name} flag`;

  if (country.flag) {
    flag.src = country.flag;
  } else {
    flag.style.display = "none";
  }

  flag.onerror = function() {
    this.style.display = "none";
  };


 

  const heading = document.createElement("h2");

  heading.textContent =
    `${country.flagEmoji} ${country.name}`;


  

  const detailInfo = document.createElement("div");

  detailInfo.className = "detail-info";


 

  details.forEach(([label, value]) => {

    const p = document.createElement("p");

    const strong = document.createElement("strong");

    strong.textContent = `${label}: `;

    p.append(
      strong,
      document.createTextNode(value)
    );

    detailInfo.appendChild(p);

  });


  

  countryDetails.append(
    flag,
    heading,
    detailInfo
  );


 

  countryModal.classList.add("active");

}




function hideModal() {

  countryModal.classList.remove("active");

}




closeModal.addEventListener("click", hideModal);




countryModal.addEventListener("click", function(event) {

  if (event.target === countryModal) {
    hideModal();
  }

});




document.addEventListener("keydown", function(event) {

  if (event.key === "Escape") {
    hideModal();
  }

});




searchInput.addEventListener("input", displayCountries);



regionFilter.addEventListener("change", displayCountries);




sortPopulation.addEventListener("change", displayCountries);




fetchCountries();
