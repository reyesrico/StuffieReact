export function useFetch(action, setIsLoading) {
  setIsLoading(true);

  action
  .then(res => {
    setIsLoading(false);
    return new Promise.resolve(res);
  })
  .catch(err => {
    setIsLoading(false);
    return new Promise.reject(err);
  });
}
