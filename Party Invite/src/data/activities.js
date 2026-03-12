const locationFilterOptions = [
  "At the House",
  "Mesa / East Valley",
  "Tempe / Chandler / Gilbert",
  "Scottsdale / North Scottsdale",
  "Phoenix / Central City",
  "West Valley",
  "Day Trip / Out of Town"
];

const travelFilterOptions = [
  "At the House",
  "Nearby",
  "Medium Drive",
  "Long Drive",
  "Varies / Unknown"
];

const durationFilterOptions = [
  "Quick Stop",
  "Half Day",
  "Most of the Day",
  "Full Day",
  "Flexible / Unknown"
];

const costFilterOptions = [
  "Included",
  "Free",
  "Low Cost",
  "Moderate Cost",
  "High Cost",
  "Varies / Unknown"
];

const energyFilterOptions = [
  "Low",
  "Low-Medium",
  "Medium",
  "Medium-High",
  "High"
];

export const activityAdvancedFilters = {
  location: locationFilterOptions,
  travel: travelFilterOptions,
  duration: durationFilterOptions,
  cost: costFilterOptions,
  energy: energyFilterOptions
};

const durationBucketGroups = {
  "Quick Stop": [
    "hike-hole-rock",
    "hike-papago"
  ],
  "Half Day": [
    "animal-sea-life",
    "animal-butterfly",
    "animal-herp",
    "adrenaline-escape-room",
    "adrenaline-bam-kazam",
    "adrenaline-octane",
    "adrenaline-andretti",
    "adrenaline-topgolf",
    "adrenaline-ifly",
    "adrenaline-fatcats",
    "adrenaline-gamers-guild",
    "museum-art",
    "museum-heard",
    "museum-natural-history",
    "museum-mesa-contemporary",
    "museum-mesa-arts",
    "nature-tempe-town-lake",
    "nature-riparian",
    "nature-botanical",
    "nature-japanese-garden",
    "nature-downtown-strolls",
    "hike-wind-cave",
    "hike-gateway",
    "hike-camelback-cholla",
    "hike-toms-thumb",
    "hike-fremont",
    "hike-camelback-echo",
    "hike-pinnacle",
    "hike-piestewa",
    "hike-holbert",
    "hike-lost-dog",
    "hike-hieroglyphic",
    "hike-wave-cave",
    "hike-hidden-valley"
  ],
  "Most of the Day": [
    "featured-daggerheart",
    "animal-phoenix-zoo",
    "animal-odysea",
    "animal-wildlife-world",
    "museum-science-center",
    "museum-mim",
    "nature-salt-river",
    "nature-saguaro-lake",
    "nature-revel-surf",
    "hike-pass-mountain",
    "hike-flatiron",
    "hike-browns-ranch",
    "trip-tortilla-flat",
    "trip-boyce",
    "trip-tonto-bridge",
    "trip-montezuma"
  ],
  "Flexible / Unknown": [
    "adrenaline-gamers-guild",
    "museum-mesa-arts",
    "nature-downtown-strolls"
  ],
  "Full Day": [
    "trip-payson",
    "trip-prescott",
    "trip-jerome",
    "trip-sedona",
    "trip-tucson",
    "trip-kartchner",
    "trip-flagstaff",
    "trip-petrified",
    "trip-tombstone",
    "trip-bisbee",
    "trip-grand-canyon"
  ]
};

const durationBucketById = Object.fromEntries(
  Object.entries(durationBucketGroups).flatMap(([bucket, ids]) =>
    ids.map((activityId) => [activityId, bucket])
  )
);

function getLocationGroup(activity) {
  if (activity.locationGroup !== undefined) {
    return activity.locationGroup;
  }

  const location = activity.location?.toLowerCase() ?? "";

  if (!location || /tbd/.test(location)) {
    return null;
  }

  if (activity.category === "Day Trips") {
    return "Day Trip / Out of Town";
  }

  if (location.includes("kyle's house")) {
    return "At the House";
  }

  if (location.includes("mesa / scottsdale / chandler")) {
    return "Mesa / East Valley";
  }

  if (/west valley|glendale/.test(location)) {
    return "West Valley";
  }

  if (/scottsdale/.test(location)) {
    return "Scottsdale / North Scottsdale";
  }

  if (/tempe|chandler|gilbert/.test(location)) {
    return "Tempe / Chandler / Gilbert";
  }

  if (/mesa|east valley|near east mesa|peralta|coon bluff|phon d\. sutton|butcher jones/.test(location)) {
    return "Mesa / East Valley";
  }

  if (/phoenix|papago park|downtown phoenix|central phoenix|south mountain/.test(location)) {
    return "Phoenix / Central City";
  }

  return "Day Trip / Out of Town";
}

function getTravelBucket(activity) {
  if (activity.travelBucket !== undefined) {
    return activity.travelBucket;
  }

  const driveTime = activity.driveTime?.toLowerCase() ?? "";

  if (!driveTime || /tbd/.test(driveTime)) {
    return null;
  }

  if (/already there|at the house/.test(driveTime)) {
    return "At the House";
  }

  if (/varies/.test(driveTime)) {
    return "Varies / Unknown";
  }

  const values = [...driveTime.matchAll(/\d+(?:\.\d+)?/g)].map(([match]) => Number(match));
  const maxValue = values.length ? Math.max(...values) : null;

  if (driveTime.includes("hr")) {
    return "Long Drive";
  }

  if (driveTime.includes("min")) {
    if (maxValue !== null && maxValue <= 20) {
      return "Nearby";
    }

    if (maxValue !== null && maxValue <= 60) {
      return "Medium Drive";
    }

    return "Long Drive";
  }

  if (driveTime.includes("mi")) {
    if (maxValue !== null && maxValue <= 15) {
      return "Nearby";
    }

    if (maxValue !== null && maxValue <= 30) {
      return "Medium Drive";
    }

    return "Long Drive";
  }

  return "Varies / Unknown";
}

function getDurationBucket(activity) {
  if (activity.durationBucket !== undefined) {
    return activity.durationBucket;
  }

  if (activity.activityId in durationBucketById) {
    return durationBucketById[activity.activityId];
  }

  if (activity.category === "Games") {
    if (activity.subtype === "Tabletop RPGs") {
      return "Most of the Day";
    }

    return "Half Day";
  }

  return null;
}

function getCostBucket(activity) {
  if (activity.costBucket !== undefined) {
    return activity.costBucket;
  }

  const cost = activity.cost?.toLowerCase() ?? "";

  if (!cost || /tbd/.test(cost)) {
    return null;
  }

  if (cost.includes("included")) {
    return "Included";
  }

  if (cost === "free" || cost.includes("often free")) {
    return "Free";
  }

  if (cost.includes("varies")) {
    return "Varies / Unknown";
  }

  if (cost.includes("low cost")) {
    return "Low Cost";
  }

  const values = [...cost.matchAll(/\d+(?:\.\d+)?/g)].map(([match]) => Number(match));
  const maxValue = values.length ? Math.max(...values) : null;

  if (maxValue === null) {
    return "Varies / Unknown";
  }

  if (maxValue <= 20) {
    return "Low Cost";
  }

  if (maxValue <= 60) {
    return "Moderate Cost";
  }

  return "High Cost";
}

function getEnergyBucket(activity) {
  if (activity.energyBucket !== undefined) {
    return activity.energyBucket;
  }

  return energyFilterOptions.includes(activity.energy) ? activity.energy : null;
}

export function normalizeActivityForFilters(activity) {
  return {
    ...activity,
    locationGroup: getLocationGroup(activity),
    travelBucket: getTravelBucket(activity),
    durationBucket: getDurationBucket(activity),
    costBucket: getCostBucket(activity),
    energyBucket: getEnergyBucket(activity)
  };
}

export const activityCategories = [
  "All",
  "Featured",
  "Animals",
  "Adrenaline",
  "Museums",
  "Nature",
  "Hiking",
  "Day Trips",
  "Games"
];

const baseFeaturedActivities = [
  {
    activityId: "featured-daggerheart",
    title: "Daggerheart campaign with Jenga tension",
    category: "Featured",
    subtype: "Primary activity",
    location: "Kyle's house",
    driveTime: "Already there",
    cost: "Included",
    energy: "Medium-High",
    description:
      "Kyle's original story-first TTRPG session. This is the anchor event for the day and it is not voteable.",
    voteable: false,
    featured: true
  }
];

const baseActivities = [
  { activityId: "animal-phoenix-zoo", title: "Phoenix Zoo", category: "Animals", subtype: "Animal attraction", location: "Papago Park", driveTime: "~20-55 min", cost: "$39.95 adult", energy: "Medium", description: "Large zoo day with good shoulder-season weather.", voteable: true, featured: false },
  { activityId: "animal-odysea", title: "OdySea Aquarium", category: "Animals", subtype: "Animal attraction", location: "Scottsdale", driveTime: "~25-55 min", cost: "$35-$55", energy: "Low-Medium", description: "Aquarium and Arizona Boardwalk options in the same zone.", voteable: true, featured: false },
  { activityId: "animal-sea-life", title: "SEA LIFE Arizona", category: "Animals", subtype: "Animal attraction", location: "Tempe", driveTime: "~20-50 min", cost: "$18-$22", energy: "Low", description: "Shorter aquarium stop near Arizona Mills.", voteable: true, featured: false },
  { activityId: "animal-butterfly", title: "Butterfly Wonderland", category: "Animals", subtype: "Animal attraction", location: "Scottsdale", driveTime: "~25-55 min", cost: "Varies", energy: "Low", description: "Light, colorful indoor outing at Arizona Boardwalk.", voteable: true, featured: false },
  { activityId: "animal-wildlife-world", title: "Wildlife World Zoo + Aquarium", category: "Animals", subtype: "Animal attraction", location: "West Valley", driveTime: "~60-90 min", cost: "$49 adult", energy: "Medium", description: "A longer zoo day if the group wants something bigger.", voteable: true, featured: false },
  { activityId: "animal-herp", title: "Phoenix Herpetological Sanctuary", category: "Animals", subtype: "Animal attraction", location: "North Scottsdale", driveTime: "~40-70 min", cost: "$25 adult", energy: "Low-Medium", description: "Reptile tour option with a more niche feel.", voteable: true, featured: false },

  { activityId: "adrenaline-escape-room", title: "Escape room", category: "Adrenaline", subtype: "Venue", location: "Puzzle Effect, Phoenix", driveTime: "~35-60 min", cost: "$37.95/person", energy: "High", description: "Good fit for a coordinated group that wants a puzzle challenge.", voteable: true, featured: false },
  { activityId: "adrenaline-bam-kazam", title: "Bam Kazam", category: "Adrenaline", subtype: "Venue", location: "Scottsdale", driveTime: "~25-55 min", cost: "$36/person", energy: "High", description: "A human arcade with physical challenge rooms.", voteable: true, featured: false },
  { activityId: "adrenaline-octane", title: "Octane Raceway", category: "Adrenaline", subtype: "Venue", location: "Scottsdale", driveTime: "~25-55 min", cost: "$26-$28/race + membership", energy: "High", description: "Go-karts, arcade, and VR in one stop.", voteable: true, featured: false },
  { activityId: "adrenaline-andretti", title: "Andretti Indoor Karting", category: "Adrenaline", subtype: "Venue", location: "Chandler", driveTime: "~25-55 min", cost: "$29/race", energy: "High", description: "Karting-heavy option on the Chandler side.", voteable: true, featured: false },
  { activityId: "adrenaline-topgolf", title: "Topgolf", category: "Adrenaline", subtype: "Venue", location: "Scottsdale or Glendale", driveTime: "~25-70 min", cost: "$25-$45/hr per bay", energy: "Medium", description: "Easy group activity with a flexible pace.", voteable: true, featured: false },
  { activityId: "adrenaline-ifly", title: "Indoor skydiving", category: "Adrenaline", subtype: "Venue", location: "iFLY, Scottsdale area", driveTime: "~25-55 min", cost: "$100+/person", energy: "High", description: "High-cost, high-novelty option.", voteable: true, featured: false },
  { activityId: "adrenaline-fatcats", title: "FatCats Mesa or Dave & Buster's", category: "Adrenaline", subtype: "Venue", location: "Mesa", driveTime: "~5-20 min", cost: "Varies", energy: "Medium", description: "Bowling, arcade, and movies with low planning overhead.", voteable: true, featured: false },
  { activityId: "adrenaline-gamers-guild", title: "Gamers Guild", category: "Adrenaline", subtype: "Venue", location: "Tempe or North Phoenix", driveTime: "Varies", cost: "Low cost", energy: "Low-Medium", description: "Good backup if the group wants a dedicated board game venue.", voteable: true, featured: false },

  { activityId: "museum-science-center", title: "Arizona Science Center + Dome", category: "Museums", subtype: "Museum", location: "Downtown Phoenix", driveTime: "~35-60 min", cost: "$22.95 + $14 Dome", energy: "Medium", description: "Interactive museum day with an IMAX-style dome option.", voteable: true, featured: false },
  { activityId: "museum-mim", title: "Musical Instrument Museum", category: "Museums", subtype: "Museum", location: "North Phoenix", driveTime: "~45-75 min", cost: "$20 adult", energy: "Low", description: "Large, polished museum with broad appeal.", voteable: true, featured: false },
  { activityId: "museum-art", title: "Phoenix Art Museum", category: "Museums", subtype: "Museum", location: "Central Phoenix", driveTime: "~35-60 min", cost: "$28 adult", energy: "Low", description: "Straight art museum option with easy discussion fuel.", voteable: true, featured: false },
  { activityId: "museum-heard", title: "Heard Museum", category: "Museums", subtype: "Museum", location: "Central Phoenix", driveTime: "~35-60 min", cost: "$26 adult", energy: "Low", description: "High-value cultural museum stop.", voteable: true, featured: false },
  { activityId: "museum-natural-history", title: "AZ Museum of Natural History", category: "Museums", subtype: "Museum", location: "Downtown Mesa", driveTime: "~15-35 min", cost: "$16 adult", energy: "Low-Medium", description: "Close and easy if the group wants minimal travel.", voteable: true, featured: false },
  { activityId: "museum-mesa-contemporary", title: "Mesa Contemporary Arts Museum", category: "Museums", subtype: "Museum", location: "Mesa Arts Center", driveTime: "~15-35 min", cost: "Free", energy: "Low", description: "Fast and flexible arts stop.", voteable: true, featured: false },
  { activityId: "museum-mesa-arts", title: "Mesa Arts Center shows", category: "Museums", subtype: "Venue", location: "Downtown Mesa", driveTime: "~15-35 min", cost: "Varies", energy: "Low-Medium", description: "Event-dependent option if timing works.", voteable: true, featured: false },

  { activityId: "nature-salt-river", title: "Salt River wild horses", category: "Nature", subtype: "Scenic outing", location: "Coon Bluff / Phon D. Sutton", driveTime: "~25-55 min", cost: "$0-$8", energy: "Low-Medium", description: "Scenic desert river option with horse-spotting upside.", voteable: true, featured: false },
  { activityId: "nature-saguaro-lake", title: "Saguaro Lake beach day", category: "Nature", subtype: "Scenic outing", location: "Butcher Jones Day Use Area", driveTime: "~45-70 min", cost: "$8 day pass", energy: "Medium", description: "Easy beach-day energy if weather cooperates.", voteable: true, featured: false },
  { activityId: "nature-tempe-town-lake", title: "Tempe Town Lake walk and rentals", category: "Nature", subtype: "Scenic outing", location: "Tempe", driveTime: "~20-45 min", cost: "$0-$45+", energy: "Low-Medium", description: "Walk, pedal boats, kayaks, or SUP rentals.", voteable: true, featured: false },
  { activityId: "nature-riparian", title: "Riparian Preserve + stargazing", category: "Nature", subtype: "Scenic outing", location: "Gilbert", driveTime: "~20-40 min", cost: "Often free", energy: "Low", description: "Good slower option, especially later in the day.", voteable: true, featured: false },
  { activityId: "nature-botanical", title: "Desert Botanical Garden", category: "Nature", subtype: "Scenic outing", location: "Papago Park", driveTime: "~35-60 min", cost: "$33-$40", energy: "Low-Medium", description: "Reliable Arizona scenery with high hit rate for visitors.", voteable: true, featured: false },
  { activityId: "nature-japanese-garden", title: "Japanese Friendship Garden", category: "Nature", subtype: "Scenic outing", location: "Downtown Phoenix", driveTime: "~35-60 min", cost: "$14 adult", energy: "Low", description: "Calmer, lower-duration option.", voteable: true, featured: false },
  { activityId: "nature-revel-surf", title: "Revel Surf", category: "Nature", subtype: "Scenic outing", location: "Mesa", driveTime: "~10-35 min", cost: "Varies", energy: "Medium", description: "Surf park option close to base camp.", voteable: true, featured: false },
  { activityId: "nature-downtown-strolls", title: "Downtown strolls", category: "Nature", subtype: "Scenic outing", location: "Mesa / Scottsdale / Chandler", driveTime: "Varies", cost: "$0+", energy: "Low", description: "Flexible low-stakes wandering with food and shops.", voteable: true, featured: false },

  { activityId: "hike-pass-mountain", title: "Pass Mountain Loop", category: "Hiking", subtype: "Trail", location: "Near East Mesa", driveTime: "2.7 mi", cost: "Free", energy: "Medium", description: "7.5 miles, 1,200 ft gain, moderate loop.", voteable: true, featured: false },
  { activityId: "hike-wind-cave", title: "Wind Cave Trail", category: "Hiking", subtype: "Trail", location: "Near East Mesa", driveTime: "2.7 mi", cost: "Free", energy: "Medium", description: "3.2 miles, 1,043 ft gain, moderate out-and-back.", voteable: true, featured: false },
  { activityId: "hike-hole-rock", title: "Hole-in-the-Rock", category: "Hiking", subtype: "Trail", location: "Papago Park", driveTime: "16.8 mi", cost: "Free", energy: "Low", description: "0.3 miles, easy, quick iconic Phoenix stop.", voteable: true, featured: false },
  { activityId: "hike-papago", title: "Papago Park Nature Trail", category: "Hiking", subtype: "Trail", location: "Papago Park", driveTime: "17 mi", cost: "Free", energy: "Low", description: "0.5 miles, easy loop.", voteable: true, featured: false },
  { activityId: "hike-gateway", title: "Gateway Loop Trail", category: "Hiking", subtype: "Trail", location: "Scottsdale", driveTime: "17.3 mi", cost: "Free", energy: "Medium", description: "4.4 miles, 718 ft gain, moderate loop.", voteable: true, featured: false },
  { activityId: "hike-camelback-cholla", title: "Camelback (Cholla)", category: "Hiking", subtype: "Trail", location: "Phoenix", driveTime: "17.3 mi", cost: "Free", energy: "High", description: "3 miles, 984 ft gain, hard out-and-back.", voteable: true, featured: false },
  { activityId: "hike-toms-thumb", title: "Tom's Thumb", category: "Hiking", subtype: "Trail", location: "Scottsdale", driveTime: "17.6 mi", cost: "Free", energy: "High", description: "4 miles, 1,214 ft gain, hard out-and-back.", voteable: true, featured: false },
  { activityId: "hike-fremont", title: "Fremont Saddle", category: "Hiking", subtype: "Trail", location: "Peralta", driveTime: "18.3 mi", cost: "Free", energy: "Medium-High", description: "4.6 miles, 1,338 ft gain, moderate out-and-back.", voteable: true, featured: false },
  { activityId: "hike-camelback-echo", title: "Camelback (Echo Canyon)", category: "Hiking", subtype: "Trail", location: "Phoenix", driveTime: "18.9 mi", cost: "Free", energy: "High", description: "2.1 miles, 1,281 ft gain, extreme out-and-back.", voteable: true, featured: false },
  { activityId: "hike-pinnacle", title: "Pinnacle Peak Trail", category: "Hiking", subtype: "Trail", location: "Scottsdale", driveTime: "21.7 mi", cost: "Free", energy: "Medium", description: "4.1 miles, 1,020 ft gain, moderate out-and-back.", voteable: true, featured: false },
  { activityId: "hike-piestewa", title: "Piestewa Peak #300", category: "Hiking", subtype: "Trail", location: "Phoenix", driveTime: "21.9 mi", cost: "Free", energy: "High", description: "2.4 miles, 1,208 ft gain, extreme.", voteable: true, featured: false },
  { activityId: "hike-holbert", title: "Holbert Trail to Dobbins", category: "Hiking", subtype: "Trail", location: "Phoenix", driveTime: "25.4 mi", cost: "Free", energy: "Medium", description: "4.6 miles, 1,000 ft gain, moderate.", voteable: true, featured: false },
  { activityId: "hike-flatiron", title: "Flatiron via Siphon Draw", category: "Hiking", subtype: "Trail", location: "East Valley", driveTime: "10 mi", cost: "Free", energy: "High", description: "6.6 miles, 3,000 ft gain, hard scramble.", voteable: true, featured: false },
  { activityId: "hike-lost-dog", title: "Lost Dog Trail", category: "Hiking", subtype: "Trail", location: "Scottsdale", driveTime: "13 mi", cost: "Free", energy: "Medium", description: "4.2 miles, 413 ft gain, moderate out-and-back.", voteable: true, featured: false },
  { activityId: "hike-hieroglyphic", title: "Hieroglyphic Trail", category: "Hiking", subtype: "Trail", location: "East Valley", driveTime: "14.3 mi", cost: "Free", energy: "Medium", description: "3 miles, moderate, good seasonal water payoff.", voteable: true, featured: false },
  { activityId: "hike-browns-ranch", title: "Brown's Ranch Loop", category: "Hiking", subtype: "Trail", location: "Scottsdale", driveTime: "23.1 mi", cost: "Free", energy: "Low-Medium", description: "~6 miles, 400 ft gain, easy-moderate loop.", voteable: true, featured: false },
  { activityId: "hike-wave-cave", title: "Wave Cave Trail", category: "Hiking", subtype: "Trail", location: "East Valley", driveTime: "~30 mi", cost: "Free", energy: "Medium-High", description: "3.2 miles, 872 ft gain, moderate-hard.", voteable: true, featured: false },
  { activityId: "hike-hidden-valley", title: "Hidden Valley / Fat Man's Pass", category: "Hiking", subtype: "Trail", location: "South Mountain", driveTime: "22.8 mi", cost: "Free", energy: "Medium", description: "4 miles, 1,017 ft gain, moderate loop.", voteable: true, featured: false },

  { activityId: "trip-tortilla-flat", title: "Tortilla Flat + Canyon Lake", category: "Day Trips", subtype: "Day trip", location: "Apache Trail", driveTime: "~50-60 min", cost: "$0-$60", energy: "Medium", description: "Five-star scenic drive and desert lake option.", voteable: true, featured: false },
  { activityId: "trip-boyce", title: "Boyce Thompson Arboretum", category: "Day Trips", subtype: "Day trip", location: "Superior", driveTime: "~50-60 min", cost: "$50-$120", energy: "Low-Medium", description: "One of the best out-of-town options in the guide.", voteable: true, featured: false },
  { activityId: "trip-payson", title: "Payson / Rim Country", category: "Day Trips", subtype: "Day trip", location: "Rim Country", driveTime: "~1 hr 20 min", cost: "$0-$80", energy: "Medium", description: "Cooler pine-country reset.", voteable: true, featured: false },
  { activityId: "trip-tonto-bridge", title: "Tonto Natural Bridge", category: "Day Trips", subtype: "Day trip", location: "State park", driveTime: "~1 hr 30-45 min", cost: "$20-$100", energy: "Medium", description: "Big natural feature with steep trails.", voteable: true, featured: false },
  { activityId: "trip-montezuma", title: "Montezuma Castle + Well", category: "Day Trips", subtype: "Day trip", location: "Camp Verde area", driveTime: "~1 hr 40-2 hr", cost: "$20-$110", energy: "Low-Medium", description: "Cliff dwelling and museum paths.", voteable: true, featured: false },
  { activityId: "trip-prescott", title: "Prescott / Watson Lake", category: "Day Trips", subtype: "Day trip", location: "Prescott", driveTime: "~2 hr", cost: "$0-$90", energy: "Medium", description: "Lakes, boulders, and Whiskey Row.", voteable: true, featured: false },
  { activityId: "trip-jerome", title: "Jerome", category: "Day Trips", subtype: "Day trip", location: "Jerome", driveTime: "~2 hr 15 min", cost: "$0-$135", energy: "Low-Medium", description: "Wild hillside mining town.", voteable: true, featured: false },
  { activityId: "trip-sedona", title: "Sedona Red Rocks", category: "Day Trips", subtype: "Day trip", location: "Sedona", driveTime: "~2 hr 10-30 min", cost: "$0-$135", energy: "Medium", description: "Iconic views and short hikes.", voteable: true, featured: false },
  { activityId: "trip-tucson", title: "Tucson: Saguaro National Park", category: "Day Trips", subtype: "Day trip", location: "Tucson", driveTime: "~2 hr 10-40 min", cost: "$25-$145", energy: "Medium", description: "Strong first-time Arizona desert day.", voteable: true, featured: false },
  { activityId: "trip-kartchner", title: "Kartchner Caverns", category: "Day Trips", subtype: "Day trip", location: "State park", driveTime: "~2 hr 40 min", cost: "$20-$150", energy: "Low-Medium", description: "Cave tour plus visitor center.", voteable: true, featured: false },
  { activityId: "trip-flagstaff", title: "Flagstaff", category: "Day Trips", subtype: "Day trip", location: "Flagstaff", driveTime: "~2 hr 25-45 min", cost: "$0-$130", energy: "Medium", description: "Mountain town reset with cooler weather.", voteable: true, featured: false },
  { activityId: "trip-petrified", title: "Petrified Forest", category: "Day Trips", subtype: "Day trip", location: "National park", driveTime: "~3 hr 50-4 hr 15 min", cost: "$25-$185", energy: "Medium", description: "Long drive but memorable desert geology.", voteable: true, featured: false },
  { activityId: "trip-tombstone", title: "Tombstone", category: "Day Trips", subtype: "Day trip", location: "Tombstone", driveTime: "~2 hr 50-3 hr 15 min", cost: "$0-$155", energy: "Low-Medium", description: "Tourist old-west town energy.", voteable: true, featured: false },
  { activityId: "trip-bisbee", title: "Bisbee", category: "Day Trips", subtype: "Day trip", location: "Bisbee", driveTime: "~3 hr 15-45 min", cost: "$0-$145", energy: "Low-Medium", description: "Quirky mining town, best paired with Tombstone.", voteable: true, featured: false },
  { activityId: "trip-grand-canyon", title: "Grand Canyon South Rim", category: "Day Trips", subtype: "Day trip", location: "Grand Canyon", driveTime: "~3 hr 50-4 hr 30 min", cost: "$35-$210", energy: "Medium", description: "The obvious epic option, but also the longest day.", voteable: true, featured: false },

  { activityId: "game-custom-ttrpg", title: "Custom narrative tower system", category: "Games", subtype: "Tabletop RPGs", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium-High", description: "Daggerheart plus Jenga tower plus Scrabble-style spellcraft hybrid.", voteable: true, featured: false },
  { activityId: "game-dnd", title: "Dungeons & Dragons", category: "Games", subtype: "Tabletop RPGs", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "High", description: "Classic structured TTRPG fallback.", voteable: true, featured: false },
  { activityId: "game-ps4", title: "PlayStation 4", category: "Games", subtype: "Video Games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low-Medium", description: "Console gaming with multiplayer options.", voteable: true, featured: false },
  { activityId: "game-wii", title: "Wii", category: "Games", subtype: "Video Games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium-High", description: "Motion-based party-friendly console games.", voteable: true, featured: false },
  { activityId: "game-streaming", title: "Netflix or digital party games", category: "Games", subtype: "Video Games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low", description: "Low-lift wind-down option.", voteable: true, featured: false },
  { activityId: "game-pool", title: "Swimming pool", category: "Games", subtype: "Outdoor", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium-High", description: "Pool time if March weather cooperates.", voteable: true, featured: false },
  { activityId: "game-croquet", title: "Croquet set", category: "Games", subtype: "Outdoor", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low-Medium", description: "Classic backyard pacing.", voteable: true, featured: false },
  { activityId: "game-badminton", title: "Badminton set", category: "Games", subtype: "Outdoor", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Easy pairs activity.", voteable: true, featured: false },
  { activityId: "game-tennis", title: "Tennis equipment", category: "Games", subtype: "Outdoor", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium-High", description: "Casual tennis or hit-around.", voteable: true, featured: false },
  { activityId: "game-soccer", title: "Soccer balls and sports balls", category: "Games", subtype: "Outdoor", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium-High", description: "Open-format outdoor play.", voteable: true, featured: false },
  { activityId: "game-bikes", title: "Bikes", category: "Games", subtype: "Outdoor", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Casual neighborhood riding.", voteable: true, featured: false },
  { activityId: "game-catan", title: "Settlers of Catan (+ expansions)", category: "Games", subtype: "Strategy board games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Reliable strategy board game staple.", voteable: true, featured: false },
  { activityId: "game-risk", title: "Risk / Risk LoTR / Risk Battlefield", category: "Games", subtype: "Strategy board games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Longer-form conquest options.", voteable: true, featured: false },
  { activityId: "game-ticket", title: "Ticket to Ride", category: "Games", subtype: "Strategy board games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Friendly route-building strategy.", voteable: true, featured: false },
  { activityId: "game-trekking", title: "Trekking National Parks / World", category: "Games", subtype: "Strategy board games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low-Medium", description: "Travel-themed point collection.", voteable: true, featured: false },
  { activityId: "game-pandemic", title: "Pandemic", category: "Games", subtype: "Strategy board games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Co-op crisis-solving.", voteable: true, featured: false },
  { activityId: "game-forbidden-island", title: "Forbidden Island", category: "Games", subtype: "Strategy board games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Co-op treasure recovery adventure.", voteable: true, featured: false },
  { activityId: "game-stargate", title: "Stargate SG-1 Board Game", category: "Games", subtype: "Strategy board games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Territory and mission strategy.", voteable: true, featured: false },
  { activityId: "game-blockus", title: "Blockus", category: "Games", subtype: "Strategy board games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Spatial tile placement strategy.", voteable: true, featured: false },
  { activityId: "game-command-nature", title: "Command of Nature", category: "Games", subtype: "Card games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Creature-based card battles.", voteable: true, featured: false },
  { activityId: "game-mtg", title: "Magic: The Gathering (Fallout deck)", category: "Games", subtype: "Card games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "One deck available.", voteable: true, featured: false },
  { activityId: "game-uno", title: "UNO (multiple versions)", category: "Games", subtype: "Card games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Standard, team, and revenge variants.", voteable: true, featured: false },
  { activityId: "game-good", title: "We're So Good", category: "Games", subtype: "Card games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Humorous social card game.", voteable: true, featured: false },
  { activityId: "game-dots", title: "Dots puzzle card game", category: "Games", subtype: "Card games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low", description: "Quiet dot-alignment puzzle game.", voteable: true, featured: false },
  { activityId: "game-poker", title: "Texas Hold'em poker set", category: "Games", subtype: "Card games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Classic poker setup with chips.", voteable: true, featured: false },
  { activityId: "game-burrito", title: "Throw Throw Burrito", category: "Games", subtype: "Party games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "High", description: "High-chaos foam dodgeball card hybrid.", voteable: true, featured: false },
  { activityId: "game-beat-that", title: "Beat That!", category: "Games", subtype: "Party games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "High", description: "Stacking, flipping, and balancing challenges.", voteable: true, featured: false },
  { activityId: "game-herd", title: "Herd Mentality", category: "Games", subtype: "Party games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Match the group's answer to score.", voteable: true, featured: false },
  { activityId: "game-loaded-questions", title: "Loaded Questions", category: "Games", subtype: "Party games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Revealing question-driven party game.", voteable: true, featured: false },
  { activityId: "game-would-you-rather", title: "Would You Rather?", category: "Games", subtype: "Party games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low-Medium", description: "Low-friction social game.", voteable: true, featured: false },
  { activityId: "game-things", title: "Game of Things", category: "Games", subtype: "Party games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Anonymous answer guessing game.", voteable: true, featured: false },
  { activityId: "game-gestures", title: "Gestures (charades)", category: "Games", subtype: "Party games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "High", description: "Timed charades competition.", voteable: true, featured: false },
  { activityId: "game-headbands", title: "Headbands for Adults", category: "Games", subtype: "Party games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Guess the word on your head.", voteable: true, featured: false },
  { activityId: "game-campfire", title: "Campfire Stories Deck", category: "Games", subtype: "Party games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low-Medium", description: "Storytelling prompt cards.", voteable: true, featured: false },
  { activityId: "game-pictionary", title: "Pictionary / Quickdraw", category: "Games", subtype: "Drawing games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "High", description: "Drawing and guessing with faster variant support.", voteable: true, featured: false },
  { activityId: "game-pie-face", title: "Pie Face", category: "Games", subtype: "Drawing games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Whipped-cream surprise game.", voteable: true, featured: false },
  { activityId: "game-dinosaurs", title: "Happy Little Dinosaurs", category: "Games", subtype: "Drawing games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Light strategy survival card game.", voteable: true, featured: false },
  { activityId: "game-candy-land", title: "Candy Land", category: "Games", subtype: "Drawing games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low", description: "Classic children's board game.", voteable: true, featured: false },
  { activityId: "game-greedy-granny", title: "Greedy Granny", category: "Games", subtype: "Drawing games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low-Medium", description: "Sneak treats without waking granny.", voteable: true, featured: false },
  { activityId: "game-guess-10", title: "Guess in 10", category: "Games", subtype: "Drawing games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low-Medium", description: "Ask up to ten questions to guess right.", voteable: true, featured: false },
  { activityId: "game-freeze-frame", title: "Freeze Frame", category: "Games", subtype: "Drawing games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Freeze-in-place party game.", voteable: true, featured: false },
  { activityId: "game-paper-sumo", title: "Paper Sumo", category: "Games", subtype: "Drawing games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Paper-based tabletop pushing duel.", voteable: true, featured: false },
  { activityId: "game-trivial-pursuit", title: "Trivial Pursuit: Family Edition", category: "Games", subtype: "Trivia and word games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low-Medium", description: "General knowledge trivia.", voteable: true, featured: false },
  { activityId: "game-harry-potter", title: "Harry Potter Trivia", category: "Games", subtype: "Trivia and word games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low-Medium", description: "HP universe trivia game.", voteable: true, featured: false },
  { activityId: "game-hues", title: "Hues and Cues", category: "Games", subtype: "Trivia and word games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Guess colors from word clues.", voteable: true, featured: false },
  { activityId: "game-scrabble", title: "Scrabble (multiple versions)", category: "Games", subtype: "Trivia and word games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low", description: "Classic word-building board game.", voteable: true, featured: false },
  { activityId: "game-bananagrams", title: "Bananagrams", category: "Games", subtype: "Trivia and word games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Fast-paced word tile game.", voteable: true, featured: false },
  { activityId: "game-pairs-pears", title: "Pairs to Pears", category: "Games", subtype: "Trivia and word games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Word comparison and association game.", voteable: true, featured: false },
  { activityId: "game-music-maestro", title: "Music Maestro", category: "Games", subtype: "Trivia and word games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low-Medium", description: "Music-themed trivia.", voteable: true, featured: false },
  { activityId: "game-geography", title: "Name the State / Name That Country", category: "Games", subtype: "Trivia and word games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low", description: "Geography trivia options.", voteable: true, featured: false },
  { activityId: "game-chess", title: "Chess (standard and no stress)", category: "Games", subtype: "Classic and dexterity", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low", description: "Classic strategy with a beginner-friendly version.", voteable: true, featured: false },
  { activityId: "game-checkers", title: "Checkers and multi-game set", category: "Games", subtype: "Classic and dexterity", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low", description: "Traditional board game collection.", voteable: true, featured: false },
  { activityId: "game-dominoes", title: "Dominoes", category: "Games", subtype: "Classic and dexterity", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low", description: "Traditional tile-based number game.", voteable: true, featured: false },
  { activityId: "game-parcheesi", title: "Parcheesi", category: "Games", subtype: "Classic and dexterity", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low-Medium", description: "Classic roll-and-race game.", voteable: true, featured: false },
  { activityId: "game-battleship", title: "Battleship", category: "Games", subtype: "Classic and dexterity", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low", description: "Hidden-ship guessing game.", voteable: true, featured: false },
  { activityId: "game-clue", title: "Clue", category: "Games", subtype: "Classic and dexterity", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Mystery deduction board game.", voteable: true, featured: false },
  { activityId: "game-monopoly", title: "Monopoly (multiple versions)", category: "Games", subtype: "Classic and dexterity", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Property trading and negotiation.", voteable: true, featured: false }
];

export const featuredActivities = baseFeaturedActivities.map(normalizeActivityForFilters);
export const activities = baseActivities.map(normalizeActivityForFilters);
