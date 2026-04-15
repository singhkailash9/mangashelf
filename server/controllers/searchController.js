const axios = require('axios');

exports.searchManga = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const response = await axios.get(`https://api.jikan.moe/v4/manga`, {
      params: {
        q,
        limit: 10,
        order_by: 'popularity',
        sort: 'asc'
      }
    });

    const results = response.data.data.map(manga => ({
      malId: manga.mal_id,
      title: manga.title,
      coverImage: manga.images?.jpg?.image_url || '',
      type: 'manga',
      genres: manga.genres?.map(g => g.name) || [],
      synopsis: manga.synopsis,
      score: manga.score,
      status: manga.status,
      chapters: manga.chapters
    }));

    res.status(200).json({ success: true, results });
  } catch (err) {
    // console.error("Jikan API Error:", err.response?.data || err.message);
    
    const statusCode = err.response?.status || 500;
    const errorMessage = err.response?.data?.message || err.message;

    res.status(statusCode).json({ success: false, message: errorMessage });
  }
};