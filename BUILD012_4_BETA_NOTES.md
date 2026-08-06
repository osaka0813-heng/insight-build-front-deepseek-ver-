# Build012.4 Beta — Editorial Trigger Scope Fix

The hidden editor trigger was accidentally injected into every reader page component.

Those pages do not receive `onOpenEditorial`, which caused:

`ReferenceError: Property 'onOpenEditorial' doesn't exist`

This revision keeps the trigger only in `CoverPage` and removes all accidental copies from Question, Signals, Change, Process, and Observe pages.
