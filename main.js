document.addEventListener('DOMContentLoaded', function() {
    fetch('menu.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const menuContainer = document.getElementById('menu-container');
            if (!menuContainer) return;

            menuContainer.innerHTML = '';

            data.forEach(item => {
                const menuItemDiv = document.createElement('div');
                // We add CSS classes here to match the new style.css
                menuItemDiv.className = 'menu-item'; 

                menuItemDiv.innerHTML = `
                    <h3>${item.name}</h3>
                    <p class="description">${item.description}</p>
                    <p class="price">₹ ${item.price}</p>
                `;
                menuContainer.appendChild(menuItemDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching or parsing menu data:', error);
            const menuContainer = document.getElementById('menu-container');
            if (menuContainer) {
                menuContainer.innerHTML = '<p>Sorry, our menu is currently unavailable.</p>';
            }
        });
});
