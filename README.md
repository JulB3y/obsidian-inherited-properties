# Obsidian Inherited Properties

Automatically inherit frontmatter properties from parent notes when creating new notes via links.

## How It Works

When you click a `[[wikilink]]` or `[Markdown link]()` in a note, Obsidian creates a new empty file. This plugin intercepts that creation and copies configured frontmatter properties from the parent note into the new note.

**Example:**

Parent note has:
```yaml
---
area: work
project: alpha
---
```

You click `[[New Task]]` → the new note starts with:
```yaml
---
area: work
project: alpha
---
```

## Features

- **Configurable properties** — choose which frontmatter keys to inherit
- **Trigger values** — only inherit when the parent's value matches (e.g. only inherit `area` when it's `"work"`)
- **Works with both** `[[wikilinks]]` and `[Markdown links]()`
- **Autocomplete** — suggests existing property keys from your vault
- **Safe** — only writes to empty, newly created files

## Installation

### Manual

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](../../releases)
2. Copy them into `<vault>/.obsidian/plugins/inherited-properties/`
3. Restart Obsidian or reload community plugins
4. Enable **Inherited Properties** in Settings → Community Plugins

### From Source

```bash
git clone https://github.com/JulBey/obsidian-inherited-properties.git
cd obsidian-inherited-properties
npm install
npm run build
```

Then copy `main.js`, `manifest.json`, and `styles.css` into your vault's plugin folder as above.

## Usage

1. Open **Settings** → **Community Plugins** → **Inherited Properties**
2. Toggle **Enable inheritance** on
3. Click **Add Property**
4. Enter a property key (e.g. `area`, `project`, `status`)
5. Optionally set **trigger values** (comma-separated, leave empty to inherit all values)
6. Enable the checkbox

Now any new note created via a link will inherit the configured properties.

## Development

```bash
npm install       # install dependencies
npm run dev       # watch mode (rebuild on change)
npm run build     # production build
```
