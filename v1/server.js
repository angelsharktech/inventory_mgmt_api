const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const usersRoutes = require('./routes/userRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const firmRoutes = require('./routes/firmRoutes');
const roleRoutes = require('./routes/roleRoutes');
const positionRoutes = require('./routes/positionRoutes');
const workTypeRoutes = require('./routes/workTypeRoutes');
const languageRoutes = require('./routes/languageRoutes');
const schemesRoutes = require('./routes/schemesRoutes');
const clientRoutes = require('./routes/clientRoutes');
const paymentModesRoutes = require('./routes/paymentModesRoutes');
const chatsRoutes = require('./routes/chatsRoutes');
const messagesRoutes = require('./routes/messagesRoutes');
const workRoutes = require('./routes/workRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const documentRoutes = require('./routes/documentRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const salebillRoutes = require('./routes/salebillRoutes');
const purchasebillRoutes = require('./routes/purchasebillRoutes');
const gstRoutes = require('./routes/gstRoutes');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3001                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       ;

connectDB();

// Configure CORS options
const corsOptions = {
  origin: 'http://localhost:3000', // Allow only this origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies and authentication headers
  optionsSuccessStatus: 204 // For legacy browser support
};

// Apply CORS with these options
app.use(cors(corsOptions));

// Alternative if you want to allow multiple origins:
/*
const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
*/

app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/firm', firmRoutes);
app.use('/api/role', roleRoutes);
app.use('/api/position', positionRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/firm', firmRoutes);
app.use('/api/worktype', workTypeRoutes);
app.use('/api/language', languageRoutes);
app.use('/api/scheme', schemesRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/paymentMode', paymentModesRoutes);
app.use('/api/chat', chatsRoutes);
app.use('/api/message', messagesRoutes);
app.use('/api/work', workRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/quotation', quotationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/salebills', salebillRoutes);
app.use('/api/purchasebills', purchasebillRoutes);
app.use('/api/gst', gstRoutes);

app.get('/', (req, res) => {3
  res.sendFile(__dirname + '/views/index.html');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Accessible on your local network at: http://YOUR_LOCAL_IP:${port}`);
});