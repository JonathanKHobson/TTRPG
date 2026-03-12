const imageRoot = "/assets/images";

function imagePath(relativePath) {
  return `${imageRoot}/${relativePath}`;
}

export const assetCatalog = {
  characters: {
    amberElfRogue: imagePath("characters/amber-elf-rogue.png"),
    mycostarMushroomDruid: imagePath("characters/mycostar-mushroom-druid.png"),
    gladranWingedGuardian: imagePath("characters/gladran-winged-guardian.png"),
    gladranWingedGuardianWide: imagePath("characters/variants/gladran-winged-guardian-wide.png")
  },
  borders: {
    fantasyFrameLandscapeGold: imagePath("borders/fantasy-frame-landscape-gold.png"),
    fantasyFrameLandscape: imagePath("borders/fantasy-frame-landscape.png"),
    fantasyFrameSquare: imagePath("borders/fantasy-frame-square.png")
  },
  loot: {
    coinPileGold: imagePath("loot/coin-pile-gold.png"),
    treasurePileRuby: imagePath("loot/treasure-pile-ruby.png"),
    gemGreen: imagePath("loot/gem-green.png"),
    gemPrismatic: imagePath("loot/gem-prismatic.png"),
    coinPurseRed: imagePath("loot/coin-purse-red.png"),
    coinBagsCorners: imagePath("loot/coin-bags-corners.png")
  },
  textures: {
    parchmentFolded: imagePath("textures/parchment-folded.png")
  }
};
