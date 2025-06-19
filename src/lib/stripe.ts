import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID!
