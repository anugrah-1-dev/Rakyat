import { useEffect } from 'react';
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { LayersControl, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { Crosshair, MapPinOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { StatusBadge } from './Badges';

L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

const CENTER = [-7.7956, 110.3695];
const selectedIcon = L.divIcon({ className: '', html: '<span class="map-pin map-pin-user"></span>', iconSize: [34, 42], iconAnchor: [17, 38], popupAnchor: [0, -36] });

function ClickPicker({ enabled, onChange }) {
  useMapEvents({ click: (event) => enabled && onChange?.({ lat: event.latlng.lat, lng: event.latlng.lng }) });
  return null;
}

function Recenter({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location) map.flyTo([location.lat, location.lng], Math.max(map.getZoom(), 15), { duration: 0.7 });
  }, [location, map]);
  return null;
}

export default function MapView({ markers = [], location, onChange, interactive = false, className = 'h-[520px]' }) {
  const locate = () => {
    if (!navigator.geolocation) return toast.error('Peramban tidak mendukung geolokasi.');
    const id = toast.loading('Mengambil posisi GPS...');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        onChange?.({ lat: coords.latitude, lng: coords.longitude });
        toast.success('Lokasi GPS berhasil ditandai.', { id });
      },
      () => toast.error('Lokasi tidak dapat diakses. Periksa izin GPS.', { id }),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="relative h-full min-h-0 overflow-hidden rounded-[20px] bg-slate-200">
      <MapContainer center={location ? [location.lat, location.lng] : CENTER} zoom={11} scrollWheelZoom className={`w-full ${className}`}>
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Carto Light">
            <TileLayer attribution="&copy; OpenStreetMap &copy; CARTO" url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Carto Dark">
            <TileLayer attribution="&copy; OpenStreetMap &copy; CARTO" url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Citra Satelit">
            <TileLayer attribution="Tiles &copy; Esri" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          </LayersControl.BaseLayer>
        </LayersControl>
        <ClickPicker enabled={interactive} onChange={onChange} />
        <Recenter location={location} />
        {markers.filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude)).map((item) => (
          <Marker key={item.id} position={[item.latitude, item.longitude]}>
            <Popup>
              <div className="min-w-[190px]">
                <StatusBadge status={item.status} />
                <strong className="mt-2 block text-sm leading-5 text-slate-900">{item.title}</strong>
                <span className="mt-1 block text-xs text-slate-500">{item.village?.name}, {item.regency?.name}</span>
                <Link to={`/aspirasi/${item.id}`} className="mt-2 inline-block text-xs font-bold text-blue-600">Lihat detail &rarr;</Link>
              </div>
            </Popup>
          </Marker>
        ))}
        {location && <Marker position={[location.lat, location.lng]} icon={selectedIcon}><Popup><strong>Lokasi kejadian</strong><br /><span className="text-xs">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</span></Popup></Marker>}
      </MapContainer>
      {interactive && (
        <div className="absolute bottom-4 left-4 z-[500] flex flex-wrap gap-2">
          <button type="button" onClick={locate} className="inline-flex items-center gap-2 rounded-xl bg-civic-950 px-3.5 py-2.5 text-xs font-bold text-white shadow-lg"><Crosshair size={15} /> Gunakan GPS</button>
          {location && <button type="button" onClick={() => onChange?.(null)} className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-xs font-bold text-rose-600 shadow-lg"><MapPinOff size={15} /> Hapus titik</button>}
        </div>
      )}
      {interactive && !location && <div className="pointer-events-none absolute left-1/2 top-4 z-[500] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-center text-xs font-bold text-slate-700 shadow-lg">Klik peta untuk menandai lokasi</div>}
    </div>
  );
}
