const express = require('express');
const { exec } = require('child_process');
const app = express();

// Endpoint utama buat dicek di Android Studio lu nanti
app.get('/extract', (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) {
        return res.status(400).json({ error: 'Url nya mana bre?' });
    }

    // Perintah manggil yt-dlp buat ngeluarin info video format JSON mentah
    exec(`yt-dlp -j "${videoUrl}"`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: 'Gagal nge-extract link YT: ' + error.message });
        }
        
        try {
            const info = JSON.parse(stdout);
            const daftarFormat = [];

            // Looping buat ngambil semua format video dan audio yang ada
            if (info.formats) {
                info.formats.forEach(f => {
                    // Kita filter: ambil yang ada url download-nya langsung
                    if (f.url) {
                        let tipe = 'video';
                        let ext = '.mp4';
                        
                        // Cek apakah format ini cuma audio/mp3 aja
                        if (f.vcodec === 'none') {
                            tipe = 'audio';
                            ext = '.mp3';
                        }

                        // Gabungin info kualitasnya biar dinamis
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

            // Kirim balik respon JSON rapi ke aplikasi Android lu
            res.json({
                title: info.title || 'ClipTube Video',
                formats: daftarFormat
            });

        } catch (e) {
            res.status(500).json({ error: 'Gagal urai data JSON' });
        }
    });
});

// Port dinamis bawaan cloud hosting
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server jalan di port ${PORT}, bre!`);
});