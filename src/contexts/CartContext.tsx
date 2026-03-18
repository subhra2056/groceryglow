'use client'

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import type { CartAction, CartContextItem, CartContextState, Product } from '@/types'
import { effectivePrice } from '@/lib/utils'

function cartReducer(state: CartContextState, action: CartAction): CartContextState {
  switch (action.type) {
    case 'SET_ITEMS': {
      const items = action.items
      const subtotal = items.reduce(
        (sum, i) => sum + effectivePrice(i.product) * i.quantity,
        0
      )
      return { ...state, items, subtotal, itemCount: items.reduce((s, i) => s + i.quantity, 0) }
    }
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.product.id === action.product.id)
      let items: CartContextItem[]
      if (existing) {
        items = state.items.map((i) =>
          i.product.id === action.product.id
            ? { ...i, quantity: i.quantity + (action.quantity ?? 1) }
            : i
        )
      } else {
        items = [...state.items, { product: action.product, quantity: action.quantity ?? 1 }]
      }
      const subtotal = items.reduce(
        (sum, i) => sum + effectivePrice(i.product) * i.quantity,
        0
      )
      return { ...state, items, subtotal, itemCount: items.reduce((s, i) => s + i.quantity, 0) }
    }
    case 'REMOVE_ITEM': {
      const items = state.items.filter((i) => i.product.id !== action.productId)
      const subtotal = items.reduce(
        (sum, i) => sum + effectivePrice(i.product) * i.quantity,
        0
      )
      return { ...state, items, subtotal, itemCount: items.reduce((s, i) => s + i.quantity, 0) }
    }
    case 'UPDATE_QTY': {
      const items =
        action.quantity <= 0
          ? state.items.filter((i) => i.product.id !== action.productId)
          : state.items.map((i) =>
              i.product.id === action.productId ? { ...i, quantity: action.quantity } : i
            )
      const subtotal = items.reduce(
        (sum, i) => sum + effectivePrice(i.product) * i.quantity,
        0
      )
      return { ...state, items, subtotal, itemCount: items.reduce((s, i) => s + i.quantity, 0) }
    }
    case 'CLEAR_CART':
      return { ...state, items: [], subtotal: 0, itemCount: 0 }
    case 'SET_LOADING':
      return { ...state, loading: action.loading }
    default:
      return state
  }
}

const initialState: CartContextState = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  loading: false,
}

interface CartContextValue extends CartContextState {
  addItem: (product: Product, quantity?: number) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const { user } = useAuth()
  const supabase = createClient()

  // Load cart from Supabase when user logs in
  const loadCart = useCallback(async () => {
    if (!user) {
      dispatch({ type: 'CLEAR_CART' })
      return
    }

    dispatch({ type: 'SET_LOADING', loading: true })

    const { data: cartData } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!cartData) {
      // Create a cart row if none exists
      await supabase.from('carts').insert({ user_id: user.id, subtotal: 0 })
      dispatch({ type: 'SET_LOADING', loading: false })
      return
    }

    const { data: items } = await supabase
      .from('cart_items')
      .select('*, product:products(*, category:categories(*))')
      .eq('cart_id', cartData.id)

    if (items) {
      const mapped: CartContextItem[] = items.map((item) => ({
        product: item.product as Product,
        quantity: item.quantity,
      }))
      dispatch({ type: 'SET_ITEMS', items: mapped })
    }

    dispatch({ type: 'SET_LOADING', loading: false })
  }, [user, supabase])

  useEffect(() => {
    loadCart()
  }, [loadCart])

  // Helper — get or create cart id
  const getCartId = async (): Promise<string | null> => {
    if (!user) return null
    const { data } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (data) return data.id

    const { data: newCart } = await supabase
      .from('carts')
      .insert({ user_id: user.id, subtotal: 0 })
      .select('id')
      .single()
    return newCart?.id ?? null
  }

  const addItem = async (product: Product, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', product, quantity })

    if (!user) return
    const cartId = await getCartId()
    if (!cartId) return

    const price = effectivePrice(product)

    // Check if item exists in DB
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', product.id)
      .single()

    if (existing) {
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
    } else {
      await supabase.from('cart_items').insert({
        cart_id: cartId,
        product_id: product.id,
        quantity,
        price,
      })
    }
  }

  const removeItem = async (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', productId })

    if (!user) return
    const cartId = await getCartId()
    if (!cartId) return

    await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId)
      .eq('product_id', productId)
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QTY', productId, quantity })

    if (!user) return
    const cartId = await getCartId()
    if (!cartId) return

    if (quantity <= 0) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId)
        .eq('product_id', productId)
    } else {
      await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('cart_id', cartId)
        .eq('product_id', productId)
    }
  }

  const clearCart = async () => {
    dispatch({ type: 'CLEAR_CART' })

    if (!user) return
    const cartId = await getCartId()
    if (!cartId) return

    await supabase.from('cart_items').delete().eq('cart_id', cartId)
  }

  return (
    <CartContext.Provider value={{ ...state, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
