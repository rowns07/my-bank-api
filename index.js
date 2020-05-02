const express = require('express');
const app = express();
const port = 3000
const fs = require('fs');
const promisify = require('util').promisify;
const exists = promisify(fs.exists);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

app.use(express.json())
app.get('/', function (req, res) {
    res.send('Hello Worldinho!');
});

app.post('/accounts', async function (req, res) {
    console.log(req.body)
    const json = JSON.parse(await readFile('accounts.json', 'utf8'))
    req.body.id = ++json.id
    json.accounts.push(req.body)
    await writeFile('accounts.json', JSON.stringify(json))
    res.sendStatus(200)
})

app.post('/accounts/:id/balance/insert', async function (req, res) {
    const json = JSON.parse(await readFile('accounts.json', 'utf8'))
    const account = json.accounts.find(a => a.id === parseInt(req.params.id))
    if (!account) {
        res.status(404).send({ error: 'Conta Inexistente' })
    } else {
        account.balance += req.body.balance
        const index = json.accounts.findIndex(a => a.id === account.id)
        json.accounts[index] = account
        await writeFile('accounts.json', JSON.stringify(json))
        res.sendStatus(200)
    }
})

app.post('/accounts/:id/balance/withdrawl', async function (req, res) {
    const json = JSON.parse(await readFile('accounts.json', 'utf8'))
    const account = json.accounts.find(a => a.id === parseInt(req.params.id))
    if (!account) {
        res.status(404).send({ error: 'Conta Inexistente' })
    } else if (account.balance < req.body.balance) {
        res.status(400).send({ error: 'Saldo Insuficiente' })
    } else {
        account.balance -= req.body.balance
        const index = json.accounts.findIndex(a => a.id === account.id)
        json.accounts[index] = account
        await writeFile('accounts.json', JSON.stringify(json))
        res.sendStatus(200)
    }
})

app.get('/accounts/:id/balance', async function (req, res) {
    const json = JSON.parse(await readFile('accounts.json', 'utf8'))
    const account = json.accounts.find(a => a.id === parseInt(req.params.id))
    if (!account) {
        res.status(404).send({ error: 'Conta Inexistente' })
    } else {
        res.send({ balance: account.balance })
    }
})

app.delete('/accounts/:id', async function (req, res) {
    const json = JSON.parse(await readFile('accounts.json', 'utf8'))
    const accounts = json.accounts.filter(a => a.id !== parseInt(req.params.id))
    json.accounts = accounts
    await writeFile('accounts.json', JSON.stringify(json))
    res.sendStatus(200)
    
})

app.listen(port, async function () {
    const fileExits = await exists('accounts.json');
    if (!fileExits) {
        const json = {
            id: 0,
            accounts: []
        }
        await writeFile('accounts.json', JSON.stringify(json));
    }

    console.log(`Example app listening on port ${port}`);
});
