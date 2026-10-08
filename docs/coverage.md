# Portfolio coverage

These examples are independent versions of the application's functional areas. The interface layer, real data, and operational settings remain outside this public repository.

| Application area | Public example |
| --- | --- |
| Safe emoji and image imports | `examples/emoji-import-planner.js` |
| Economy and rewards | `examples/economy-service.js` |
| Premium shop, roles, and custom orders | `examples/premium-shop-service.js` |
| Crash game, multipliers, and cashout | `examples/crash-game.js` |
| Economy persistence and data migration | `examples/economy-repository.js` |
| Local runtime configuration mirror | `examples/runtime-mirror.js` |
| Update-log buffering and publishing | `examples/update-log-buffer.js` |
| XP, levels, leaderboards, and podiums | `examples/ranking-service.js` |
| Support tickets and assignment | `examples/ticket-service.js` |
| Automated messages, updates, and recurring jobs | `examples/automation-scheduler.js` |
| Word filters, action limits, and protection | `examples/moderation-service.js` |
| Temporary channels and custom names | `examples/voice-channel-service.js` |
| Persistent voice-channel statuses | `examples/voice-status-store.js` |
| Community-scoped settings | `examples/config-store.js` |
| Media rotation and safe filenames | `examples/media-library.js` |
| Access verification | `examples/verification-service.js` |
| Panels, lists, and pagination | `examples/panel-state.js` |
| Text and music integration limits | `examples/integration-gateway.js` |

Integration adapters receive clients that are already configured by the host environment. Keys, tokens, IDs, private URLs, user data, and usage history are not included in these examples.

Run `npm test` from the repository root to validate every listed example.

The examples are safe to inspect and run with local test data only.
