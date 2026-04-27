# stackdiff

> CLI tool to visually diff environment configs and `.env` files across staging and production.

---

## Installation

```bash
npm install -g stackdiff
```

Or run without installing:

```bash
npx stackdiff
```

---

## Usage

```bash
stackdiff <file1> <file2>
```

**Example:**

```bash
stackdiff .env.staging .env.production
```

Outputs a color-coded diff highlighting keys that are missing, added, or changed between the two environment files.

**Options:**

| Flag | Description |
|------|-------------|
| `--keys-only` | Show only key names, hide values |
| `--missing` | Show only missing keys |
| `--output json` | Output diff as JSON |

**Example with flags:**

```bash
stackdiff .env.staging .env.production --keys-only --missing
```

---

## Requirements

- Node.js `>=16`

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## License

[MIT](LICENSE)