import axios from 'axios';
import { showAlert } from './alert';

export const bookTour = async (tourId, date) => {
    try {
        // 1) Get checkout session from API
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}/${date}`)
        // console.log(session);

        // 2) Create checkout from * charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })

    } catch(err) {
        console.log(err);
        const appErr = err.response?.data.message;
        showAlert('error', appErr? appErr: err.message)
        // showAlert('error', err);
    }
}
