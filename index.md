# VM 2026 Tips - Index

Detta ar huvudindex for projektet i mapp 3.

## Projektoversikt

VM 2026 Tips ar en React-app byggd med Vite och TypeScript for att registrera tips, hantera tabeller och visa slutspel.

## Teknik

- React 18
- TypeScript 5
- Vite 5
- flag-icons

## Snabbstart

```bash
npm.cmd install
npm.cmd run dev
```

Lokal adress:

- http://localhost:5173/

## Bygg och preview

```bash
npm.cmd run build
npm.cmd run preview
```

## Dokumentation

- [Cloudflare deployment guide](./CLOUDFLARE_DEPLOYMENT.md)

## Viktiga mappar

- `src/components` - UI-komponenter for standings, teams, tips och knockout
- `src/data` - matchdata, schema, lag och knockout-grunder
- `src/utils` - berakningslogik for tabeller och poang
- `src/types` - gemensamma TypeScript-typer
