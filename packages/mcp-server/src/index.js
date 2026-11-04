#!/usr/bin/env node
"use strict";

const { serveStdio } = require("@modelcontextprotocol/server/stdio");
const { createServer } = require("./server");

if (require.main === module) {
  // stdout is the MCP channel. Fatal errors go to stderr only.
  serveStdio(createServer).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
