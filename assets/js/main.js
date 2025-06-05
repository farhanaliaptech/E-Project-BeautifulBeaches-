// Initialize scripts after DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Navigation Scroll Effect: Add 'scrolled' class to nav-bar when scrolling past 50px
  const header = document.getElementById('nav-bar');
  let scrollTimeout;

  document.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, 100); // Debounce scroll event for performance
  });

  // Hamburger Menu Toggle: Handle mobile menu open/close with accessibility support
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', navMenu.classList.contains('active')); // Update ARIA attribute
    hamburger.querySelector('i').classList.toggle('fa-bars');
    hamburger.querySelector('i').classList.toggle('fa-times'); // Toggle icon between bars and times
  });

  // Keyboard Support for Hamburger Menu: Allow Enter or Space to toggle menu
  hamburger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navMenu.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', navMenu.classList.contains('active'));
      hamburger.querySelector('i').classList.toggle('fa-bars');
      hamburger.querySelector('i').classList.toggle('fa-times');
    }
  });

  // Zone Cards Animation: Animate cards when they enter viewport
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
      } else {
        entry.target.classList.remove('animate');
      }
    });
  }, { threshold: 0.3 }); // Trigger when 30% of card is visible

  document.querySelectorAll('.card').forEach(card => cardObserver.observe(card));

  // Consolidated Intersection Observer: Toggle visibility for multiple sections
  function toggleVisibility(sectionSelector, itemSelector) {
    const section = document.querySelector(sectionSelector);
    const items = document.querySelectorAll(itemSelector);
    if (!section || !items.length) return; // Exit if section or items not found

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          items.forEach(item => item.classList.add('visible'));
        } else {
          entry.target.classList.remove('visible');
          items.forEach(item => item.classList.remove('visible'));
        }
      });
    }, { threshold: 0.2, rootMargin: '0px' }); // Trigger at 20% visibility

    observer.observe(section);
  }

  // Apply visibility toggle to gallery, testimonials, FAQs, and promo carousel
  toggleVisibility('.beach-gallery', '.gallery-item');
  toggleVisibility('.testimonial-section', '.testimonial-card');
  toggleVisibility('.faq-section', '.faq-item');
  toggleVisibility('.promo-carousel-section', '.promo-carousel-slide');

  // Activities Slider: Infinite horizontal slider with touch support
  const slider = document.querySelector('.card-slider');
  const prevBtn = document.querySelector('.slider-btn.prev');
  const nextBtn = document.querySelector('.slider-btn.next');
  const cards = Array.from(slider.children);
  let scrollAmount = 250;
  let autoSlideInterval;
  let touchStartX = 0;
  let touchEndX = 0;

  cards.forEach(card => {
    const clone = card.cloneNode(true);
    slider.appendChild(clone); // Clone cards for infinite scroll effect
  });

  function scrollNext() {
    if (slider.scrollLeft >= slider.scrollWidth / 2) {
      slider.scrollLeft = 0; // Reset to start for infinite loop
    } else {
      slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }

  function scrollPrev() {
    if (slider.scrollLeft <= 0) {
      slider.scrollLeft = slider.scrollWidth / 2; // Jump to cloned cards
    } else {
      slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  }

  prevBtn.addEventListener('click', () => {
    scrollPrev();
    resetAutoSlide();
  });

  nextBtn.addEventListener('click', () => {
    scrollNext();
    resetAutoSlide();
  });

  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX; // Capture touch start position
  });

  slider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX; // Capture touch end position
    if (touchEndX < touchStartX - 50) scrollNext(); // Swipe left
    if (touchEndX > touchStartX + 50) scrollPrev(); // Swipe right
    resetAutoSlide();
  });

  function startAutoSlide() {
    autoSlideInterval = setInterval(scrollNext, 4000); // Auto-slide every 4 seconds
  }

  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide(); // Restart auto-slide
  }

  if (window.innerWidth >= 768) {
    startAutoSlide(); // Start auto-slide on desktop
  }

  // Testimonial Carousel: Rotate through testimonial cards
  const testimonialSection = document.querySelector('.testimonial-section');
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  const loadingWave = document.querySelector('.loading-wave');
  let currentIndex = 0;
  const totalCards = testimonialCards.length;
  const rotationInterval = 3000;

  function updateCarousel() {
    if (!testimonialCards.length) {
      testimonialSection.style.display = 'none'; // Hide section if no cards
      return;
    }
    testimonialCards.forEach((card, index) => {
      card.classList.remove('active', 'next', 'prev', 'visible');
      if (index === currentIndex) {
        card.classList.add('active', 'visible');
      } else if (index === (currentIndex + 1) % totalCards) {
        card.classList.add('next', 'visible');
      } else if (index === (currentIndex - 1 + totalCards) % totalCards) {
        card.classList.add('prev', 'visible');
      }
    });

    // Reset and restart loading wave animation
    if (loadingWave) {
      loadingWave.style.animation = 'none';
      void loadingWave.offsetWidth; // Trigger reflow
      loadingWave.style.animation = `wave ${rotationInterval / 1000}s linear infinite`;
    }
  }

  function rotateCarousel() {
    currentIndex = (currentIndex + 1) % totalCards;
    updateCarousel();
  }

  let rotationTimer;
  if (testimonialCards.length) {
    updateCarousel();
    rotationTimer = setInterval(rotateCarousel, rotationInterval); // Rotate every 3 seconds
  }

  // Pause testimonial carousel on hover
  const testimonialCarousel = document.querySelector('.testimonial-carousel');
  if (testimonialCarousel) {
    testimonialCarousel.addEventListener('mouseenter', () => {
      clearInterval(rotationTimer);
      if (loadingWave) {
        loadingWave.style.animationPlayState = 'paused';
      }
    });
    testimonialCarousel.addEventListener('mouseleave', () => {
      rotationTimer = setInterval(rotateCarousel, rotationInterval);
      if (loadingWave) {
        loadingWave.style.animationPlayState = 'running';
      }
    });
  }

  // Promo Carousel: Auto-rotate promotional slides
  const promoSlides = document.querySelectorAll('.promo-carousel-slide');
  let promoIndex = 0;

  function showNextPromoSlide() {
    promoSlides[promoIndex].classList.remove('promo-active');
    promoIndex = (promoIndex + 1) % promoSlides.length;
    promoSlides[promoIndex].classList.add('promo-active');
  }

  if (promoSlides.length) {
    setInterval(showNextPromoSlide, 4000); // Rotate every 4 seconds
  }

  // GSAP ScrollTrigger for Promo Section: Animate on scroll
  gsap.registerPlugin(ScrollTrigger);
  gsap.to('.promo-carousel-section', {
    scrollTrigger: {
      trigger: '.promo-carousel-section',
      start: 'top 80%',
      toggleClass: { targets: '.promo-carousel-section', className: 'promo-visible' },
      once: false,
    },
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out',
  });

  // FAQ Accordion: Toggle FAQ answers with accessibility support
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const faqItem = question.parentElement;
      const answer = faqItem.querySelector('.faq-answer');
      const isActive = faqItem.classList.contains('active');

      // Close all other FAQs
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
        item.querySelector('.faq-answer').style.maxHeight = '0';
        item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      // Open clicked FAQ
      if (!isActive) {
        faqItem.classList.add('active');
        answer.style.maxHeight = `${answer.scrollHeight}px`;
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });
});

// Feedback Section Animations: Animate feedback section and form on scroll
document.addEventListener('DOMContentLoaded', () => {
  // Scroll Animation for Feedback Section
  gsap.registerPlugin(ScrollTrigger);

  gsap.fromTo(
    '.feedback-section',
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.feedback-section',
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
      },
    }
  );

  gsap.fromTo(
    '.feedback-form',
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.feedback-form',
        start: 'top 90%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
      },
    }
  );

  // Form Submission Handling: Simulate form submission with animation
  const feedbackForm = document.getElementById('feedbackForm');
  const thankYouMessage = document.getElementById('thankYouMessage');

  feedbackForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Simulate form submission (replace with actual backend logic if needed)
    feedbackForm.style.display = 'none';
    thankYouMessage.style.display = 'block';
    
    gsap.fromTo(
      '.feedback-thankyou',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    );

    // Reset form after submission
    feedbackForm.reset();
  });
});

// Download Section Animation: Reveal section on scroll
document.addEventListener("DOMContentLoaded", function () {
  const downloadSection = document.querySelector(".download-section");

  function revealOnScroll() {
    const sectionTop = downloadSection.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (sectionTop < windowHeight - 100) {
      downloadSection.classList.add("visible"); // Add visible class when in view
    }
  }

  // Check on scroll
  window.addEventListener("scroll", revealOnScroll);
  // Check on load in case it's already in view
  revealOnScroll();
});

// About Section Animations: Handle hero and staggered list animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible'); // Add visible class when in view
    }
  });
}, {
  threshold: 0.2,
  rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.animate-on-scroll').forEach((element) => {
  observer.observe(element); // Observe elements for scroll animation
});

// Staggered animations for list items in About section
const staggerObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const listItems = entry.target.querySelectorAll('ul li');
      listItems.forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.1}s`; // Delay each list item
      });
    }
  });
}, {
  threshold: 0.2
});

document.querySelectorAll('.about-beach-content').forEach((element) => {
  staggerObserver.observe(element); // Observe About section content
});

// About Hero Animation: Parallax effect and animation trigger
document.addEventListener('DOMContentLoaded', () => {
  const aboutHero = document.querySelector('.about-hero-section');
  const cloudLayer = document.querySelector('.hero-cloud-layer');

  // Trigger initial animation
  aboutHero.classList.add('about-animate');

  // Parallax effect on scroll
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    cloudLayer.style.transform = `translateX(${-scrollPos * 0.4}px)`; // Move cloud layer
  });

  // Intersection Observer for re-triggering animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        aboutHero.classList.add('about-animate');
      } else {
        aboutHero.classList.remove('about-animate');
      }
    });
  }, { threshold: 0.3 }); // Trigger when 30% of hero is visible

  observer.observe(aboutHero);
});

// Zone Section Animations: Reveal beach cards on scroll
document.addEventListener("DOMContentLoaded", () => {
  // Scroll reveal for cards
  const sectionCards = document.querySelectorAll(".beach-card, .east-beach-card, .south-beach-card, .west-beach-card");

  const revealCards = () => {
    const windowHeight = window.innerHeight;
    sectionCards.forEach(card => {
      const top = card.getBoundingClientRect().top;
      if (top <= windowHeight - 50) {
        card.classList.add("visible"); // Add visible class when in view
      } else {
        card.classList.remove("visible");
      }
    });
  };

  window.addEventListener("scroll", revealCards);
  revealCards(); // Check on load
});

// Vibrant Hero Animation: Parallax and scale effect for hero section
document.addEventListener('DOMContentLoaded', () => {
  const vibrantHero = document.querySelector('.vibrant-hero-section');
  const particleBg = document.querySelector('.hero-particle-bg');

  // Trigger initial animation
  vibrantHero.classList.add('vibrant-animate');

  // Parallax and scale effect on scroll
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    particleBg.style.transform = `translateY(${scrollPos * 0.2}px) scale(${1 + scrollPos * 0.0005})`; // Move and scale particle background
  });

  // Intersection Observer for re-triggering animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        vibrantHero.classList.add('vibrant-animate');
      } else {
        vibrantHero.classList.remove('vibrant-animate');
      }
    });
  }, { threshold: 0.3 }); // Trigger when 30% of hero is visible

  observer.observe(vibrantHero);
});