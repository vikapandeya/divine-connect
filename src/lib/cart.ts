export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedOption?: string;
}

const STORAGE_KEY = 'divine-connect-cart';
const CART_EVENT = 'divine-connect-cart-updated';

function isBrowser() {
  return typeof window !== 'undefined';
}

function notifyCartChange() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(CART_EVENT));
}

export function getCartItems(): CartItem[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch (error) {
    console.error('Failed to read cart items:', error);
    return [];
  }
}

function saveCartItems(items: CartItem[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  notifyCartChange();
}

export function addToCart(item: Omit<CartItem, 'quantity'>) {
  const items = getCartItems();
  // Unique key based on ID and option
  const itemKey = item.id + (item.selectedOption || '');
  const existingItem = items.find((cartItem) => (cartItem.id + (cartItem.selectedOption || '')) === itemKey);

  if (existingItem) {
    saveCartItems(
      items.map((cartItem) =>
        (cartItem.id + (cartItem.selectedOption || '')) === itemKey
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem,
      ),
    );
    return;
  }

  saveCartItems([...items, { ...item, quantity: 1 }]);
}

export function removeFromCart(itemKey: string) {
  saveCartItems(getCartItems().filter((item) => (item.id + (item.selectedOption || '')) !== itemKey));
}

export function updateCartItemQuantity(itemKey: string, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(itemKey);
    return;
  }

  saveCartItems(
    getCartItems().map((item) =>
      (item.id + (item.selectedOption || '')) === itemKey ? { ...item, quantity } : item,
    ),
  );
}

export function clearCart() {
  saveCartItems([]);
}

export function getCartCount() {
  return getCartItems().reduce((count, item) => count + item.quantity, 0);
}

export function subscribeToCart(callback: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener(CART_EVENT, callback);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(CART_EVENT, callback);
    window.removeEventListener('storage', handleStorage);
  };
}
