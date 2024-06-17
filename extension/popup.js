document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('generate-btn');
  const mainPage = document.getElementById('transition');

  button.addEventListener('click', () => {
    // Replace 'newpage.html' with the path to your new HTML 
    mainPage.classList.add('animate-popup');

    mainPage.addEventListener('animationend', () => {
        // Replace 'generate.html' with the path to your new HTML file

        setTimeout(() => {
        // Replace 'generate.html' with the path to your new HTML file
        window.location.href = 'generate.html';
      }, 1000); 
      }, { once: true });
  });
});