import { useEffect } from 'react';

const BASE_TITLE = 'PunyaSeva';

/**
 * Sets document.title and meta description for a page.
 * Resets to base title on unmount.
 */
export function usePageSeo(title: string, description?: string) {
  useEffect(() => {
    document.title = `${title} | ${BASE_TITLE}`;

    if (description) {
      let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', description);
    }

    return () => {
      document.title = BASE_TITLE;
    };
  }, [title, description]);
}
