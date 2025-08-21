import { useEffect, useRef } from 'react';

const APP_NAME = 'News Aggregator | Innoscripta';

/**
 * Custom hook to manage document title dynamically
 * @param title - The page title (without the app name suffix)
 * @param restoreOnUnmount - Whether to restore the previous title when component unmounts
 */
export const useDocumentTitle = (
  title?: string,
  restoreOnUnmount: boolean = false
) => {
  const prevTitleRef = useRef<string>(document.title);

  useEffect(() => {
    const prevTitle = prevTitleRef.current;
    
    // Set the new title
    if (title) {
      document.title = `${title} | ${APP_NAME}`;
    } else {
      document.title = APP_NAME;
    }

    // Restore previous title on unmount if requested
    return () => {
      if (restoreOnUnmount) {
        document.title = prevTitle;
      }
    };
  }, [title, restoreOnUnmount]);

  // Function to update title programmatically
  const setTitle = (newTitle?: string) => {
    if (newTitle) {
      document.title = `${newTitle} | ${APP_NAME}`;
    } else {
      document.title = APP_NAME;
    }
  };

  return { setTitle };
};
