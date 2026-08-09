import React, { useState, useEffect } from 'react';

const API_BASE = "https://anime-world-india-api-streaming-api-six.vercel.app/api/anime-world-india/v1";

export default function Index() {
  const [activeTab, setActiveTab] = useState<'home' | 'series' | 'movies' | 'a2z'>('home');
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Selection states for Series -> Seasons -> Episodes
  const [selectedSeries, setSelectedSeries] = useState<any>(null);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [episodes, setEpisodes] = useState<any[]>([]);
  
  // Stream & Video Player state
  const [streamData, setStreamData] = useState<any>(null);
  const [selectedLetter, setSelectedLetter] = useState<string>('a');

  // 1. Initial Load (Home Page)
  useEffect(() => {
    loadHome();
  }, []);

  // 1. Home Endpoint
  const loadHome = async () => {
    setLoading(true);
    setActiveTab('home');
    resetPlayerAndSelection();
    try {
      const res = await fetch(`${API_BASE}/home.php`);
      const data = await res.json();
      if (data.success && data.latest_series) {
        setDataList(data.latest_series);
      }
    } catch (err) {
      console.error("Home fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Search Endpoint
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    resetPlayerAndSelection();
    try {
      const res = await fetch(`${API_BASE}/search.php?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success && data.results) {
        setDataList(data.results);
      } else {
        setDataList([]);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Series Endpoint
  const loadSeries = async () => {
    setLoading(true);
    setActiveTab('series');
    resetPlayerAndSelection();
    try {
      const res = await fetch(`${API_BASE}/series.php?p=1`);
      const data = await res.json();
      if (data.success && data.series) {
        setDataList(data.series);
      }
    } catch (err) {
      console.error("Series error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 4. Movies Endpoint
  const loadMovies = async () => {
    setLoading(true);
    setActiveTab('movies');
    resetPlayerAndSelection();
    try {
      const res = await fetch(`${API_BASE}/movie.php?p=1`);
      const data = await res.json();
      if (data.success && data.movies) {
        setDataList(data.movies);
      }
    } catch (err) {
      console.error("Movies error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 5. A2Z Endpoint
  const loadA2Z = async (letter: string) => {
    setSelectedLetter(letter);
    setLoading(true);
    setActiveTab('a2z');
    resetPlayerAndSelection();
    try {
      const res = await fetch(`${API_BASE}/a2z.php?letter=${letter}&page=1`);
      const data = await res.json();
      if (data.success && data.results) {
        setDataList(data.results);
      }
    } catch (err) {
      console.error("A2Z error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 6. Seasons Endpoint
  const openSeriesDetail = async (seriesId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/seasons.php?seriesID=${seriesId}`);
      const data = await res.json();
      if (data.success && data.series) {
        setSelectedSeries(data.series);
        setSeasons(data.seasons || []);
        setEpisodes([]);
        window.scrollTo({ top: 300, behavior: 'smooth' });
      }
    } catch (err) {
      console.error("Seasons fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 7. Episodes Endpoint
  const loadEpisodes = async (seasonId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/episodes.php?seasonId=${seasonId}`);
      const data = await res.json();
      if (data.success && data.episodes) {
        setEpisodes(data.episodes);
      }
    } catch (err) {
      console.error("Episodes fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 8. Stream Endpoint
  const playContent = async (id: string, isMovie: boolean = false) => {
    setLoading(true);
    const param = isMovie ? `movieId=${id}` : `episodeId=${id}`;
    try {
      const res = await fetch(`${API_BASE}/stream.php?${param}`);
      const data = await res.json();
      if (data.success && data.stream) {
        setStreamData(data.stream);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert("Stream link not available!");
      }
    } catch (err) {
      alert("Failed to fetch stream details");
    } finally {
      setLoading(false);
    }
  };

  const resetPlayerAndSelection = () => {
    setSelectedSeries(null);
    setSeasons([]);
    setEpisodes([]);
    setStreamData(null);
  };

  return (
    <div style={{ backgroundColor: '#0f0f13', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* Navbar */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <h1 style={{ color: '#ff4757', margin: 0, cursor: 'pointer' }} onClick={loadHome}>AnizenX</h1>
        
        <nav style={{ display: 'flex', gap: '10px' }}>
          <button onClick={loadHome} style={navBtnStyle(activeTab === 'home')}>Home</button>
          <button onClick={loadSeries} style={navBtnStyle(activeTab === 'series')}>Series</button>
          <button onClick={loadMovies} style={navBtnStyle(activeTab === 'movies')}>Movies</button>
          <button onClick={() => loadA2Z('a')} style={navBtnStyle(activeTab === 'a2z')}>A-Z</button>
        </nav>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="Search Hindi Anime..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #333', background: '#1a1a24', color: '#fff' }}
          />
          <button type="submit" style={{ padding: '8px 15px', background: '#ff4757', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Search</button>
        </form>
      </header>

      {/* A-Z Bar */}
      {activeTab === 'a2z' && (
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {["0-9", ..."abcdefghijklmnopqrstuvwxyz".split("")].map((char) => (
            <button 
              key={char} 
              onClick={() => loadA2Z(char)}
              style={{ padding: '5px 10px', background: selectedLetter === char ? '#ff4757' : '#1a1a24', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
            >
              {char.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Player Section */}
      {streamData && (
        <div style={{ marginBottom: '30px', background: '#1a1a24', padding: '15px', borderRadius: '10px' }}>
          <iframe src={streamData.streamLink} style={{ width: '100%', height: '420px', border: 'none', borderRadius: '8px' }} allowFullScreen />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            {streamData.file && (
              <a href={streamData.file} target="_blank" rel="noreferrer" style={{ padding: '8px 15px', background: '#2ed573', color: '#fff', textDecoration: 'none', borderRadius: '5px' }}>
                Download Episode
              </a>
            )}
            <button onClick={() => setStreamData(null)} style={{ padding: '8px 15px', background: '#ff4757', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Close Player</button>
          </div>
        </div>
      )}

      {/* Series Details, Seasons & Episodes */}
      {selectedSeries && (
        <div style={{ background: '#16161e', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
          <h2>{selectedSeries.title}</h2>
          <p style={{ color: '#aaa' }}>{selectedSeries.description}</p>
          
          <h3>Seasons</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
            {seasons.map((s) => (
              <button key={s.seasonId} onClick={() => loadEpisodes(s.seasonId)} style={{ padding: '8px 12px', background: '#2f3542', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                {s.seasonName}
              </button>
            ))}
          </div>

          {episodes.length > 0 && (
            <div>
              <h3>Episodes</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                {episodes.map((ep) => (
                  <div key={ep.episodeId} onClick={() => playContent(ep.episodeId, false)} style={{ background: '#1a1a24', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}>
                    <strong>{ep.episodeNumber}: {ep.title}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Grid View */}
      <h2>{activeTab.toUpperCase()} Section</h2>
      {loading ? (
        <p>Loading Content...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px' }}>
          {dataList.map((item, index) => {
            const isMovie = item.type === 'movie' || Boolean(item.movieId);
            const id = item.seriesId || item.movieId || item.id;
            
            return (
              <div 
                key={index} 
                onClick={() => isMovie ? playContent(id, true) : openSeriesDetail(id)}
                style={{ background: '#1a1a24', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }}
              >
                <img src={item.image || item.poster || "https://via.placeholder.com/160x220"} alt={item.title} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                <div style={{ padding: '10px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: '#aaa', marginTop: '5px' }}>{item.year} {item.rating && `• ${item.rating}`}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const navBtnStyle = (active: boolean) => ({
  padding: '8px 15px',
  background: active ? '#ff4757' : '#1a1a24',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
});
  
