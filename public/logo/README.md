# PunyaSeva — Logo Assets

This directory contains all brand logo assets for PunyaSeva.

## Available Files

| File | Format | Usage |
|------|--------|-------|
| `full-logo.svg` | SVG | Full horizontal logo (light backgrounds) |
| `horizontal-logo.svg` | SVG | Horizontal layout, compact (nav, receipts) |
| `dark-horizontal-logo.svg` | SVG | Horizontal logo for dark backgrounds |
| `icon-only.svg` | SVG | Square icon / favicon — use this in `<img>` tags |
| `app-icon.svg` | SVG | App icon variant |
| `dark-logo.svg` | SVG | Full logo, dark-mode optimised |
| `dark-logo.png` | PNG | Raster fallback for dark logo |
| `app-icons.png` | PNG | Icon sprite sheet |
| `full-logo2.png` | PNG | Alternate full logo raster |
| `horizontal-logo2.png` | PNG | Alternate horizontal raster |

## Usage Notes

- Always prefer `.svg` over `.png` for screen rendering (sharp at any size, smaller file)
- Use `icon-only.svg` for favicons and small icon contexts
- Use `horizontal-logo.svg` in the navbar and print receipts
- OG/Twitter meta image in `index.html` uses `horizontal-logo.svg`
