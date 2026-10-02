/**
 * Universal Print Isolation Helper for SIGAR PRO
 * Guarantees that only the targeted card, badge, or certificate is printed,
 * completely hiding sidebars, headers, navigation bars, and rest of portal.
 */

export function printIsolatedElement(elementIdOrSelector: string, title?: string): void {
  const target = document.getElementById(elementIdOrSelector) || document.querySelector(elementIdOrSelector);
  
  if (!target) {
    console.warn(`Print isolation: element "${elementIdOrSelector}" not found. Falling back to window.print().`);
    window.print();
    return;
  }

  // Backup original page title if custom title provided
  const originalTitle = document.title;
  if (title) {
    document.title = title;
  }

  // Mark body and target element
  document.body.classList.add('print-isolated-active');
  target.classList.add('print-target');

  const cleanUp = () => {
    document.body.classList.remove('print-isolated-active');
    target.classList.remove('print-target');
    if (title) {
      document.title = originalTitle;
    }
    window.removeEventListener('afterprint', cleanUp);
  };

  window.addEventListener('afterprint', cleanUp, { once: true });

  // Fallback timeout in case afterprint doesn't fire in some browsers
  setTimeout(cleanUp, 10000);

  // Trigger print dialog
  setTimeout(() => {
    window.print();
  }, 100);
}
