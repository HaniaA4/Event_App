// auto-dismiss the flash messages (the success/error banners) after a few seconds so the user doesn't have to close them manually
setTimeout(() => {
  document.querySelectorAll(".flash").forEach(flash => {
    flash.classList.add("hide"); // triggers the css fade-out transition

    // wait for the fade to finish before actually removing it from the page
    setTimeout(() => {
      flash.remove();
    }, 500);
  });
}, 3000);