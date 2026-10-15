import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe('pk_test_51NHJ0MB37G2GMKNj4mWfY21aCOnVOuQekkUmJFRROH1UlXII6429mzqbN1BAj5l4bswCYmJUyb9QqFPrOzZbaFIo00gtnsHXOO');

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
