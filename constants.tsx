
import * as React from 'react';

export const BOT_ID = 'bot-1';

export const CITIES = [
  { name: 'Stockholm', emoji: '🏰' },
  { name: 'Göteborg', emoji: '⚓' },
  { name: 'Malmö', emoji: '🌉' },
  { name: 'Uppsala', emoji: '⛪' },
  { name: 'Västerås', emoji: '🏢' },
  { name: 'Örebro', emoji: '🏰' },
  { name: 'Linköping', emoji: '✈️' },
  { name: 'Helsingborg', emoji: '⛴️' },
  { name: 'Jönköping', emoji: '🕯️' },
  { name: 'Norrköping', emoji: '🏭' },
  { name: 'Lund', emoji: '🎓' },
  { name: 'Umeå', emoji: '🌳' },
  { name: 'Gävle', emoji: '🐐' },
  { name: 'Borås', emoji: '🧵' },
  { name: 'Södertälje', emoji: '⚙️' },
  { name: 'Eskilstuna', emoji: '🛠️' },
  { name: 'Halmstad', emoji: '🏖️' },
  { name: 'Växjö', emoji: '🌲' },
  { name: 'Karlstad', emoji: '☀️' },
  { name: 'Sundsvall', emoji: '🐲' },
  { name: 'Östersund', emoji: '❄️' },
  { name: 'Trollhättan', emoji: '🚗' },
  { name: 'Luleå', emoji: '🏗️' },
  { name: 'Lidingö', emoji: '🏝️' },
  { name: 'Borlänge', emoji: '🎶' },
  { name: 'Tumba', emoji: '📜' },
  { name: 'Kristianstad', emoji: '🌾' },
  { name: 'Kalmar', emoji: '🏰' },
  { name: 'Falun', emoji: '⛏️' },
  { name: 'Skövde', emoji: '🛡️' },
  { name: 'Karlskrona', emoji: '⚓' },
  { name: 'Skellefteå', emoji: '🏒' },
  { name: 'Uddevalla', emoji: '🐚' },
  { name: 'Varberg', emoji: '🏰' },
  { name: 'Åkersberga', emoji: '⛵' },
  { name: 'Landskrona', emoji: '🏰' },
  { name: 'Nyköping', emoji: '🏰' },
  { name: 'Motala', emoji: '💧' },
  { name: 'Vallentuna', emoji: '🐎' },
  { name: 'Örnsköldsvik', emoji: '🏔️' },
  { name: 'Trelleborg', emoji: '🚢' },
  { name: 'Lidköping', emoji: '☕' },
  { name: 'Enköping', emoji: '🌳' },
  { name: 'Ängelholm', emoji: '🍦' },
  { name: 'Lerum', emoji: '🍃' },
  { name: 'Alingsås', emoji: '☕' },
  { name: 'Sandviken', emoji: '⛸️' },
  { name: 'Kungälv', emoji: '🏰' },
  { name: 'Visby', emoji: '🧱' },
  { name: 'Katrineholm', emoji: '🚂' },
  { name: 'Vänersborg', emoji: '🛶' },
  { name: 'Piteå', emoji: '🏖️' },
  { name: 'Hudiksvall', emoji: '🏮' },
  { name: 'Västervik', emoji: '⚓' },
  { name: 'Karlshamn', emoji: '🚢' },
  { name: 'Värnamo', emoji: '🪑' },
  { name: 'Arvika', emoji: '🎻' },
  { name: 'Härnösand', emoji: '🌉' },
  { name: 'Kiruna', emoji: '🏔️' },
  { name: 'Vetlanda', emoji: '🌲' },
  { name: 'Bollnäs', emoji: '🎻' },
  { name: 'Ystad', emoji: '🚨' },
  { name: 'Mariestad', emoji: '⛵' },
  { name: 'Kristinehamn', emoji: '🗿' },
  { name: 'Oskarshamn', emoji: '⛴️' },
  { name: 'Köping', emoji: '🦾' },
  { name: 'Ludvika', emoji: '🔌' },
  { name: 'Mora', emoji: '🎿' },
  { name: 'Höganäs', emoji: '🏺' },
  { name: 'Kumla', emoji: '⛓️' },
  { name: 'Eslöv', emoji: '🏘️' },
  { name: 'Norrtälje', emoji: '⚓' }
];

export const GENDERS = ['Man', 'Kvinna'] as const;

export const GENDER_CONFIG = {
  'Man': { label: 'Man', emoji: '👦' },
  'Kvinna': { label: 'Kvinna', emoji: '👧' }
};

export const BADGES = {
  admin: (
    <span className="bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0.5 rounded-full border border-red-500/50 flex items-center gap-1">
      <i className="fas fa-shield-halved text-[8px]"></i> ADMIN
    </span>
  ),
  verified: (
    <span className="bg-blue-500/20 text-blue-400 text-[10px] px-1.5 py-0.5 rounded-full border border-blue-500/50 flex items-center gap-1">
      <i className="fas fa-check-circle text-[8px]"></i> VERIFIED
    </span>
  ),
  vip: (
    <span className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded-full border border-amber-500/50 flex items-center gap-1">
      <i className="fas fa-crown text-[8px]"></i> VIP
    </span>
  )
};
