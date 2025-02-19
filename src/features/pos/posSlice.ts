import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Product {
  productID: string;
  title: string;
  description: string;
  price: number;
  vat: number;
  discount: number;
  quantity: number;
  notes: string;
}

interface Cart {
  customerId: string;
  notes: string;
  products: Product[];
}

interface Tab {
  id: string;
  cart: Cart;
}

interface TabsState {
  tabs: Tab[];
}

const initialState: TabsState = {
  tabs: [],
};

const tabsSlice = createSlice({
  name: "tabs",
  initialState,
  reducers: {
    createTab: (state, action: PayloadAction<{ id: string; customerId: string }>) => {
      state.tabs.push({
        id: action.payload.id,
        cart: { customerId: action.payload.customerId, notes: "", products: [] },
      });
    },
    addProduct: (state, action: PayloadAction<{ tabId: string; product: Product }>) => {
      const tab = state.tabs.find((t) => t.id === action.payload.tabId);
      if (tab) {
        tab.cart.products.push(action.payload.product);
      }
    },
    updateProduct: (
      state,
      action: PayloadAction<{ tabId: string; productID: string; updates: Partial<Product> }>
    ) => {
      const tab = state.tabs.find((t) => t.id === action.payload.tabId);
      if (tab) {
        const product = tab.cart.products.find((p) => p.productID === action.payload.productID);
        if (product) {
          Object.assign(product, action.payload.updates);
        }
      }
    },
    removeProduct: (state, action: PayloadAction<{ tabId: string; productID: string }>) => {
      const tab = state.tabs.find((t) => t.id === action.payload.tabId);
      if (tab) {
        tab.cart.products = tab.cart.products.filter((p) => p.productID !== action.payload.productID);
      }
    },
    setCustomerDetails: (
      state,
      action: PayloadAction<{ tabId: string; customerId: string; notes: string }>
    ) => {
      const tab = state.tabs.find((t) => t.id === action.payload.tabId);
      if (tab) {
        tab.cart.customerId = action.payload.customerId;
        tab.cart.notes = action.payload.notes;
      }
    },
    removeTab: (state, action: PayloadAction<string>) => {
      state.tabs = state.tabs.filter((t) => t.id !== action.payload);
    },
  },
});

export const { createTab, addProduct, updateProduct, removeProduct, setCustomerDetails, removeTab } = tabsSlice.actions;
export default tabsSlice.reducer;
