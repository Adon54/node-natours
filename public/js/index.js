// import '@babel/polyfill';
import { login, logout, signup } from './login';
import { displayMap } from './mapbox';
import { updateData } from './updateData';
import { bookTour } from './stripe';
import { initReview } from './review';
import { showAlert } from './alert';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

// DELEGATION
if(mapBox) {
	const locations = JSON.parse(document.getElementById('map').dataset.locations);
	displayMap(locations);
}

if(loginForm) {
	loginForm.addEventListener('submit', e => {
		e.preventDefault();

		// VALUES
		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;
		
		login(email, password);
	})
}

if(signupForm) {
	signupForm.addEventListener('submit', e => {
		e.preventDefault();

		// VALUES
		const name = document.getElementById('name').value;
		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;
		const passwordConfirm = document.getElementById('password-confirm').value;

		signup(name, email, password, passwordConfirm);
	})
}

if (logoutBtn) {
  	logoutBtn.addEventListener('click', logout); 
}

if (userDataForm) {
	userDataForm.addEventListener('submit', e => {
		e.preventDefault();

		const form = new FormData();
		form.append('name', document.getElementById('name').value);
		form.append('email', document.getElementById('email').value); 
		form.append('photo', document.getElementById('photo').files[0]);
		// console.log(form);

		updateData(form, 'data');
	})
}

if (userPasswordForm) {
	userPasswordForm.addEventListener('submit', async e => {
		e.preventDefault(); 
		document.querySelector('.btn--save-password').textContent = 'Updating...';

		const passwordCurrent = document.getElementById('password-current').value;
		const password = document.getElementById('password').value;
		const passwordConfirm = document.getElementById('password-confirm').value;
		await updateData({ passwordCurrent, password, passwordConfirm }, 'password');
		
		document.querySelector('.btn--save-password').textContent = 'SAVE PASSWORD';
		document.getElementById('password-current').value = '';
		document.getElementById('password').value = '';
		document.getElementById('password-confirm').value = '';
	})
}

// Asking user to select starting-date to book the tour
const options = {weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', hour12: true}

const genDates = dates => `
	<ul id="ask-date">
		${dates.map(date => {
			const dateObj = new Date(date);
			return `<li id="date" data-date="${dateObj.toISOString()}">${dateObj.toLocaleDateString('en-US', options)}</li>`
		})}
		<span id="close-booking">&#10005;</span>
	</ul>
`;

const askDate = () => {
	const dateForm = document.getElementById('ask-date');
	dateForm.addEventListener('click', e => {
		const date = e.target.closest('#date')?.dataset.date;
		const close = e.target.closest('#close-booking');
		if (close) return dateForm.remove();
		
		if (date) bookTour(bookBtn.dataset.tourId, date);
	})
}

if(bookBtn) {
	const cta = bookBtn.closest('.cta');
	
	bookBtn.addEventListener('click', e => {
		e.target.textContent = 'Processing...';
		cta.insertAdjacentHTML('beforeend', genDates(bookBtn.dataset.datesStr.split(',')));
		askDate();
	})
}

// if (bookBtn) {
//   bookBtn.addEventListener('click', e => {
//     e.target.textContent = 'Processing...';
//     const {tourId, date} = e.target.dataset;
//     bookTour(tourId)
//   })
// }

// Activating review upload feature
initReview()

// Show the alert if there is one
const alertMessage = document.querySelector('body').dataset.alert

if (alertMessage) {
	showAlert('success', alertMessage, 15)
}
