export const grocerySections = [
  {
    id: "hosting-basics",
    title: "Hosting Basics",
    source: "Safeway, Trader Joe's, Costco",
    subtitle: "Guest breakfasts, lunches, snacks, and fire night"
  },
  {
    id: "birthday-party",
    title: "Birthday Party",
    source: "Mexican market, Costco, Safeway",
    subtitle: "Carne asada tacos and frijoles charros for seven people"
  },
  {
    id: "ice-cream-bar",
    title: "Homemade Ice Cream Bar",
    source: "Safeway, Trader Joe's, Any",
    subtitle: "Vanilla, chocolate, and cookie butter"
  },
  {
    id: "party-extras",
    title: "Party Extras and Placeholders",
    source: "Flexible",
    subtitle: "Dessert, wine, and backup snacks"
  }
];

export const groceries = [
  { itemId: "eggs", section: "hosting-basics", label: "Eggs - cage-free (2 dozen)", defaultSource: "Costco", budgetNote: "" },
  { itemId: "sandwich-bread", section: "hosting-basics", label: "Sandwich bread (2 loaves)", defaultSource: "Safeway", budgetNote: "" },
  { itemId: "bagels", section: "hosting-basics", label: "Bagels or English muffins", defaultSource: "Safeway", budgetNote: "" },
  { itemId: "cream-cheese", section: "hosting-basics", label: "Cream cheese", defaultSource: "Safeway", budgetNote: "" },
  { itemId: "fruit", section: "hosting-basics", label: "Bananas or easy fruit", defaultSource: "Safeway", budgetNote: "" },
  { itemId: "deli-turkey", section: "hosting-basics", label: "Deli turkey (2 packs)", defaultSource: "Safeway", budgetNote: "" },
  { itemId: "sliced-cheese", section: "hosting-basics", label: "Sliced cheese (2 packs)", defaultSource: "Safeway", budgetNote: "" },
  { itemId: "mayo-mustard", section: "hosting-basics", label: "Mayo and mustard", defaultSource: "Safeway", budgetNote: "" },
  { itemId: "lettuce", section: "hosting-basics", label: "Lettuce or romaine", defaultSource: "Safeway", budgetNote: "" },
  { itemId: "pasta", section: "hosting-basics", label: "Pasta (2 boxes)", defaultSource: "Trader Joe's", budgetNote: "" },
  { itemId: "marinara", section: "hosting-basics", label: "Marinara sauce (2 jars)", defaultSource: "Trader Joe's", budgetNote: "" },
  { itemId: "frozen-backup", section: "hosting-basics", label: "Frozen emergency item (2)", defaultSource: "Costco", budgetNote: "" },
  { itemId: "marshmallows", section: "hosting-basics", label: "Marshmallows", defaultSource: "Safeway", budgetNote: "" },
  { itemId: "graham-crackers", section: "hosting-basics", label: "Graham crackers", defaultSource: "Safeway", budgetNote: "" },
  { itemId: "chocolate-bars", section: "hosting-basics", label: "Chocolate bars (6)", defaultSource: "Safeway", budgetNote: "" },
  { itemId: "sparkling-water", section: "hosting-basics", label: "Sparkling water (case)", defaultSource: "Costco", budgetNote: "" },
  { itemId: "coke", section: "hosting-basics", label: "Coke 12-pack (optional)", defaultSource: "Costco", budgetNote: "Optional" },
  { itemId: "carne-asada", section: "birthday-party", label: "Carne asada (~4.5 lb)", defaultSource: "Mexican market", budgetNote: "$40-$58" },
  { itemId: "corn-tortillas", section: "birthday-party", label: "Corn tortillas (3 packs)", defaultSource: "Mexican market", budgetNote: "" },
  { itemId: "cilantro", section: "birthday-party", label: "Cilantro (4 bunches)", defaultSource: "Safeway", budgetNote: "" },
  { itemId: "white-onions", section: "birthday-party", label: "White onions (3)", defaultSource: "Safeway", budgetNote: "" },
  { itemId: "limes", section: "birthday-party", label: "Limes (12)", defaultSource: "Safeway", budgetNote: "" },
  { itemId: "avocados", section: "birthday-party", label: "Avocados (6)", defaultSource: "Costco", budgetNote: "$5-$12" },
  { itemId: "salsa", section: "birthday-party", label: "Salsa (2 tubs or jars)", defaultSource: "Trader Joe's", budgetNote: "" },
  { itemId: "chips", section: "birthday-party", label: "Tortilla chips (2 bags)", defaultSource: "Costco", budgetNote: "" },
  { itemId: "sour-cream", section: "birthday-party", label: "Sour cream", defaultSource: "Safeway", budgetNote: "" },
  { itemId: "hot-sauce", section: "birthday-party", label: "Hot sauce (Cholula or Valentina)", defaultSource: "Safeway", budgetNote: "" },
  { itemId: "ham-hot-dogs", section: "birthday-party", label: "Ham and hot dogs", defaultSource: "Safeway", budgetNote: "Mentioned elsewhere on the list" },
  { itemId: "cotija", section: "birthday-party", label: "Cotija or shredded cheese", defaultSource: "Safeway", budgetNote: "" },
  { itemId: "jalapenos", section: "birthday-party", label: "Jalapenos (fresh or pickled)", defaultSource: "Safeway", budgetNote: "" },
  { itemId: "roma-tomatoes", section: "birthday-party", label: "Roma tomatoes and 3 lbs of tomatoes (4)", defaultSource: "Safeway", budgetNote: "" },
  { itemId: "pinto-beans", section: "birthday-party", label: "Pinto beans (dried, 1.5 lb)", defaultSource: "Safeway", budgetNote: "$3-$6" },
  { itemId: "mexican-chorizo", section: "birthday-party", label: "Mexican chorizo (1 pkg)", defaultSource: "Mexican market", budgetNote: "" },
  { itemId: "bacon", section: "birthday-party", label: "Bacon (1/2 lb, smoked)", defaultSource: "Safeway", budgetNote: "$3-$6" },
  { itemId: "serranos", section: "birthday-party", label: "Serrano peppers (4)", defaultSource: "Safeway", budgetNote: "" },
  { itemId: "chicken-broth", section: "birthday-party", label: "Chicken broth (1 carton)", defaultSource: "Safeway", budgetNote: "" },
  { itemId: "charcoal", section: "birthday-party", label: "Charcoal or grill supplies", defaultSource: "Costco", budgetNote: "" },
  { itemId: "rainbow-quiche", section: "birthday-party", label: "Rainbow quiche", defaultSource: "Anne's contribution", budgetNote: "Pre-assigned contribution", lockedClaimBy: "anne-sly" },
  { itemId: "whole-milk", section: "ice-cream-bar", label: "Whole milk (1/2 gal)", defaultSource: "Safeway", budgetNote: "" },
  { itemId: "heavy-cream", section: "ice-cream-bar", label: "Heavy whipping cream", defaultSource: "Safeway", budgetNote: "" },
  { itemId: "sugar", section: "ice-cream-bar", label: "Granulated sugar (2 lb)", defaultSource: "Any", budgetNote: "" },
  { itemId: "vanilla", section: "ice-cream-bar", label: "Pure vanilla extract", defaultSource: "Any", budgetNote: "" },
  { itemId: "cocoa", section: "ice-cream-bar", label: "Cocoa powder", defaultSource: "Any", budgetNote: "" },
  { itemId: "cookie-butter", section: "ice-cream-bar", label: "Cookie butter or Biscoff", defaultSource: "Trader Joe's", budgetNote: "" },
  { itemId: "toppings", section: "ice-cream-bar", label: "Toppings bundle (4 items)", defaultSource: "Any", budgetNote: "$12-$24" },
  { itemId: "cones", section: "ice-cream-bar", label: "Ice cream cones or cups", defaultSource: "Safeway", budgetNote: "" },
  { itemId: "misc-snacks", section: "party-extras", label: "Misc snacks (chips, cookies, extras)", defaultSource: "Any", budgetNote: "$20-$35" },
  { itemId: "dessert", section: "party-extras", label: "Dessert - Costco cake or Craves cookies", defaultSource: "Costco or Craves", budgetNote: "$25-$55" },
  { itemId: "party-wine", section: "party-extras", label: "Party wine (2-3 bottles)", defaultSource: "Trader Joe's", budgetNote: "$20-$45" }
];
