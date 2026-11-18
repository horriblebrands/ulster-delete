document.addEventListener('DOMContentLoaded', () => {
    // Get the basket container and ID
    const basketContainer = document.getElementById('stickyBasket');

    // _ShoppingBasket only renders under For Home / For Hospitality, but this script is
    // loaded on every page. Bail out rather than throwing on the missing container.
    if (!basketContainer) {
        return;
    }

    const basketId = basketContainer.getAttribute('data-basket-id');

    // Load basket from localStorage using the basketId
    let basket = JSON.parse(localStorage.getItem(`basket_${basketId}`)) || [];
    const maxCapacity = 5;

    // Add event listener for the "Add to Basket" and "Remove" buttons
    document.addEventListener('click', (event) => {
        if (event.target.closest('.add-to-basket')) {
            event.preventDefault();
            const button = event.target.closest('.add-to-basket');
            const productId = button.getAttribute('data-id');
            addToBasket(productId);
        } else if (event.target.closest('.remove')) {
            event.preventDefault();
            const button = event.target.closest('.remove');
            const productId = button.getAttribute('data-id');
            removeFromBasket(productId);
        }
    });

    // Initial render if basket is not empty
    if (basket.length > 0) {
        renderBasket();
    } else {
        hideBasket();
    }

    function addToBasket(productId) {
        const totalQuantity = basket.reduce((sum, item) => sum + item.quantity, 0);

        if (totalQuantity >= maxCapacity) {
            alert(`Basket is full! You can only have a maximum of ${maxCapacity} items.`);
            return;
        }

        const productElement = document.querySelector(`.product[data-id="${productId}"]`);

        if (productElement) {
            const product = {
                id: productElement.getAttribute('data-id'),
                name: productElement.getAttribute('data-name'),
                image: productElement.getAttribute('data-img'),
                range: productElement.getAttribute('data-range') || '',
                design: productElement.getAttribute('data-design') || '',
                designNumber: productElement.getAttribute('data-design-number') || '',
                quantity: 1
            };

            const existingProduct = basket.find(item => item.id === product.id);
            if (existingProduct) {
                alert(`Product ${product.name} is already in your basket.`);
            } else {
                basket.push(product);
                // Save basket to localStorage with the unique basketId
                localStorage.setItem(`basket_${basketId}`, JSON.stringify(basket));
                renderBasket();
            }
        }
    }

    function removeFromBasket(productId) {
        const index = basket.findIndex(item => item.id === productId);

        if (index !== -1) {
            basket[index].quantity -= 1;
            if (basket[index].quantity === 0) {
                basket.splice(index, 1);
            }

            localStorage.setItem(`basket_${basketId}`, JSON.stringify(basket));
            renderBasket();
        }
    }

    function renderBasket() {

        const basketElement = document.getElementById('basket-items');

        if (basket.length > 0) {

            basketContainer.style.display = 'block';
            basketElement.innerHTML = '';

            basket.forEach(item => {
                const li = document.createElement('li');

                const div = document.createElement('div');
                div.className = 'sample-item';
                div.innerHTML = `
                    <button class="remove" type="button" aria-label="Remove sample" data-id="${item.id}"><span class="szicon-cross"></span></button>
                    <img src="${item.image}">
                    <p>${item.name}</p>
                `;

                li.appendChild(div);
                basketElement.appendChild(li);
            });
        } else {
            hideBasket();
        }
    }

    function hideBasket() {
        basketContainer.style.display = 'none';
    }

    renderBasket();
});
