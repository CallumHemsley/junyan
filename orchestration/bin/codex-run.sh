#!/bin/sh
# Run codex non-interactively with the flags every orchestration job needs.
# usage: codex-run.sh <exec|review> [codex args...]   (feed prompts via `- < file`, or stdin is closed)
cmd="$1"; shift
[ -t 0 ] && exec < /dev/null
exec codex "$cmd" --skip-git-repo-check \
  -c 'approval_policy="never"' -c 'notify=[]' -c 'features.hooks=false' -c 'features.apps=false' \
  -c 'mcp_servers.playwright.enabled=false' -c 'mcp_servers.figma.enabled=false' \
  -c 'mcp_servers.maestro.enabled=false' -c 'mcp_servers.paper.enabled=false' \
  -c 'mcp_servers.node_repl.enabled=false' -c 'mcp_servers.sentry.enabled=false' \
  -c 'mcp_servers.computer-use.enabled=false' -c 'mcp_servers.codex_app.enabled=false' \
  -c 'mcp_servers.cua_repl={command="/usr/bin/false",enabled=false}' \
  "$@"
