// ========================================
// WhatsApp AI Bot - Gemini Powered
// ========================================

require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');
const express = require('express');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ── Config ──────────────────────────────
const CONFIG_PATH = path.join(__dirname, 'config.json');
let config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));

function saveConfig() {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

function reloadConfig() {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}


// ── Gemini AI ───────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
let geminiModel = null;

function initGemini() {
    try {
        geminiModel = genAI.getGenerativeModel({ model: 'gemma-3-1b-it' });
        console.log('✅ Gemini AI initialized (gemma-3-1b-it)');
    } catch (err) {
        console.error('❌ Gemini AI init error:', err.message);
    }
}

async function askGemini(userMessage, senderName, isGroup, groupName, customPromptOverride = null) {
    if (!geminiModel) return 'Maaf, AI sedang tidak tersedia.';

    const contextInfo = isGroup
        ? `Pesan dari ${senderName} di grup "${groupName}".`
        : `Pesan dari ${senderName} (chat pribadi).`;

    const basePrompt = customPromptOverride || config.systemPrompt;
    const prompt = `${basePrompt}\n\nKonteks: ${contextInfo}\n\nPesan: ${userMessage}`;
    console.log(`[DEBUG] Final AI Prompt: ${prompt.substring(0, 150).replace(/\n/g, ' ')}...`);

    try {
        const result = await geminiModel.generateContent(prompt);
        const response = result.response.text();
        return response || 'Maaf, saya tidak bisa menjawab saat ini.';
    } catch (err) {
        console.error('❌ Gemini error:', err.message);
        return 'Maaf, terjadi kesalahan saat memproses pesan.';
    }
}


// ── WhatsApp Client ─────────────────────
let qrCodeDataUrl = null;
let clientReady = false;
let clientInfo = null;
let messageLog = [];
const MAX_LOG = 100;

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: path.join(__dirname, '.wwebjs_auth') }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--disable-gpu'
        ]
    }
});

client.on('qr', async (qr) => {
    console.log('\n📱 Scan QR Code berikut di WhatsApp:');
    qrcode.generate(qr, { small: true });

    // Generate QR as data URL for web dashboard
    try {
        qrCodeDataUrl = await QRCode.toDataURL(qr, { width: 300, margin: 2 });
    } catch (err) {
        console.error('QR generation error:', err);
    }
});

client.on('ready', () => {
    clientReady = true;
    qrCodeDataUrl = null;
    clientInfo = client.info;
    console.log('\n✅ WhatsApp Bot siap!');
    console.log(`📞 Terhubung sebagai: ${client.info.pushname} (${client.info.wid.user})`);
    console.log(`🌐 Dashboard: http://localhost:${process.env.PORT || 3000}`);
});

client.on('disconnected', (reason) => {
    clientReady = false;
    clientInfo = null;
    console.log('❌ WhatsApp disconnected:', reason);
});

client.on('auth_failure', (msg) => {
    console.error('❌ Auth failure:', msg);
});

// ── Message Handler ─────────────────────
client.on('message', async (msg) => {
    if (!config.autoReplyEnabled) return;
    if (msg.fromMe) return;

    const chat = await msg.getChat();
    const contact = await msg.getContact();
    const senderName = contact.pushname || contact.name || contact.number;
    const senderNumber = contact.number || msg.author || '';
    const isGroup = chat.isGroup;
    const groupName = isGroup ? chat.name : '';

    // ── Log message ──
    const logEntry = {
        time: new Date().toISOString(),
        from: senderName,
        number: senderNumber,
        group: groupName,
        message: msg.body,
        isGroup
    };
    messageLog.unshift(logEntry);
    if (messageLog.length > MAX_LOG) messageLog.pop();

    let customPromptOverride = null;

    // ── Check contact rules (auto agree/disagree) ──
    console.log(`[DEBUG] senderName: ${senderName}, contact.number: ${contact.number}, msg.author: ${msg.author}`);
    const contactRule = config.contactRules.find(r => {
        // Normalize rule number (change 08... to 628...)
        let normalizedRuleNum = r.number.trim();
        if (normalizedRuleNum.startsWith('0')) {
            normalizedRuleNum = '62' + normalizedRuleNum.slice(1);
        }
        
        const match = senderNumber.includes(normalizedRuleNum) && r.enabled;
        if (match) console.log(`[DEBUG] Rule matched for ${r.number} (normalized: ${normalizedRuleNum})`);
        return match;
    });

    if (contactRule) {
        let ruleResponse = null;
        if (contactRule.mode === 'agree') {
            ruleResponse = contactRule.customResponse || 'Iya, setuju 👍';
        } else if (contactRule.mode === 'disagree') {
            ruleResponse = contactRule.customResponse || 'Maaf, saya tidak setuju 🙏';
        } else if (contactRule.mode === 'ignore') {
            return; // ignore this contact
        } else if (contactRule.mode === 'custom') {
            ruleResponse = contactRule.customResponse || '';
        } else if (contactRule.mode === 'ai_persona') {
            customPromptOverride = contactRule.customResponse || '';
        }

        if (ruleResponse) {
            // For groups, only reply when mentioned
            if (isGroup) {
                const mentions = await msg.getMentions();
                const botNumber = client.info.wid.user;
                const isMentioned = mentions.some(m => m.id.user === botNumber) ||
                    msg.body.toLowerCase().includes(`@${botNumber}`);
                if (!isMentioned && config.replyOnlyWhenMentioned) return;
            }

            console.log(`📨 [Rule: ${contactRule.mode}] ${senderName}: ${msg.body.substring(0, 50)}`);
            await msg.reply(ruleResponse);

            logEntry.replied = true;
            logEntry.replyText = ruleResponse;
            logEntry.ruleApplied = contactRule.mode;
            return;
        }
    }

    // ── Check custom keyword replies ──
    const matchedReply = config.customReplies.find(r =>
        r.enabled && msg.body.toLowerCase().includes(r.keyword.toLowerCase())
    );

    if (matchedReply) {
        if (isGroup) {
            const mentions = await msg.getMentions();
            const botNumber = client.info.wid.user;
            const isMentioned = mentions.some(m => m.id.user === botNumber) ||
                msg.body.toLowerCase().includes(`@${botNumber}`);
            if (!isMentioned && config.replyOnlyWhenMentioned) return;
        }

        console.log(`📨 [Keyword: ${matchedReply.keyword}] ${senderName}: ${msg.body.substring(0, 50)}`);
        await msg.reply(matchedReply.response);

        logEntry.replied = true;
        logEntry.replyText = matchedReply.response;
        logEntry.ruleApplied = `keyword:${matchedReply.keyword}`;
        return;
    }

    // ── Group messages: only reply when mentioned ──
    if (isGroup && config.replyOnlyWhenMentioned) {
        const mentions = await msg.getMentions();
        const botNumber = client.info.wid.user;
        const isMentioned = mentions.some(m => m.id.user === botNumber) ||
            msg.body.toLowerCase().includes(`@${botNumber}`);

        if (!isMentioned) return;
    }

    // ── AI Response via Gemini ──
    console.log(`🤖 [AI] ${senderName}${isGroup ? ` @ ${groupName}` : ''}: ${msg.body.substring(0, 80)}`);

    // Remove the @mention from message before sending to AI
    let cleanMessage = msg.body;
    if (client.info) {
        cleanMessage = cleanMessage.replace(new RegExp(`@${client.info.wid.user}`, 'gi'), '').trim();
    }

    const aiReply = await askGemini(cleanMessage, senderName, isGroup, groupName, customPromptOverride);
    await msg.reply(aiReply);

    logEntry.replied = true;
    logEntry.replyText = aiReply;
    logEntry.ruleApplied = 'gemini-ai';
});

// ── Express Dashboard ───────────────────
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: Status
app.get('/api/status', (req, res) => {
    res.json({
        connected: clientReady,
        qrCode: qrCodeDataUrl,
        botInfo: clientInfo ? {
            name: clientInfo.pushname,
            number: clientInfo.wid.user,
            platform: clientInfo.platform
        } : null
    });
});

// API: Get config
app.get('/api/config', (req, res) => {
    reloadConfig();
    res.json(config);
});

// API: Update config
app.post('/api/config', (req, res) => {
    const updates = req.body;
    Object.assign(config, updates);
    saveConfig();
    res.json({ success: true, config });
});

// API: Get contact rules
app.get('/api/contacts', (req, res) => {
    res.json(config.contactRules);
});

// API: Add contact rule
app.post('/api/contacts', (req, res) => {
    const rule = {
        id: Date.now().toString(),
        number: req.body.number,
        name: req.body.name || '',
        mode: req.body.mode || 'agree',  // agree, disagree, ignore, custom
        customResponse: req.body.customResponse || '',
        enabled: true
    };
    config.contactRules.push(rule);
    saveConfig();
    res.json({ success: true, rule });
});

// API: Update contact rule
app.put('/api/contacts/:id', (req, res) => {
    const idx = config.contactRules.findIndex(r => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    Object.assign(config.contactRules[idx], req.body);
    saveConfig();
    res.json({ success: true, rule: config.contactRules[idx] });
});

// API: Delete contact rule
app.delete('/api/contacts/:id', (req, res) => {
    config.contactRules = config.contactRules.filter(r => r.id !== req.params.id);
    saveConfig();
    res.json({ success: true });
});

// API: Get custom replies
app.get('/api/replies', (req, res) => {
    res.json(config.customReplies);
});

// API: Add custom reply
app.post('/api/replies', (req, res) => {
    const reply = {
        id: Date.now().toString(),
        keyword: req.body.keyword,
        response: req.body.response,
        enabled: true
    };
    config.customReplies.push(reply);
    saveConfig();
    res.json({ success: true, reply });
});

// API: Update custom reply
app.put('/api/replies/:id', (req, res) => {
    const idx = config.customReplies.findIndex(r => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    Object.assign(config.customReplies[idx], req.body);
    saveConfig();
    res.json({ success: true, reply: config.customReplies[idx] });
});

// API: Delete custom reply
app.delete('/api/replies/:id', (req, res) => {
    config.customReplies = config.customReplies.filter(r => r.id !== req.params.id);
    saveConfig();
    res.json({ success: true });
});

// API: Message log
app.get('/api/logs', (req, res) => {
    res.json(messageLog);
});

// API: Restart WhatsApp
app.post('/api/restart', async (req, res) => {
    try {
        clientReady = false;
        clientInfo = null;
        await client.destroy();
        setTimeout(() => {
            client.initialize();
        }, 2000);
        res.json({ success: true, message: 'Restarting...' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Logout WhatsApp
app.post('/api/logout', async (req, res) => {
    try {
        await client.logout();
        clientReady = false;
        clientInfo = null;
        qrCodeDataUrl = null;
        res.json({ success: true, message: 'Logged out' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Start Everything ────────────────────
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('╔══════════════════════════════════════╗');
    console.log('║   WhatsApp AI Bot - Gemini Powered   ║');
    console.log('╠══════════════════════════════════════╣');
    console.log(`║  Dashboard: http://localhost:${PORT}     ║`);
    console.log('╚══════════════════════════════════════╝');
    console.log('');

    initGemini();
    client.initialize();
});
