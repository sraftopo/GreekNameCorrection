"use strict";

const { Server } = require("@modelcontextprotocol/server");
const { tools, callTool } = require("./tools");

const SERVER_NAME = "greek-name-correction-mcp";
const SERVER_VERSION = "1.0.0";

function createServer() {
  const server = new Server(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler("tools/list", async () => ({ tools }));

  server.setRequestHandler("tools/call", async (request) => {
    const params = request && request.params ? request.params : {};
    return callTool(params.name, params.arguments);
  });

  return server;
}

module.exports = {
  createServer,
  SERVER_NAME,
  SERVER_VERSION
};
