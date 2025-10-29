const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (_, res) =>
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

app.use(express.static(path.join(__dirname, 'public')));

const DATA = path.join(__dirname, 'data');
const USERS = path.join(DATA, 'user.json');
const BETS = path.join(DATA, 'bets.json');
const LAST = path.join(DATA, 'last.json');

const read = (file, fallback = []) =>
    fs.readFile(file, 'utf-8').then(JSON.parse).catch(() => fallback);

const write = (file, data) =>
    fs.writeFile(file, JSON.stringify(data, null, 2));

app.get('/api/users', async (_, res) => {
    const users = await read(USERS);
    res.json(users.map(({
        birthday,
        ...u
    }) => u));
});

app.post('/api/login', async (req, res) => {
    const {
        number,
        birthday
    } = req.body || {};
    if (number == null || birthday == null) {
        return res.status(400).json({
            error: '정보를 입력해주세요'
        });
    }

    const users = await read(USERS);
    const u = users.find(x => Number(x.number) === Number(number));
    if (!u) {
        return res.status(404).json({
            error: '존재하지 않는 학번이에요'
        });
    }

    const toStrExact = v => (v === null || v === undefined) ? '' : String(v);
    if (toStrExact(u.birthday) !== toStrExact(birthday)) {
        return res.status(401).json({
            error: '생년월일이 옳지 않아요'
        });
    }

    const {
        birthday: _b,
        ...safe
    } = u;
    res.json({
        ok: true,
        user: safe
    });
});

app.post('/api/bet', async (req, res) => {
    const {
        userNumber,
        betNumber,
        amount
    } = req.body || {};
    if (![1, 3, 5, 10, 20].includes(Number(betNumber))) {
        return res.status(400).json({
            error: 'invalid betNumber'
        });
    }
    if (!userNumber || !amount || Number(amount) <= 0) {
        return res.status(400).json({
            error: 'bad request'
        });
    }

    const users = await read(USERS);
    const u = users.find(x => Number(x.number) === Number(userNumber));
    if (!u) return res.status(404).json({
        error: 'user not found'
    });
    if (Number(amount) > Number(u.point)) {
        return res.status(400).json({
            error: '포인트가 부족해요'
        });
    }

    u.point = Number(u.point) - Number(amount);

    const bets = await read(BETS);
    bets.push({
        userNumber: Number(userNumber),
        betNumber: Number(betNumber),
        amount: Number(amount)
    });

    await Promise.all([
        write(USERS, users),
        write(BETS, bets)
    ]);

    res.json({
        ok: true
    });
});

app.post('/api/spin', async (req, res) => {
    const {
        resultNumber,
        multiplier
    } = req.body || {};
    if (resultNumber == null || multiplier == null) {
        return res.status(400).json({
            error: 'bad request'
        });
    }

    const [users, bets] = await Promise.all([read(USERS), read(BETS)]);

    bets.forEach(b => {
        if (Number(b.betNumber) === Number(resultNumber)) {
            const u = users.find(x => Number(x.number) === Number(b.userNumber));
            if (u) u.point = Number(u.point) + Number(b.amount) * Number(multiplier);
        }
    });

    await Promise.all([
        write(USERS, users),
        write(BETS, []),
        write(LAST, {
            resultNumber: Number(resultNumber),
            multiplier: Number(multiplier),
            time: Date.now()
        })
    ]);

    res.json({
        ok: true
    });
});

app.get('/api/result', async (_, res) => {
    const last = await read(LAST, {
        resultNumber: null,
        multiplier: null
    });
    res.json(last);
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

app.get('/api/bets', async (_, res) => res.json(await read(BETS)));

app.listen(PORT, () => console.log(`META-ROULETTE ▶  http://localhost:${PORT}`));

