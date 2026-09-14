import { world } from "@minecraft/server";
const KEY_POS = "deathCoords_pos";
const KEY_DIM = "deathCoords_dim";
const KEY_PENDING = "deathCoords_pending";

const dimMap = {
  "minecraft:overworld": "主世界",
  "minecraft:nether": "下界",
  "minecraft:the_end": "末地"
};

world.afterEvents.entityDie.subscribe((event) => {
  const { deadEntity } = event;
  if (deadEntity.typeId !== "minecraft:player") return;
  const loc = deadEntity.location;
  const dimId = deadEntity.dimension.id;
  deadEntity.setDynamicProperty(
    KEY_POS,
    `${Math.floor(loc.x)} ${Math.floor(loc.y)} ${Math.floor(loc.z)}`
  );
  deadEntity.setDynamicProperty(KEY_DIM, dimId);
  deadEntity.setDynamicProperty(KEY_PENDING, true);
});

world.afterEvents.playerSpawn.subscribe((event) => {
  const { player } = event;
  if (player.getDynamicProperty(KEY_PENDING) !== true) return;
  const pos = player.getDynamicProperty(KEY_POS);
  const dimId = player.getDynamicProperty(KEY_DIM);
  if (typeof pos === "string" && typeof dimId === "string") {
    const dimName = dimMap[dimId] ?? dimId;
    player.sendMessage(`§6[死亡坐标]§r §e上次死亡位置【${dimName}】: §f${pos}`);
  }
  player.setDynamicProperty(KEY_PENDING, false);
});
