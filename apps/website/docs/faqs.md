---
sidebar_position: 14
---

# FAQs

## Why Does Shuffle leave empty spaces?

The algorithm used to place items does not keep track of empty space nor try to fill them. If you require this functionality, I suggest [packery](http://packery.metafizzy.co/).

## Why are images overlapping?

If the size of your items are dependent on images, they can overlap if shuffle is initialized before all the images have loaded. Check out [this demo](https://codepen.io/Vestride/details/podNGMR) to see how to fix it.

## What’s the difference between Shuffle and Isotope?

Isotope:

- more layout modes
- more options
- community of users
- commercial use requires a license

Shuffle:

- robust filtering
- slightly smaller
- responsive by default
- sizer element (which [packery also has](https://packery.metafizzy.co/options.html#element-sizing))

They are _very_ similar, but I think Shuffle's filtering and sorting are easier to customize, which is the main reason I created this library. Isotope has a much larger community, is battle-tested, and has many stackoverflow answers.

## Padding isn’t working on the shuffle element

The padding is ignored by Shuffle because it creates complexities with absolute positioning the shuffle-items when they have a percentage width as well as setting the height of the shuffle container because of box-sizing. To fix this, wrap the shuffle element in another element which has the padding on it.

## Can I center the layout?

Yes. Use the `isCentered` option.

## It’s not working with Bootstrap 4

Bootstrap 4 uses flexbox for grids, so your main shuffle container element must be a `.row` and the items inside the row (shuffle items) should all be columns. See the [Bootstrap 4 grid demo](https://codepen.io/Vestride/details/weWbJQ).

---

:::info Didn't find an answer?

Try browsing the [CodePen collection](https://codepen.io/collection/AWGLbd) or searching the issues [on GitHub](https://github.com/glen-cheney/Shuffle/issues).

:::
