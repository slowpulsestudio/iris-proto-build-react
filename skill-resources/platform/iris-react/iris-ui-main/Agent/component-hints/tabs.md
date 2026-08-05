# Tabs — Functional Requirements and Hints

## Mutual exclusivity

A tab set presents a fixed set of views where exactly one tab is active at a time. Selecting a tab deactivates the previously active one.

## Content ownership

Tabs do not own or render the content panels. When the active tab changes, the component emits the selected tab's value and the parent is responsible for displaying the corresponding content.

## Icons

Each tab item can optionally display an icon alongside its label. The icon appears before the label text.

## Unique values

Each tab item must have a unique value within the tab set.
