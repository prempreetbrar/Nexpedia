import axios from "axios";
import showAlert from "./alerts";
const stripe = Stripe(
  "pk_test_51NjYI9LAKft78KRlgHodoQ5wSZ0PSC98lusruzNtW8HJgcSgyTha2jVZc4VxhMJ8sHrtAmNfFKlhHTgQjbj4KKRG00M0xRXUHL"
);

export default async function bookTour(tourId) {
  // 1) get session from server

  try {
    const checkoutSession = await axios.get(
      `${request.protocol}://${request.get(
        "host"
      )}/api/v1/bookings/checkout/${tourId}`
    );
    await stripe.redirectToCheckout({
      sessionId: checkoutSession.data.session.id,
    });
  } catch (error) {
    showAlert("error", error);
  }

  // 2) Create checkout form + charge credit card
}
