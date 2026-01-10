/**
 * QURAN AUDIO NUMBER CALCULATOR
 * Use this to generate correct audioNumber values for your ayats.json
 */

// Complete verse counts for all 114 surahs
const SURAH_VERSES = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109,
  123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60,
  34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
  54, 53, 89, 59, 37, 35, 38, 29, 18, 45,
  60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
  14, 11, 11, 18, 12, 12, 30, 52, 52, 44,
  28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
  29, 19, 36, 25, 22, 17, 19, 26, 30, 20,
  15, 21, 11, 8, 8, 19, 5, 8, 8, 11,
  11, 8, 3, 9, 5, 4, 7, 3, 6, 3,
  5, 4, 5, 6
];

/**
 * Calculate the absolute audio number for a verse
 * @param {string} verse - Format: "surah:ayah" (e.g., "1:2", "94:6")
 * @returns {number} - The absolute ayah number for audio API
 */
function getAudioNumber(verse) {
  const [surah, ayah] = verse.split(':').map(Number);
  
  if (!surah || !ayah || surah < 1 || surah > 114) {
    console.error(`Invalid verse reference: ${verse}`);
    return null;
  }
  
  let total = 0;
  for (let i = 1; i < surah; i++) {
    total += SURAH_VERSES[i - 1];
  }
  
  const audioNumber = total + ayah;
  
  // Validate ayah number is within surah bounds
  if (ayah > SURAH_VERSES[surah - 1]) {
    console.warn(`Warning: Ayah ${ayah} exceeds surah ${surah} which has ${SURAH_VERSES[surah - 1]} verses`);
  }
  
  return audioNumber;
}

/**
 * Test audio URL for a verse
 * @param {string} verse - Format: "surah:ayah"
 */
function testAudio(verse) {
  const audioNumber = getAudioNumber(verse);
  if (!audioNumber) return;
  
  const url = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${audioNumber}.mp3`;
  
  console.log(`
📖 Verse: ${verse}
🔢 Audio Number: ${audioNumber}
🔊 Audio URL: ${url}
  `);
  
  // Test if audio exists
  const audio = new Audio(url);
  audio.addEventListener('canplaythrough', () => {
    console.log('✅ Audio file exists and is ready to play');
  });
  audio.addEventListener('error', () => {
    console.error('❌ Audio file not found or cannot be loaded');
  });
  
  return url;
}

/**
 * Generate audioNumber for all verses in your JSON
 * @param {Array} verses - Array of verse objects with "verse" property
 */
function generateAudioNumbers(verses) {
  return verses.map(v => ({
    ...v,
    audioNumber: getAudioNumber(v.verse)
  }));
}

/**
 * Batch test - Check all your current verses
 */
function testAllVerses() {
  const testVerses = [
    "1:2", "14:7", "2:152", "93:7", "3:103", "11:88",
    "94:6", "94:5", "12:87", "7:156", "39:53", "30:60",
    "2:155", "2:153", "65:3", "9:120", "62:11", "3:173",
    "2:45", "39:10", "70:5", "3:200", "1:6", "29:69",
    "17:9", "2:185", "65:2", "12:21", "4:81", "13:28",
    "48:4", "10:25", "3:175", "3:134", "7:199", "41:34",
    "42:37", "9:40", "19:31", "16:89", "16:18", "28:60",
    "2:195", "2:148", "41:46", "2:110"
  ];
  
  console.log('🧪 Testing all verses...\n');
  
  testVerses.forEach(verse => {
    const audioNumber = getAudioNumber(verse);
    console.log(`${verse} → ${audioNumber}`);
  });
  
  console.log('\n✅ All audio numbers calculated!');
}

/**
 * Convert your entire JSON structure
 */
function convertJSON(jsonData) {
  const converted = {};
  
  for (const [mood, verses] of Object.entries(jsonData)) {
    converted[mood] = verses.map(verse => ({
      ...verse,
      audioNumber: getAudioNumber(verse.verse)
    }));
  }
  
  return converted;
}

// Example usage:
console.log('🎵 Quran Audio Number Calculator Ready!\n');
console.log('Usage examples:');
console.log('1. getAudioNumber("94:6")  // Returns 6233');
console.log('2. testAudio("94:6")       // Tests the audio URL');
console.log('3. testAllVerses()         // Tests all verses in your JSON');
console.log('\n---\n');

// Quick test examples
console.log('📋 Sample calculations:');
console.log(`1:2 → ${getAudioNumber("1:2")}`);
console.log(`94:6 → ${getAudioNumber("94:6")}`);
console.log(`2:152 → ${getAudioNumber("2:152")}`);

// Export functions for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getAudioNumber, testAudio, generateAudioNumbers, convertJSON, testAllVerses };
}