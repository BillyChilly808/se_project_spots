// The function takes an array of input fields
// and the button element, whose state you need to change

const toggleButtonState = (inputList, buttonElement) => {
  // If there is at least one invalid input
  if (hasInvalidInput(inputList)) {
    // make the button inactive
    buttonElement.classList.add("form__submit_inactive");
  } else {
        // otherwise, make it active
    buttonElement.classList.remove("form__submit_inactive");
  }
};

const setEventListeners = (formElement) => {
  // Find all the form fields and make an array of them
const inputList = Array.from(formElement.querySelectorAll(".form__input"));
// Find the submit button in the current form
const buttonElement = formElement.querySelector(".form__submit");

inputList.forEach((inputElement) => {
  inputElement.addEventListener("input", () => {
    checkInputValidity(formElement, inputElement);

          // Call the toggleButtonState() and pass an array of fields and the button to it
    toggleButtonState(inputList, buttonElement);
  });
});
};

