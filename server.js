const express = require('express');
const ytDlp = require('yt-dlp-exec');
const app = express();

// Endpoint utama
app.get('/extract', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) {
        return res.status(400).json({ error: 'Url nya mana bre?' });
    }

    try {
        // Manggil yt-dlp secara asinkronus lewat library resmi node
        const info = await ytDlp(videoUrl, {
            dumpSingleJson: true,
            noCheckCertificates: true
        });

        const daftarFormat = [];

        if (info.formats) {
            info.formats.forEach(f => {
                if (f.url) {
                    let tipe = 'video';
                    let ext = '.mp4';
                    
                    if (f.vcodec === 'none') {
                        tipe = 'audio';
                        ext = '.mp3';
                    }

                    let kualitas = f.format_note || f.resolution || 'Standard';

                    daftarFormat.push({
                        quality: kualitas + " (" + ext.toUpperCase() + ")",
                        download_url: f.url,
                        type: tipe,
                        ext: ext
                    });
                }
            });
        }

        res.json({
            title: info.title || 'ClipTube Video',
            formats: daftarFormat
        });

    } catch (error) {
        res.status(500).json({ error: 'Gagal nge-extract link YT: ' + error.message });
    }
});

// Export biar dibaca serverless Vercel
module.exports = app;

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));