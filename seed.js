const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');

dotenv.config();

// Sample data
const restaurants = [
  {
    name: 'Pizza Palace',
    description: 'Authentic Italian pizzas with fresh ingredients and traditional recipes',
    longDescription: 'At Pizza Palace, we believe that great pizza starts with quality ingredients. Our dough is made fresh daily using imported Italian flour, and our tomatoes are sourced directly from San Marzano. Every pizza is hand-crafted by our skilled pizzaiolos who have trained in Naples, ensuring an authentic Italian experience with every bite.',
    history: 'Pizza Palace was founded in 2010 by Chef Marco Romano, who brought his family\'s 100-year-old recipes from Naples, Italy. What started as a small family pizzeria has grown into one of the city\'s most beloved dining destinations. Our commitment to authenticity and quality has earned us numerous awards and a loyal following of pizza enthusiasts.',
    foundedYear: 2010,
    founderName: 'Chef Marco Romano',
    address: '123 Main Street, City Center, Bangalore 560001',
    location: {
      type: 'Point',
      coordinates: [77.5946, 12.9716]
    },
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    coverImage: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?w=1200',
    logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200',
    gallery: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
      'https://images.unsplash.com/photo-1579751626657-72bc17010498?w=800',
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800'
    ],
    rating: 4.5,
    numReviews: 1250,
    deliveryTime: '30-40 mins',
    minOrder: 299,
    deliveryFee: 40,
    cuisineType: ['Italian', 'Pizza', 'Pasta'],
    specialties: ['Wood-fired Pizza', 'Fresh Pasta', 'Tiramisu', 'Calzones', 'Garlic Bread'],
    features: ['Dine-in', 'Takeaway', 'Delivery', 'Outdoor Seating', 'Family Friendly'],
    phone: '+91 98765 43210',
    email: 'order@pizzapalace.com',
    website: 'www.pizzapalace.com',
    hours: '11:00 AM - 11:00 PM',
    socialMedia: {
      facebook: 'https://facebook.com/pizzapalace',
      instagram: 'https://instagram.com/pizzapalace',
      twitter: 'https://twitter.com/pizzapalace'
    },
    awards: [
      { title: 'Best Pizza in Town', year: 2023, organization: 'Food Critics Association' },
      { title: 'Excellence in Italian Cuisine', year: 2022, organization: 'Culinary Awards' }
    ],
    certifications: ['FSSAI Certified', 'ISO 22000', 'Halal Certified'],
    isActive: true,
    isFeatured: true
  },
  {
    name: 'Burger Hub',
    description: 'Juicy gourmet burgers and crispy fries made with premium ingredients',
    longDescription: 'Burger Hub is your ultimate destination for gourmet burgers crafted with passion. We source our beef from local farms, grind it fresh daily, and cook each patty to perfection. Our secret sauce recipe has been perfected over years, creating a flavor that keeps our customers coming back for more.',
    history: 'Founded in 2015 by food enthusiast David Smith after his travels across America inspired him to bring authentic American diner culture to India. Starting with just 5 burger varieties, we now offer over 20 unique creations. Our "Double Stack Challenge" has become legendary among burger lovers.',
    foundedYear: 2015,
    founderName: 'David Smith',
    address: '456 Park Avenue, Downtown, Bangalore 560002',
    location: {
      type: 'Point',
      coordinates: [77.6033, 12.9698]
    },
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    coverImage: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1200',
    logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200',
    gallery: [
      'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800',
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
      'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800',
      'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800',
      'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800'
    ],
    rating: 4.3,
    numReviews: 890,
    deliveryTime: '25-35 mins',
    minOrder: 199,
    deliveryFee: 30,
    cuisineType: ['American', 'Fast Food', 'Burgers'],
    specialties: ['Gourmet Burgers', 'Loaded Fries', 'Milkshakes', 'Onion Rings', 'Chicken Wings'],
    features: ['Dine-in', 'Takeaway', 'Delivery', 'Late Night Service'],
    phone: '+91 98765 43211',
    email: 'order@burgerhub.com',
    hours: '11:00 AM - 1:00 AM',
    isActive: true,
    isFeatured: true
  },
  {
    name: 'Pasta Paradise',
    description: 'Fresh homemade pasta dishes inspired by Italian grandmothers',
    longDescription: 'Every strand of pasta at Pasta Paradise is made with love, just like Italian nonnas have done for generations. We import semolina flour from Italy and prepare our pasta fresh every morning. Our sauces simmer for hours to develop deep, complex flavors that transport you straight to the heart of Italy.',
    history: 'Pasta Paradise began in 2012 when Chef Isabella returned from her culinary training in Bologna, Italy. Armed with authentic recipes passed down through four generations of her Italian mentors family, she set out to bring genuine Italian pasta to India. Today, we serve over 500 satisfied customers daily.',
    foundedYear: 2012,
    founderName: 'Chef Isabella Martinez',
    address: '789 Food Street, Little Italy, Bangalore 560003',
    location: {
      type: 'Point',
      coordinates: [77.5912, 12.9634]
    },
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
    coverImage: 'https://images.unsplash.com/photo-1481931098730-318b6f776db0?w=1200',
    logo: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=200',
    gallery: [
      'https://images.unsplash.com/photo-1481931098730-318b6f776db0?w=800',
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
      'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800',
      'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800',
      'https://images.unsplash.com/photo-1556761223-4c4282c73f77?w=800'
    ],
    rating: 4.7,
    numReviews: 1560,
    deliveryTime: '35-45 mins',
    minOrder: 349,
    deliveryFee: 50,
    cuisineType: ['Italian', 'Pasta', 'Mediterranean'],
    specialties: ['Fresh Pasta', 'Risotto', 'Lasagna', 'Ravioli', 'Gnocchi'],
    features: ['Dine-in', 'Romantic Ambiance', 'Wine Selection', 'Private Dining'],
    phone: '+91 98765 43212',
    email: 'reservations@pastaparadise.com',
    hours: '12:00 PM - 10:30 PM',
    isActive: true
  },
  {
    name: 'Dessert Dreams',
    description: 'Heavenly cakes, artisan pastries, and creamy ice creams',
    longDescription: 'Dessert Dreams is where sweet fantasies come true. Our pastry chefs create edible art using premium Belgian chocolate, fresh seasonal fruits, and house-made creams. Every dessert tells a story of craftsmanship and passion, from our signature layered cakes to our delicate French macarons.',
    history: 'What started as a small home bakery in 2014 by sisters Maya and Priya has blossomed into the citys favorite dessert destination. Their mothers recipes, combined with French patisserie training, created a unique fusion that has won hearts (and taste buds) across the city. Our chocolate lava cake alone sells over 200 pieces daily!',
    foundedYear: 2014,
    founderName: 'Maya & Priya Sisters',
    address: '321 Sweet Lane, Sugar Town, Bangalore 560004',
    location: {
      type: 'Point',
      coordinates: [77.5880, 12.9800]
    },
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
    coverImage: 'https://images.unsplash.com/photo-1517433670267-30f41c098e5c?w=1200',
    logo: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200',
    gallery: [
      'https://images.unsplash.com/photo-1517433670267-30f41c098e5c?w=800',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800',
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800',
      'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800',
      'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800',
      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800'
    ],
    rating: 4.8,
    numReviews: 2100,
    deliveryTime: '20-30 mins',
    minOrder: 249,
    deliveryFee: 35,
    cuisineType: ['Desserts', 'Bakery', 'Ice Cream', 'Cafe'],
    specialties: ['Chocolate Lava Cake', 'French Macarons', 'Artisan Gelato', 'Custom Cakes', 'Cheesecakes'],
    features: ['Dine-in', 'Custom Orders', 'Party Catering', 'Eggless Options'],
    phone: '+91 98765 43213',
    email: 'sweet@dessertdreams.com',
    hours: '10:00 AM - 11:00 PM',
    isActive: true,
    isFeatured: true
  },
  {
    name: 'Spice Garden',
    description: 'Authentic Indian cuisine with rich aromatic flavors from across the subcontinent',
    longDescription: 'Spice Garden celebrates the incredible diversity of Indian cuisine. Our chefs, each specializing in a different regional cuisine, work together to bring you the best of North Indian curries, South Indian dosas, Mughlai biryanis, and street food favorites. We grind our own spices fresh daily for maximum flavor.',
    history: 'Chef Rajesh Kumar founded Spice Garden in 2011 after spending 15 years traveling across India documenting traditional recipes. His mission was simple: preserve authentic Indian flavors in a modern setting. Today, Spice Garden hosts cooking classes, spice workshops, and has trained over 50 chefs who now run their own kitchens.',
    foundedYear: 2011,
    founderName: 'Chef Rajesh Kumar',
    address: '555 Curry Lane, Spice District, Bangalore 560005',
    location: {
      type: 'Point',
      coordinates: [77.5950, 12.9750]
    },
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
    logo: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=200',
    gallery: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
      'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800',
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800',
      'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800'
    ],
    rating: 4.6,
    numReviews: 1850,
    deliveryTime: '35-45 mins',
    minOrder: 299,
    deliveryFee: 45,
    cuisineType: ['Indian', 'North Indian', 'South Indian', 'Mughlai'],
    specialties: ['Butter Chicken', 'Hyderabadi Biryani', 'Tandoori Platter', 'Dal Makhani', 'Masala Dosa'],
    features: ['Dine-in', 'Live Kitchen', 'Thali Specials', 'Catering Services'],
    phone: '+91 98765 43214',
    email: 'order@spicegarden.com',
    hours: '11:00 AM - 11:00 PM',
    isActive: true
  },
  {
    name: 'Fresh Juice Bar',
    description: 'Fresh cold-pressed juices, smoothies, and healthy wellness drinks',
    longDescription: 'At Fresh Juice Bar, we believe in the power of nature. Every drink is made to order using 100% organic fruits and vegetables sourced from local farms. Our cold-press technology preserves maximum nutrients, ensuring you get the healthiest, freshest drinks possible. No added sugar, no preservatives, just pure goodness.',
    history: 'Fresh Juice Bar was born in 2018 from fitness enthusiast and nutritionist Ananya Sharmas passion for healthy living. After struggling to find genuinely healthy drinks in the city, she decided to create her own. Starting with a small cart outside a gym, the brand has grown to 5 locations, serving health-conscious customers their daily dose of vitamins.',
    foundedYear: 2018,
    founderName: 'Ananya Sharma',
    address: '888 Health Street, Green Zone, Bangalore 560006',
    location: {
      type: 'Point',
      coordinates: [77.5920, 12.9680]
    },
    image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400',
    coverImage: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=1200',
    logo: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=200',
    gallery: [
      'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800',
      'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800',
      'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800',
      'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800',
      'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=800'
    ],
    rating: 4.4,
    numReviews: 720,
    deliveryTime: '15-25 mins',
    minOrder: 149,
    deliveryFee: 25,
    cuisineType: ['Beverages', 'Healthy', 'Juices', 'Smoothies'],
    specialties: ['Cold-pressed Juices', 'Acai Bowls', 'Protein Smoothies', 'Detox Drinks', 'Immunity Boosters'],
    features: ['Quick Service', 'Organic Ingredients', 'Customizable Drinks', 'Subscription Plans'],
    phone: '+91 98765 43215',
    email: 'fresh@juicebar.com',
    hours: '7:00 AM - 9:00 PM',
    isActive: true
  }
];

const menuItemsData = [
  // ==================== PIZZAS ====================
  {
    name: 'Margherita Pizza',
    description: 'Classic tomato sauce, fresh mozzarella, and aromatic basil leaves on a crispy thin crust',
    price: 299,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    imageGallery: [
      { url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800', caption: 'Fresh from the oven' },
      { url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', caption: 'Perfectly baked crust' },
      { url: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800', caption: 'Melted mozzarella' }
    ],
    category: 'Pizza',
    available: true,
    rating: 4.5,
    numReviews: 45,
    isVeg: true,
    preparationTime: 20,
    ingredients: ['Tomato Sauce', 'Mozzarella', 'Fresh Basil', 'Olive Oil'],
    nutritionalInfo: { calories: 850, protein: 32, carbs: 98, fat: 35 }
  },
  {
    name: 'Pepperoni Pizza',
    description: 'Loaded with spicy pepperoni slices, extra mozzarella cheese, and our signature tomato sauce',
    price: 399,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
    imageGallery: [
      { url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800', caption: 'Loaded with pepperoni' },
      { url: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800', caption: 'Cheesy goodness' }
    ],
    category: 'Pizza',
    available: true,
    rating: 4.7,
    numReviews: 78,
    isVeg: false,
    isSpicy: true,
    spicyLevel: 2,
    preparationTime: 25,
    ingredients: ['Pepperoni', 'Mozzarella', 'Tomato Sauce', 'Oregano'],
    nutritionalInfo: { calories: 1100, protein: 45, carbs: 95, fat: 52 }
  },
  {
    name: 'BBQ Chicken Pizza',
    description: 'Smoky BBQ sauce, grilled chicken breast, caramelized onions, and fresh cilantro',
    price: 449,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    imageGallery: [
      { url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', caption: 'BBQ perfection' }
    ],
    category: 'Pizza',
    available: true,
    rating: 4.6,
    numReviews: 56,
    isVeg: false,
    preparationTime: 30,
    ingredients: ['BBQ Sauce', 'Grilled Chicken', 'Red Onion', 'Cilantro', 'Mozzarella'],
    nutritionalInfo: { calories: 980, protein: 48, carbs: 88, fat: 42 }
  },
  {
    name: 'Veggie Supreme Pizza',
    description: 'Garden fresh bell peppers, mushrooms, olives, onions, and tomatoes on a bed of cheese',
    price: 379,
    image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400',
    category: 'Pizza',
    available: true,
    rating: 4.4,
    numReviews: 42,
    isVeg: true,
    preparationTime: 25,
    ingredients: ['Bell Peppers', 'Mushrooms', 'Olives', 'Onions', 'Tomatoes', 'Mozzarella'],
    nutritionalInfo: { calories: 780, protein: 28, carbs: 92, fat: 30 }
  },
  {
    name: 'Four Cheese Pizza',
    description: 'A cheese lovers dream with mozzarella, cheddar, parmesan, and gorgonzola',
    price: 429,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    category: 'Pizza',
    available: true,
    rating: 4.8,
    numReviews: 65,
    isVeg: true,
    preparationTime: 22,
    ingredients: ['Mozzarella', 'Cheddar', 'Parmesan', 'Gorgonzola'],
    nutritionalInfo: { calories: 1050, protein: 42, carbs: 82, fat: 58 }
  },

  // ==================== BURGERS ====================
  {
    name: 'Classic Beef Burger',
    description: 'Juicy 200g beef patty with fresh lettuce, tomato, pickles, and our secret sauce',
    price: 249,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    imageGallery: [
      { url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', caption: 'Classic perfection' },
      { url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800', caption: 'Juicy patty' }
    ],
    category: 'Burger',
    available: true,
    rating: 4.5,
    numReviews: 89,
    isVeg: false,
    preparationTime: 15,
    ingredients: ['Beef Patty', 'Lettuce', 'Tomato', 'Pickles', 'Special Sauce', 'Sesame Bun'],
    nutritionalInfo: { calories: 650, protein: 35, carbs: 45, fat: 38 }
  },
  {
    name: 'Crispy Chicken Burger',
    description: 'Crispy fried chicken breast with coleslaw, pickles, and spicy mayo',
    price: 229,
    image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400',
    category: 'Burger',
    available: true,
    rating: 4.4,
    numReviews: 72,
    isVeg: false,
    isSpicy: true,
    spicyLevel: 2,
    preparationTime: 18,
    ingredients: ['Crispy Chicken', 'Coleslaw', 'Pickles', 'Spicy Mayo'],
    nutritionalInfo: { calories: 580, protein: 32, carbs: 48, fat: 28 }
  },
  {
    name: 'Veg Supreme Burger',
    description: 'Crispy veggie patty with lettuce, tomato, cheese, and tangy sauce',
    price: 179,
    image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400',
    category: 'Burger',
    available: true,
    rating: 4.3,
    numReviews: 54,
    isVeg: true,
    preparationTime: 12,
    ingredients: ['Veggie Patty', 'Lettuce', 'Tomato', 'Cheese', 'Tangy Sauce'],
    nutritionalInfo: { calories: 420, protein: 18, carbs: 52, fat: 18 }
  },
  {
    name: 'Double Cheese Burger',
    description: 'Two beef patties, double cheese, caramelized onions, and bacon',
    price: 349,
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400',
    category: 'Burger',
    available: true,
    rating: 4.7,
    numReviews: 95,
    isVeg: false,
    preparationTime: 20,
    ingredients: ['Double Beef Patty', 'Double Cheese', 'Caramelized Onions', 'Bacon'],
    nutritionalInfo: { calories: 980, protein: 55, carbs: 48, fat: 62 }
  },
  {
    name: 'Spicy Paneer Burger',
    description: 'Grilled paneer patty with spicy sauce, jalapeños, and melted cheese',
    price: 199,
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400',
    category: 'Burger',
    available: true,
    rating: 4.5,
    numReviews: 48,
    isVeg: true,
    isSpicy: true,
    spicyLevel: 3,
    preparationTime: 15,
    ingredients: ['Paneer Patty', 'Spicy Sauce', 'Jalapeños', 'Cheese'],
    nutritionalInfo: { calories: 480, protein: 22, carbs: 45, fat: 24 }
  },
  {
    name: 'Mushroom Swiss Burger',
    description: 'Beef patty topped with sautéed mushrooms and melted Swiss cheese',
    price: 299,
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400',
    category: 'Burger',
    available: true,
    rating: 4.6,
    numReviews: 38,
    isVeg: false,
    preparationTime: 18,
    ingredients: ['Beef Patty', 'Sautéed Mushrooms', 'Swiss Cheese', 'Garlic Aioli'],
    nutritionalInfo: { calories: 720, protein: 38, carbs: 42, fat: 45 }
  },

  // ==================== PASTA ====================
  {
    name: 'Spaghetti Carbonara',
    description: 'Creamy egg-based sauce with crispy pancetta, parmesan, and black pepper',
    price: 329,
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400',
    category: 'Pasta',
    available: true,
    rating: 4.8,
    numReviews: 92,
    isVeg: false,
    preparationTime: 25,
    ingredients: ['Spaghetti', 'Eggs', 'Pancetta', 'Parmesan', 'Black Pepper'],
    nutritionalInfo: { calories: 680, protein: 28, carbs: 72, fat: 32 }
  },
  {
    name: 'Penne Arrabbiata',
    description: 'Spicy tomato sauce with garlic, red chili flakes, and fresh parsley',
    price: 279,
    image: 'https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?w=400',
    category: 'Pasta',
    available: true,
    rating: 4.5,
    numReviews: 67,
    isVeg: true,
    isSpicy: true,
    spicyLevel: 3,
    preparationTime: 20,
    ingredients: ['Penne', 'Tomato Sauce', 'Garlic', 'Red Chili', 'Parsley'],
    nutritionalInfo: { calories: 520, protein: 16, carbs: 82, fat: 14 }
  },
  {
    name: 'Fettuccine Alfredo',
    description: 'Rich and creamy parmesan sauce with butter and fresh herbs',
    price: 349,
    image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400',
    category: 'Pasta',
    available: true,
    rating: 4.7,
    numReviews: 78,
    isVeg: true,
    preparationTime: 22,
    ingredients: ['Fettuccine', 'Heavy Cream', 'Parmesan', 'Butter', 'Garlic'],
    nutritionalInfo: { calories: 780, protein: 22, carbs: 68, fat: 48 }
  },
  {
    name: 'Chicken Pesto Pasta',
    description: 'Grilled chicken with fresh basil pesto, cherry tomatoes, and pine nuts',
    price: 379,
    image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400',
    category: 'Pasta',
    available: true,
    rating: 4.6,
    numReviews: 55,
    isVeg: false,
    preparationTime: 25,
    ingredients: ['Penne', 'Grilled Chicken', 'Basil Pesto', 'Cherry Tomatoes', 'Pine Nuts'],
    nutritionalInfo: { calories: 720, protein: 38, carbs: 65, fat: 35 }
  },
  {
    name: 'Lasagna Bolognese',
    description: 'Layered pasta with rich meat sauce, béchamel, and melted cheese',
    price: 399,
    image: 'https://images.unsplash.com/photo-1619895092538-128341789043?w=400',
    category: 'Pasta',
    available: true,
    rating: 4.9,
    numReviews: 86,
    isVeg: false,
    preparationTime: 35,
    ingredients: ['Lasagna Sheets', 'Beef Bolognese', 'Béchamel', 'Mozzarella', 'Parmesan'],
    nutritionalInfo: { calories: 850, protein: 42, carbs: 72, fat: 45 }
  },

  // ==================== DESSERTS ====================
  {
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with a molten chocolate center, served with vanilla ice cream',
    price: 199,
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400',
    imageGallery: [
      { url: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800', caption: 'Molten center' },
      { url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800', caption: 'With ice cream' }
    ],
    category: 'Dessert',
    available: true,
    rating: 4.9,
    numReviews: 120,
    isVeg: true,
    preparationTime: 15,
    ingredients: ['Dark Chocolate', 'Butter', 'Eggs', 'Sugar', 'Flour'],
    nutritionalInfo: { calories: 450, protein: 8, carbs: 52, fat: 26 }
  },
  {
    name: 'Classic Tiramisu',
    description: 'Italian coffee-flavored dessert with mascarpone, cocoa, and ladyfingers',
    price: 249,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
    category: 'Dessert',
    available: true,
    rating: 4.8,
    numReviews: 98,
    isVeg: true,
    preparationTime: 10,
    ingredients: ['Mascarpone', 'Espresso', 'Ladyfingers', 'Cocoa', 'Eggs'],
    nutritionalInfo: { calories: 380, protein: 8, carbs: 42, fat: 22 }
  },
  {
    name: 'New York Cheesecake',
    description: 'Creamy cheesecake with a graham cracker crust and berry compote',
    price: 229,
    image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400',
    category: 'Dessert',
    available: true,
    rating: 4.7,
    numReviews: 76,
    isVeg: true,
    preparationTime: 10,
    ingredients: ['Cream Cheese', 'Graham Cracker', 'Sugar', 'Eggs', 'Vanilla'],
    nutritionalInfo: { calories: 420, protein: 8, carbs: 38, fat: 28 }
  },
  {
    name: 'Brownie Sundae',
    description: 'Warm chocolate brownie with vanilla ice cream, hot fudge, and whipped cream',
    price: 179,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
    category: 'Dessert',
    available: true,
    rating: 4.6,
    numReviews: 85,
    isVeg: true,
    preparationTime: 8,
    ingredients: ['Chocolate Brownie', 'Vanilla Ice Cream', 'Hot Fudge', 'Whipped Cream'],
    nutritionalInfo: { calories: 580, protein: 10, carbs: 68, fat: 32 }
  },
  {
    name: 'Mango Cheesecake',
    description: 'Light and creamy mango cheesecake with fresh mango topping',
    price: 259,
    image: 'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=400',
    category: 'Dessert',
    available: true,
    rating: 4.5,
    numReviews: 45,
    isVeg: true,
    preparationTime: 10,
    ingredients: ['Cream Cheese', 'Mango Puree', 'Fresh Mango', 'Biscuit Base'],
    nutritionalInfo: { calories: 380, protein: 6, carbs: 45, fat: 20 }
  },
  {
    name: 'Gulab Jamun',
    description: 'Soft milk-solid dumplings soaked in rose-flavored sugar syrup (4 pieces)',
    price: 129,
    image: 'https://images.unsplash.com/photo-1666190094762-2e8c313c9f54?w=400',
    category: 'Dessert',
    available: true,
    rating: 4.8,
    numReviews: 110,
    isVeg: true,
    preparationTime: 5,
    ingredients: ['Khoya', 'Sugar Syrup', 'Cardamom', 'Rose Water'],
    nutritionalInfo: { calories: 320, protein: 4, carbs: 52, fat: 12 }
  },

  // ==================== DRINKS ====================
  {
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice, no added sugar or preservatives',
    price: 99,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400',
    category: 'Drinks',
    available: true,
    rating: 4.6,
    numReviews: 65,
    isVeg: true,
    preparationTime: 5,
    ingredients: ['Fresh Oranges'],
    nutritionalInfo: { calories: 110, protein: 2, carbs: 26, fat: 0 }
  },
  {
    name: 'Mango Lassi',
    description: 'Creamy yogurt drink blended with sweet Alphonso mango',
    price: 129,
    image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400',
    category: 'Drinks',
    available: true,
    rating: 4.7,
    numReviews: 88,
    isVeg: true,
    preparationTime: 5,
    ingredients: ['Yogurt', 'Mango Puree', 'Sugar', 'Cardamom'],
    nutritionalInfo: { calories: 180, protein: 6, carbs: 32, fat: 4 }
  },
  {
    name: 'Cold Coffee',
    description: 'Chilled coffee blended with milk, cream, and a hint of vanilla',
    price: 149,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
    category: 'Drinks',
    available: true,
    rating: 4.5,
    numReviews: 72,
    isVeg: true,
    preparationTime: 5,
    ingredients: ['Espresso', 'Milk', 'Cream', 'Vanilla', 'Sugar'],
    nutritionalInfo: { calories: 220, protein: 6, carbs: 28, fat: 10 }
  },
  {
    name: 'Strawberry Smoothie',
    description: 'Fresh strawberries blended with yogurt and honey',
    price: 159,
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400',
    category: 'Drinks',
    available: true,
    rating: 4.6,
    numReviews: 58,
    isVeg: true,
    preparationTime: 5,
    ingredients: ['Fresh Strawberries', 'Greek Yogurt', 'Honey', 'Ice'],
    nutritionalInfo: { calories: 165, protein: 8, carbs: 30, fat: 2 }
  },
  {
    name: 'Mint Lemonade',
    description: 'Refreshing lemonade with fresh mint leaves and a touch of honey',
    price: 89,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
    category: 'Drinks',
    available: true,
    rating: 4.4,
    numReviews: 95,
    isVeg: true,
    preparationTime: 5,
    ingredients: ['Fresh Lemon', 'Mint Leaves', 'Honey', 'Soda'],
    nutritionalInfo: { calories: 75, protein: 0, carbs: 20, fat: 0 }
  },
  {
    name: 'Oreo Milkshake',
    description: 'Thick creamy milkshake with crushed Oreo cookies and whipped cream',
    price: 179,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400',
    category: 'Drinks',
    available: true,
    rating: 4.8,
    numReviews: 110,
    isVeg: true,
    preparationTime: 5,
    ingredients: ['Milk', 'Ice Cream', 'Oreo Cookies', 'Whipped Cream'],
    nutritionalInfo: { calories: 420, protein: 10, carbs: 58, fat: 18 }
  },
  {
    name: 'Masala Chai',
    description: 'Traditional Indian spiced tea with ginger, cardamom, and cinnamon',
    price: 49,
    image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400',
    category: 'Drinks',
    available: true,
    rating: 4.7,
    numReviews: 145,
    isVeg: true,
    preparationTime: 8,
    ingredients: ['Black Tea', 'Milk', 'Ginger', 'Cardamom', 'Cinnamon'],
    nutritionalInfo: { calories: 80, protein: 2, carbs: 12, fat: 3 }
  },
  {
    name: 'Watermelon Juice',
    description: 'Fresh watermelon juice with a hint of lime, perfect for summer',
    price: 79,
    image: 'https://images.unsplash.com/photo-1528818955841-a7f1425131b5?w=400',
    category: 'Drinks',
    available: true,
    rating: 4.3,
    numReviews: 52,
    isVeg: true,
    preparationTime: 5,
    ingredients: ['Fresh Watermelon', 'Lime', 'Ice'],
    nutritionalInfo: { calories: 85, protein: 1, carbs: 22, fat: 0 }
  },
  {
    name: 'Coca Cola',
    description: 'Classic Coca-Cola served chilled (330ml)',
    price: 45,
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
    category: 'Drinks',
    available: true,
    rating: 4.2,
    numReviews: 200,
    isVeg: true,
    preparationTime: 1,
    ingredients: ['Coca-Cola'],
    nutritionalInfo: { calories: 140, protein: 0, carbs: 39, fat: 0 }
  },
  {
    name: 'Sprite',
    description: 'Refreshing lemon-lime soda served chilled (330ml)',
    price: 45,
    image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400',
    category: 'Drinks',
    available: true,
    rating: 4.2,
    numReviews: 180,
    isVeg: true,
    preparationTime: 1,
    ingredients: ['Sprite'],
    nutritionalInfo: { calories: 140, protein: 0, carbs: 38, fat: 0 }
  },

  // ==================== APPETIZERS ====================
  {
    name: 'Garlic Bread',
    description: 'Toasted bread with garlic butter, herbs, and melted cheese',
    price: 149,
    image: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=400',
    category: 'Appetizer',
    available: true,
    rating: 4.5,
    numReviews: 88,
    isVeg: true,
    preparationTime: 10,
    ingredients: ['Bread', 'Garlic Butter', 'Parsley', 'Mozzarella'],
    nutritionalInfo: { calories: 280, protein: 8, carbs: 32, fat: 14 }
  },
  {
    name: 'Chicken Wings',
    description: 'Crispy fried chicken wings with your choice of BBQ, Buffalo, or Honey sauce',
    price: 299,
    image: 'https://images.unsplash.com/photo-1608039829572-9b90e25a20fb?w=400',
    category: 'Appetizer',
    available: true,
    rating: 4.7,
    numReviews: 105,
    isVeg: false,
    isSpicy: true,
    spicyLevel: 2,
    preparationTime: 18,
    ingredients: ['Chicken Wings', 'Choice of Sauce', 'Celery', 'Ranch Dip'],
    nutritionalInfo: { calories: 480, protein: 32, carbs: 18, fat: 32 }
  },
  {
    name: 'French Fries',
    description: 'Golden crispy fries with ketchup and mayo',
    price: 99,
    image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400',
    category: 'Appetizer',
    available: true,
    rating: 4.4,
    numReviews: 150,
    isVeg: true,
    preparationTime: 10,
    ingredients: ['Potatoes', 'Salt', 'Ketchup', 'Mayo'],
    nutritionalInfo: { calories: 320, protein: 4, carbs: 42, fat: 16 }
  },
  {
    name: 'Loaded Nachos',
    description: 'Crispy tortilla chips with cheese sauce, jalapeños, salsa, and sour cream',
    price: 249,
    image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400',
    category: 'Appetizer',
    available: true,
    rating: 4.6,
    numReviews: 72,
    isVeg: true,
    isSpicy: true,
    spicyLevel: 2,
    preparationTime: 12,
    ingredients: ['Tortilla Chips', 'Cheese Sauce', 'Jalapeños', 'Salsa', 'Sour Cream'],
    nutritionalInfo: { calories: 520, protein: 12, carbs: 48, fat: 32 }
  },
  {
    name: 'Mozzarella Sticks',
    description: 'Breaded mozzarella sticks fried to golden perfection with marinara sauce',
    price: 199,
    image: 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=400',
    category: 'Appetizer',
    available: true,
    rating: 4.5,
    numReviews: 68,
    isVeg: true,
    preparationTime: 10,
    ingredients: ['Mozzarella', 'Breadcrumbs', 'Marinara Sauce'],
    nutritionalInfo: { calories: 380, protein: 18, carbs: 28, fat: 22 }
  },
  {
    name: 'Onion Rings',
    description: 'Crispy battered onion rings served with chipotle dip',
    price: 129,
    image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400',
    category: 'Appetizer',
    available: true,
    rating: 4.3,
    numReviews: 55,
    isVeg: true,
    preparationTime: 10,
    ingredients: ['Onions', 'Batter', 'Chipotle Mayo'],
    nutritionalInfo: { calories: 290, protein: 4, carbs: 38, fat: 14 }
  },

  // ==================== INDIAN MAIN COURSE ====================
  {
    name: 'Butter Chicken',
    description: 'Tender chicken in a rich, creamy tomato-based curry with butter and spices',
    price: 349,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
    category: 'Main Course',
    available: true,
    rating: 4.8,
    numReviews: 145,
    isVeg: false,
    preparationTime: 30,
    ingredients: ['Chicken', 'Tomatoes', 'Cream', 'Butter', 'Spices'],
    nutritionalInfo: { calories: 550, protein: 35, carbs: 18, fat: 38 }
  },
  {
    name: 'Paneer Tikka Masala',
    description: 'Grilled paneer cubes in a spiced tomato and cream gravy',
    price: 299,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
    category: 'Main Course',
    available: true,
    rating: 4.7,
    numReviews: 98,
    isVeg: true,
    preparationTime: 25,
    ingredients: ['Paneer', 'Tomatoes', 'Cream', 'Bell Peppers', 'Spices'],
    nutritionalInfo: { calories: 420, protein: 22, carbs: 18, fat: 30 }
  },
  {
    name: 'Chicken Biryani',
    description: 'Fragrant basmati rice layered with spiced chicken and aromatic herbs',
    price: 329,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
    category: 'Main Course',
    available: true,
    rating: 4.9,
    numReviews: 180,
    isVeg: false,
    isSpicy: true,
    spicyLevel: 2,
    preparationTime: 40,
    ingredients: ['Basmati Rice', 'Chicken', 'Yogurt', 'Saffron', 'Whole Spices'],
    nutritionalInfo: { calories: 680, protein: 38, carbs: 72, fat: 25 }
  },
  {
    name: 'Dal Makhani',
    description: 'Creamy black lentils slow-cooked with butter and cream',
    price: 229,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
    category: 'Main Course',
    available: true,
    rating: 4.6,
    numReviews: 88,
    isVeg: true,
    preparationTime: 35,
    ingredients: ['Black Lentils', 'Kidney Beans', 'Butter', 'Cream', 'Spices'],
    nutritionalInfo: { calories: 380, protein: 18, carbs: 42, fat: 16 }
  },
  {
    name: 'Tandoori Chicken',
    description: 'Chicken marinated in yogurt and spices, cooked in a clay oven',
    price: 379,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
    category: 'Main Course',
    available: true,
    rating: 4.7,
    numReviews: 92,
    isVeg: false,
    isSpicy: true,
    spicyLevel: 2,
    preparationTime: 35,
    ingredients: ['Chicken', 'Yogurt', 'Tandoori Masala', 'Lemon'],
    nutritionalInfo: { calories: 420, protein: 45, carbs: 8, fat: 22 }
  },
  {
    name: 'Veg Biryani',
    description: 'Aromatic basmati rice with mixed vegetables and fragrant spices',
    price: 249,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400',
    category: 'Main Course',
    available: true,
    rating: 4.5,
    numReviews: 75,
    isVeg: true,
    preparationTime: 35,
    ingredients: ['Basmati Rice', 'Mixed Vegetables', 'Saffron', 'Whole Spices'],
    nutritionalInfo: { calories: 480, protein: 12, carbs: 78, fat: 14 }
  },

  // ==================== SALADS ====================
  {
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with Caesar dressing, croutons, and parmesan',
    price: 199,
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400',
    category: 'Salad',
    available: true,
    rating: 4.4,
    numReviews: 62,
    isVeg: true,
    preparationTime: 10,
    ingredients: ['Romaine Lettuce', 'Caesar Dressing', 'Croutons', 'Parmesan'],
    nutritionalInfo: { calories: 280, protein: 8, carbs: 18, fat: 20 }
  },
  {
    name: 'Greek Salad',
    description: 'Fresh tomatoes, cucumbers, olives, and feta cheese with olive oil dressing',
    price: 229,
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
    category: 'Salad',
    available: true,
    rating: 4.5,
    numReviews: 48,
    isVeg: true,
    preparationTime: 10,
    ingredients: ['Tomatoes', 'Cucumber', 'Olives', 'Feta Cheese', 'Olive Oil'],
    nutritionalInfo: { calories: 220, protein: 8, carbs: 12, fat: 16 }
  },
  {
    name: 'Grilled Chicken Salad',
    description: 'Mixed greens with grilled chicken, cherry tomatoes, and balsamic vinaigrette',
    price: 279,
    image: 'https://images.unsplash.com/photo-1604497181015-76590d828f3f?w=400',
    category: 'Salad',
    available: true,
    rating: 4.6,
    numReviews: 55,
    isVeg: false,
    preparationTime: 15,
    ingredients: ['Mixed Greens', 'Grilled Chicken', 'Cherry Tomatoes', 'Balsamic Vinaigrette'],
    nutritionalInfo: { calories: 320, protein: 32, carbs: 14, fat: 16 }
  },

  // ==================== NEW SPECIAL ITEM ====================
  {
    name: 'Ultimate Loaded Nachos Supreme',
    description: 'Crispy tortilla chips loaded with seasoned beef, melted cheese, jalapeños, guacamole, sour cream, pico de gallo, and black beans - the ultimate sharing platter!',
    price: 399,
    image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400',
    imageGallery: [
      { url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=800', caption: 'Loaded to perfection' },
      { url: 'https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=800', caption: 'Fresh guacamole' },
      { url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800', caption: 'Melted cheese heaven' }
    ],
    category: 'Appetizer',
    available: true,
    rating: 4.9,
    numReviews: 156,
    isVeg: false,
    isSpicy: true,
    spicyLevel: 2,
    preparationTime: 15,
    ingredients: ['Tortilla Chips', 'Seasoned Beef', 'Cheddar Cheese', 'Jalapeños', 'Guacamole', 'Sour Cream', 'Pico de Gallo', 'Black Beans'],
    nutritionalInfo: { calories: 780, protein: 28, carbs: 62, fat: 48 },
    tags: ['Best Seller', 'Sharing Platter', 'Party Favorite']
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('Cleared existing data');

    // Insert restaurants
    const createdRestaurants = await Restaurant.insertMany(restaurants);
    console.log(`Created ${createdRestaurants.length} restaurants`);

    // Distribute menu items across restaurants more evenly
    const menuItems = [];
    const itemsPerRestaurant = Math.ceil(menuItemsData.length / createdRestaurants.length);
    
    menuItemsData.forEach((item, index) => {
      const restaurantIndex = Math.floor(index / itemsPerRestaurant) % createdRestaurants.length;
      menuItems.push({
        ...item,
        restaurant: createdRestaurants[restaurantIndex]._id
      });
    });

    const createdMenuItems = await MenuItem.insertMany(menuItems);
    console.log(`Created ${createdMenuItems.length} menu items`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📍 Restaurants:');
    createdRestaurants.forEach(r => {
      console.log(`  - ${r.name}`);
    });

    console.log('\n🍽️  Menu Items by Category:');
    const categories = [...new Set(menuItemsData.map(m => m.category))];
    categories.forEach(cat => {
      const items = menuItemsData.filter(m => m.category === cat);
      console.log(`  ${cat}: ${items.length} items`);
    });

    console.log(`\n📊 Total: ${createdMenuItems.length} menu items across ${createdRestaurants.length} restaurants`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
