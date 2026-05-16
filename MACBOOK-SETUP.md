# MacBook Setup

1. Copy project folder from USB to MacBook

2. Delete Windows-only folders:
```bash
rm -rf node_modules .next
```

3. Remove Windows-only packages from `package.json`:
- `opencode-windows-x64`
- `opencode-windows-x64-baseline`

4. Install dependencies:
```bash
npm install
```

5. Run dev server:
```bash
npm run dev
```

6. (Optional) Install opencode for macOS from https://opencode.ai
