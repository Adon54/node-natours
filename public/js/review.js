const reviewSection = document.querySelector('.section-my-review');

import { showAlert } from './alert';

export const initReview = () => {
  if (!reviewSection) {
    return
  }

  const reviewForm = reviewSection.querySelector('.review-form');

  const stars = reviewForm.querySelectorAll('.star');
  const comment = reviewForm.querySelector('textarea');

  const submitButton = reviewForm.querySelector('.review-submit');
  const deleteButton = reviewForm.querySelector('.review-delete')
  const editButton = reviewForm.querySelector('.review-edit');
  const updateButton = reviewForm.querySelector('.review-update');

  let selectedRating = 0;

  // -------------------- STAR RATING --------------------

  const updateStars = (rating) => {
    stars.forEach((star) => {
      const starRating = Number(star.dataset.rating);

      star.classList.toggle('star--active', starRating <= rating);
    });
  };

  stars.forEach((star) => {
    star.addEventListener('click', () => {
      selectedRating = Number(star.dataset.rating);

      updateStars(selectedRating);
    });
  });

  // -------------------- EDIT EXISTING REVIEW --------------------

  if (editButton) {
    editButton.addEventListener('click', () => {
      reviewForm.dataset.editing = 'true';

      stars.forEach((star) => {
        star.disabled = false;
      });

      comment.disabled = false;

      selectedRating = [...stars].filter((star) =>
        star.classList.contains('star--active')
      ).length;

      editButton.hidden = true;
      deleteButton.hidden = true;
      updateButton.hidden = false;
    });
  }

  // -------------------- SUBMIT NEW REVIEW --------------------

  if (submitButton) {
    submitButton.addEventListener('click', async () => {
      const rating = selectedRating;
      const review = comment.value.trim();

      if (!rating) {
        showAlert('error', 'Please select a rating.');
        return;
      }

      if (!review) {
        showAlert('error', 'Please write a review.');
        return;
      }

      const tourId = reviewSection.dataset.tourId;

      try {
        submitButton.disabled = true;

        const response = await fetch(`/api/v1/tours/${tourId}/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rating,
            review,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Something went wrong.');
        }

        showAlert('success', 'Review submitted successfully.');

        window.location.reload();
      } catch (err) {
        showAlert('error', err.message);

        submitButton.disabled = false;
      }
    });
  }

  // -------------------- DELETE EXISTING REVIEW --------------------

  if (!deleteButton) {
    deleteButton.addEventListener('click', async () => {
      const reviewId = reviewForm.dataset.reviewId;

      try {
        updateButton.disabled = true;

        const response = await fetch(`/api/v1/reviews/${reviewId}`, {method: "DELETE"})

        if (!response.ok) {
          throw new Error(data.message || 'Something went wrong.');
        }

        showAlert('success', 'Review deleted successfully.');

        window.location.reload();
      } catch(err) {
        console.log(err)
        showAlert('error', err.message);

        deleteButton.disabled = false;
      }
    })
  }

  // -------------------- UPDATE EXISTING REVIEW --------------------

  if (updateButton) {
    updateButton.addEventListener('click', async () => {
      const reviewId = reviewForm.dataset.reviewId;

      const rating = selectedRating;
      const review = comment.value.trim();

      if (!rating) {
        showAlert('error', 'Please select a rating.');
        return;
      }

      if (!review) {
        showAlert('error', 'Please write a review.');
        return;
      }

      try {
        updateButton.disabled = true;

        const response = await fetch(`/api/v1/reviews/${reviewId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rating,
            review,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Something went wrong.');
        }

        showAlert('success', 'Review updated successfully.');

        window.location.reload();
      } catch (err) {
        showAlert('error', err.message);

        updateButton.disabled = false;
      }
    });
  }
}

/*
modules[name][0].call(
  module.exports,
  localRequire,
  module,
  module.exports,
  globalObject
);

there is again some annoying error showing up that doesn't make any sense and that's maybe teh cause preventing my review.js to work?
*/
