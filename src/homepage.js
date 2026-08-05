const searchInput = document.getElementById('searchInput');
const courseCards = document.querySelectorAll('.course-card');

searchInput?.addEventListener('input', event => {
  const searchTerm = event.target.value.toLowerCase();

  courseCards.forEach(card => {
    const title = card.querySelector('.course-title')?.textContent.toLowerCase() || '';
    const description = card.querySelector('.course-description')?.textContent.toLowerCase() || '';
    card.style.display = title.includes(searchTerm) || description.includes(searchTerm) ? 'block' : 'none';
  });
});
