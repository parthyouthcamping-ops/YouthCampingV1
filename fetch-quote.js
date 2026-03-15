
async function check() {
    const slug = 'trip-luxury-0424e';
    const response = await fetch('https://youthcampingp.vercel.app/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getAll' })
    });
    const all = await response.json();
    const found = all.find(q => q.slug === slug);
    const fs = require('fs');
    fs.writeFileSync('quote-debug.json', JSON.stringify(found, null, 2), 'utf8');
}

check();
