//variables 
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

//Cart items
let cart = [];
//Buttons
let buttonsDOM = [];

//Getting the products
class Products {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items
      products = products.map((item) => {
        const {
          title,
          price
        } = item.fields;
        const {
          id
        } = item.sys;
        const image = item.fields.image.fields.file.url;
        return {
          title,
          price,
          id,
          image
        };
      })
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

//Display products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach(product => {
      result += `
    <!--Single products -->
    <article class = "product">
      <div class = "img-container" >
      <img src = ${product.image}
      alt = "queen bed"
      class = "product-img"/>
      <button class = "bag-btn" data-id = ${product.id}>
        <i class = "fas fa-shopping-cart"></i>Add to Cart
      </button >
    </div>
    <h3> ${product.title}</h3>
    <h4>$${product.price}</h4>
    </article>
    <!--End of Single products -->`;
    });
    productsDOM.innerHTML = result;
  }

  getBagButtons(products) {
    const buttons = [...document.querySelectorAll('.bag-btn')];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if (inCart) {
        button.innerText = "in Cart";
        button.disabled = true;
      }
      button.addEventListener('click', (event) => {
        event.target.innerText = 'In Cart';
        event.target.disabled = true;

        //Get product from the products 
        let cartItem = {
          ...Storage.getProducts(id),
          amount: 1
        };

        //Add product to cart
        cart = [...cart, cartItem];

        //Save cart to storage
        Storage.saveCart(cart);

        //Set cart values
        this.setCartValues(cart);

        //display cart items
        this.addCartItems(cartItem);

        //Show cart
        this.showCart();

      })
    });
  }

  setCartValues(cart) {
    let itemTotalPrice = 0;
    let itemsTotalAmount = 0;
    cart.map(item => {
      itemTotalPrice += item.price * item.amount;
      itemsTotalAmount += item.amount;
    });
    cartTotal.innerText = parseFloat(itemTotalPrice.toFixed(2));
    cartItems.innerText = itemsTotalAmount;
  }

  addCartItems(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `<img src= ${item.image} alt="product">	
    <div>
    <h3>${item.title}</h3>
    <h5>$${item.price}</h5>
    <span class="remove-item" data-id=${item.id}>remove</span>
    </div>
    <div>
    <i class="fas fa-chevron-up" data-id=${item.id}></i>
    <p class=${item.amount}>1</p>
    <i class="fas fa-chevron-down" data-id=${item.id}></i>
    </div>`;
    cartContent.appendChild(div);

  }

  showCart() {
    cartOverlay.classList.add('transparentBcg');
    cartDOM.classList.add('showCart');
  }

  setAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart);
  }

  populateCart(cart) {
    cart.forEach(item => this.addCartItems(item));
  }

  hideCart() {
    cartOverlay.classList.remove('transparentBcg');
    cartDOM.classList.remove('showCart');
  }

  cartLogic() {
    //Clear cart button
    clearCartBtn.addEventListener('click', () => {
      this.clearCart();
    });
    //Cart functionality
    cartContent.addEventListener('click', event =>
    {
      if (event.target.classList.contains('remove-item'))
      {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      }
      else if (event.target.classList.contains('fa-chevron-up'))
      {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
        
      }
      else if (event.target.classList.contains('fa-chevron-down')){
        let reduceAmount = event.target;
        let id = reduceAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount - 1;

        if(tempItem.amount > 0)
        {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          reduceAmount.previousElementSibling.innerText = tempItem.amount;
        } else
        {
          cartContent.removeChild(reduceAmount.parentElement.parentElement);
          this.removeItem(id)
        }
      }
    });
  }

  clearCart() {
    let cartItemsId = cart.map(item => item.id)
    cartItemsId.forEach(id => this.removeItem(id));
    while (cartContent.children.length > 0)
    {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }

  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class='fas fa-shopping-cart'></i>Add to Cart`;
  }

  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id);
  }

  
}

//Local Storage 
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProducts(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find(product => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const ui = new UI();
  const products = new Products();

  //Set App
  ui.setAPP();

  //get all products
  products.getProducts().then(products => {
    ui.displayProducts(products);
    Storage.saveProducts(products);
  }).then(() => {
    ui.getBagButtons();
    ui.cartLogic();
  })
});