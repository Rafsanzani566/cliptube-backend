const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const app = express();

app.use(cors());

app.get('/extract', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) {
        return res.status(400).json({ error: 'Url nya mana bre?' });
    }

    // JALUR 1: Jika user memasukkan link YouTube / Shorts
    if (videoUrl.contains("youtube.com") || videoUrl.contains("youtu.be")) {
        try {
            // Ambil info video menggunakan ytdl-core (Murni JS)
            const info = await ytdl.getInfo(videoUrl);
            
            // Filter format yang punya audio dan video sekaligus
            const formats = ytdl.filterFormats(info.formats, 'audioandvideo');
            
            const daftarFormat = formats.map(f => ({
                quality: f.qualityLabel + " (MP4)",
                download_url: f.url,
                ext: "mp4"
            }));

            // Tambahkan opsi format audio saja (MP3)
            const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
            if (audioFormats.length > 0) {
                daftarFormat.push({
                    quality: "Audio Terbaik (MP3)",
                    download_url: audioFormats[0].url,
                    ext: "mp3"
                });
            }

            return res.json({
                title: info.videoDetails.title,
                formats: daftarFormat
            });

        } catch (error) {
            return res.status(500).json({ error: 'Gagal ekstrak YouTube: ' + error.message });
        }
    } 
    
    // JALUR 2: Jika user memasukkan link TikTok
    else if (videoUrl.contains("tiktok.com")) {
        try {
            // Trik bypass cepat TikTok tanpa watermark menggunakan API terpercaya ttdown
            const response = await fetch(`https://api.tik-wm.com/api/v1/download?url=${encodeURIComponent(videoUrl)}`);
            const data = await response.json();
            
            if (data && data.data) {
                const videoData = data.data;
                const daftarFormat = [
                    {
                        quality: "Video Tanpa Watermark (MP4)",
                        download_url: videoData.play,
                        ext: "mp4"
                    },
                    {
                        quality: "Audio Musik TikTok (MP3)",
                        download_url: videoData.music,
                        ext: "mp3"
                    }
                ];

                return res.json({
                    title: videoData.title || "TikTok Video",
                    formats: daftarFormat
                });
            } else {
                return res.status(500).json({ error: "Gagal parse struktur TikTok" });
            }
        } catch (error) {
            return res.status(500).json({ error: 'Gagal ekstrak TikTok: ' + error.message });
        }
    } 
    
    else {
        return res.status(400).json({ error: 'Link gak didukung, bre!' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server jalan mandiri di port ${PORT}`));