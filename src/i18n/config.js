import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      welcome: 'Welcome',
      login: 'Login',
      username: 'Username',
      password: 'Password',
      adminDashboard: 'Admin Dashboard',
      users: 'Users',
      chatRooms: 'Chat Rooms',
      createRoom: 'Create Room',
      send: 'Send',
      logout: 'Logout'
    }
  },
  my: {
    translation: {
      welcome: 'ကြိုဆိုပါတယ်',
      login: 'အကောင့်ဝင်ရန်',
      username: 'အသုံးပြုသူအမည်',
      password: 'စကားဝှက်',
      adminDashboard: 'အက်ဒမင်ဒက်ရှ်ဘုတ်',
      users: 'အသုံးပြုသူများ',
      chatRooms: 'ချက်အခန်းများ',
      createRoom: 'အခန်းအသစ်ဖန်တီးရန်',
      send: 'ပို့ရန်',
      logout: 'ထွက်ရန်'
    }
  },
  th: {
    translation: {
      welcome: 'ยินดีต้อนรับ',
      login: 'เข้าสู่ระบบ',
      username: 'ชื่อผู้ใช้',
      password: 'รหัสผ่าน',
      adminDashboard: 'แดชบอร์ดผู้ดูแลระบบ',
      users: 'ผู้ใช้',
      chatRooms: 'ห้องแชท',
      createRoom: 'สร้างห้อง',
      send: 'ส่ง',
      logout: 'ออกจากระบบ'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
