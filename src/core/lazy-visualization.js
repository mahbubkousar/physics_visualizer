export function whenNearViewport(element, rootMargin = '600px') {
  if (!element || typeof IntersectionObserver !== 'function') {
    return Promise.resolve();
  }

  return new Promise(resolve => {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      resolve();
    }, { rootMargin });

    observer.observe(element);
  });
}
