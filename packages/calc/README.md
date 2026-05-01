This is a _highly_ idiosyncratic, selective re-implementation of CSS `calc` as a JS tree-like thingy.

I use it to "bake" values into CSS or leave them dynamic as `--property` references. You define the equation in this tree structure, and then give it some subset of 'baked' values, and it reduces the equation to the minimal version with baked values all computed in as much as possible.

Is this necessary? Maybe not...
