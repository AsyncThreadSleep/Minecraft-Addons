# Minecraft-Addons

A lightweight Minecraft **Bedrock** addon (Behavior Pack + Resource Pack) with two practical features:

- **Chain Mining** — mine connected blocks of the same type in one go while sneaking
- **Death Coordinates** — see where you died in chat after respawning

Requires Minecraft Bedrock **1.21.60+** (tested on 1.26.45, App Store version).
Script API: `@minecraft/server` 1.15.0.

---

## Features

### Chain Mining (连锁采集)

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
- **Durability**: each extra block costs 1 durability point. The **Unbreaking** enchantment gives a `1/(level+1)` chance to skip the cost. Mining stops when the tool is down to its last durability point. Creative mode is unaffected.
- **Safety blacklist**: containers and functional blocks (chests, furnaces, hoppers, crafting tables, spawners, redstone components, beds, doors, shulker boxes, ...) are never chained, so your chests and machines stay safe.
- Uses `setblock air destroy` for natural block drops, breaking sounds and experience.

> **Why "Efficiency"?** Bedrock does not support registering custom enchantments (as of this writing). Chain Mining rides on the vanilla **Efficiency** enchantment, and the resource pack renames its display name to "Chain Mining" (`enchantment.digging`). Side effect: Efficiency shows as "Chain Mining" everywhere in the world.

### Death Coordinates (死亡坐标)

- When you die, your death location and dimension are saved as player dynamic properties.
- After respawning, the chat shows your last death position:

  `[死亡坐标] 上次死亡位置【主世界】: 123 64 -456`

- Dimensions are localized: 主世界 / 下界 / 末地.

---

## Project structure

```
Minecraft-Addons/
├── MinecraftAddons_BP/            # Behavior pack
│   ├── manifest.json
│   ├── pack_icon.png
│   └── scripts/
│       ├── main.js                # Single script entry - imports both modules
│       ├── ChainMining.js         # Chain mining logic
│       └── DeathCoordinates.js    # Death coordinates logic
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

- Minecraft Bedrock 1.21.60+
- `@minecraft/server` 1.15.0
- `script_eval` capability (already enabled in the manifest)

## Notes

- **Keep exactly one script module.** The Bedrock engine only executes the *first* script module of a behavior pack. This addon therefore uses a single entry (`scripts/main.js`) that imports both feature files — keep it that way when adding features.

## Changelog

| Version | Changes |
| --- | --- |
| 1.0.3 | Single script entry (`main.js`) so both modules always load; removed debug output |
| 1.0.2 | Fresh UUIDs to fix stale-version imports; completed the block blacklist; added zh_TW; removed `pack_scope` |
| 1.0.1 | Merged Death Coordinates into the addon |

---

## 中文说明

一个轻量的 Minecraft 基岩版 AddOn（行为包 + 资源包），包含两个功能：

**连锁采集**：潜行挖掘时，一次性连锁破坏同类型相连方块。基于原版「效率」附魔触发（基岩版不支持自定义附魔，资源包把效率的显示名改成了"连锁采集"）。效率 I–V 分别连锁 6 / 8 / 10 / 12 / 16 个方块；每连锁一个方块消耗 1 点耐久（附魔「耐久」可概率减免）；箱子、熔炉、工作台等容器与功能方块不会连锁。

**死亡坐标**：死亡时自动记录坐标与维度，重生后在聊天栏显示上次死亡位置（主世界 / 下界 / 末地）。

**安装**：导入 `.mcaddon`（用 Minecraft 打开），在世界设置中启用行为包与资源包。**更新**时先在世界设置和全局资源里移除旧包，再导入新包。

**结构**：`scripts/main.js` 是唯一脚本入口（引擎只执行行为包的第一个 script 模块），通过它导入两个功能文件。连锁采集使用 `setblock air destroy` 实现自然掉落；容器与功能方块被列入黑名单不会连锁。
