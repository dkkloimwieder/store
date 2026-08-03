---
title: Quick Start
id: quick-start
---

The basic Solid app example to get started with the TanStack Solid-store.

```jsx
import { createStore, useSelector } from '@tanstack/solid-store';

// You can instantiate the store outside of Solid components too!
export const store = createStore({
  cats: 0,
  dogs: 0
})

export const Display = (props) => {
  const count = useSelector(store, (state) => state[props.animals]);
  return (
    <span>
      {props.animals}: {count()}
      </span>
    );
}

export const Button = (props) => {
  return (
    <button
      onClick={() => {
        store.setState((state) => {
          return {
            ...state,
            [props.animals]: state[props.animals] + 1
          }
        })
      }}
    >
      Increment
    </button>
  )
}

const App = () => {
  return (
    <div>
    <h1>How many of your friends like cats or dogs?</h1>
    <p>
      Press one of the buttons to add a counter of how many of your friends
      like cats or dogs
      </p>
      <Button animals="dogs" />
      <Display animals="dogs" />
      <Button animals="cats" />
      <Display animals="cats" />
  </div>
  );
};

export default App;
```

`useStore` remains available as a deprecated alias to `useSelector`.

## Solid 2

This adapter requires SolidJS 2. Reading `count()` from JSX, as above, works exactly as
you would expect — but Solid 2 settles updates on a microtask, so an *imperative* read
taken in the same synchronous tick as `store.setState(...)` still returns the previous
value. See the [Solid 2 Guide](./guide/solid-2) for the full timing contract and the
`settleOnRead` opt-in.
