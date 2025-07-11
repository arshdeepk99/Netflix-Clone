// Constants
const apikey = "e950e51d5d49e85f7c2f17f01eb23ba3";
const apiEndpoint = "https://api.themoviedb.org/3";
const imgPath = "https://image.tmdb.org/t/p/original";

const apiPaths = {
  fetchAllCategories: `${apiEndpoint}/genre/movie/list?api_key=${apikey}`,
  fetchMoviesList: (id) => `${apiEndpoint}/discover/movie?api_key=${apikey}&with_genres=${id}`,
  fetchTrending: `${apiEndpoint}/trending/all/day?api_key=${apikey}&language=en-US`,
  searchOnYoutube: (query) =>
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=AIzaSyA_eZ5WJhmYhRQOM8-jAyVIzzdfWUlp_P0`,
};

// Initialize App
function init() {
  fetchTrendingMovies();
  fetchAndBuildAllSections();
}

function fetchTrendingMovies() {
  fetchAndBuildMovieSection(apiPaths.fetchTrending, "Trending Now")
    .then((list) => {
      const randomIndex = Math.floor(Math.random() * list.length);
      buildBannerSection(list[randomIndex]);
    })
    .catch((err) => console.error("Error fetching trending movies:", err));
}

function buildBannerSection(movie) {
  const bannerCont = document.getElementById("banner-section");
  bannerCont.style.backgroundImage = `url('${imgPath}${movie.backdrop_path}')`;

  const div = document.createElement("div");
  div.className = "banner-content container";
  div.innerHTML = `
    <h2 class="banner__title">${movie.title || movie.name}</h2>
    <p class="banner__info">Trending Now | Released: ${movie.release_date || "N/A"}</p>
    <p class="banner__overview">
      ${movie.overview && movie.overview.length > 200
        ? movie.overview.slice(0, 200).trim() + "..."
        : movie.overview}
    </p>
    <div class="action-buttons-cont">
      <button class="action-button">
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 2.691C4 1.93 4.815 1.448 5.482 1.815L22.407 11.124C23.098 11.504 23.098 12.496 22.407 12.876L5.482 22.185C4.815 22.551 4 22.069 4 21.309V2.691Z"/>
        </svg>
        &nbsp;Play
      </button>
      <button class="action-button more-info">
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9Zm1 7v8h-2v-8h2Zm-1-2.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"/>
        </svg>
        &nbsp;More Info
      </button>
    </div>`;

  bannerCont.innerHTML = "";
  bannerCont.append(div);
}

function fetchAndBuildAllSections() {
  fetch(apiPaths.fetchAllCategories)
    .then((res) => res.json())
    .then((res) => {
      const categories = res.genres;
      categories.forEach((category) => {
        fetchAndBuildMovieSection(apiPaths.fetchMoviesList(category.id), category.name);
      });
    })
    .catch((err) => console.error("Error fetching categories:", err));
}

function fetchAndBuildMovieSection(fetchUrl, categoryName) {
  return fetch(fetchUrl)
    .then((res) => res.json())
    .then((res) => {
      const movies = res.results;
      if (Array.isArray(movies) && movies.length) {
        buildMoviesSection(movies.slice(0, 6), categoryName);
      }
      return movies;
    })
    .catch((err) => console.error(`Error fetching ${categoryName} movies:`, err));
}

function buildMoviesSection(list, categoryName) {
  const moviesCont = document.getElementById("movies-cont");

  const moviesListHTML = list
    .map(
      (item) => `
    <div class="movie-item" onmouseenter="searchMovieTrailer('${item.title || item.name}', 'yt${item.id}')">
      <img class="move-item-img" src="${imgPath}${item.backdrop_path}" alt="${item.title || item.name}" />
      <div class="iframe-wrap" id="yt${item.id}"></div>
    </div>`
    )
    .join("");

  const moviesSectionHTML = `
    <h2 class="movie-section-heading">
      ${categoryName} <span class="explore-nudge">Explore All</span>
    </h2>
    <div class="movies-row">${moviesListHTML}</div>`;

  const div = document.createElement("div");
  div.className = "movies-section";
  div.innerHTML = moviesSectionHTML;

  moviesCont.append(div);
}

function searchMovieTrailer(movieName, iframeId) {
  if (!movieName) return;

  fetch(apiPaths.searchOnYoutube(movieName))
    .then((res) => res.json())
    .then((res) => {
      const bestResult = res.items[0];
      const iframeContainer = document.getElementById(iframeId);
      if (!iframeContainer) return;

      iframeContainer.innerHTML = `<iframe width="245" height="150" src="https://www.youtube.com/embed/${bestResult.id.videoId}?autoplay=1&controls=0" frameborder="0" allowfullscreen></iframe>`;
    })
    .catch((err) => console.error("YouTube trailer fetch error:", err));
}

// Scroll effect for header
window.addEventListener("load", function () {
  init();
  window.addEventListener("scroll", function () {
    const header = document.getElementById("header");
    if (window.scrollY > 5) header.classList.add("black-bg");
    else header.classList.remove("black-bg");
  });
});
