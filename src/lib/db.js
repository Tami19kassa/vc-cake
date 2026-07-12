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
        updatedAt: new Date().toISOString()
      }
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
      
      const keys = ['admins', 'hero_settings', 'articles', 'testimonies', 'cbe_mock_transactions', 'course_registrations', 'cake_orders', 'contact_messages'];
      for (const key of keys) {
        if (!store[key]) {
          store[key] = [];
          updated = true;
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
        imageUrl TEXT,
        cbeAccountNo VARCHAR(255) DEFAULT '1000444555666',
        cbeAccountHolder VARCHAR(255) DEFAULT 'Biruk Tigistu Lugaba',
        telebirrPhone VARCHAR(255) DEFAULT '251911378448',
        telebirrAccountHolder VARCHAR(255) DEFAULT 'Kibrom Haileselassie Abreha',
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Dynamic schema migrations for existing database tables
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

    await connection.query(`
      CREATE TABLE IF NOT EXISTS course_registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        studentName VARCHAR(255) NOT NULL,
        studentPhone VARCHAR(255) NOT NULL,
        studentEmail VARCHAR(255) NOT NULL,
        shift VARCHAR(50) NOT NULL,
        paymentReference VARCHAR(255) UNIQUE NOT NULL,
        amountPaid DOUBLE NOT NULL,
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
        mediaUrl VARCHAR(255) NOT NULL,
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
        'INSERT INTO hero_settings (id, title, subtitle, ctaText, imageUrl) VALUES (1, ?, ?, ?, ?)',
        [SEED_HERO.title, SEED_HERO.subtitle, SEED_HERO.ctaText, 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?q=80&w=800&auto=format&fit=crop']
      );
      console.log('Seeded MySQL Hero Settings');
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

  async updateHeroSettings(title, subtitle, ctaText, imageUrl, cbeAccountNo, cbeAccountHolder, telebirrPhone, telebirrAccountHolder) {
    const config = getDBConfig();
    const cbeAcc = cbeAccountNo || '1000444555666';
    const cbeHolder = cbeAccountHolder || 'Biruk Tigistu Lugaba';
    const telePhone = telebirrPhone || '251911378448';
    const teleHolder = telebirrAccountHolder || 'Kibrom Haileselassie Abreha';

    if (config.type === 'json') {
      return await jsonQuery('hero_settings', 'update', {
        id: 1,
        fields: {
          title,
          subtitle,
          ctaText,
          imageUrl,
          cbeAccountNo: cbeAcc,
          cbeAccountHolder: cbeHolder,
          telebirrPhone: telePhone,
          telebirrAccountHolder: teleHolder
        }
      });
    }
    const myPool = getPool();
    await myPool.query(
      `INSERT INTO hero_settings (id, title, subtitle, ctaText, imageUrl, cbeAccountNo, cbeAccountHolder, telebirrPhone, telebirrAccountHolder) 
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
         title = VALUES(title), 
         subtitle = VALUES(subtitle), 
         ctaText = VALUES(ctaText), 
         imageUrl = VALUES(imageUrl),
         cbeAccountNo = VALUES(cbeAccountNo),
         cbeAccountHolder = VALUES(cbeAccountHolder),
         telebirrPhone = VALUES(telebirrPhone),
         telebirrAccountHolder = VALUES(telebirrAccountHolder)`,
      [title, subtitle, ctaText, imageUrl, cbeAcc, cbeHolder, telePhone, teleHolder]
    );
    return {
      id: 1,
      title,
      subtitle,
      ctaText,
      imageUrl,
      cbeAccountNo: cbeAcc,
      cbeAccountHolder: cbeHolder,
      telebirrPhone: telePhone,
      telebirrAccountHolder: teleHolder
    };
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
      status: data.status || 'pending',
      paymentMethod: data.paymentMethod || 'cbe',
      verifiedAt: data.verifiedAt || null
    };

    if (config.type === 'json') {
      return await jsonQuery('course_registrations', 'insert', regData);
    }
    const myPool = getPool();
    const [result] = await myPool.query(
      'INSERT INTO course_registrations (studentName, studentPhone, studentEmail, shift, paymentReference, amountPaid, status, paymentMethod, verifiedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        regData.studentName,
        regData.studentPhone,
        regData.studentEmail,
        regData.shift,
        regData.paymentReference,
        regData.amountPaid,
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
      status: data.status || 'pending',
      paymentMethod: data.paymentMethod || 'cbe',
      verifiedAt: data.verifiedAt || null
    };

    if (config.type === 'json') {
      return await jsonQuery('cake_orders', 'insert', orderData);
    }
    const myPool = getPool();
    const [result] = await myPool.query(
      'INSERT INTO cake_orders (customerName, customerPhone, cakeType, sizeKg, layers, flavor, description, deliveryDate, paymentReference, amountPaid, status, paymentMethod, verifiedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
  }
};

// Trigger auto-initialization on server startup
if (typeof window === 'undefined') {
  initDB().catch(err => {
    console.error('Database auto-initialization failed on startup:', err);
  });
}
