import Stripe from "stripe";
import Subscription from "../models/subscriptionModel.js";

const stripe = new Stripe(process.env.STRIPE_API_KEY);

export const createSubscription = async (req, res, next) => {
  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      success_url: "http://localhost:5173",
      line_items: [
        {
          price: req.body.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      metadata: {
        userId: req.user._id,
      },
    });

    const subscription = new Subscription({
      userId: req.user._id,
      checkoutSessionId: checkoutSession.id,
      status: "pending",
    });

    await subscription.save();

    res.json(checkoutSession.url);
  } catch (err) {
    console.log(err);
    next(err);
  }
};
