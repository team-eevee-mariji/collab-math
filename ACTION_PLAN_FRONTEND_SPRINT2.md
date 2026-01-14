### **Phase 3: Game Room & Collaboration (Sprint 2)**

**Goal:** Finalize the real-time game room experience and help flow.

## Game Room UI

[x] Build GameView layout with two player panels, prompts, work area, and inputs.
[x] Show room id and a prominent level badge.
[x] Wire SUBMIT_ANSWER for both slots and show feedback.
[x] Replace scratch/notes area with Excalidraw canvas synced via CANVAS_UPDATE.

## Help Flow

[x] "Need help?" sends REQUEST_HELP.
[x] Highlight the target player card for the other player.
[x] "Accept" button enables partner input.
[x] Add a toast or banner when help is requested.

## Progress & Outcomes

[x] Add a level-up animation or transition on NEXT_LEVEL.
[x] Clear answer inputs on NEXT_LEVEL.
[x] Implement a GAME_OVER summary screen (stats + replay/exit).

## Reliability & Polish

[ ] Handle disconnect/reconnect UI state.
[ ] Add error handling for invalid server responses.
[ ] Tune mobile layout for GameView.
