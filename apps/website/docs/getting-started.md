---
sidebar_position: 2
---

# Getting started

## HTML markup

Shuffle operates on a group of items, giving you the ability to filter or sort them.

```html
<div id="photo-gallery">
  <div class="picture-item">…</div>
  <div class="picture-item">…</div>
  <div class="picture-item">…</div>
  <div class="picture-item">…</div>
</div>
```

The easiest way to use Shuffle is to add a `data-groups` attribute to each of the items in your grid as a [valid JSON](https://jsonlint.com/) array of strings.

```html
<!-- highlight-next-line -->
<figure class="picture-item" data-groups='["nature","city"]'>
  <img src="central-park.jpg" alt="Aerial view of Central Park" />
  <figcaption>Looking down on central park and the surrounding builds from the Rockefellar Center</figcaption>
</figure>
```

Alternatively, you can set the `delimiter` option to a comma (`delimiter: ','`) and the `data-groups` attribute will be `split` on that character.

```html
<!-- highlight-next-line -->
<figure class="picture-item" data-groups="nature,city">
  <img src="central-park.jpg" alt="Aerial view of Central Park" />
  <figcaption>Looking down on central park and the surrounding builds from the Rockefellar Center</figcaption>
</figure>
```

If you were using Bootstrap v4 grids, you could use the `col-*` classes like this.

```html
<div class="row" id="photo-gallery">
  <figure class="col-3 picture-item" data-groups='["animal"]'>
    <div class="aspect">
      <img src="crocodile.jpg" alt="A close, profile view of a crocodile looking directly into the camera" />
    </div>
    <figcaption>Crocodile</figcaption>
  </figure>
  <figure class="col-3 picture-item" data-groups='["city"]'>
    <div class="aspect">
      <img src="crossroads.jpg" alt="A multi-level highway stack interchange in Puxi, Shanghai" />
    </div>
    <figcaption>Crossroads</figcaption>
  </figure>
  <figure class="col-3 picture-item" data-groups='["nature","city"]'>
    <div class="aspect">
      <img
        src="central-park.jpg"
        alt="Looking down on central park and the surrounding builds from the Rockefellar Center"
      />
    </div>
    <figcaption>Central Park</figcaption>
  </figure>
  <div class="col-1 js-shuffle-sizer"></div>
</div>
```

## JavaScript

Once the markup is ready, initialize Shuffle by giving it the container element and an optional options object.

```js
const Shuffle = window.Shuffle; // Assumes you're using the UMD version of Shuffle (for example, from unpkg.com).
const element = document.getElementById('photo-gallery');
const sizer = element.querySelector('.js-shuffle-sizer');

const shuffleInstance = new Shuffle(element, {
  itemSelector: '.picture-item',
  sizer: sizer, // could also be a selector: '.js-shuffle-sizer'
});
```
