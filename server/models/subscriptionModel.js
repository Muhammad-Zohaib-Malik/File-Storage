import { model, Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkoutSessionId: {
      type: String,
      required: true,
      unique: true,
    },
    stripeSubscriptionId: {
      type: String,
      unique: true,
    },

    stripeCustomerId: {
      type: String,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "active",
        "trialing",
        "past_due",
        "canceled",
        "unpaid",
        "incomplete",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Subscription = model("Subscription", subscriptionSchema);

export default Subscription;
