# AGENTS.md

## Commands

### Typecheck
```bash
bunx tsc --noEmit
```

### Run
```bash
bun run src/index.ts
```

## Notes

- This project uses Bun 1.3.14 as the runtime.
- Server uses `Bun.serve` (built-in HTTP server).
- Database uses `bun:sqlite` (built-in SQLite).
- No external dependencies — only Bun built-ins.
