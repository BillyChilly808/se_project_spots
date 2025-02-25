import {
  resetValidation,
  enableValidation,
  settings,
} from "../scripts/validation.js";

import "./index.css";
import colemanSrc from "../images/avatar.jpg";
import pencilSrc from "../images/pencil.svg";
import plusSrc from "../images/plus.svg";
import logoSrc from "../images/plus.svg";
import Api from "../utils/Api.js";
import { setButtonText } from "../utils/helpers.js";

// Initialize API
const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "778c1696-f6df-470d-ab8d-faed528a1377",
    "Content-Type": "application/json",
  },
});

// Card Template and List
const cardTemplate = document.querySelector("#card-template");
const cardList = document.querySelector(".cards__list");

// Profile Elements
const profileEditButton = document.querySelector(".profile__edit-btn");
const cardModalButton = document.querySelector(".profile__add-btn");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");
const avatarModalButton = document.querySelector(".profile__avatar-btn");

// Modal Elements
const editProfileModal = document.querySelector("#edit-profile-modal");
const editFormElement = editProfileModal.querySelector(".modal__form");
const editModalCloseButton =
  editProfileModal.querySelector(".modal__close-btn");
const editModalNameInput = editProfileModal.querySelector(
  "#profile-name-input"
);
const editModalDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input"
);

// Card Elements
const cardModal = document.querySelector("#add-card-modal");
const cardForm = cardModal.querySelector(".modal__form");
const cardModalCloseBtn = cardModal.querySelector(".modal__close-btn");
const cardSubmitButton = cardModal.querySelector(".modal__submit-btn");
const cardNameInput = cardModal.querySelector("#add-card-name-input");
const cardLinkInput = cardModal.querySelector("#add-card-link-input");

let selectedCard, selectedCardId;

// Avatar Elements
const avatarModal = document.querySelector("#edit-avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarLinkInput = avatarModal.querySelector("#profile-avatar-input");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarSubmitButton = avatarModal.querySelector(".modal__submit-btn");

// Preview Modal elements
const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaptionEl = previewModal.querySelector(".modal__caption");
const previewModalCloseBtn = previewModal.querySelector(
  ".modal__close-btn_type_preview"
);

// Delete Form Elements
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");
const deleteFormCancelBtn = deleteModal.querySelector(".modal__cancel-btn");

// Load Images
document.getElementById("pencil").src = pencilSrc;
document.getElementById("logo").src = logoSrc;
document.getElementById("plus").src = plusSrc;
document.getElementById("bessie-coleman").src = colemanSrc;

// Utility Function
function disableButton(buttonElement, settings) {
  buttonElement.disabled = true;
  buttonElement.classList.add(settings.inactiveButtonClass);
}

// Handle Add Card
function handleAddCardSubmit(evt) {
  evt.preventDefault();

  const inputValues = {
    name: cardNameInput.value,
    link: cardLinkInput.value,
  };

  setButtonText(evt.submitter, "Saving...");

  api
    .addCard(inputValues)
    .then((cardData) => {
      const cardElement = getCardElement(cardData);
      cardList.prepend(cardElement);
      closeModal(cardModal);
      evt.target.reset();
      disableButton(cardSubmitButton, settings);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(evt.submitter, false, "Saving...", "Save");
    });
}

// Handle Like Card
function handleLike(evt, id) {
  const isLiked = evt.target.classList.contains("card__like-btn_liked");
  evt.target.classList.toggle("card__like-btn_liked");
  api
    .changeLikeStatus(id, isLiked)
    .then(() => {
      evt.target.classList.toggle("card__like-btn_active");
    })
    .catch(console.error);
}

// Handle Delete Card
function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  setButtonText(evt.submitter, true, "Delete", "Deleting..."); // Set loading state

  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      selectedCard = null;
      selectedCardId = null;
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => setButtonText(evt.submitter, false, "Delete")); // Reset button text
}

// Handle Edit Profile
function handleEditFormSubmit(evt) {
  evt.preventDefault();

  setButtonText(evt.submitter, true, "Save", "Saving..."); // Set loading state
  api
    .editUserInfo({
      name: editModalNameInput.value,
      about: editModalDescriptionInput.value,
    })
    .then((data) => {
      profileName.textContent = data.name;
      profileDescription.textContent = data.about;
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => setButtonText(evt.submitter, false, "Save")); // Reset button text
}

// Handle Avatar Update
function handleAvatarSubmit(evt) {
  evt.preventDefault();
  setButtonText(evt.submitter, "Saving...");

  api
    .editAvatarInfo(avatarLinkInput.value)
    .then((data) => {
      console.log(data);
      if (data.avatar) {
        document.querySelector(".profile__avatar").src = data.avatar;
      } else {
        console.error("Avatar update failed:", data);
      }
      closeModal(avatarModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(evt.submitter, false, "Saving...", "Save");
    });
}

// Create Card
function getCardElement(data, userData) {
  console.log(data);
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeBtn = cardElement.querySelector(".card__like-btn");
  const cardDeleteBtn = cardElement.querySelector(".card__delete-btn");

  cardNameEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  if (data.isLiked) {
    cardLikeBtn.classList.add("card__like-btn_liked");
  }

  cardLikeBtn.addEventListener("click", (evt) => handleLike(evt, data._id));

  cardDeleteBtn.addEventListener("click", () =>
    handleDeleteCard(cardElement, data._id)
  );

  cardImageEl.addEventListener("click", () => {
    openModal(previewModal);
    previewModalImageEl.src = data.link;
    previewModalImageEl.alt = data.name;
    previewModalCaptionEl.textContent = data.name;
  });

  return cardElement;
}

// Open and Close Modal Functions
function openModal(modal) {
  modal.classList.add("modal_opened");
  modal.addEventListener("mousedown", handleClickOverlay);
  document.addEventListener("keydown", handleEscClose);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  modal.removeEventListener("mousedown", handleClickOverlay);
  document.removeEventListener("keydown", handleEscClose);
}

function handleClickOverlay(evt) {
  if (evt.target.classList.contains("modal_opened")) {
    closeModal(evt.target);
  }
}

function handleEscClose(evt) {
  if (evt.key === "Escape") {
    const openedModal = document.querySelector(".modal_opened");
    if (openedModal) {
      closeModal(openedModal);
    }
  }
}

// Initialize API data
api
  .getAppInfo()
  .then(([cards, user]) => {
    profileName.textContent = user.name;
    profileDescription.textContent = user.about;
    document.querySelector(".profile__avatar").src = user.avatar;

    cards.forEach((item) => {
      const cardElement = getCardElement(item, user);
      cardList.prepend(cardElement);
    });
  })
  .catch(console.error);

// Event Listeners
profileEditButton.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  resetValidation(
    editFormElement,
    [editModalNameInput, editModalDescriptionInput],
    settings
  );
  openModal(editProfileModal);
});

editModalCloseButton.addEventListener("click", () => {
  closeModal(editProfileModal);
});

cardModalButton.addEventListener("click", () => {
  openModal(cardModal);
});

cardModalCloseBtn.addEventListener("click", () => {
  closeModal(cardModal);
});

avatarModalButton.addEventListener("click", () => {
  openModal(avatarModal);
});

avatarModalCloseBtn.addEventListener("click", () => {
  closeModal(avatarModal);
});

deleteFormCancelBtn.addEventListener("click", () => {
  closeModal(deleteModal);
});

avatarForm.addEventListener("submit", handleAvatarSubmit);
deleteForm.addEventListener("submit", handleDeleteSubmit);
editFormElement.addEventListener("submit", handleEditFormSubmit);
cardForm.addEventListener("submit", handleAddCardSubmit);
previewModalCloseBtn.addEventListener("click", () => closeModal(previewModal));

enableValidation(settings);
