import Stripe from "stripe";
import dotenv from "dotenv";
import Course from "../models/courseModel.js";
import User from "../models/userModel.js";

dotenv.config();

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const getClientUrl = () => process.env.CLIENT_URL || "http://localhost:5173";

export const createOrder = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured" });
    }

    const { courseId } = req.body;
    const userId = req.userId || req.body.userId;

    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const amount = Math.round(Number(course.price || 0) * 100);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Course price is invalid" });
    }

    const clientUrl = getClientUrl();
    const courseIdStr = courseId.toString();
    const userIdStr = userId.toString();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${clientUrl}/viewcourse/${courseIdStr}?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/viewcourse/${courseIdStr}?canceled=1`,
      client_reference_id: userIdStr,
      metadata: {
        courseId: courseIdStr,
        userId: userIdStr,
      },
      payment_intent_data: {
        metadata: {
          courseId: courseIdStr,
          userId: userIdStr,
        },
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "inr",
            unit_amount: amount,
            product_data: {
              name: course.title || "Course Enrollment",
            },
          },
        },
      ],
    });

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: `Order creation failed ${err?.message || err}` });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured" });
    }

    const { sessionId, courseId } = req.body;
    const userId = req.userId || req.body.userId;

    if (!sessionId) {
      return res.status(400).json({ message: "sessionId is required" });
    }
    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Checkout session not found" });
    }

    const metaCourseId = session.metadata?.courseId;
    const metaUserId = session.metadata?.userId;

    if (
      metaCourseId?.toString() !== courseId.toString() ||
      metaUserId?.toString() !== userId.toString()
    ) {
      return res.status(400).json({ message: "Session metadata mismatch" });
    }

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const userUpdate = await User.updateOne(
      { _id: userId },
      { $addToSet: { enrolledCourses: courseId } }
    );

    const courseUpdate = await Course.updateOne(
      { _id: courseId },
      { $addToSet: { enrolledStudents: userId } }
    );

    if (userUpdate.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    if (courseUpdate.matchedCount === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res
      .status(200)
      .json({ message: "Payment verified and enrollment successful" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error during payment verification",
    });
  }
};

export const stripeWebhook = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).send("Stripe is not configured");
    }

    const signature = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return res.status(400).send("Missing Stripe webhook configuration");
    }
    if (!req.rawBody) {
      return res.status(400).send("Missing raw request body");
    }

    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      webhookSecret
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const courseId = session.metadata?.courseId;
      const userId = session.metadata?.userId;

      if (courseId && userId && session.payment_status === "paid") {
        await Promise.all([
          User.updateOne(
            { _id: userId },
            { $addToSet: { enrolledCourses: courseId } }
          ),
          Course.updateOne(
            { _id: courseId },
            { $addToSet: { enrolledStudents: userId } }
          ),
        ]);
      }
    }

    return res.json({ received: true });
  } catch (error) {
    console.log("Stripe webhook error:", error?.message || error);
    return res.status(400).send(`Webhook Error: ${error?.message || error}`);
  }
};
