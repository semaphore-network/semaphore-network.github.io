import React, { useState, useRef, useEffect } from 'react'
import Select from 'react-select'
import { Sun, Moon } from 'lucide-react'
import './App.css'
import { telegraphes } from './data/telegraphes'

function App() {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const [selected, setSelected] = useState(null)
  const [filteredType, setFilteredType] = useState(null)
  const [filteredState, setFilteredState] = useState(null)
  const [darkMode, setDarkMode] = useState(false)

  const types = [...new Set(telegraphes.map(t => t.type))].map(t => ({value: t, label: t}))
  const states = [...new Set(telegraphes.map(t => t.etat))].map(s => ({value: s, label: s}))

  const filtered = telegraphes.filter(t => {
    if (filteredType && t.type !== filteredType.value) return false
    if (filteredState && t.etat !== filteredState.value) return false
    return true
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }
  }, [darkMode])

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return
    if (typeof window !== 'undefined' && window.L) {
      const map = window.L.map(mapRef.current).setView([46.5, 2.5], 6)
      window.L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 20
      }).addTo(map)
      mapInstance.current = map
    }
  }, [])

  useEffect(() => {
    if (!mapInstance.current || !window.L) return
    mapInstance.current.eachLayer(layer => {
      if (layer instanceof window.L.CircleMarker) mapInstance.current.removeLayer(layer)
    })
    
    filtered.forEach(t => {
      const marker = window.L.circleMarker([t.lat, t.lng], {
        radius: selected?.id === t.id ? 12 : 8,
        fillColor: t.couleur,
        color: selected?.id === t.id ? '#000' : '#fff',
        weight: selected?.id === t.id ? 3 : 2,
        fillOpacity: 0.85
      }).addTo(mapInstance.current)

      marker.on('click', () => setSelected(t))
      marker.bindPopup(`<strong>${t.nom}</strong><br/>${t.region}`)
    })
  }, [filtered, selected])

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <div className="navbar">
        <div className="navbar-left">
          <img src="https://static.vecteezy.com/system/resources/thumbnails/016/720/428/small/france-flag-french-flag-wind-flag-revolution-war-french-revolution-revolution-flag-png.png" alt="France" className="flag-icon" />
          <span className="navbar-title">Télégraphes de Chappe</span>
        </div>
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="main-content">
        <div className="map-wrapper">
          <div ref={mapRef} className="map"></div>
          <div className="legend-box">
            <div className="legend-header">
              <h3>État de conservation</h3>
            </div>
            <div className="legend-items">
              <div className="legend-item">
                <span style={{backgroundColor: '#D4AF37'}}></span>
                <span>Restauré</span>
              </div>
              <div className="legend-item">
                <span style={{backgroundColor: '#8B6F47'}}></span>
                <span>Vestiges</span>
              </div>
              <div className="legend-item">
                <span style={{backgroundColor: '#A9A9A9'}}></span>
                <span>Disparu</span>
              </div>
            </div>
          </div>
        </div>

        <aside className="sidebar-wrapper">
          <div className="sidebar-header">
            <h2>Stations ({filtered.length})</h2>
          </div>

          <div className="filters-section">
            <div className="filter-group">
              <label>Type de structure</label>
              <Select
                options={types}
                value={filteredType}
                onChange={setFilteredType}
                isClearable
                placeholder="Tous les types"
                classNamePrefix="select"
              />
            </div>
            <div className="filter-group">
              <label>État</label>
              <Select
                options={states}
                value={filteredState}
                onChange={setFilteredState}
                isClearable
                placeholder="Tous les états"
                classNamePrefix="select"
              />
            </div>
          </div>

          <div className="stations-scroll">
            {filtered.map(t => (
              <button
                key={t.id}
                className={`station-btn ${selected?.id === t.id ? 'active' : ''}`}
                onClick={() => setSelected(t)}
                style={{borderLeftColor: t.couleur}}
              >
                <div className="station-name">{t.nom}</div>
                <div className="station-meta">{t.region} • {t.annee}</div>
              </button>
            ))}
          </div>

          {selected && (
            <div className="details-section">
              <div className="details-header">
                <h3>{selected.nom}</h3>
                <p>{selected.region}</p>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <label>Année</label>
                  <value>{selected.annee}</value>
                </div>
                <div className="detail-item">
                  <label>Altitude</label>
                  <value>{selected.altitude}m</value>
                </div>
                <div className="detail-item">
                  <label>Diamètre</label>
                  <value>{selected.diametre}m</value>
                </div>
                <div className="detail-item">
                  <label>Hauteur</label>
                  <value>{selected.hauteur}m</value>
                </div>
              </div>

              <div className="detail-full">
                <label>Type</label>
                <value>{selected.type}</value>
              </div>
              <div className="detail-full">
                <label>Ligne</label>
                <value>{selected.ligne}</value>
              </div>
              <div className="detail-full">
                <label>État</label>
                <value>{selected.etat}</value>
              </div>

              <div className="action-buttons">
                <a href={`https://www.google.com/maps/search/${selected.nom}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary">📍 Maps</a>
                <a href={`https://www.openstreetmap.org/?mlat=${selected.lat}&mlon=${selected.lng}&zoom=15`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">🗺️ OSM</a>
              </div>
            </div>
          )}
        </aside>
      </div>

      <footer className="app-footer">
        <i>Contact : <a href="mailto:data@caslu.fr"> data@caslu.fr</a></i>
      </footer>
    </div>
  )
}

export default App
