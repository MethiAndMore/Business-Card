document.addEventListener('DOMContentLoaded', function() {
    // This function runs when the page is fully loaded

    // Fetch the menu data from the JSON file
    fetch('menu.json')
        .then(response => {
            // Check if the file was found
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json(); // Convert the response to JSON
        })
        .then(data => {
            // We have the menu data, now let's display it
            const menuContainer = document.getElementById('menu-container');
            if (!menuContainer) return; // Exit if the container element isn't found

            // Clear any existing content
            menuContainer.innerHTML = '';

            // Loop through each item in our menu data
            data.forEach(item => {
                // Create a div element for the menu item
                const menuItemDiv = document.createElement('div');
                menuItemDiv.className = 'menu-item'; // Add a CSS class for styling

                // Create the HTML structure for the item
                menuItemDiv.innerHTML = `
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <strong>${item.price}</strong>
                `;

                // Add the new item to the container on the page
                menuContainer.appendChild(menuItemDiv);
            });
        })
        .catch(error => {
            // If something goes wrong (e.g., file not found)
            console.error('Error fetching or parsing menu data:', error);
            const menuContainer = document.getElementById('menu-container');
            if (menuContainer) {
                menuContainer.innerHTML = '<p>Sorry, our menu is currently unavailable.</p>';
            }
        });
});