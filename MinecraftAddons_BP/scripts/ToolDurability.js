import { world, system, EquipmentSlot } from "@minecraft/server";

const ALIVE = 40;
const THROTTLE = 10;
const cache = new Map();

const SLOTS = [
  EquipmentSlot.Head,
  EquipmentSlot.Chest,
  EquipmentSlot.Legs,
  EquipmentSlot.Feet,
  EquipmentSlot.Mainhand,
  EquipmentSlot.Offhand
];

const NAMES = {
  "minecraft:wooden_pickaxe": "木镐",
  "minecraft:stone_pickaxe": "石镐",
  "minecraft:iron_pickaxe": "铁镐",
  "minecraft:golden_pickaxe": "金镐",
  "minecraft:diamond_pickaxe": "钻石镐",
  "minecraft:netherite_pickaxe": "下界合金镐",
  "minecraft:wooden_axe": "木斧",
  "minecraft:stone_axe": "石斧",
  "minecraft:iron_axe": "铁斧",
  "minecraft:golden_axe": "金斧",
  "minecraft:diamond_axe": "钻石斧",
  "minecraft:netherite_axe": "下界合金斧",
  "minecraft:wooden_shovel": "木锹",
  "minecraft:stone_shovel": "石锹",
  "minecraft:iron_shovel": "铁锹",
  "minecraft:golden_shovel": "金锹",
  "minecraft:diamond_shovel": "钻石锹",
  "minecraft:netherite_shovel": "下界合金锹",
  "minecraft:wooden_hoe": "木锄",
  "minecraft:stone_hoe": "石锄",
  "minecraft:iron_hoe": "铁锄",
  "minecraft:golden_hoe": "金锄",
  "minecraft:diamond_hoe": "钻石锄",
  "minecraft:netherite_hoe": "下界合金锄",
  "minecraft:wooden_sword": "木剑",
  "minecraft:stone_sword": "石剑",
  "minecraft:iron_sword": "铁剑",
  "minecraft:golden_sword": "金剑",
  "minecraft:diamond_sword": "钻石剑",
  "minecraft:netherite_sword": "下界合金剑",
  "minecraft:bow": "弓",
  "minecraft:crossbow": "弩",
  "minecraft:trident": "三叉戟",
  "minecraft:fishing_rod": "钓鱼竿",
  "minecraft:shield": "盾牌",
  "minecraft:shears": "剪刀",
  "minecraft:elytra": "鞘翅",
  "minecraft:flint_and_steel": "打火石",
  "minecraft:leather_helmet": "皮革头盔",
  "minecraft:leather_chestplate": "皮革胸甲",
  "minecraft:leather_leggings": "皮革护腿",
  "minecraft:leather_boots": "皮革靴子",
  "minecraft:chainmail_helmet": "锁链头盔",
  "minecraft:chainmail_chestplate": "锁链胸甲",
  "minecraft:chainmail_leggings": "锁链护腿",
  "minecraft:chainmail_boots": "锁链靴子",
  "minecraft:iron_helmet": "铁头盔",
  "minecraft:iron_chestplate": "铁胸甲",
  "minecraft:iron_leggings": "铁护腿",
  "minecraft:iron_boots": "铁靴子",
  "minecraft:golden_helmet": "金头盔",
  "minecraft:golden_chestplate": "金胸甲",
  "minecraft:golden_leggings": "金护腿",
  "minecraft:golden_boots": "金靴子",
  "minecraft:diamond_helmet": "钻石头盔",
  "minecraft:diamond_chestplate": "钻石胸甲",
  "minecraft:diamond_leggings": "钻石护腿",
  "minecraft:diamond_boots": "钻石靴子",
  "minecraft:netherite_helmet": "下界合金头盔",
  "minecraft:netherite_chestplate": "下界合金胸甲",
  "minecraft:netherite_leggings": "下界合金护腿",
  "minecraft:netherite_boots": "下界合金靴子",
  "minecraft:turtle_helmet": "海龟壳"
};

function toolName(id) {
  return NAMES[id] || id.replace("minecraft:", "");
}

function colorOf(pct) {
  return pct > 0.5 ? "§a" : pct > 0.25 ? "§e" : "§c";
}

function refresh(player) {
  const now = system.currentTick;
  const c = cache.get(player.id);
  let key = "";
  const lines = [];
  try {
    const eq = player.getComponent("minecraft:equippable");
    if (eq) {
      for (const slot of SLOTS) {
        const item = eq.getEquipment(slot);
        if (!item) continue;
        const dur = item.getComponent("minecraft:durability");
        if (!dur || dur.maxDurability <= 0) continue;
        const left = dur.maxDurability - dur.damage;
        const max = dur.maxDurability;
        key += item.typeId + left + max + "|";
        lines.push(`${colorOf(left / max)}${toolName(item.typeId)} ${left}/${max}`);
      }
    }
  } catch (err) {
  }
  if (lines.length === 0) {
    if (c) {
      player.onScreenDisplay.setActionBar("");
      cache.delete(player.id);
    }
    return;
  }
  if (c && c.key === key && now - c.tick < ALIVE) return;
  if (c && now - c.tick < THROTTLE) return;
  player.onScreenDisplay.setActionBar(lines.join("\n"));
  cache.set(player.id, { key, tick: now });
}

world.afterEvents.playerBreakBlock.subscribe((e) => refresh(e.player));
world.afterEvents.entityHitEntity.subscribe((e) => {
  const p = e.damagingEntity;
  if (p && p.typeId === "minecraft:player") refresh(p);
});
world.afterEvents.entityHurt.subscribe((e) => {
  const p = e.hurtEntity;
  if (p && p.typeId === "minecraft:player") refresh(p);
});
world.afterEvents.itemReleaseUse.subscribe((e) => refresh(e.source));
world.afterEvents.playerInteractWithBlock.subscribe((e) => {
  if (e.player) refresh(e.player);
});
world.afterEvents.playerHotbarSelectedSlotChange.subscribe((e) => refresh(e.player));
world.afterEvents.playerJoin.subscribe((e) => refresh(e.player));
world.afterEvents.playerSpawn.subscribe((e) => refresh(e.player));

system.runInterval(() => {
  for (const player of world.getAllPlayers()) refresh(player);
  if (cache.size > 128) cache.clear();
}, ALIVE);