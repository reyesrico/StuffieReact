const usePrevious = (useEffect, useRef, value, initialValue) => {
  const ref = useRef(initialValue);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};
const useEffectDebugger = (useEffect, useRef, effectHook, dependencies, dependencyNames) => {
  const previousDeps = usePrevious(useEffect, useRef, dependencies, []);
  const changedDeps = dependencies.reduce((accum, dependency, index) => {
    if (dependency !== previousDeps[index]) {
      const keyName = dependencyNames[index] || index;
      return {
        ...accum,
        [keyName]: {
          before: previousDeps[index],
          after: dependency
        }
      };
    }
    return accum;
  }, {});

  if (Object.keys(changedDeps).length) {
    console.log('[use-effect-debugger] ', changedDeps);
  }
  useEffect(effectHook, dependencies);
};

// https://stackoverflow.com/questions/55187563/determine-which-dependency-array-variable-caused-useeffect-hook-to-fire
// How to use it
/*
  useEffectDebugger(() => {
    // useEffect code here...
  }, [dep1, dep2], ['dep1', 'dep2'])

  useEffectDebugger(() => {
    // useEffect code here...
    stableFeed(friends, dispatch, setIsLoading);
  }, [stableFeed, friends, dispatch], ['stableFeed', 'friends', 'dispatch']);
*/