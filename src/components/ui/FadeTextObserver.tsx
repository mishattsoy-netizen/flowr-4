"use client";

import { useEffect } from "react";

/**
 * FadeTextObserver
 *
 * Mounts once at the app root. Uses MutationObserver to watch for any
 * element with the `text-fade` class being added to the DOM, and
 * ResizeObserver to detect when its content overflows its container.
 *
 * When overflow is detected, sets `data-overflow="true"` on the element
 * so the CSS gradient mask activates. Clears it when text fits again.
 */

function checkOverflow(el: Element) {
  // Trigger fade only when text actually overflows.
  // Using a strict check avoids unnecessary fades on elements that fit perfectly.
  const overflowing = el.scrollWidth > el.clientWidth;
  if (overflowing) {
    el.setAttribute("data-overflow", "true");
  } else {
    el.removeAttribute("data-overflow");
  }
}

export default function FadeTextObserver() {
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        checkOverflow(entry.target);
      }
    });

    function observeElement(el: Element) {
      if (el.classList.contains("text-fade") || el.classList.contains("truncate") || el.classList.contains("text-ellipsis")) {
        checkOverflow(el);
        resizeObserver.observe(el);
      }
    }

    function unobserveElement(el: Element) {
      if (el.classList.contains("text-fade") || el.classList.contains("truncate") || el.classList.contains("text-ellipsis")) {
        resizeObserver.unobserve(el);
        el.removeAttribute("data-overflow");
      }
    }

    // Observe all existing elements
    document.querySelectorAll(".text-fade, .truncate, .text-ellipsis").forEach(observeElement);

    // Watch for new .text-fade elements being added/removed
    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          const el = node as Element;
          observeElement(el);
          // Also check children
          el.querySelectorAll(".text-fade, .truncate, .text-ellipsis").forEach(observeElement);
        });

        mutation.removedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          const el = node as Element;
          unobserveElement(el);
          el.querySelectorAll(".text-fade, .truncate, .text-ellipsis").forEach(unobserveElement);
        });

        // Handle attribute changes (e.g. class toggled onto existing element)
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const el = mutation.target as Element;
          if (el.classList.contains("text-fade") || el.classList.contains("truncate") || el.classList.contains("text-ellipsis")) {
            observeElement(el);
          } else {
            unobserveElement(el);
          }
        }
      }
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
