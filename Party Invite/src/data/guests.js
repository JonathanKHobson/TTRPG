export const guests = [
  {
    id: "kyle",
    displayName: "Kyle Hobson",
    aliases: ["KyleH"],
    hiddenFromInvite: true,
    travelType: "host",
    pickup: null,
    flight: null,
    arrivalOptions: [
      "Host mode: all roads lead to your kitchen."
    ],
    foodRole: "Host and ice cream architect",
    notes: "Host and game master."
  },
  {
    id: "mitch",
    displayName: "Mitch",
    aliases: ["Crag", "Infinitely0"],
    travelType: "flight",
    pickup: {
      driver: "Kyle",
      time: "9:30 AM",
      date: "March 21, 2026",
      location: "Mesa Gateway Airport (AZA)"
    },
    flight: {
      inbound: {
        airline: "Allegiant Air",
        flightNumber: "G4 1715",
        departureAirport: "LAS",
        departureLabel: "Harry Reid International Airport, Las Vegas",
        departureTime: "8:00 AM",
        arrivalAirport: "AZA",
        arrivalLabel: "Mesa Gateway Airport",
        arrivalTime: "9:21 AM",
        date: "March 21, 2026"
      },
      outbound: {
        airline: "Frontier Airlines",
        flightNumber: "F9 1019",
        departureAirport: "PHX",
        departureLabel: "Phoenix Sky Harbor",
        departureTime: "2:28 PM",
        arrivalAirport: "LAS",
        arrivalLabel: "Harry Reid International Airport, Las Vegas",
        date: "March 23, 2026"
      }
    },
    arrivalOptions: [],
    foodRole: null,
    notes: "First pickup of the day."
  },
  {
    id: "brian",
    displayName: "Brian",
    aliases: ["Kosros", "idislikebannanas"],
    travelType: "flight",
    pickup: {
      driver: "Kyle",
      time: "2:55 PM",
      date: "March 19, 2026",
      location: "Phoenix Sky Harbor (PHX)"
    },
    flight: {
      inbound: {
        airline: "Southwest",
        flightNumber: "3163 -> 3162",
        flightNumberIata: "WN3163",
        departureAirport: "MCO",
        departureLabel: "Orlando International Airport",
        departureTime: "11:20 AM",
        arrivalAirport: "PHX",
        arrivalLabel: "Phoenix Sky Harbor",
        arrivalTime: "2:55 PM",
        date: "March 19, 2026",
        layover: "Austin-Bergstrom International Airport (AUS)"
      },
      outbound: {
        airline: "Southwest",
        flightNumber: "2697 -> 2226",
        flightNumberIata: "WN2697",
        departureAirport: "PHX",
        departureLabel: "Phoenix Sky Harbor",
        departureTime: "9:00 AM",
        arrivalAirport: "MCO",
        arrivalLabel: "Orlando International Airport",
        arrivalTime: "6:20 PM",
        date: "March 22, 2026",
        layover: "Dallas Love Field (DAL)"
      }
    },
    arrivalOptions: [
      "You are already at Kyle's house before event day."
    ],
    foodRole: null,
    notes: "Staying at Kyle's house starting March 19."
  },
  {
    id: "eleni",
    displayName: "Eleni",
    aliases: ["Lopchop", "Kiran", "Mycostar", "Bibble"],
    travelType: "onsite",
    pickup: null,
    flight: null,
    arrivalOptions: [
      "You are already at Kyle's house before event day."
    ],
    foodRole: null,
    notes: "Already at Kyle's house before the event."
  },
  {
    id: "june-alice",
    displayName: "June Alice",
    aliases: ["June Alice"],
    travelType: "pickup",
    pickup: {
      driver: "Kyle",
      time: "12:30 PM",
      date: "March 21, 2026",
      location: "Tempe Marketplace area"
    },
    flight: null,
    arrivalOptions: [
      "Meet Kyle near Tempe Marketplace around 12:30 PM."
    ],
    foodRole: "Carnitas tacos and frijoles charros",
    notes: "Second pickup of the day."
  },
  {
    id: "maddie",
    displayName: "Maddie",
    aliases: ["maddzasaur"],
    travelType: "driving",
    pickup: null,
    flight: null,
    arrivalOptions: [
      "Join the morning run near Tempe Marketplace around 12:30 PM.",
      "Come to the house early anytime after 1:00 PM.",
      "Arrive for the official 3:00 PM start."
    ],
    foodRole: null,
    notes: "Local guest with flexible arrival."
  },
  {
    id: "anne-sly",
    displayName: "Anne",
    aliases: ["Sly", "Anne"],
    travelType: "driving",
    pickup: null,
    flight: null,
    arrivalOptions: [
      "Drive in for the official 3:00 PM start."
    ],
    foodRole: "Rainbow quiche",
    notes: "Anne and Sly are the same person."
  }
];

export function getGuestById(guestId) {
  return guests.find((guest) => guest.id === guestId) ?? null;
}

export function getInviteGuests() {
  return guests.filter((guest) => !guest.hiddenFromInvite);
}
