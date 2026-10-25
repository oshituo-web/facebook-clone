
/* =========================================================
   MARKETPLACE FEATURE — STEP 1
   Loads demonstration products from DummyJSON.
   Supports product search, category filtering and real images.
   The products are for demonstration, not verified local offers.
   ========================================================= */

// Public API that supplies sample product information.
const MARKETPLACE_API_URL = "https://dummyjson.com/products?limit=30";

// Stores the products returned by the API.
let marketplaceProducts = [];

// Prevents duplicate event listeners when the Marketplace opens again.
let marketplaceInitialized = false;


/* =========================================================
   SHOPPING CART — LOCAL STORAGE
   Only product IDs and quantities are saved locally.
   Product details come from the API when it loads.
   ========================================================= */

const MARKETPLACE_CART_KEY = "facebookCloneMarketplaceCart";

function loadMarketplaceCart() {
    try {
        const savedCart = localStorage.getItem(MARKETPLACE_CART_KEY);

        if (!savedCart) return [];

        const parsedCart = JSON.parse(savedCart);

        if (!Array.isArray(parsedCart)) return [];

        // Accept only valid product IDs and positive quantities.
        return parsedCart.filter((item) =>
            Number.isInteger(item.id) &&
            Number.isInteger(item.quantity) &&
            item.id > 0 &&
            item.quantity > 0
        );
    } catch (error) {
        console.error("Could not read the saved Marketplace cart:", error);
        return [];
    }
}

let marketplaceCart = loadMarketplaceCart();

function saveMarketplaceCart() {
    try {
        localStorage.setItem(
            MARKETPLACE_CART_KEY,
            JSON.stringify(marketplaceCart)
        );
    } catch (error) {
        console.error("Could not save the Marketplace cart:", error);
    }
}

/* Count all units in the cart, including repeated quantities. */
function getMarketplaceCartCount() {
    return marketplaceCart.reduce(
        (total, item) => total + item.quantity,
        0
    );
}

/* Add a product, or increase its quantity if already present. */
function addToMarketplaceCart(productId) {
    const existingItem = marketplaceCart.find(
        (item) => item.id === productId
    );

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        marketplaceCart.push({ id: productId, quantity: 1 });
    }

    saveMarketplaceCart();
    renderMarketplaceCart();
}

/* Remove a product entirely from the cart. */
function removeFromMarketplaceCart(productId) {
    marketplaceCart = marketplaceCart.filter(
        (item) => item.id !== productId
    );

    saveMarketplaceCart();
    renderMarketplaceCart();
}


/* Increase or decrease a product's quantity in the cart. */
function updateMarketplaceCartQuantity(productId, change) {
    const cartItem = marketplaceCart.find(
        (item) => item.id === productId
    );

    if (!cartItem) return;

    cartItem.quantity += change;

    // Remove the product automatically if its quantity reaches zero.
    if (cartItem.quantity <= 0) {
        removeFromMarketplaceCart(productId);
        return;
    }

    saveMarketplaceCart();
    renderMarketplaceCart();
}


/* Empty the entire cart. */
function clearMarketplaceCart() {
    marketplaceCart = [];
    saveMarketplaceCart();
    renderMarketplaceCart();
}

/* Display the cart and calculate its total. */
function renderMarketplaceCart() {
    const countElement = document.getElementById("marketplaceCartCount");
    const itemsContainer = document.getElementById("marketplaceCartItems");
    const totalElement = document.getElementById("marketplaceCartTotal");

    if (!countElement || !itemsContainer || !totalElement) return;

    countElement.textContent = getMarketplaceCartCount();

    let total = 0;
    const cartRows = [];

    marketplaceCart.forEach((cartItem) => {
        const product = marketplaceProducts.find(
            (item) => item.id === cartItem.id
        );

        // Ignore stored IDs that no longer exist in the API response.
        if (!product) return;

        total += product.price * cartItem.quantity;

        const row = document.createElement("div");
        row.className = "marketplace-cart-item";

        const details = document.createElement("div");

        const name = document.createElement("p");
        name.className = "marketplace-cart-item-name";
        name.textContent = product.title;

        
        const quantityControls = document.createElement("div");
        quantityControls.className = "marketplace-quantity-controls";
        
        // Decrease quantity by one.
        const decreaseButton = document.createElement("button");
        decreaseButton.type = "button";
        decreaseButton.className = "marketplace-quantity-button";
        decreaseButton.textContent = "−";
        decreaseButton.setAttribute(
            "aria-label",
            `Decrease quantity of ${product.title}`
        );
        decreaseButton.addEventListener("click", () => {
            updateMarketplaceCartQuantity(product.id, -1);
        });
        
        // Show the current quantity.
        const quantity = document.createElement("span");
        quantity.className = "marketplace-quantity-value";
        quantity.textContent = cartItem.quantity;
        quantity.setAttribute("aria-live", "polite");
        
        // Increase quantity by one.
        const increaseButton = document.createElement("button");
        increaseButton.type = "button";
        increaseButton.className = "marketplace-quantity-button";
        increaseButton.textContent = "+";
        increaseButton.setAttribute(
            "aria-label",
            `Increase quantity of ${product.title}`
        );
        increaseButton.addEventListener("click", () => {
            updateMarketplaceCartQuantity(product.id, 1);
        });
        
        quantityControls.append(decreaseButton, quantity, increaseButton);
        
        const unitPrice = document.createElement("p");
        unitPrice.className = "marketplace-cart-item-quantity";
        unitPrice.textContent =
            `Price each: ${formatMarketplacePrice(product.price)}`;
        
        details.append(name, unitPrice, quantityControls);
        

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "marketplace-remove-item";
        removeButton.textContent = "Remove";
        removeButton.setAttribute(
            "aria-label",
            `Remove ${product.title} from cart`
        );

        removeButton.addEventListener("click", () => {
            removeFromMarketplaceCart(product.id);
        });

        row.append(details, removeButton);
        cartRows.push(row);
    });

    if (cartRows.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "marketplace-message";
        emptyMessage.textContent = "Your cart is empty.";
        itemsContainer.replaceChildren(emptyMessage);
    } else {
        itemsContainer.replaceChildren(...cartRows);
    }

    totalElement.textContent = formatMarketplacePrice(total);
}


/* ---------------------------------------------------------
   1. FORMAT PRODUCT PRICES

   DummyJSON prices are demonstration prices, not Nigerian
   market prices, so we display them in US dollars for now.
   --------------------------------------------------------- */
function formatMarketplacePrice(price) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(price);
}

/* ---------------------------------------------------------
   2. MAKE CATEGORY NAMES EASIER TO READ

   Example: "mens-shirts" becomes "Mens Shirts".
   --------------------------------------------------------- */
function formatMarketplaceCategory(category) {
    return category
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

/* ---------------------------------------------------------
   3. CREATE ONE PRODUCT CARD

   DOM methods and textContent are used instead of inserting
   API text directly into HTML.
   --------------------------------------------------------- */
function createMarketplaceProductCard(product) {
    const card = document.createElement("article");
    card.className = "marketplace-product-card";

    // Product photo.
    const imageContainer = document.createElement("div");
    imageContainer.className = "marketplace-product-image";

    const image = document.createElement("img");
    // Prefer a full product image over the smaller thumbnail.
image.src = product.images?.[0] || product.thumbnail || "";
    image.alt = product.title;
    image.loading = "lazy";

    image.addEventListener("error", () => {
        imageContainer.textContent = "Image unavailable";
        imageContainer.classList.add("marketplace-image-error");
    }, { once: true });

    imageContainer.appendChild(image);

    // Product information.
    const details = document.createElement("div");
    details.className = "marketplace-product-details";

    const name = document.createElement("h3");
    name.textContent = product.title;

    const price = document.createElement("p");
    price.className = "marketplace-product-price";
    price.textContent = formatMarketplacePrice(product.price);

    const category = document.createElement("p");
    category.className = "marketplace-product-category";
    category.textContent = formatMarketplaceCategory(product.category);

    const description = document.createElement("p");
    description.className = "marketplace-product-description";
    description.textContent = product.description || "No description available.";

    
details.append(name, price, category, description);

// Create a button for adding this product to the cart.
const addToCartButton = document.createElement("button");
addToCartButton.type = "button";
addToCartButton.className = "marketplace-add-to-cart";
addToCartButton.innerHTML =
    '<i class="fa-solid fa-cart-plus" aria-hidden="true"></i> Add to cart';

addToCartButton.addEventListener("click", () => {
    addToMarketplaceCart(product.id);

    // Give the user simple feedback after adding the product.
    addToCartButton.innerHTML =
        '<i class="fa-solid fa-check" aria-hidden="true"></i> Added to cart';

    addToCartButton.classList.add("added");

    // Restore the original label after a short delay.
    window.setTimeout(() => {
        addToCartButton.innerHTML =
            '<i class="fa-solid fa-cart-plus" aria-hidden="true"></i> Add to cart';

        addToCartButton.classList.remove("added");
    }, 1000);
});

card.append(imageContainer, details, addToCartButton);

return card;

}

/* ---------------------------------------------------------
   4. POPULATE THE CATEGORY FILTER FROM THE API PRODUCTS

   This prevents the old fixed categories from hiding API
   products whose categories have different names.
   --------------------------------------------------------- */
function populateMarketplaceCategories() {
    const categorySelect = document.getElementById("marketplaceCategory");

    if (!categorySelect) return;

    const previousCategory = categorySelect.value;
    const categories = [
        ...new Set(marketplaceProducts.map((product) => product.category))
    ].sort();

    categorySelect.replaceChildren();

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All categories";
    categorySelect.appendChild(allOption);

    categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = formatMarketplaceCategory(category);
        categorySelect.appendChild(option);
    });

    // Keep the previous selection if it still exists.
    if (categories.includes(previousCategory)) {
        categorySelect.value = previousCategory;
    }
}

/* ---------------------------------------------------------
   5. SEARCH AND FILTER PRODUCTS
   --------------------------------------------------------- */
function renderMarketplaceProducts() {
    const productGrid = document.getElementById("marketplaceProductGrid");
    const searchInput = document.getElementById("marketplaceSearch");
    const categorySelect = document.getElementById("marketplaceCategory");

    if (!productGrid || !searchInput || !categorySelect) return;

    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedCategory = categorySelect.value;

    const filteredProducts = marketplaceProducts.filter((product) => {
        const searchableText = [
            product.title,
            product.description,
            product.category,
            product.brand || ""
        ].join(" ").toLowerCase();

        const matchesSearch = searchableText.includes(searchTerm);
        const matchesCategory =
            selectedCategory === "all" ||
            product.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    if (filteredProducts.length === 0) {
        const message = document.createElement("p");
        message.className = "marketplace-message";
        message.textContent = "No products match your search. Try another term or category.";
        productGrid.replaceChildren(message);
        return;
    }

    const cards = filteredProducts.map(createMarketplaceProductCard);
    productGrid.replaceChildren(...cards);
}

/* ---------------------------------------------------------
   6. FETCH PRODUCTS FROM THE PUBLIC API
   --------------------------------------------------------- */
async function loadMarketplaceProducts() {
    const productGrid = document.getElementById("marketplaceProductGrid");

    if (!productGrid) return;

    const loadingMessage = document.createElement("p");
    loadingMessage.className = "marketplace-message";
    loadingMessage.textContent = "Loading demonstration products...";
    productGrid.replaceChildren(loadingMessage);

    try {
        const response = await fetch(MARKETPLACE_API_URL);

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data.products)) {
            throw new Error("The API returned an unexpected product list.");
        }

        marketplaceProducts = data.products;

        // Remove saved cart entries for products no longer returned by the API.
        marketplaceCart = marketplaceCart.filter((cartItem) =>
            marketplaceProducts.some((product) => product.id === cartItem.id)
        );

        saveMarketplaceCart();
        populateMarketplaceCategories();
        renderMarketplaceProducts();
        renderMarketplaceCart();

    } catch (error) {
        console.error("Marketplace product loading failed:", error);

        const errorMessage = document.createElement("p");
        errorMessage.className = "marketplace-message";
        errorMessage.textContent =
            "We couldn't load products. Check your internet connection and try refreshing the page.";

        productGrid.replaceChildren(errorMessage);
    }
}

/* ---------------------------------------------------------
   7. INITIALIZE THE MARKETPLACE

   Called by initMarketplace() from script.js when the user
   opens Marketplace.
   --------------------------------------------------------- */
export function initMarketplace() {
    const productGrid = document.getElementById("marketplaceProductGrid");
    const searchInput = document.getElementById("marketplaceSearch");
    const categorySelect = document.getElementById("marketplaceCategory");

    if (!productGrid || !searchInput || !categorySelect) {
        console.error("Marketplace HTML elements are missing. Check index.html IDs.");
        return;
    }

    
if (!marketplaceInitialized) {
    // Existing search and category filtering.
    searchInput.addEventListener("input", renderMarketplaceProducts);
    categorySelect.addEventListener("change", renderMarketplaceProducts);

    // Show or hide the cart panel.
    const cartToggle = document.getElementById("marketplaceCartToggle");
    const cartPanel = document.getElementById("marketplaceCartPanel");

    if (cartToggle && cartPanel) {
        cartToggle.addEventListener("click", () => {
            const isOpening = cartPanel.hidden;
            cartPanel.hidden = !isOpening;
            cartToggle.setAttribute("aria-expanded", String(isOpening));
        });
    }

    // Clear every item from the cart.
    const clearCartButton = document.getElementById("marketplaceClearCart");

    if (clearCartButton) {
        clearCartButton.addEventListener("click", clearMarketplaceCart);
    }

    marketplaceInitialized = true;
}

// Show saved cart contents whenever Marketplace is opened.
renderMarketplaceCart();


    // Fetch products on the first opening, or retry if loading failed.
    if (marketplaceProducts.length === 0) {
        loadMarketplaceProducts();
    } else {
        renderMarketplaceProducts();
    }
}
