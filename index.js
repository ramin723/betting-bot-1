const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');
const { User, Event, Bet } = require('./database'); // وارد کردن مدل‌ها از فایل database.js

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json()); // اضافه کردن این خط برای تجزیه JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.post('/place-bet', (req, res) => {
    const bet = req.body.bet;
    console.log(`شرط‌بندی دریافت شد: ${bet}`);
    res.send(`شرط شما ثبت شد: ${bet}`);
});

const token = '7464521966:AAF5qiWs9CsTr7k5wFXlu00ATqx5l6P48lg'; 
const bot = new TelegramBot(token, { polling: true });

// ارسال دکمه Launch به کاربران هنگام ارسال /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const options = {
    reply_markup: {
      keyboard: [
        [
          {
            text: 'Launch Web App',
            web_app: { url: 'https://1ef8-89-34-230-128.ngrok-free.app' }
          }
        ]
      ]
    }
  };

  bot.sendMessage(chatId, 'برای استفاده از برنامه وب، دکمه زیر را فشار دهید:', options);
});

// مسیر برای ایجاد رویداد جدید
app.post('/api/events', (req, res) => {
    const { title, description, option_1, option_2, option_3, start_time, end_time } = req.body;

    Event.create({
        title,
        description,
        option_1,
        option_2,
        option_3,
        start_time,
        end_time,
        status: 'active'
    })
    .then(event => {
        res.json({ message: 'رویداد با موفقیت ایجاد شد', event });
    })
    .catch(error => {
        console.error('Error creating event:', error);
        res.status(500).json({ message: 'خطا در ایجاد رویداد' });
    });
});

// مسیر برای دریافت لیست رویدادهای فعال
app.get('/api/events', (req, res) => {
  Event.findAll({
      where: { status: 'active' }
  })
  .then(events => {
      res.json(events);
  })
  .catch(error => {
      console.error('Error fetching events:', error);
      res.status(500).json({ message: 'خطا در دریافت رویدادها' });
  });
});

// مسیر برای ثبت شرط‌بندی
app.post('/api/bets', (req, res) => {
  const { user_id, event_id, bet_option, bet_amount } = req.body;

  Bet.create({
      user_id,
      event_id,
      bet_option,
      bet_amount
  })
  .then(bet => {
      res.json({ message: 'شرط‌بندی با موفقیت ثبت شد', bet });
  })
  .catch(error => {
      console.error('Error placing bet:', error);
      res.status(500).json({ message: 'خطا در ثبت شرط‌بندی' });
  });
});

// مسیر برای بستن رویداد و تعیین نتیجه
app.post('/api/events/:id/close', (req, res) => {
    const eventId = req.params.id;
    const { result } = req.body;

    Event.update(
        { status: 'closed', result },
        { where: { id: eventId } }
    )
    .then(() => {
        res.json({ message: 'رویداد بسته شد و نتیجه تعیین شد' });
    })
    .catch(error => {
        console.error('Error closing event:', error);
        res.status(500).json({ message: 'خطا در بستن رویداد' });
    });
});

// مسیر برای بستن رویداد، محاسبه نتایج و پرداخت به برندگان
app.post('/api/events/:id/close', async (req, res) => {
  const eventId = req.params.id;
  const { result } = req.body;

  try {
      // بروزرسانی وضعیت رویداد و تعیین نتیجه
      await Event.update(
          { status: 'closed', result },
          { where: { id: eventId } }
      );

      // دریافت تمام شرط‌بندی‌های انجام‌شده روی این رویداد
      const allBets = await Bet.findAll({
          where: { event_id: eventId }
      });

      // محاسبه کل مبلغ شرط‌بندی
      const totalBetAmount = allBets.reduce((total, bet) => total + bet.bet_amount, 0);

      // محاسبه هزینه خدمات سایت
      const serviceFee = totalBetAmount * 0.15;

      // مبلغ قابل توزیع بین برندگان
      const payoutPool = totalBetAmount - serviceFee;

      // پیدا کردن شرط‌های برنده
      const winningBets = await Bet.findAll({
          where: {
              event_id: eventId,
              bet_option: result
          }
      });

      // محاسبه مجموع مبلغ شرط‌بندی شده روی گزینه برنده
      const totalWinningBets = winningBets.reduce((total, bet) => total + bet.bet_amount, 0);

      // پرداخت به برندگان
      for (let bet of winningBets) {
          const user = await User.findByPk(bet.user_id);
          const payoutAmount = (bet.bet_amount / totalWinningBets) * payoutPool;
          // انتقال مبلغ به کیف پول کاربر
          console.log(`پرداخت ${payoutAmount.toFixed(2)} به ${user.username}`);
      }

      res.json({ message: 'رویداد بسته شد و برندگان پرداخت شدند' });
  } catch (error) {
      console.error('Error closing event and calculating winners:', error);
      res.status(500).json({ message: 'خطا در بستن رویداد و پرداخت به برندگان' });
  }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
app.post('/test', (req, res) => {
  res.json({ message: 'Test POST route works!' });
});
