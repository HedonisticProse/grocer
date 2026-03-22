# Grocer

---

## Table of Contents

- [Grocer](#grocer)
  - [Table of Contents](#table-of-contents)
  - [Description](#description)
  - [Implementation](#implementation)
  - [MVP Core Features](#mvp-core-features)

---

## Description

`Grocer` is a simple static web-app which is deployed on GitHub Pages for users to track their groceries. It allows you to add stores as tabs, then each tab contains the items you want to shop for.

---

## Implementation

- `Grocer` should be created using SvelteKit and be a static web page.
  - Insure use of `ESLint` and `Prettier`
  - Deployments should go to a `/docs` folder
    - Insure an empty `.nojekyll` file is always created in `/docs` to insure proper loading of JS
  - Source material goes in `/src`
- First MVPs are "ugly" meaning no real styling/coloring outside of the basic layout and function as-needed

---

## MVP Core Features

- Use of `IndexedDB` to insure persistence; `localStorage` can be used for simple things like settings and which "list" was last loaded
- Need to have tabs which represent the stores
  - Items exist within the tabs
    - Items have...
      - ID (int) - unique ID of item
      - Store ID (int) - which store ID it belongs under
      - Order (int) - which position does it sit in the list (1st? Last? etc.)
      - Name (str) - name of item
      - Quantity (int) - quantity of item
      - Status (bool) - did you get the item?
      - Important (bool) - is the item important?
      - Coupon ID (str) - for if you have a coupon for the item
    - Items can be re-ordered (use their `Order` property to shift the rendering of the items) using drag-and-drop
    - Items can be moved between stores (use their `Store ID` to change the rendering) using the properties window or drag-and-drop
    - Items on the list can be modified by clicking on them, opening a small window for changing their properties...
      - Name
      - Quantity
      - Store (drop down with the stores available)
      - Important
      - Coupon ID
    - Items have a small star left of their name to show if its important or not
    - Items display a coupon symbol after the name if they have a coupon related to them
- Tabs and Items can be added/removed/modified
- `Trip` is the parent structure that holds `Tabs` and `Items`
  - We can create a new trip, save a current trip, or load another trip from our `IndexedDB`
