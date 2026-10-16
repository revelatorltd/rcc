# Working in this repo

RCC, Revelator's internal operations tool, rebuilt from the design system in `../ui-components`.
Like the replica (`../revelator-pro-app`), it is a SPECIFICATION of the system: a page here
reveals what the system lacks, the system gains it, and the page adopts it. Read
`../ui-components/CLAUDE.md` first — every rule there holds here.

## Pages

A page is declared: an index is a `CollectionPage`, a record a `DetailPage`. What no declared form
covers is logged in `gaps.md` and asked — never drawn with HTML, classes or values of the page's
own. Fixtures are invented: hand-written names, never copied from the prototype or the product.

## The system

Taken as a versioned archive in `vendor/`: `npm run ds:update` rebuilds `../ui-components`, packs
it and installs it.

## Before every push

```bash
npm run build                                                  # types and bundle
(cd ../ui-components && APP="$PWD/../rcc" npm run check:app)   # this app against the system
```

`npm run dev` serves on 5180.
