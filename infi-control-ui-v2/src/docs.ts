export const DOCS = {
  tunnel: {
    title: 'Make your gateway reachable (required for Chat/Health)',
    body: `If your baseUrl is http://127.0.0.1:18789 (localhost), Netlify cannot reach it. Pairing can still succeed, but Chat/Health will fail.

Recommended (default): Cloudflare Tunnel

1) Install + login on the gateway host:

  sudo apt-get update && sudo apt-get install -y cloudflared
  cloudflared tunnel login

2) Create a tunnel:

  cloudflared tunnel create infi-gateway

3) Run it to your OpenClaw gateway:

  cloudflared tunnel run --url http://127.0.0.1:18789 infi-gateway

4) Use your tunnel URL as baseUrl (must be https://...).

Alternative: Tailscale Serve/Funnel also works.
`,
  },
}
