import { world, EquipmentSlot } from "@minecraft/server";

const MAX = { 1: 6, 2: 8, 3: 10, 4: 12, 5: 16 };
const RADIUS = 12;
const DIRS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const BLOCKED = new Set([
  "minecraft:chest", "minecraft:trapped_chest", "minecraft:ender_chest", "minecraft:barrel",
  "minecraft:furnace", "minecraft:blast_furnace", "minecraft:smoker", "minecraft:hopper",
  "minecraft:dropper", "minecraft:dispenser", "minecraft:crafter", "minecraft:brewing_stand",
  "minecraft:beacon", "minecraft:enchanting_table",
  "minecraft:anvil", "minecraft:chipped_anvil", "minecraft:damaged_anvil",
  "minecraft:crafting_table", "minecraft:lectern", "minecraft:smithing_table",
  "minecraft:stonecutter", "minecraft:stonecutter_block",
  "minecraft:cartography_table", "minecraft:fletching_table", "minecraft:loom",
  "minecraft:composter", "minecraft:grindstone",
  "minecraft:jukebox", "minecraft:note_block",
  "minecraft:bookshelf", "minecraft:chiseled_bookshelf", "minecraft:decorated_pot",
  "minecraft:beehive", "minecraft:bee_nest",
  "minecraft:respawn_anchor", "minecraft:lodestone", "minecraft:conduit",
  "minecraft:campfire", "minecraft:soul_campfire",
  "minecraft:cauldron", "minecraft:lava_cauldron",
  "minecraft:bell", "minecraft:lightning_rod", "minecraft:daylight_detector",
  "minecraft:target", "minecraft:observer",
  "minecraft:piston", "minecraft:sticky_piston",
  "minecraft:redstone_wire", "minecraft:repeater", "minecraft:comparator",
  "minecraft:redstone_torch", "minecraft:lever", "minecraft:tripwire", "minecraft:tripwire_hook",
  "minecraft:bedrock", "minecraft:command_block", "minecraft:chain_command_block", "minecraft:repeating_command_block",
  "minecraft:structure_block", "minecraft:structure_void", "minecraft:jigsaw", "minecraft:reinforced_deepslate",
  "minecraft:nether_portal",
  "minecraft:spawner", "minecraft:trial_spawner", "minecraft:vault", "minecraft:heavy_core",
  "minecraft:copper_bulb",
  "minecraft:sculk_catalyst", "minecraft:sculk_shrieker",
  "minecraft:sculk_sensor", "minecraft:calibrated_sculk_sensor"
]);

function key(x, y, z) {
  return x + "," + y + "," + z;
}

function enchantLevel(tool, id) {
  if (!tool) return 0;
  try {
    const c = tool.getComponent("minecraft:enchantable");
    if (!c) return 0;
    const e = c.getEnchantment(id);
    return e ? e.level : 0;
  } catch (err) {
    return 0;
  }
}

function isBlocked(id) {
  return BLOCKED.has(id) || /_shulker_box|_bed|_door|_sign|_banner|_skull|_head|_button|_pressure_plate/.test(id);
}

world.afterEvents.playerBreakBlock.subscribe((event) => {
  try {
    const player = event.player;
    if (!player || !player.isSneaking) return;
    const equippable = player.getComponent("minecraft:equippable");
    if (!equippable) return;
    const tool = equippable.getEquipment(EquipmentSlot.Mainhand);
    const lv = enchantLevel(tool, "minecraft:efficiency");
    if (!lv) return;
    const maxExtra = MAX[Math.min(lv, 5)] - 1;
    const typeId = event.brokenBlockPermutation.type.id;
    const dim = event.dimension;
    const ox = event.block.location.x;
    const oy = event.block.location.y;
    const oz = event.block.location.z;
    const visited = new Set([key(ox, oy, oz)]);
    const queue = [[ox, oy, oz]];
    const targets = [];
    let qi = 0;
    while (qi < queue.length && targets.length < maxExtra) {
      const pos = queue[qi++];
      for (let i = 0; i < 6 && targets.length < maxExtra; i++) {
        const nx = pos[0] + DIRS[i][0];
        const ny = pos[1] + DIRS[i][1];
        const nz = pos[2] + DIRS[i][2];
        if (Math.abs(nx - ox) + Math.abs(ny - oy) + Math.abs(nz - oz) > RADIUS) continue;
        const k = key(nx, ny, nz);
        if (visited.has(k)) continue;
        visited.add(k);
        const b = dim.getBlock({ x: nx, y: ny, z: nz });
        if (!b || b.typeId !== typeId || isBlocked(b.typeId)) continue;
        targets.push(b);
        queue.push([nx, ny, nz]);
      }
    }
    if (!targets.length) return;
    const dur = tool.getComponent("minecraft:durability");
    const hasDur = !!dur && dur.maxDurability > 0 && player.getGameMode() !== "creative";
    const unb = hasDur ? enchantLevel(tool, "minecraft:unbreaking") : 0;
    let damage = hasDur ? dur.damage : 0;
    for (const b of targets) {
      if (hasDur && dur.maxDurability - damage <= 1) break;
      const bx = b.location.x;
      const by = b.location.y;
      const bz = b.location.z;
      try {
        dim.runCommand("setblock " + bx + " " + by + " " + bz + " air destroy");
      } catch (err) {
        continue;
      }
      if (hasDur && !(unb > 0 && Math.random() < 1 / (unb + 1))) {
        dur.damage = ++damage;
        equippable.setEquipment(EquipmentSlot.Mainhand, tool);
      }
    }
  } catch (err) {
  }
});
