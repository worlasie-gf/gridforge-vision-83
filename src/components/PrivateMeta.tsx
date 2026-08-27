import { useEffect } from "react";

/**
 * Sets noindex, nofollow for private routes while mounted and restores
 * the default when unmounted.
 */
const PrivateMeta = ({ title }: { title?: string }) => {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);

    const previousTitle = document.title;
    if (title) document.title = title;

    return () => {
      document.head.removeChild(meta);
      document.title = previousTitle;
    };
  }, [title]);

  return null;
};

export default PrivateMeta;
