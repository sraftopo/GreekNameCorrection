# greek-name-correction-mcp

Stdio MCP server for the [`greek-name-correction`](https://www.npmjs.com/package/greek-name-correction) rules engine. It exposes five tools. Each tool returns the library's `preserveOriginal` object as JSON text. The server does not add behavior the library does not already have.

Requires Node.js 20 or newer. The core library stays zero-dependency; this package is separate.

## Setup

From this directory:

```bash
npm install
npm test
npm start
```

`npm start` speaks MCP on stdin/stdout. Do not write application logs to stdout. A host launches the process; you do not open a URL.

Development depends on the core library with `"greek-name-correction": "file:../.."`. That install follows the core package `files` list, so it matches a published install of the core package.

## Tools

| Tool | Arguments | Result |
| --- | --- | --- |
| `correct_greek_name` | `name`, optional `options` | Nominative correction. `corrected`, `original`, `isValid`, `parts`. |
| `convert_greek_name_case` | `name`, `case` (`genitive`, `vocative`, `accusative`) | Same object plus `genitive`, `vocative`, or `accusative`. |
| `transliterate_greek_name` | `name`, `mode` (`greeklish-to-greek`, `greek-to-latin`, `greek-to-greeklish`) | `corrected` is the transliteration after the library capitalizes each token. |
| `analyze_greek_name` | `name` | `gender`, `diminutive`, `title` when present, `parts`, `sortKey`. |
| `batch_correct_greek_names` | `names` (max 100 strings), optional `options` | Array of correction objects, in order. |

`options` accepts the boolean flags in the tool schema, including `explainConfidence`. `preserveOriginal` is always on. `explainConfidence` defaults to false, which omits `confidence`. Set it to true on correction, batch, case, transliteration, or analysis to include `confidence.score` and `confidence.signals`.

Behavior an LLM should not guess past:

- All-caps Greek input has no tonos to keep. Accents come back only when `addAccents` is true.
- Greeklish `s` becomes `σ` at the end of a word as well. `u` is not a Greeklish key.
- Gender is the ending of the last token. `Γεωργίου` and `Γιώργος του Νίκου` are `female`. Unmatched endings are `unknown`.
- `parts` drops particles and titles. A father's name in the genitive is `middleName` when a surname follows it. There is no father-name field.
- Genitive text does not include the title. Vocative and accusative text do.
- A blank string is returned unchanged, not as a correction object.

## Claude Desktop

Edit `claude_desktop_config.json`:

- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "greek-name-correction": {
      "command": "node",
      "args": ["C:\\absolute\\path\\to\\greeknamecorrection\\packages\\mcp-server\\src\\index.js"]
    }
  }
}
```

Use the absolute path of `src/index.js` on this machine. Restart Claude Desktop after saving. The server shows up as `greek-name-correction` with the five tools above.

## Cursor

In the project, create or edit `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "greek-name-correction": {
      "command": "node",
      "args": ["packages/mcp-server/src/index.js"]
    }
  }
}
```

Cursor starts this process with the workspace as the working directory, so the path is relative to the repository root. Run `npm install` inside `packages/mcp-server` first. Reload MCP servers from Cursor's MCP settings if the tools do not appear.

A global server uses the same shape in `~/.cursor/mcp.json` with an absolute path to `src/index.js`.

## n8n

This server is stdio only. n8n's built-in **MCP Client Tool** node connects to an SSE or HTTP endpoint, so it cannot launch this process by itself.

Use the community node [`n8n-nodes-mcp`](https://github.com/nerding-io/n8n-nodes-mcp), which has an MCP Client STDIO credential:

1. Install the community node (`n8n-nodes-mcp`) on a self-hosted n8n. Community nodes are not available on n8n Cloud.
2. To let an AI Agent call it as a tool, set `N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true` and restart n8n.
3. Create a credential of type **MCP Client (STDIO)**:
   - Command: `node`
   - Arguments: the absolute path to `packages/mcp-server/src/index.js` (one argument)
   - Environment variables: leave empty
4. Add the MCP Client node, select that credential, and execute a list-tools or call-tool step. `node` must be Node.js 20+ on the n8n host, and `npm install` must already have been run in `packages/mcp-server` on that host.

## Tests

```bash
npm test
```

Jest calls each tool handler directly. It does not start the stdio process and does not download model weights.

## License

Copyright (c) Stavros. This package is licensed under [CC BY-ND 4.0](https://creativecommons.org/licenses/by-nd/4.0/), the same terms as future releases of the core library. You may copy and redistribute it if you give credit. You may not distribute a modified version.
