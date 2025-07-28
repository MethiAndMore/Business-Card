document.addEventListener('DOMContentLoaded', function() {
    fetch('menu.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            const menuContainer = document.getElementById('menu-container');
            if (!menuContainer) return;
            menuContainer.innerHTML = ''; // Clear loading message

            data.forEach(item => {
                const menuItemDiv = document.createElement('div');
                menuItemDiv.className = 'menu-item'; // Assign class for styling

                // Create and populate the elements to match the CSS
                menuItemDiv.innerHTML = `
                    <h3>${item.name}</h3>
                    <p class="description">${item.description}</p>
                    <p class="price">${item.price}</p> 
                `; // Use the price directly from your menu.json
                menuContainer.appendChild(menuItemDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching menu data:', error);
            const menuContainer = document.getElementById('menu-container');
            if (menuContainer) {
                menuContainer.innerHTML = '<p>Sorry, our menu is currently unavailable.</p>';
            }
        });
});