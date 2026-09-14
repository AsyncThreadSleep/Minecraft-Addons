# Minecraft-Addons

[中文](README.md) | English

A lightweight Minecraft **Bedrock** addon (Behavior Pack + Resource Pack) with three practical features:

- **Chain Mining** — mine connected blocks of the same type in one go while sneaking
- **Death Coordinates** — see where you died in chat after respawning
- **Tool Durability HUD** — always see how much durability your tools and armor have left

Requires Minecraft Bedrock **1.26.30+** (tested on 1.26.45, App Store version).
Script API: `@minecraft/server` 2.8.0.

---

## Features

### Chain Mining

Sneak (shift) while mining to break connected blocks of the same type all at once.

| Efficiency level | Blocks chained |
| :---: | :---: |
| I | 6 |
| II | 8 |
| III | 10 |
| IV | 12 |
| V | 16 |

- **Trigger**: sneak + break a block with a tool enchanted with **Efficiency**
- Blocks are searched by BFS over the 6 neighbor directions, within a Manhattan radius of 12
- **Durability**: each chained block costs 1 durability point. The **Unbreaking** enchantment gives a `1/(level+1)` chance to skip the cost. Mining stops when the tool is down to its last durability point. Creative mode is unaffected.
- **Safety blacklist**: containers and functional blocks (chests, furnaces, hoppers, crafting tables, spawners, redstone components, beds, doors, shulker boxes, ...) are never chained, so your chests and machines stay safe.
- Uses `setblock air destroy` for natural block drops, breaking sounds and experience.

> **Why "Efficiency"?** Bedrock does not support registering custom enchantments (as of this writing). Chain Mining rides on the vanilla **Efficiency** enchantment, and the resource pack renames its display name to "Chain Mining" (`enchantment.digging`). Side effect: Efficiency shows as "Chain Mining" everywhere in the world.

### Death Coordinates

- When you die, your death location and dimension are saved as player dynamic properties.
- After respawning, the chat shows your last death position:

  `[死亡坐标] 上次死亡位置【主世界】: 123 64 -456`

- Dimensions are localized: 主世界 / 下界 / 末地.

### Tool Durability HUD

Shows the remaining durability of all equipped items in real time on the action bar.

- **6 slots**: helmet, chestplate, leggings, boots, main hand, off hand
- Format: `钻石头盔 100/100`, color-coded: green (>50%), yellow (>25%), red (≤25%)
- Localized names for 60+ common items (all tools, all armor, bow, shield, elytra, ...)
- **Event-driven**: refreshes instantly on mining, attacking, taking damage, releasing item use, interacting with blocks, switching hotbar slots, joining and respawning — plus a 2-second fallback poll (for mending / elytra gliding). No per-second polling.
- Works for every player in the world.

---

## Project structure

```
Minecraft-Addons/
├── MinecraftAddons_BP/            # Behavior pack
│   ├── manifest.json
│   ├── pack_icon.png
│   └── scripts/
│       ├── main.js                # Single script entry - imports all three modules
│       ├── ChainMining.js         # Chain mining logic
│       ├── DeathCoordinates.js    # Death coordinates logic
│       └── ToolDurability.js      # Tool durability HUD
└── MinecraftAddons_RP/            # Resource pack
    ├── manifest.json
    ├── pack_icon.png
    └── texts/
        ├── en_US.lang             # "Chain Mining"
        ├── zh_CN.lang             # "连锁采集"
        ├── zh_TW.lang             # "連鎖採集"
        └── languages.json
```

---

## Installation

1. Download the latest `.mcaddon` from [Releases](https://github.com/AsyncThreadSleep/Minecraft-Addons/releases), or build from source (below).
2. Open the `.mcaddon` file **with Minecraft**: on mobile use Files -> tap the file -> share -> Minecraft; on Windows just double-click it.
3. In the world settings, enable it under **Behavior Packs** and **Resource Packs**.
4. Fully quit and re-enter the world.

> **Updating an old version?** First remove the old pack from the global resource list *and* from the world settings, then import the new one. If a pack keeps showing an old version, it is usually because the old copy is still embedded in the world save — remove it and re-add the new pack, or test in a fresh world.

## Building from source

1. Put the two folders (`MinecraftAddons_BP`, `MinecraftAddons_RP`) into a zip, with their `manifest.json` files at the zip root.
2. Rename the zip extension to `.mcaddon`.
3. Import as described above.

## Requirements

- Minecraft Bedrock 1.26.30+
- `@minecraft/server` 2.8.0
- `script_eval` capability (already enabled in the manifest)

## Notes

- **Keep exactly one script module.** The Bedrock engine only executes the *first* script module of a behavior pack. This addon therefore uses a single entry (`scripts/main.js`) that imports all three feature files — keep it that way when adding features.

## Changelog

| Version | Changes |
| --- | --- |
| 1.0.8 | Chain Mining rule change: the block you break yourself is not counted — each level now chains 6 / 8 / 10 / 12 / 16 blocks |
| 1.0.7 | Fixed Chain Mining re-triggering itself: blocks broken by the chain no longer trigger a new chain, so leftover blocks stay until you mine them again |
| 1.0.6 | Upgraded Script API to `@minecraft/server` 2.8.0 (min_engine_version 1.26.30+); Tool Durability HUD rewritten to be event-driven (instant refresh + 2s fallback) |
| 1.0.5 | Tool Durability HUD now shows item names, e.g. `钻石头盔 100/100` |
| 1.0.4 | Added Tool Durability HUD (durability of all worn and held items) |
| 1.0.3 | Single script entry (`main.js`) so both modules always load; removed debug output |
| 1.0.2 | Fresh UUIDs to fix stale-version imports; completed the block blacklist; added zh_TW; removed `pack_scope` |
| 1.0.1 | Merged Death Coordinates into the addon |
