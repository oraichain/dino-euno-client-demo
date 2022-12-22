import { useMemo } from "react";
import url from "url";
import { useLocation } from "react-router-dom";

export const useQueryLocation = () => {
  const { pathname, search } = useLocation();

  const queries = useMemo(() => {
    try {
      return url.parse(search, true).query || {};
    } catch (e) {
      return {};
    }
  }, [search]);

  return {
    queries,
    pathname,
  };
};
