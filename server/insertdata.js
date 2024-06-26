// insertData.js
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: '148.66.138.145',
  user: 'dbusrShnkr24',
  password: 'studDBpwWeb2!',
  database: 'dbShnkr24stud'
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
  
  const items = [
    {
        itemName: "Laptop",
        lostDate: "2024-01-15",
        timeLost: "10:30",
        locationLost: "Library",
        category: "Electronics",
        status: "Found",
        color: "Gray",
        imageUrl: "https://cdn.mos.cms.futurecdn.net/7fhdrdEhVie6e5q4jJHFJS-1200-80.jpeg",
        description: "A gray laptop found in the library",
        contactEmail: "example@example.com",
        contactPhone: "12345"
    },
    {
        itemName: "Backpack",
        lostDate: "2023-06-01",
        timeLost: "11:00",
        locationLost: "Subway Station",
        category: "Bags",
        status: "Found",
        color: "Brown",
        imageUrl: "https://img.freepik.com/premium-photo/one-lost-bag-backpack-lie-bus-seat_8595-26070.jpg",
        description: "A brown backpack left at the subway station",
        contactEmail: "example@example.com",
        contactPhone: "12345"
    },    
    {
        itemName: "Notebook",
        lostDate: "2024-03-15",
        timeLost: "11:45",
        locationLost: "Library",
        category: "Books",
        status: "Lost",
        color: "Blue",
        imageUrl: "https://thestationers.pk/cdn/shop/files/subject-notebook-subject-4-the-stationers-3_1445x.jpg?v=1708447707",
        description: "A blue notebook lost in the library",
        contactEmail: "example@example.com",
        contactPhone: "12345"
    },       
    {
        itemName: "Smartphone",
        lostDate: "2023-06-10",
        timeLost: "15:30",
        locationLost: "Shopping Mall",
        category: "Electronics",
        status: "Found",
        color: "Blue",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOLJDeee3Bdryx3ljX573HgIvznpJVoKg4eQ&s",
        description: "A blue smartphone found in the shopping mall",
        contactEmail: "example@example.com",
        contactPhone: "12345"
    }
  ];

  items.forEach(item => {
    const query = 'INSERT INTO tbl_123_posts (itemName, lostDate, timeLost, locationLost, category, status, color, imageUrl, description, contactEmail, contactPhone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(query, [item.itemName, item.lostDate, item.timeLost, item.locationLost, item.category, item.status, item.color, item.imageUrl, item.description, item.contactEmail, item.contactPhone], (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        return;
      }
      console.log('Data inserted:', result.insertId);
    });
  });

  connection.end();
});
