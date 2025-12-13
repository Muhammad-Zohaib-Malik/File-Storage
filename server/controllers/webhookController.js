import Stripe from "stripe";
import Subscription from "../models/subscriptionModel.js";
const stripe = new Stripe(process.env.STRIPE_API_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const subscription = await Subscription.findOne({
        checkoutSessionId: session.id,
      });

      if (!subscription) {
        console.log("Not Found");
      }

      if (subscription) {
        subscription.stripeSubscriptionId = session.subscription;
        subscription.stripeCustomerId = session.customer;
        subscription.status =
          session.payment_status === "paid" ? "active" : "unpaid";

        await subscription.save();
        console.log(`Subscription ${subscription._id} updated to ACTIVE`);
      } else {
        console.log(
          "Subscription not found for checkoutSessionId:",
          session.id
        );
      }
    } catch (err) {
      console.log("Error updating subscription:", err);
      return res.status(500).send("Server error");
    }
  }

  res.json({ received: true });
};
