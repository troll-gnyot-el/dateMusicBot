const discogsToken = 'YOUR_DISCOGS_API_TOKEN';
const artistName = 'Coldplay'; // Замени на имя нужного исполнителя

const apiUrl = `https://api.discogs.com/database/search?type=artist&q=${encodeURIComponent(artistName)}&token=${discogsToken}`;

fetch(apiUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Обработка данных, например, вывод в консоль
        console.log(data);
    })
    .catch(error => {
        console.error('Fetch error:', error);
    });