// ==========================================================================
// 1. CONFIGURATION & STATE
// ==========================================================================
const RESTAURANT_PHONE = "2347081485609"; // Replace with your phone number
let cart = []; 
let audioCtx = null;

// ==========================================================================
// 2. AUDIO SYNTHESIZER
// ==========================================================================
function playKitchenAlert() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.4);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.4);
    } catch (error) {
        console.log("Audio skipped due to browser safety policy.");
    }
}

// ==========================================================================
// 3. CORE CART LOGIC
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    console.log("Script loaded and DOM fully ready!");

    const cartDrawer = document.getElementById("cart-drawer");
    const cartToggleBadge = document.getElementById("floating-cart-badge");
    const closeCartBtn = document.getElementById("close-cart");
    const cartItemsContainer = document.getElementById("cart-items-container");
    const cartTotalPriceEl = document.getElementById("cart-total-price");
    const cartCountBadge = document.getElementById("cart-count");
    const whatsappCheckoutBtn = document.getElementById("whatsapp-checkout-btn");
    
    const alertBox = document.getElementById("kitchen-alert-box");
    const alertStatus = document.getElementById("alert-status");

    // Drawer toggles
    if (cartToggleBadge) {
        cartToggleBadge.addEventListener("click", () => {
            cartDrawer.classList.add("open");
        });
    }
    if (closeCartBtn) {
        closeCartBtn.addEventListener("click", () => {
            cartDrawer.classList.remove("open");
        });
    }

    // Attach listeners to every Add to Cart button
    const foodCards = document.querySelectorAll(".food-card");
    console.log(`Found ${foodCards.length} food cards on the page.`);

    foodCards.forEach(card => {
        const addBtn = card.querySelector(".add-to-cart-btn");
        const foodName = card.getAttribute("data-name");
        const foodPrice = parseInt(card.getAttribute("data-price"), 10);

        if (addBtn) {
            addBtn.addEventListener("click", (e) => {
                e.preventDefault(); // Stop any default background behaviors
                console.log(`Clicked! Adding item: ${foodName} - ₦${foodPrice}`);
                
                addItemToCart(foodName, foodPrice);
                playKitchenAlert();
                triggerKitchenDashboardAlert(foodName);
            });
        } else {
            console.log("Warning: a .food-card is missing its .add-to-cart-btn");
        }
    });

    function addItemToCart(name, price) {
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price, quantity: 1 });
        }
        renderCart();
    }

    function removeCartItem(name) {
        cart = cart.filter(item => item.name !== name);
        renderCart();
    }

    function renderCart() {
        cartItemsContainer.innerHTML = "";
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your basket is empty. Add yummy food to start!</p>';
            cartTotalPriceEl.innerText = "₦0";
            cartCountBadge.innerText = "0";
            whatsappCheckoutBtn.disabled = true;
            return;
        }

        let totalAmount = 0;
        let totalItemsCount = 0;

        cart.forEach(item => {
            const itemSubtotal = item.price * item.quantity;
            totalAmount += itemSubtotal;
            totalItemsCount += item.quantity;

            const row = document.createElement("div");
            row.className = "cart-item-row";
            row.innerHTML = `
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <span>${item.quantity}x @ ₦${item.price.toLocaleString()}</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <span style="font-weight:600; margin-right: 10px;">₦${itemSubtotal.toLocaleString()}</span>
                    <button class="remove-item-btn" data-name="${item.name}">Remove</button>
                </div>
            `;
            cartItemsContainer.appendChild(row);
        });

        cartTotalPriceEl.innerText = `₦${totalAmount.toLocaleString()}`;
        cartCountBadge.innerText = totalItemsCount;
        whatsappCheckoutBtn.disabled = false;

        cartItemsContainer.querySelectorAll(".remove-item-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                removeCartItem(e.target.getAttribute("data-name"));
            });
        });
    }

       // 🟢 UPDATE THIS ENTIRE CLICK EVENT IN YOUR script.js FILE
if (whatsappCheckoutBtn) {
    whatsappCheckoutBtn.addEventListener("click", () => {
        if (cart.length === 0) return;

        let messageText = "Hello Gourmet Express! 🍔\n\nI want to place a new order:\n";
        let finalTotal = 0;

        cart.forEach((item, index) => {
            const subtotal = item.price * item.quantity;
            finalTotal += subtotal;
            messageText += `${index + 1}. *${item.name}* (x${item.quantity}) - ₦${subtotal.toLocaleString()}\n`;
        });

        messageText += `\n💵 *Total Bill:* ₦${finalTotal.toLocaleString()}\n\nPlease confirm my order details!`;
        
        const finalUrl = "https://wa.me/" + RESTAURANT_PHONE + "?text=" + encodeURIComponent(messageText);
        
        // 🟢 FIX: Change window.open to window.location.href to trigger the real app instantly!
        window.location.href = finalUrl; 
    });
}


    function triggerKitchenDashboardAlert(itemName) {
        if (alertBox && alertStatus) {
            alertBox.className = "alert-box active-alert";
            alertStatus.innerHTML = `🚨 ITEM ADDED TO CART!<br>Added: ${itemName}<br>Open your order basket to check out!`;

            setTimeout(() => {
                alertBox.className = "alert-box idle";
                alertStatus.innerText = "🟢 Kitchen System: Waiting for incoming orders...";
            }, 4000);
        }
    }
});
