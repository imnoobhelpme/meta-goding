const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (_, res) =>
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

app.get('/YWRtaW4K', (_, res) =>
    res.sendFile(path.join(__dirname, 'public', 'admin.html'))
);

app.get('/roulette', (_, res) =>
    res.sendFile(path.join(__dirname, 'public', 'roulette.html'))
);

app.use(express.static(path.join(__dirname, 'public')));

const DATA = path.join(__dirname, 'data');
const USERS = path.join(DATA, 'user.json');
const BETS = path.join(DATA, 'bets.json');
const LAST = path.join(DATA, 'last.json');

const read = async (file, fallback = []) => {
    try {
        return JSON.parse(await fs.readFile(file, 'utf8'));
    } catch (e) {
        console.error(`[READ] ${file}:`, e.message);
        return fallback;
    }
};
const write = (file, data) =>
    fs.writeFile(file, JSON.stringify(data, null, 2));

app.get('/api/users', async (_, res) => {
    res.json(await read(USERS));
});

app.post('/api/users/update', async (req, res) => {
    const {
        number,
        point
    } = req.body;
    const users = await read(USERS);
    const u = users.find(v => +v.number === +number);
    if (!u) return res.status(404).json({
        error: 'user not found'
    });
    u.point = +point;
    await write(USERS, users);
    res.json({
        ok: true
    });
});

app.post('/api/bet', async (req, res) => {
    const {
        userNumber,
        betNumber,
        amount
    } = req.body;
    const users = await read(USERS);
    const u = users.find(v => +v.number === +userNumber);
    if (!u) return res.status(404).json({
        error: 'user not found'
    });
    if (+amount > u.point) return res.status(400).json({
        error: 'not enough point'
    });

    u.point -= +amount;
    const bets = await read(BETS);
    bets.push({
        userNumber: +userNumber,
        betNumber: +betNumber,
        amount: +amount
    });

    await Promise.all([write(USERS, users), write(BETS, bets)]);
    res.json({
        ok: true
    });
});

app.post('/api/spin', async (req, res) => {
    const {
        resultNumber,
        multiplier
    } = req.body;
    const [users, bets] = await Promise.all([read(USERS), read(BETS)]);

    bets.forEach(({
        userNumber,
        betNumber,
        amount
    }) => {
        const u = users.find(v => +v.number === +userNumber);
        if (!u) return;
        if (+betNumber === +resultNumber) u.point += amount * multiplier;
    });

    await Promise.all([
        write(USERS, users),
        write(BETS, []),
        write(LAST, {
            resultNumber: +resultNumber,
            multiplier: +multiplier,
            time: Date.now()
        })
    ]);

    res.json({
        ok: true,
        users
    });
});

app.get('/api/result', async (_, res) => {
    res.json(await read(LAST, {
        resultNumber: null,
        multiplier: null
    }));
});

app.post('/api/reset', async (_, res) => {
    const users = await read(USERS);
    users.forEach(u => u.point = 0);
    await Promise.all([
        write(USERS, users),
        write(BETS, []),
        write(LAST, {
            resultNumber: null,
            multiplier: null
        })
    ]);
    res.json({
        ok: true
    });
});

app.listen(PORT, () =>
    console.log(`META-ROULETTE ▶  http://localhost:${3000}`)
);

app.get('/api/bets', async (_, res) => res.json(await read(BETS)));