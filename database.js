const { Sequelize, DataTypes } = require('sequelize');

// ایجاد اتصال به پایگاه داده
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'  // پایگاه داده در یک فایل ذخیره خواهد شد
});

// تعریف مدل کاربران
const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    wallet_address: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

// تعریف مدل رویدادها
const Event = sequelize.define('Event', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    option_1: {
        type: DataTypes.STRING,
        allowNull: false
    },
    option_2: {
        type: DataTypes.STRING,
        allowNull: false
    },
    option_3: {
        type: DataTypes.STRING,
        allowNull: true
    },
    start_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'active'  // وضعیت پیش‌فرض "فعال" است
    }
});

// تعریف مدل شرط‌بندی‌ها
const Bet = sequelize.define('Bet', {
    bet_option: {
        type: DataTypes.STRING,
        allowNull: false
    },
    bet_amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
});

// تعریف ارتباطات بین مدل‌ها
User.hasMany(Bet);
Bet.belongsTo(User);

Event.hasMany(Bet);
Bet.belongsTo(Event);

// همگام‌سازی مدل‌ها با پایگاه داده
sequelize.sync({ force: true }).then(() => {
    console.log('Database & tables created!');
});

module.exports = {
    User,
    Event,
    Bet
};
