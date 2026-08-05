# Subtext — Functional Requirements and Hints

A small line of text placed below an input field to provide contextual guidance or display a validation error.

## What it does

Shows content projected by the consumer below an input control. Each subtext element has an explicit purpose — either a hint or an error — declared by the consumer.

When used inside an `iris-form-field`, the form field controls which subtext is visible at any given time: the first hint is shown when the control is valid or untouched, and the first error is shown when the control is invalid and touched. All other subtexts are hidden. The consumer places one subtext per message and uses conditional rendering to include only the messages that are relevant at the time.

When used outside an `iris-form-field`, the subtext simply displays its projected content.

## Visibility animation

When a subtext element transitions from hidden to visible, it plays a brief entrance animation. This draws the user's attention to the newly appeared message without an abrupt layout shift.

## What it does not do

Does not validate the form control itself. Does not decide its own visibility — that is managed by the parent form field. Does not produce error message text — all content is supplied by the consumer. Does not add spacing or layout beyond its own inline text line.
