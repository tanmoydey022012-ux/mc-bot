import { system, world } from "@minecraft/server";
import { http, HttpRequest, HttpRequestMethod } from "@minecraft/server-net";

const ATERNOS_IP = "OwnServer-WKpp.aternos.me";
const ATERNOS_PORT = 48825;

// Periodically ping and send keep-alive heartbeats to Aternos
system.runInterval(() => {
  const req = new HttpRequest(`http://${ATERNOS_IP}:${ATERNOS_PORT}`);
  req.setMethod(HttpRequestMethod.Get);
  req.setTimeout(5);

  http.request(req).then(() => {
    console.warn("[KeepAlive] Heartbeat pulse sent successfully to Aternos server.");
  }).catch(() => {
    // Expected behavior for UDP/RakNet endpoints hit with HTTP probes
    console.warn("[KeepAlive] Server socket pinged.");
  });
}, 600); // Triggers every 30 seconds (600 ticks)
