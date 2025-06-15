document.addEventListener('DOMContentLoaded', function() {
  // Efecto de aparición suave para las tarjetas
  const teamCards = document.querySelectorAll('.team-card');
  
  teamCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 200 * index);
  });

  // Animación para los iconos
  const memberIcons = document.querySelectorAll('.member-icon');
  
  memberIcons.forEach(icon => {
    icon.addEventListener('mouseenter', () => {
      icon.style.transform = 'scale(1.1)';
      icon.style.transition = 'transform 0.3s ease';
    });
    
    icon.addEventListener('mouseleave', () => {
      icon.style.transform = 'scale(1)';
    });
  });
});