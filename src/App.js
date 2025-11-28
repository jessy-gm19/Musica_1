
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('todas');
  const [activeSection, setActiveSection] = useState('inicio');
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [miMusicas, setMiMusicas] = useState([]);
  const [favoritas, setFavoritas] = useState([]);
  const [albumes, setAlbumes] = useState([]);
  const [formData, setFormData] = useState({
    titulo: '',
    artista: '',
    album: '',
    duracion: ''
  });

  const tabs = ['todas', 'canciones', 'podcasts', 'álbumes'];
  const carouselItems = [
    { id: 1, title: 'Melanie Martinez', image: 'https://m.media-amazon.com/images/M/MV5BNDQ2MDI3YTMtZjhmMS00YzdlLTg0ZDYtZWVjMjYzODJiYjk3XkEyXkFqcGc@._V1_.jpg' },
    { id: 2, title: 'Black Pink', image: 'https://i.ytimg.com/vi/vRXZj0DzXIA/maxresdefault.jpg' },
    { id: 3, title: 'Sailor Moon', image: 'https://i.pinimg.com/736x/5c/55/d6/5c55d6c7998f750f1d29de52f396b671.jpg' },
    { id: 4, title: 'Piratas del Caribe', image: 'https://i.blogs.es/13b8c5/piratascaribe/1366_2000.jpg' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselItems.length]);

  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm.trim()) { setResults([]); return; }
      try {
        const res = await fetch(
          `http://localhost/examen-spotify/backend/Api.php?action=search&q=${encodeURIComponent(searchTerm)}&type=${activeTab}`
        );
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error en búsqueda:', err);
        setResults([]);
      }
    };

    if (activeSection === 'buscar') performSearch();
  }, [searchTerm, activeTab, activeSection]);

  const fetchMiMusicas = async () => {
    try {
      const res = await fetch('http://localhost/examen-spotify/backend/Api.php?action=getMiMusicas');
      const data = await res.json();
      setMiMusicas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error mi músicas:', err);
      setMiMusicas([]);
    }
  };

  const fetchFavoritas = async () => {
    try {
      const res = await fetch('http://localhost/examen-spotify/backend/Api.php?action=getFavoritas');
      const data = await res.json();
      setFavoritas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error favoritas:', err);
      setFavoritas([]);
    }
  };

  const fetchAlbumes = async () => {
    try {
      const res = await fetch('http://localhost/examen-spotify/backend/Api.php?action=getAlbumes');
      const data = await res.json();
      setAlbumes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error álbumes:', err);
      setAlbumes([]);
    }
  };

  useEffect(() => {
    if (activeSection === 'mis-musicas') fetchMiMusicas();
    if (activeSection === 'favoritas') fetchFavoritas();
    if (activeSection === 'albumes') fetchAlbumes();
  }, [activeSection]);

  const handleTabClick = (tab) => setActiveTab(tab);
  const handleMenuClick = (section) => { setActiveSection(section); setSearchTerm(''); };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost/examen-spotify/backend/Api.php?action=addSong', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setFormData({ titulo: '', artista: '', album: '', duracion: '' });
        if (activeSection === 'mis-musicas') fetchMiMusicas();
        alert('Canción agregada');
      } else {
        alert('Error al agregar canción');
      }
    } catch (err) {
      console.error(err);
      alert('Error al agregar canción');
    }
  };

  const addToFavorites = async (id) => {
    try {
      const res = await fetch('http://localhost/examen-spotify/backend/Api.php?action=addToFavorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) fetchFavoritas();
    } catch (err) { console.error(err); }
  };

  const deleteCancion = async (id) => {
    if (!window.confirm('Eliminar canción?')) return;
    try {
      const res = await fetch('http://localhost/examen-spotify/backend/Api.php?action=deleteCancion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) fetchMiMusicas();
    } catch (err) { console.error(err); }
  };

  const prevCarousel = () => setCarouselIndex(prev => (prev - 1 + carouselItems.length) % carouselItems.length);
  const nextCarousel = () => setCarouselIndex(prev => (prev + 1) % carouselItems.length);

  return (
    <div className="spotify">
      <aside className="sidebar">
        <div className="logo">🎵 Spotify</div>
        <nav>
          <ul>
            <li onClick={() => handleMenuClick('inicio')} className={activeSection === 'inicio' ? 'active' : ''}>🏠 Inicio</li>
            <li onClick={() => handleMenuClick('buscar')} className={activeSection === 'buscar' ? 'active' : ''}>🔍 Buscar</li>
            <li onClick={() => handleMenuClick('biblioteca')} className={activeSection === 'biblioteca' ? 'active' : ''}>📚 Tu biblioteca</li>
          </ul>
        </nav>
        <div className="playlist-section">
          <div className="playlist-title">📋 Playlists</div>
          <ul>
            <li onClick={() => handleMenuClick('mis-musicas')}>🎵 Mis músicas</li>
            <li onClick={() => handleMenuClick('favoritas')}>⭐ Favoritas</li>
            <li onClick={() => handleMenuClick('albumes')}>💿 Álbumes</li>
          </ul>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          {activeSection === 'buscar' && (
            <input
              className="search-input"
              type="text"
              placeholder="🔍 Buscar por artistas, canciones o podcasts"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          )}
        </header>

        <section className="content-section">
          {activeSection === 'inicio' && (
            <div>
              <h2>🎉 Bienvenido a Spotify</h2>
              <div className="carousel">
                <button className="carousel-btn prev" onClick={prevCarousel}>❮</button>
                <div className="carousel-container">
                  <img src={carouselItems[carouselIndex].image} alt={carouselItems[carouselIndex].title} className="carousel-image" />
                  <div className="carousel-title">{carouselItems[carouselIndex].title}</div>
                </div>
                <button className="carousel-btn next" onClick={nextCarousel}>❯</button>
              </div>
            </div>
          )}

          {activeSection === 'buscar' && (
            <div>
              <div className="category-tabs">
                {tabs.map(tab => (
                  <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => handleTabClick(tab)}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              <div className="cards-row">
                {results.length > 0 ? results.map(item => (
                  <div key={item.id} className="card">
                    <img src={item.imagen || 'https://via.placeholder.com/150'} alt={item.artista} />
                    <p><strong>{item.titulo}</strong></p>
                    <p>{item.artista}</p>
                    <button className="favorite-btn" onClick={() => addToFavorites(item.id)}>⭐ Favorita</button>
                  </div>
                )) : (
                  <>
                    <div className="card"><img src="https://static.spin.com/files/2015/11/melanie-martinez-soap-training-wheels-music-video.png" alt="Melanie" /><p>Melanie Martinez</p></div>
                    <div className="card"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTALuLKsdAsSeMwseePMrFFgzQz7goIDl0tiQ&s" alt="Black Pink" /><p>Black Pink</p></div>
                    <div className="card"><img src="https://mediaproxy.tvtropes.org/width/1200/https://static.tvtropes.org/pmwiki/pub/images/sailormoongroup.png" alt="Sailor Moon" /><p>Sailor Moon</p></div>
                    <div className="card"><img src="https://m.media-amazon.com/images/S/pv-target-images/201f12fbed17f0265c2041d102b8525ee610a2c99923dedb9b0b8f3887fe8c6b.jpg" alt="Piratas" /><p>Piratas del Caribe</p></div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeSection === 'biblioteca' && (
            <div>
              <h2>➕ Agregar Nueva Canción</h2>
              <form className="song-form" onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label>Título de la canción:</label>
                  <input type="text" name="titulo" value={formData.titulo} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Artista:</label>
                  <input type="text" name="artista" value={formData.artista} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Álbum:</label>
                  <input type="text" name="album" value={formData.album} onChange={handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Duración (mm:ss):</label>
                  <input type="text" name="duracion" value={formData.duracion} onChange={handleFormChange} placeholder="3:45" />
                </div>
                <button type="submit" className="submit-btn">Agregar Canción</button>
              </form>
            </div>
          )}

          {activeSection === 'mis-musicas' && (
            <div>
              <h2>Mis Músicas</h2>
              {miMusicas.length === 0 ? (
                <p>No tienes canciones guardadas.</p>
              ) : (
                <div className="cards-row">
                  {miMusicas.map(item => (
                    <div key={item.id} className="card">
                      <img src={item.imagen || 'https://via.placeholder.com/150'} alt={item.artista} />
                      <p><strong>{item.titulo}</strong></p>
                      <p>{item.artista}</p>
                      <button className="delete-btn" onClick={() => deleteCancion(item.id)}>🗑️ Eliminar</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'favoritas' && (
            <div>
              <h2>Canciones Favoritas</h2>
              {favoritas.length === 0 ? (
                <p>No tienes canciones favoritas.</p>
              ) : (
                <div className="cards-row">
                  {favoritas.map(item => (
                    <div key={item.id} className="card">
                      <img src={item.imagen || 'https://via.placeholder.com/150'} alt={item.artista} />
                      <p><strong>{item.titulo}</strong></p>
                      <p>{item.artista}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'albumes' && (
            <div>
              <h2>Mis Álbumes</h2>
              {albumes.length === 0 ? (
                <p>No tienes álbumes guardados.</p>
              ) : (
                <div className="cards-row">
                  {albumes.map(item => (
                    <div key={item.id} className="card">
                      <img src={item.imagen || 'https://via.placeholder.com/150'} alt={item.artista} />
                      <p><strong>{item.titulo}</strong></p>
                      <p>{item.artista}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;