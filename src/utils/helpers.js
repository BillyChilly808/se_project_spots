export function setButtonText(
  buttonElement,
  isLoading,
  defaultText = "Save",
  loadingText = "Saving..."
) {
  if (isLoading) {
    buttonElement.textContent = loadingText;
    console.log(`Setting text to ${loadingText}`);
  } else {
    console.log(`Setting text to ${defaultText}`);
    buttonElement.textContent = defaultText;
  }
}
