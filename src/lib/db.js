import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const JSON_DB_PATH = path.join(process.cwd(), 'db.json');

// --- BILINGUAL SEED CONSTANTS ---
const SEED_HERO = {
  title: JSON.stringify({
    en: 'Master the Art of Baking at VC Cake Academy',
    am: 'በቪሲ ኬክ አካዳሚ የኬክ አሰራር ጥበብን ያዳብሩ'
  }),
  subtitle: JSON.stringify({
    en: 'Become a certified professional cake baker in just one month! Join our flexible shifts: Morning, Afternoon, or Night. Learn cake design, decoration, pastry making, and start your own sweet business.',
    am: 'በአንድ ወር ውስጥ የተረጋገጠ የኬክ ባለሙያ ይሁኑ! በእኛ አመቺ ፈረቃዎች ይሳተፉ፡ የጠዋት፣ ከሰዓት ወይም የማታ። የኬክ ዲዛይን፣ ማስጌጥ፣ ኬክ ጋገራ ይማሩና የራስዎን ስራ ይጀምሩ።'
  }),
  ctaText: JSON.stringify({
    en: 'Register Now',
    am: 'አሁን ይመዝገቡ'
  })
};

const SEED_ARTICLES = [
  {
    title: JSON.stringify({
      en: 'Top 5 Tips for Making a Fluffy Sponge Cake',
      am: 'ለስላሳ ስፖንጅ ኬክ ለመስራት 5 ዋና ምክሮች'
    }),
    content: JSON.stringify({
      en: 'Making a perfect sponge cake is the foundation of cake decorating. 1. Always use room temperature eggs. 2. Measure your ingredients accurately by weight, not volume. 3. Sift the flour at least twice to incorporate air. 4. Avoid opening the oven door during the first 20 minutes of baking. 5. Let the cake cool completely in the pan before taking it out.',
      am: 'ጥሩ ስፖንጅ ኬክ መስራት የኬክ ማስዋብ መሰረት ነው። 1. ሁልጊዜ ክፍል ሙቀት ያላቸው እንቁላሎችን ይጠቀሙ። 2. ንጥረ ነገሮችን በክብደት ይለኩ። 3. አየር እንዲገባ ዱቄቱን ቢያንስ ሁለት ጊዜ ይንፉ። 4. በመጀመሪያዎቹ 20 ደቂቃዎች የምድጃውን በር አይክፈቱ። 5. ኬኩ ሙሉ በሙሉ እስኪቀዘቅዝ ድረስ በእቃው ውስጥ ይተዉት።'
    }),
    type: 'blog',
    mediaUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=600&auto=format&fit=crop'
  },
  {
    title: JSON.stringify({
      en: 'How to Frost a Cake with Smooth Buttercream',
      am: 'ኬክን በለስላሳ በቅቤ ክሬም እንዴት መቀባት እንደሚቻል'
    }),
    content: JSON.stringify({
      en: 'Getting that perfectly smooth finish with buttercream frosting is easier than it looks. In this vlog, we walk you through the crumb-coat technique, using a turntable, and aligning your cake scraper to get sharp edges and a silky smooth finish.',
      am: 'በቅቤ ክሬም (buttercream) ኬክን በሚገባ ማስዋብ ከምናስበው በላይ ቀላል ነው። በዚህ ቪዲዮ ውስጥ ስፓቱላ እና መቧጠጫዎችን በመጠቀም እንዴት ኬክን በሚያምር አጨራረስ ማውጣት እንደሚቻል እናሳያለን።'
    }),
    type: 'vlog',
    mediaUrl: 'https://www.youtube.com/embed/v8yH7Boc9sw'
  },
  {
    title: JSON.stringify({
      en: 'Making Beautiful Fondant Flowers for Beginners',
      am: 'ለጀማሪዎች የሚሆኑ የፎንዳንት አበቦች አሰራር'
    }),
    content: JSON.stringify({
      en: 'Fondant designs add a premium, custom touch to any celebration cake. Learn how to work with gum paste, use flower cutters, color your fondant with gel food colors, and dry your sugar petals so they look realistic and delicate.',
      am: 'የፎንዳንት (fondant) ዲዛይኖች ለማንኛውም ኬክ ልዩ ውበት ይሰጣሉ። በዚህ መመሪያ ውስጥ የፎንዳንት አበባዎችን መስራት፣ ቀለሞችን መቀላቀል እና የተፈጥሮ ቅርጽ ያላቸውን አበቦች ማዘጋጀት እንማራለን።'
    }),
    type: 'blog',
    mediaUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?q=80&w=600&auto=format&fit=crop'
  },
  {
    title: JSON.stringify({
      en: 'VC Cake Academy Class Showcase',
      am: 'የቪሲ ኬክ አካዳሚ የስልጠና ትዕይንት'
    }),
    content: JSON.stringify({
      en: 'Watch our afternoon shift students work on their final wedding cake project. See their dedication, learning, and the amazing output they achieve in just one month of training.',
      am: 'የከሰዓት በኋላ ፈረቃ ተማሪዎቻችን በሰርግ ኬክ ማጠቃለያ ፕሮጀክታቸው ላይ ሲሰሩ ይመልከቱ። በአንድ ወር ስልጠና ውስጥ ያሳዩትን ትጋት እና ያመረቱትን አስደናቂ ኬክ ይመልከቱ።'
    }),
    type: 'vlog',
    mediaUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  }
];

const SEED_TESTIMONIES = [
  {
    clientName: 'Aster Kassa',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
    text: JSON.stringify({
      en: 'VC Cake Academy changed my life! The afternoon shift fits my college schedule perfectly. In just one month, I went from not knowing how to mix batter to baking beautiful 3-tier wedding cakes!',
      am: 'ቪሲ ኬክ አካዳሚ ህይወቴን ቀይሮታል! የከሰዓት በኋላ ፈረቃ ከኮሌጅ ትምህርቴ ጋር በሚገባ ይጣጣማል። በአንድ ወር ውስጥ ብቻ ምንም ሳላውቅ ተነስቼ የሰርግ ኬኮችን እስከመስራት ደርሻለሁ!'
    }),
    rating: 5
  },
  {
    clientName: 'Martha Tolosa',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop',
    text: JSON.stringify({
      en: 'I ordered a custom chocolate-fudge birthday cake for my daughter. It was stunningly beautiful and absolutely delicious. The registration and ordering process was extremely smooth, and payment verification was quick.',
      am: 'ለልጄ የልደት ቸኮሌት ኬክ አዝዤ ነበር። በጣም ያምር ነበር፣ ጣዕሙም ልዩ ነበር። የምዝገባ እና የማዘዝ ሂደቱ በጣም ፈጣን ነበር፣ ክፍያዎችንም ወዲያውኑ አረጋግጠውልኛል።'
    }),
    rating: 5
  },
  {
    clientName: 'Yonas Gebre',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    text: JSON.stringify({
      en: 'The night shift class is excellent for working professionals. The instructors are patient, highly skilled, and teach practical business tips along with baking techniques.',
      am: 'የማታ ፈረቃ ክፍል ለሰራተኞች እጅግ አመቺ ነው። አስተማሪዎቹ ታጋሽ እና ከፍተኛ ችሎታ ያላቸው ናቸው፣ ከመጋገሪያው በተጨማሪ የንግድ ምክሮችንም ያስተምራሉ።'
    }),
    rating: 5
  }
];

// Check if database URL is configured and looks like MySQL
const getDBConfig = () => {
  const url = process.env.DATABASE_URL;
  if (url && (url.startsWith('mysql://') || url.startsWith('mysqls://'))) {
    return { type: 'mysql', url };
  }
  return { type: 'json' };
};

let pool = null;

const getPool = () => {
  const config = getDBConfig();
  if (config.type === 'mysql') {
    if (!pool) {
      const connectionOptions = {
        uri: config.url,
        ssl: {
          rejectUnauthorized: false
        },
        connectionLimit: 10,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      };
      pool = mysql.createPool(connectionOptions);
    }
    return pool;
  }
  return null;
};

// Seed initial data
const seedInitialData = async (store) => {
  // Seed admin
  if (!store.admins || store.admins.length === 0) {
    const adminPassword = 'admin';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    store.admins = [
      {
        id: 1,
        username: 'admin',
        password: hashedPassword,
        createdAt: new Date().toISOString()
      }
    ];
  }

  // Seed hero settings
  if (!store.hero_settings || store.hero_settings.length === 0) {
    store.hero_settings = [
      {
        id: 1,
        title: SEED_HERO.title,
        subtitle: SEED_HERO.subtitle,
        ctaText: SEED_HERO.ctaText,
        imageUrl: 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?q=80&w=800&auto=format&fit=crop',
        cbeAccountNo: '1000444555666',
        cbeAccountHolder: 'Biruk Tigistu Lugaba',
        telebirrPhone: '251911378448',
        telebirrAccountHolder: 'Kibrom Haileselassie Abreha',
        contactPhone1: '098 979 4444',
        contactPhone2: '093 480 2222',
        contactEmail: 'info@vccakeacademy.com',
        contactAddressEn: 'Bole, Addis Ababa',
        contactAddressAm: 'ቦሌ፣ አዲስ አበባ',
        coursePrice: 2500,
        layerPrice: 300,
        minPaymentAmount: 500,
        coursesEnabled: true,
        ordersEnabled: true,
        morningShiftEnabled: true,
        afternoonShiftEnabled: true,
        nightShiftEnabled: true,
        updatedAt: new Date().toISOString()
      }
    ];
  }

  // Seed products
  if (!store.products || store.products.length === 0) {
    store.products = [
      { id: 1, name: "Wedding Cake", category: "Cakes", basePrice: 800, minPaymentAmount: 500, image: "", isEnabled: true, createdAt: new Date().toISOString() },
      { id: 2, name: "Birthday Cake", category: "Cakes", basePrice: 800, minPaymentAmount: 300, image: "", isEnabled: true, createdAt: new Date().toISOString() },
      { id: 3, name: "Celebration Cake", category: "Cakes", basePrice: 800, minPaymentAmount: 300, image: "", isEnabled: true, createdAt: new Date().toISOString() },
      { id: 4, name: "Baby Shower Cake", category: "Cakes", basePrice: 800, minPaymentAmount: 300, image: "", isEnabled: true, createdAt: new Date().toISOString() },
      { id: 5, name: "Custom Cupcakes", category: "Cupcakes", basePrice: 600, minPaymentAmount: 150, image: "", isEnabled: true, createdAt: new Date().toISOString() }
    ];
  }

  // Seed articles
  if (!store.articles || store.articles.length === 0) {
    store.articles = SEED_ARTICLES.map((art, idx) => ({
      id: idx + 1,
      ...art,
      createdAt: new Date().toISOString()
    }));
  }

  // Seed testimonials
  if (!store.testimonies || store.testimonies.length === 0) {
    store.testimonies = SEED_TESTIMONIES.map((t, idx) => ({
      id: idx + 1,
      ...t,
      createdAt: new Date().toISOString()
    }));
  }

  // Seed mock transactions
  if (!store.cbe_mock_transactions || store.cbe_mock_transactions.length === 0) {
    store.cbe_mock_transactions = [
      {
        referenceId: 'FT2608123456',
        amount: 2500.0,
        senderName: 'Aster Kassa',
        timestamp: new Date().toISOString(),
        isClaimed: false
      },
      {
        referenceId: 'FT2608987654',
        amount: 4500.0,
        senderName: 'Martha Tolosa',
        timestamp: new Date().toISOString(),
        isClaimed: false
      },
      {
        referenceId: 'FT2608444444',
        amount: 2500.0,
        senderName: 'Yonas Gebre',
        timestamp: new Date().toISOString(),
        isClaimed: false
      }
    ];
  }

  if (!store.course_registrations) store.course_registrations = [];
  if (!store.cake_orders) store.cake_orders = [];
  if (!store.contact_messages) store.contact_messages = [];
};

// Initialize JSON database
const initJsonDB = async () => {
  if (!fs.existsSync(JSON_DB_PATH)) {
    const defaultStore = {};
    await seedInitialData(defaultStore);
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(defaultStore, null, 2));
  } else {
    try {
      const data = fs.readFileSync(JSON_DB_PATH, 'utf-8');
      const store = JSON.parse(data);
      let updated = false;
      
      const keys = ['admins', 'hero_settings', 'articles', 'testimonies', 'cbe_mock_transactions', 'course_registrations', 'cake_orders', 'contact_messages', 'products'];
      for (const key of keys) {
        if (!store[key]) {
          store[key] = [];
          updated = true;
        }
      }

      if (store.hero_settings && store.hero_settings[0]) {
        const hs = store.hero_settings[0];
        if (hs.contactPhone1 === undefined) { hs.contactPhone1 = '098 979 4444'; updated = true; }
        if (hs.contactPhone2 === undefined) { hs.contactPhone2 = '093 480 2222'; updated = true; }
        if (hs.contactEmail === undefined) { hs.contactEmail = 'info@vccakeacademy.com'; updated = true; }
        if (hs.contactAddressEn === undefined) { hs.contactAddressEn = 'Bole, Addis Ababa'; updated = true; }
        if (hs.contactAddressAm === undefined) { hs.contactAddressAm = 'ቦሌ፣ አዲስ አበባ'; updated = true; }
        if (hs.coursePrice === undefined) { hs.coursePrice = 2500; updated = true; }
        if (hs.layerPrice === undefined) { hs.layerPrice = 300; updated = true; }
        if (hs.coursesEnabled === undefined) { hs.coursesEnabled = true; updated = true; }
        if (hs.ordersEnabled === undefined) { hs.ordersEnabled = true; updated = true; }
        if (hs.morningShiftEnabled === undefined) { hs.morningShiftEnabled = true; updated = true; }
        if (hs.afternoonShiftEnabled === undefined) { hs.afternoonShiftEnabled = true; updated = true; }
        if (hs.nightShiftEnabled === undefined) { hs.nightShiftEnabled = true; updated = true; }
        if (hs.morningShiftCapacity === undefined) { hs.morningShiftCapacity = 30; updated = true; }
        if (hs.afternoonShiftCapacity === undefined) { hs.afternoonShiftCapacity = 30; updated = true; }
        if (hs.nightShiftCapacity === undefined) { hs.nightShiftCapacity = 30; updated = true; }
      }
      
      if (store.products && store.products.length > 0) {
        for (const p of store.products) {
          if (p.stock === undefined) {
            p.stock = 10;
            updated = true;
          }
        }
      }
      
      if (updated || store.admins?.length === 0 || store.hero_settings?.length === 0) {
        await seedInitialData(store);
        fs.writeFileSync(JSON_DB_PATH, JSON.stringify(store, null, 2));
      }
    } catch (e) {
      console.error('Error reading JSON DB, rebuilding...', e);
      const defaultStore = {};
      await seedInitialData(defaultStore);
      fs.writeFileSync(JSON_DB_PATH, JSON.stringify(defaultStore, null, 2));
    }
  }
};

const jsonQuery = async (table, action, data = null) => {
  await initJsonDB();
  const fileData = await fs.promises.readFile(JSON_DB_PATH, 'utf-8');
  const store = JSON.parse(fileData);

  if (action === 'select_all') {
    return store[table] || [];
  }

  if (action === 'select_by_id') {
    const list = store[table] || [];
    return list.find(item => item.id === Number(data) || item.referenceId === data || item.username === data);
  }

  if (action === 'insert') {
    const list = store[table] || [];
    const newItem = { ...data };
    
    if (table !== 'cbe_mock_transactions' && !newItem.id) {
      const maxId = list.reduce((max, item) => (item.id > max ? item.id : max), 0);
      newItem.id = maxId + 1;
    }
    
    newItem.createdAt = newItem.createdAt || new Date().toISOString();
    list.push(newItem);
    store[table] = list;
    await fs.promises.writeFile(JSON_DB_PATH, JSON.stringify(store, null, 2));
    return newItem;
  }

  if (action === 'update') {
    const list = store[table] || [];
    const index = list.findIndex(item => item.id === Number(data.id) || item.referenceId === data.referenceId);
    
    if (index !== -1) {
      list[index] = { ...list[index], ...data.fields, updatedAt: new Date().toISOString() };
      store[table] = list;
      await fs.promises.writeFile(JSON_DB_PATH, JSON.stringify(store, null, 2));
      return list[index];
    }
    throw new Error(`Item in table ${table} not found for update`);
  }

  if (action === 'delete') {
    const list = store[table] || [];
    const filtered = list.filter(item => item.id !== Number(data));
    store[table] = filtered;
    await fs.promises.writeFile(JSON_DB_PATH, JSON.stringify(store, null, 2));
    return true;
  }
};

// Database Initializer (creates tables in MySQL/TiDB or setup JSON DB)
export const initDB = async () => {
  const config = getDBConfig();
  if (config.type === 'json') {
    await initJsonDB();
    console.log('Local JSON database initialized.');
    return;
  }

  console.log('Initializing MySQL/TiDB database...');
  const connection = await mysql.createConnection({
    uri: config.url,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Create Tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS hero_settings (
        id INT PRIMARY KEY DEFAULT 1,
        title TEXT NOT NULL,
        subtitle TEXT NOT NULL,
        ctaText VARCHAR(255) NOT NULL,
        imageUrl LONGTEXT,
        cbeAccountNo VARCHAR(255) DEFAULT '1000444555666',
        cbeAccountHolder VARCHAR(255) DEFAULT 'Biruk Tigistu Lugaba',
        telebirrPhone VARCHAR(255) DEFAULT '251911378448',
        telebirrAccountHolder VARCHAR(255) DEFAULT 'Kibrom Haileselassie Abreha',
        minPaymentAmount DOUBLE DEFAULT 500,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Dynamic schema migrations for existing database tables
    try {
      await connection.query(`ALTER TABLE hero_settings MODIFY COLUMN imageUrl LONGTEXT`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE products MODIFY COLUMN image LONGTEXT`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE articles MODIFY COLUMN mediaUrl LONGTEXT`);
    } catch (e) {}

    try {
      await connection.query(`ALTER TABLE hero_settings ADD COLUMN cbeAccountNo VARCHAR(255) DEFAULT '1000444555666'`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE hero_settings ADD COLUMN cbeAccountHolder VARCHAR(255) DEFAULT 'Biruk Tigistu Lugaba'`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE hero_settings ADD COLUMN telebirrPhone VARCHAR(255) DEFAULT '251911378448'`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE hero_settings ADD COLUMN telebirrAccountHolder VARCHAR(255) DEFAULT 'Kibrom Haileselassie Abreha'`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE hero_settings ADD COLUMN contactPhone1 VARCHAR(255) DEFAULT '098 979 4444'`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE hero_settings ADD COLUMN contactPhone2 VARCHAR(255) DEFAULT '093 480 2222'`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE hero_settings ADD COLUMN contactEmail VARCHAR(255) DEFAULT 'info@vccakeacademy.com'`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE hero_settings ADD COLUMN contactAddressEn VARCHAR(255) DEFAULT 'Bole, Addis Ababa'`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE hero_settings ADD COLUMN contactAddressAm VARCHAR(255) DEFAULT 'ቦሌ፣ አዲስ አበባ'`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE hero_settings ADD COLUMN coursePrice DOUBLE DEFAULT 2500`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE hero_settings ADD COLUMN layerPrice DOUBLE DEFAULT 300`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE hero_settings ADD COLUMN coursesEnabled BOOLEAN DEFAULT TRUE`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE hero_settings ADD COLUMN ordersEnabled BOOLEAN DEFAULT TRUE`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE hero_settings ADD COLUMN morningShiftEnabled BOOLEAN DEFAULT TRUE`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE hero_settings ADD COLUMN afternoonShiftEnabled BOOLEAN DEFAULT TRUE`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE hero_settings ADD COLUMN nightShiftEnabled BOOLEAN DEFAULT TRUE`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE hero_settings ADD COLUMN morningShiftCapacity INT DEFAULT 30`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE hero_settings ADD COLUMN afternoonShiftCapacity INT DEFAULT 30`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE hero_settings ADD COLUMN nightShiftCapacity INT DEFAULT 30`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE products ADD COLUMN stock INT DEFAULT 10`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE hero_settings ADD COLUMN minPaymentAmount DOUBLE DEFAULT 500`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE course_registrations ADD COLUMN totalAmount DOUBLE DEFAULT 0`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE cake_orders ADD COLUMN totalAmount DOUBLE DEFAULT 0`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE products ADD COLUMN minPaymentAmount DOUBLE DEFAULT 0`);
    } catch (e) {}

    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        basePrice DOUBLE NOT NULL,
        minPaymentAmount DOUBLE DEFAULT 0,
        image LONGTEXT,
        stock INT DEFAULT 10,
        isEnabled BOOLEAN DEFAULT TRUE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS course_registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        studentName VARCHAR(255) NOT NULL,
        studentPhone VARCHAR(255) NOT NULL,
        studentEmail VARCHAR(255) NOT NULL,
        shift VARCHAR(50) NOT NULL,
        paymentReference VARCHAR(255) UNIQUE NOT NULL,
        amountPaid DOUBLE NOT NULL,
        totalAmount DOUBLE DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS cake_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customerName VARCHAR(255) NOT NULL,
        customerPhone VARCHAR(255) NOT NULL,
        cakeType VARCHAR(255) NOT NULL,
        sizeKg DOUBLE NOT NULL,
        layers INT NOT NULL,
        flavor VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        deliveryDate VARCHAR(50) NOT NULL,
        paymentReference VARCHAR(255) UNIQUE NOT NULL,
        amountPaid DOUBLE NOT NULL,
        totalAmount DOUBLE DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        mediaUrl LONGTEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS testimonies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        clientName VARCHAR(255) NOT NULL,
        avatarUrl VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        rating INT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS cbe_mock_transactions (
        referenceId VARCHAR(255) PRIMARY KEY,
        amount DOUBLE NOT NULL,
        senderName VARCHAR(255) NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        isClaimed BOOLEAN DEFAULT FALSE
      )
    `);

    // Self-Seed if empty
    const [admins] = await connection.query('SELECT * FROM admins LIMIT 1');
    if (admins.length === 0) {
      const adminPassword = 'admin';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await connection.query('INSERT INTO admins (username, password) VALUES (?, ?)', ['admin', hashedPassword]);
      console.log('Seeded MySQL admin account');
    }

    const [hero] = await connection.query('SELECT * FROM hero_settings LIMIT 1');
    if (hero.length === 0) {
      await connection.query(
        `INSERT INTO hero_settings (
          id, title, subtitle, ctaText, imageUrl, 
          contactPhone1, contactPhone2, contactEmail, contactAddressEn, contactAddressAm, 
          coursePrice, layerPrice, minPaymentAmount, coursesEnabled, ordersEnabled, 
          morningShiftEnabled, afternoonShiftEnabled, nightShiftEnabled,
          morningShiftCapacity, afternoonShiftCapacity, nightShiftCapacity
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 500, ?, ?, ?, ?, ?, 30, 30, 30)`,
        [
          SEED_HERO.title, SEED_HERO.subtitle, SEED_HERO.ctaText,
          'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?q=80&w=800&auto=format&fit=crop',
          '098 979 4444', '093 480 2222', 'info@vccakeacademy.com', 'Bole, Addis Ababa', 'ቦሌ፣ አዲስ አበባ',
          2500, 300, true, true, true, true, true
        ]
      );
      console.log('Seeded MySQL Hero Settings');
    }

    const [prodCheck] = await connection.query('SELECT * FROM products LIMIT 1');
    if (prodCheck.length === 0) {
      const defaultProds = [
        ["Wedding Cake", "Cakes", 800, 500, "", 10],
        ["Birthday Cake", "Cakes", 800, 300, "", 15],
        ["Celebration Cake", "Cakes", 800, 300, "", 20],
        ["Baby Shower Cake", "Cakes", 800, 300, "", 10],
        ["Custom Cupcakes", "Cupcakes", 600, 150, "", 30]
      ];
      for (const p of defaultProds) {
        await connection.query('INSERT INTO products (name, category, basePrice, minPaymentAmount, image, stock, isEnabled) VALUES (?, ?, ?, ?, ?, ?, 1)', p);
      }
      console.log('Seeded MySQL Products');
    }

    const [articles] = await connection.query('SELECT * FROM articles LIMIT 1');
    if (articles.length === 0) {
      for (const art of SEED_ARTICLES) {
        await connection.query('INSERT INTO articles (title, content, type, mediaUrl) VALUES (?, ?, ?, ?)', [
          art.title, art.content, art.type, art.mediaUrl
        ]);
      }
      console.log('Seeded MySQL Articles');
    }

    const [testimonies] = await connection.query('SELECT * FROM testimonies LIMIT 1');
    if (testimonies.length === 0) {
      for (const t of SEED_TESTIMONIES) {
        await connection.query('INSERT INTO testimonies (clientName, avatarUrl, text, rating) VALUES (?, ?, ?, ?)', [
          t.clientName, t.avatarUrl, t.text, t.rating
        ]);
      }
      console.log('Seeded MySQL Testimonials');
    }

    const [cbe] = await connection.query('SELECT * FROM cbe_mock_transactions LIMIT 1');
    if (cbe.length === 0) {
      const defaultCbe = [
        ['FT2608123456', 2500.0, 'Aster Kassa'],
        ['FT2608987654', 4500.0, 'Martha Tolosa'],
        ['FT2608444444', 2500.0, 'Yonas Gebre']
      ];
      for (const c of defaultCbe) {
        await connection.query('INSERT INTO cbe_mock_transactions (referenceId, amount, senderName) VALUES (?, ?, ?)', c);
      }
      console.log('Seeded MySQL CBE Mock Transactions');
    }

    console.log('MySQL Database Initialized successfully.');
  } catch (error) {
    console.error('MySQL database initialization failed:', error);
  } finally {
    await connection.end();
  }
};

export const db = {
  // Hero Settings
  async getHeroSettings() {
    const config = getDBConfig();
    if (config.type === 'json') {
      const list = await jsonQuery('hero_settings', 'select_all');
      return list[0] || null;
    }
    const myPool = getPool();
    const [rows] = await myPool.query('SELECT * FROM hero_settings WHERE id = 1');
    return rows[0] || null;
  },

  async updateHeroSettings(
    title, subtitle, ctaText, imageUrl, 
    cbeAccountNo, cbeAccountHolder, telebirrPhone, telebirrAccountHolder,
    contactPhone1, contactPhone2, contactEmail, contactAddressEn, contactAddressAm,
    coursePrice, layerPrice, minPaymentAmount, coursesEnabled, ordersEnabled,
    morningShiftEnabled, afternoonShiftEnabled, nightShiftEnabled,
    morningShiftCapacity, afternoonShiftCapacity, nightShiftCapacity
  ) {
    const config = getDBConfig();
    const cbeAcc = cbeAccountNo || '1000444555666';
    const cbeHolder = cbeAccountHolder || 'Biruk Tigistu Lugaba';
    const telePhone = telebirrPhone || '251911378448';
    const teleHolder = telebirrAccountHolder || 'Kibrom Haileselassie Abreha';
 
    const fields = {
      title,
      subtitle,
      ctaText,
      imageUrl,
      cbeAccountNo: cbeAcc,
      cbeAccountHolder: cbeHolder,
      telebirrPhone: telePhone,
      telebirrAccountHolder: teleHolder,
      contactPhone1: contactPhone1 || '098 979 4444',
      contactPhone2: contactPhone2 || '093 480 2222',
      contactEmail: contactEmail || 'info@vccakeacademy.com',
      contactAddressEn: contactAddressEn || 'Bole, Addis Ababa',
      contactAddressAm: contactAddressAm || 'ቦሌ፣ አዲስ አበባ',
      coursePrice: coursePrice !== undefined ? Number(coursePrice) : 2500,
      layerPrice: layerPrice !== undefined ? Number(layerPrice) : 300,
      minPaymentAmount: minPaymentAmount !== undefined ? Number(minPaymentAmount) : 500,
      coursesEnabled: coursesEnabled !== undefined ? Boolean(coursesEnabled) : true,
      ordersEnabled: ordersEnabled !== undefined ? Boolean(ordersEnabled) : true,
      morningShiftEnabled: morningShiftEnabled !== undefined ? Boolean(morningShiftEnabled) : true,
      afternoonShiftEnabled: afternoonShiftEnabled !== undefined ? Boolean(afternoonShiftEnabled) : true,
      nightShiftEnabled: nightShiftEnabled !== undefined ? Boolean(nightShiftEnabled) : true,
      morningShiftCapacity: morningShiftCapacity !== undefined ? Number(morningShiftCapacity) : 30,
      afternoonShiftCapacity: afternoonShiftCapacity !== undefined ? Number(afternoonShiftCapacity) : 30,
      nightShiftCapacity: nightShiftCapacity !== undefined ? Number(nightShiftCapacity) : 30
    };
 
    if (config.type === 'json') {
      return await jsonQuery('hero_settings', 'update', {
        id: 1,
        fields
      });
    }
 
    const myPool = getPool();
    await myPool.query(
      `INSERT INTO hero_settings (
        id, title, subtitle, ctaText, imageUrl, cbeAccountNo, cbeAccountHolder, telebirrPhone, telebirrAccountHolder,
        contactPhone1, contactPhone2, contactEmail, contactAddressEn, contactAddressAm,
        coursePrice, layerPrice, minPaymentAmount, coursesEnabled, ordersEnabled, morningShiftEnabled, afternoonShiftEnabled, nightShiftEnabled,
        morningShiftCapacity, afternoonShiftCapacity, nightShiftCapacity
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
      ON DUPLICATE KEY UPDATE 
        title = VALUES(title), 
        subtitle = VALUES(subtitle), 
        ctaText = VALUES(ctaText), 
        imageUrl = VALUES(imageUrl),
        cbeAccountNo = VALUES(cbeAccountNo),
        cbeAccountHolder = VALUES(cbeAccountHolder),
        telebirrPhone = VALUES(telebirrPhone),
        telebirrAccountHolder = VALUES(telebirrAccountHolder),
        contactPhone1 = VALUES(contactPhone1),
        contactPhone2 = VALUES(contactPhone2),
        contactEmail = VALUES(contactEmail),
        contactAddressEn = VALUES(contactAddressEn),
        contactAddressAm = VALUES(contactAddressAm),
        coursePrice = VALUES(coursePrice),
        layerPrice = VALUES(layerPrice),
        minPaymentAmount = VALUES(minPaymentAmount),
        coursesEnabled = VALUES(coursesEnabled),
        ordersEnabled = VALUES(ordersEnabled),
        morningShiftEnabled = VALUES(morningShiftEnabled),
        afternoonShiftEnabled = VALUES(afternoonShiftEnabled),
        nightShiftEnabled = VALUES(nightShiftEnabled),
        morningShiftCapacity = VALUES(morningShiftCapacity),
        afternoonShiftCapacity = VALUES(afternoonShiftCapacity),
        nightShiftCapacity = VALUES(nightShiftCapacity)`,
      [
        title, subtitle, ctaText, imageUrl, cbeAcc, cbeHolder, telePhone, teleHolder,
        fields.contactPhone1, fields.contactPhone2, fields.contactEmail, fields.contactAddressEn, fields.contactAddressAm,
        fields.coursePrice, fields.layerPrice, fields.minPaymentAmount, fields.coursesEnabled, fields.ordersEnabled,
        fields.morningShiftEnabled, fields.afternoonShiftEnabled, fields.nightShiftEnabled,
        fields.morningShiftCapacity, fields.afternoonShiftCapacity, fields.nightShiftCapacity
      ]
    );
    return { id: 1, ...fields };
  },


  // Admin Account
  async getAdminByUsername(username) {
    const config = getDBConfig();
    if (config.type === 'json') {
      return await jsonQuery('admins', 'select_by_id', username);
    }
    const myPool = getPool();
    const [rows] = await myPool.query('SELECT * FROM admins WHERE username = ?', [username]);
    return rows[0] || null;
  },

  // Course Registration
  async createCourseRegistration(data) {
    const config = getDBConfig();
    const regData = {
      studentName: data.studentName,
      studentPhone: data.studentPhone,
      studentEmail: data.studentEmail,
      shift: data.shift,
      paymentReference: data.paymentReference,
      amountPaid: Number(data.amountPaid),
      totalAmount: Number(data.totalAmount || data.amountPaid || 0),
      status: data.status || 'pending',
      paymentMethod: data.paymentMethod || 'cbe',
      verifiedAt: data.verifiedAt || null
    };

    if (config.type === 'json') {
      return await jsonQuery('course_registrations', 'insert', regData);
    }
    const myPool = getPool();
    const [result] = await myPool.query(
      'INSERT INTO course_registrations (studentName, studentPhone, studentEmail, shift, paymentReference, amountPaid, totalAmount, status, paymentMethod, verifiedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        regData.studentName,
        regData.studentPhone,
        regData.studentEmail,
        regData.shift,
        regData.paymentReference,
        regData.amountPaid,
        regData.totalAmount,
        regData.status,
        regData.paymentMethod,
        regData.verifiedAt
      ]
    );
    return { id: result.insertId, ...regData };
  },

  async getCourseRegistrations() {
    const config = getDBConfig();
    if (config.type === 'json') {
      return await jsonQuery('course_registrations', 'select_all');
    }
    const myPool = getPool();
    const [rows] = await myPool.query('SELECT * FROM course_registrations ORDER BY id DESC');
    return rows;
  },

  async updateCourseRegistrationStatus(id, status) {
    const config = getDBConfig();
    const verifiedAt = status === 'approved' ? new Date().toISOString() : null;
    if (config.type === 'json') {
      return await jsonQuery('course_registrations', 'update', { id, fields: { status, verifiedAt } });
    }
    const myPool = getPool();
    await myPool.query('UPDATE course_registrations SET status = ?, verifiedAt = ? WHERE id = ?', [status, verifiedAt, id]);
    return { id, status, verifiedAt };
  },

  // Cake Orders
  async createCakeOrder(data) {
    const config = getDBConfig();
    const orderData = {
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      cakeType: data.cakeType,
      sizeKg: Number(data.sizeKg),
      layers: Number(data.layers),
      flavor: data.flavor,
      description: data.description || '',
      deliveryDate: data.deliveryDate,
      paymentReference: data.paymentReference,
      amountPaid: Number(data.amountPaid),
      totalAmount: Number(data.totalAmount || data.amountPaid || 0),
      status: data.status || 'pending',
      paymentMethod: data.paymentMethod || 'cbe',
      verifiedAt: data.verifiedAt || null
    };

    if (config.type === 'json') {
      return await jsonQuery('cake_orders', 'insert', orderData);
    }
    const myPool = getPool();
    const [result] = await myPool.query(
      'INSERT INTO cake_orders (customerName, customerPhone, cakeType, sizeKg, layers, flavor, description, deliveryDate, paymentReference, amountPaid, totalAmount, status, paymentMethod, verifiedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        orderData.customerName,
        orderData.customerPhone,
        orderData.cakeType,
        orderData.sizeKg,
        orderData.layers,
        orderData.flavor,
        orderData.description,
        orderData.deliveryDate,
        orderData.paymentReference,
        orderData.amountPaid,
        orderData.totalAmount,
        orderData.status,
        orderData.paymentMethod,
        orderData.verifiedAt
      ]
    );
    return { id: result.insertId, ...orderData };
  },

  async getCakeOrders() {
    const config = getDBConfig();
    if (config.type === 'json') {
      return await jsonQuery('cake_orders', 'select_all');
    }
    const myPool = getPool();
    const [rows] = await myPool.query('SELECT * FROM cake_orders ORDER BY id DESC');
    return rows;
  },

  async updateCakeOrderStatus(id, status) {
    const config = getDBConfig();
    const verifiedAt = status === 'approved' ? new Date().toISOString() : null;
    if (config.type === 'json') {
      return await jsonQuery('cake_orders', 'update', { id, fields: { status, verifiedAt } });
    }
    const myPool = getPool();
    await myPool.query('UPDATE cake_orders SET status = ?, verifiedAt = ? WHERE id = ?', [status, verifiedAt, id]);
    return { id, status, verifiedAt };
  },

  async getCourseRegistrationById(id) {
    const config = getDBConfig();
    if (config.type === 'json') {
      const list = await jsonQuery('course_registrations', 'select_all');
      return list.find(item => item.id === Number(id));
    }
    const myPool = getPool();
    const [rows] = await myPool.query('SELECT * FROM course_registrations WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async getCakeOrderById(id) {
    const config = getDBConfig();
    if (config.type === 'json') {
      const list = await jsonQuery('cake_orders', 'select_all');
      return list.find(item => item.id === Number(id));
    }
    const myPool = getPool();
    const [rows] = await myPool.query('SELECT * FROM cake_orders WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async getCourseRegistrationsByPhoneOrRef(search) {
    const config = getDBConfig();
    const cleanSearch = search.trim();
    if (config.type === 'json') {
      const list = await jsonQuery('course_registrations', 'select_all');
      return list.filter(item => 
        item.studentPhone.includes(cleanSearch) || 
        item.paymentReference.toUpperCase().includes(cleanSearch.toUpperCase())
      );
    }
    const myPool = getPool();
    const queryStr = '%' + cleanSearch + '%';
    const [rows] = await myPool.query(
      'SELECT * FROM course_registrations WHERE studentPhone LIKE ? OR UPPER(paymentReference) LIKE ? ORDER BY id DESC',
      [queryStr, queryStr.toUpperCase()]
    );
    return rows;
  },

  async getCakeOrdersByPhoneOrRef(search) {
    const config = getDBConfig();
    const cleanSearch = search.trim();
    if (config.type === 'json') {
      const list = await jsonQuery('cake_orders', 'select_all');
      return list.filter(item => 
        item.customerPhone.includes(cleanSearch) || 
        item.paymentReference.toUpperCase().includes(cleanSearch.toUpperCase())
      );
    }
    const myPool = getPool();
    const queryStr = '%' + cleanSearch + '%';
    const [rows] = await myPool.query(
      'SELECT * FROM cake_orders WHERE customerPhone LIKE ? OR UPPER(paymentReference) LIKE ? ORDER BY id DESC',
      [queryStr, queryStr.toUpperCase()]
    );
    return rows;
  },

  // Articles (Blog / Vlog)
  async getArticles() {
    const config = getDBConfig();
    if (config.type === 'json') {
      const list = await jsonQuery('articles', 'select_all');
      return [...list].sort((a, b) => b.id - a.id);
    }
    const myPool = getPool();
    const [rows] = await myPool.query('SELECT * FROM articles ORDER BY id DESC');
    return rows;
  },

  async createArticle(data) {
    const config = getDBConfig();
    const artData = {
      title: data.title,
      content: data.content,
      type: data.type,
      mediaUrl: data.mediaUrl
    };

    if (config.type === 'json') {
      return await jsonQuery('articles', 'insert', artData);
    }
    const myPool = getPool();
    const [result] = await myPool.query(
      'INSERT INTO articles (title, content, type, mediaUrl) VALUES (?, ?, ?, ?)',
      [artData.title, artData.content, artData.type, artData.mediaUrl]
    );
    return { id: result.insertId, ...artData };
  },

  async updateArticle(id, data) {
    const config = getDBConfig();
    if (config.type === 'json') {
      return await jsonQuery('articles', 'update', { id, fields: data });
    }
    const myPool = getPool();
    await myPool.query(
      'UPDATE articles SET title = ?, content = ?, type = ?, mediaUrl = ? WHERE id = ?',
      [data.title, data.content, data.type, data.mediaUrl, id]
    );
    return { id, ...data };
  },

  async deleteArticle(id) {
    const config = getDBConfig();
    if (config.type === 'json') {
      return await jsonQuery('articles', 'delete', id);
    }
    const myPool = getPool();
    await myPool.query('DELETE FROM articles WHERE id = ?', [id]);
    return true;
  },

  // Testimonials
  async getTestimonies() {
    const config = getDBConfig();
    if (config.type === 'json') {
      return await jsonQuery('testimonies', 'select_all');
    }
    const myPool = getPool();
    const [rows] = await myPool.query('SELECT * FROM testimonies ORDER BY id DESC');
    return rows;
  },

  async createTestimony(data) {
    const config = getDBConfig();
    const testData = {
      clientName: data.clientName,
      avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop',
      text: data.text,
      rating: Number(data.rating)
    };

    if (config.type === 'json') {
      return await jsonQuery('testimonies', 'insert', testData);
    }
    const myPool = getPool();
    const [result] = await myPool.query(
      'INSERT INTO testimonies (clientName, avatarUrl, text, rating) VALUES (?, ?, ?, ?)',
      [testData.clientName, testData.avatarUrl, testData.text, testData.rating]
    );
    return { id: result.insertId, ...testData };
  },

  // Contact Messages
  async createContactMessage(data) {
    const config = getDBConfig();
    const msgData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message
    };

    if (config.type === 'json') {
      return await jsonQuery('contact_messages', 'insert', msgData);
    }
    const myPool = getPool();
    const [result] = await myPool.query(
      'INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)',
      [msgData.name, msgData.email, msgData.phone, msgData.message]
    );
    return { id: result.insertId, ...msgData };
  },

  async getContactMessages() {
    const config = getDBConfig();
    if (config.type === 'json') {
      return await jsonQuery('contact_messages', 'select_all');
    }
    const myPool = getPool();
    const [rows] = await myPool.query('SELECT * FROM contact_messages ORDER BY id DESC');
    return rows;
  },

  // CBE Mock Transactions (Scraper Target)
  async getCBEMockTransactions() {
    const config = getDBConfig();
    if (config.type === 'json') {
      return await jsonQuery('cbe_mock_transactions', 'select_all');
    }
    const myPool = getPool();
    const [rows] = await myPool.query('SELECT * FROM cbe_mock_transactions ORDER BY timestamp DESC');
    return rows;
  },

  async createCBEMockTransaction(data) {
    const config = getDBConfig();
    const txnData = {
      referenceId: data.referenceId.trim().toUpperCase(),
      amount: Number(data.amount),
      senderName: data.senderName,
      isClaimed: false,
      timestamp: new Date().toISOString()
    };

    if (config.type === 'json') {
      const existing = await jsonQuery('cbe_mock_transactions', 'select_by_id', txnData.referenceId);
      if (existing) {
        throw new Error(`Transaction Reference ${txnData.referenceId} already exists in bank portal.`);
      }
      return await jsonQuery('cbe_mock_transactions', 'insert', txnData);
    }
    const myPool = getPool();
    await myPool.query(
      'INSERT INTO cbe_mock_transactions (referenceId, amount, senderName, isClaimed) VALUES (?, ?, ?, ?)',
      [txnData.referenceId, txnData.amount, txnData.senderName, false]
    );
    return txnData;
  },

  async getCBEMockTransaction(referenceId) {
    const config = getDBConfig();
    const ref = referenceId.trim().toUpperCase();
    if (config.type === 'json') {
      return await jsonQuery('cbe_mock_transactions', 'select_by_id', ref);
    }
    const myPool = getPool();
    const [rows] = await myPool.query('SELECT * FROM cbe_mock_transactions WHERE referenceId = ?', [ref]);
    return rows[0] || null;
  },

  async claimCBEMockTransaction(referenceId) {
    const config = getDBConfig();
    const ref = referenceId.trim().toUpperCase();
    if (config.type === 'json') {
      return await jsonQuery('cbe_mock_transactions', 'update', { referenceId: ref, fields: { isClaimed: true } });
    }
    const myPool = getPool();
    await myPool.query('UPDATE cbe_mock_transactions SET isClaimed = 1 WHERE referenceId = ?', [ref]);
    return true;
  },

  // Products / Catalog Items
  async getProducts() {
    const config = getDBConfig();
    if (config.type === 'json') {
      const list = await jsonQuery('products', 'select_all');
      return [...list].sort((a, b) => a.id - b.id);
    }
    const myPool = getPool();
    const [rows] = await myPool.query('SELECT * FROM products ORDER BY id ASC');
    return rows;
  },

  async getProductById(id) {
    const config = getDBConfig();
    if (config.type === 'json') {
      const list = await jsonQuery('products', 'select_all');
      return list.find(item => item.id === Number(id));
    }
    const myPool = getPool();
    const [rows] = await myPool.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async createProduct(data) {
    const config = getDBConfig();
    const prodData = {
      name: data.name,
      category: data.category,
      basePrice: Number(data.basePrice),
      minPaymentAmount: data.minPaymentAmount !== undefined ? Number(data.minPaymentAmount) : 0,
      image: data.image || '',
      stock: data.stock !== undefined ? Number(data.stock) : 10,
      isEnabled: data.isEnabled !== undefined ? Boolean(data.isEnabled) : true
    };

    if (config.type === 'json') {
      return await jsonQuery('products', 'insert', prodData);
    }
    const myPool = getPool();
    const [result] = await myPool.query(
      'INSERT INTO products (name, category, basePrice, minPaymentAmount, image, stock, isEnabled) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [prodData.name, prodData.category, prodData.basePrice, prodData.minPaymentAmount, prodData.image, prodData.stock, prodData.isEnabled ? 1 : 0]
    );
    return { id: result.insertId, ...prodData };
  },

  async updateProduct(id, data) {
    const config = getDBConfig();
    const fields = {};
    if (data.name !== undefined) fields.name = data.name;
    if (data.category !== undefined) fields.category = data.category;
    if (data.basePrice !== undefined) fields.basePrice = Number(data.basePrice);
    if (data.minPaymentAmount !== undefined) fields.minPaymentAmount = Number(data.minPaymentAmount);
    if (data.image !== undefined) fields.image = data.image;
    if (data.stock !== undefined) fields.stock = Number(data.stock);
    if (data.isEnabled !== undefined) fields.isEnabled = Boolean(data.isEnabled);

    if (config.type === 'json') {
      return await jsonQuery('products', 'update', { id, fields });
    }
    const myPool = getPool();
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    if (keys.length === 0) return { id };

    const setClause = keys.map(k => `${k} = ?`).join(', ');
    values.push(id);

    await myPool.query(`UPDATE products SET ${setClause} WHERE id = ?`, values);
    return { id, ...fields };
  },

  async deleteProduct(id) {
    const config = getDBConfig();
    if (config.type === 'json') {
      return await jsonQuery('products', 'delete', id);
    }
    const myPool = getPool();
    await myPool.query('DELETE FROM products WHERE id = ?', [id]);
    return true;
  },

  async addPaymentToCakeOrder(id, amount, newReference, status, verifiedAt) {
    const config = getDBConfig();
    const order = await this.getCakeOrderById(id);
    if (!order) throw new Error("Order not found");

    const updatedAmount = Number(order.amountPaid) + Number(amount);
    const updatedRef = order.paymentReference + ", " + newReference.toUpperCase();

    if (config.type === 'json') {
      return await jsonQuery('cake_orders', 'update', { 
        id, 
        fields: { 
          amountPaid: updatedAmount, 
          paymentReference: updatedRef,
          status,
          verifiedAt
        } 
      });
    }
    const myPool = getPool();
    await myPool.query(
      'UPDATE cake_orders SET amountPaid = ?, paymentReference = ?, status = ?, verifiedAt = ? WHERE id = ?', 
      [updatedAmount, updatedRef, status, verifiedAt, id]
    );
    return { id, amountPaid: updatedAmount, paymentReference: updatedRef, status, verifiedAt };
  },

  async addPaymentToCourseRegistration(id, amount, newReference, status, verifiedAt) {
    const config = getDBConfig();
    const reg = await this.getCourseRegistrationById(id);
    if (!reg) throw new Error("Registration not found");

    const updatedAmount = Number(reg.amountPaid) + Number(amount);
    const updatedRef = reg.paymentReference + ", " + newReference.toUpperCase();

    if (config.type === 'json') {
      return await jsonQuery('course_registrations', 'update', { 
        id, 
        fields: { 
          amountPaid: updatedAmount, 
          paymentReference: updatedRef,
          status,
          verifiedAt
        } 
      });
    }
    const myPool = getPool();
    await myPool.query(
      'UPDATE course_registrations SET amountPaid = ?, paymentReference = ?, status = ?, verifiedAt = ? WHERE id = ?', 
      [updatedAmount, updatedRef, status, verifiedAt, id]
    );
    return { id, amountPaid: updatedAmount, paymentReference: updatedRef, status, verifiedAt };
  }
};

// Trigger auto-initialization on server startup
if (typeof window === 'undefined') {
  initDB().catch(err => {
    console.error('Database auto-initialization failed on startup:', err);
  });
}
