document.addEventListener("DOMContentLoaded", () => {
  const scroller = document.querySelector(".scroll-stack-scroller");
  const cards = Array.from(document.querySelectorAll(".scroll-stack-card"));

  // Setup Lenis
  const lenis = new Lenis({
    wrapper: scroller,
    content: scroller.querySelector(".scroll-stack-inner"),
    smoothWheel: true,
    duration: 1.2,
  });

  function calculateProgress(scrollTop, start, end) {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }

  function updateCardTransforms() {
    const scrollTop = scroller.scrollTop;
    const containerHeight = scroller.clientHeight;

    cards.forEach((card, i) => {
      const cardTop = card.offsetTop;
      const triggerStart = cardTop - containerHeight * 0.2 - (30 * i);
      const triggerEnd = cardTop - containerHeight * 0.1;

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale = 0.85 + (i * 0.03);
      const scale = 1 - scaleProgress * (1 - targetScale);

      const translateY = Math.max(0, scrollTop - cardTop + containerHeight * 0.2 + (30 * i));

      card.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
    });
  }

  // Attach scroll updates
  scroller.addEventListener("scroll", updateCardTransforms);

  // Lenis RAF loop
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
});
