document.addEventListener('DOMContentLoaded', () => {
    const flashcards = document.querySelectorAll('.flashcard');

    flashcards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    });
});
