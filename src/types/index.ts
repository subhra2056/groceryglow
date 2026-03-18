// ─────────────────────────────────────────────
// GroceryGlow — Shared TypeScript Types
// ─────────────────────────────────────────────

export type UserRole = 'customer' | 'admin'

export interface Profile {
  id: string
  role: UserRole
  full_name: string | null
  email: string
  phone: string | null
  photo_url: string | null
  is_active: boolean
  created_at: string
  last_login_at: string | null
}

export interface Category {
  id: string
  name: string
  slug: string
  image: string | null
  description: string | null
  is_featured: boolean
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  category_id: string | null
  description: string | null
  short_description: string | null
  price: number
  discount_price: number | null
  currency: string
  stock: number
  unit: string | null
  images: string[] | null
  is_featured: boolean
  is_organic: boolean
  rating_average: number
  review_count: number
  tags: string[] | null
  created_at: string
  updated_at: string
  // joined
  category?: Category
}

export interface CartItem {
  id: string
  cart_id: string
  product_id: string
  quantity: number
  price: number
  created_at: string
  // joined
  product?: Product
}

export interface Cart {
  id: string
  user_id: string
  subtotal: number
  updated_at: string
  items?: CartItem[]
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type PaymentStatus = 'pending' | 'paid' | 'failed'

export interface Order {
  id: string
  user_id: string
  order_number: string
  subtotal: number
  delivery_fee: number
  discount: number
  total: number
  payment_method: string
  payment_status: PaymentStatus
  order_status: OrderStatus
  delivery_full_name: string
  delivery_phone: string
  delivery_address_line_1: string
  delivery_address_line_2: string | null
  delivery_city: string
  delivery_state: string
  delivery_postal_code: string
  delivery_country: string
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  name: string
  price: number
  quantity: number
  image: string | null
}

export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product?: Product
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  user_name: string
  rating: number
  comment: string | null
  created_at: string
}

export interface Banner {
  id: string
  title: string
  subtitle: string | null
  image: string | null
  cta_text: string | null
  cta_link: string | null
  is_active: boolean
  created_at: string
}

// ─── Cart Context Types ───────────────────────

export interface CartContextItem {
  product: Product
  quantity: number
}

export interface CartContextState {
  items: CartContextItem[]
  itemCount: number
  subtotal: number
  loading: boolean
}

export type CartAction =
  | { type: 'SET_ITEMS'; items: CartContextItem[] }
  | { type: 'ADD_ITEM'; product: Product; quantity?: number }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QTY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_LOADING'; loading: boolean }

// ─── Form Types ───────────────────────────────

export interface CheckoutFormData {
  full_name: string
  phone: string
  address_line_1: string
  address_line_2: string
  city: string
  state: string
  postal_code: string
  country: string
  payment_method: string
}
