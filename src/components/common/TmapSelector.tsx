import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

interface TmapSelectorProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect: (lat: number, lon: number) => void;
  height?: string;
}

declare global {
  interface Window {
    Tmapv3: any;
    Tmapvector: any;
  }
}

// TMAP Vector JS API 키 (환경변수에서 가져오기)
const TMAP_JS_API_KEY = import.meta.env.VITE_TMAP_JS_API_KEY;

if (!TMAP_JS_API_KEY) {
  console.warn('[TMAP] VITE_TMAP_JS_API_KEY 환경변수가 설정되지 않았습니다.');
}

const TmapSelector: React.FC<TmapSelectorProps> = ({
  latitude,
  longitude,
  onLocationSelect,
  height = '360px'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // TMAP SDK가 로드될 때까지 대기 (main.tsx에서 스크립트가 로드됨)
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // 이미 Tmapv3가 있으면 완료
    if (window.Tmapv3 && window.Tmapv3.Map && window.Tmapv3.LatLng) {
      console.log('[TMAP] ✅ SDK 이미 로드됨');
      setMapReady(true);
      return;
    }

    // 스크립트가 로드될 때까지 대기
    let checkCount = 0;
    const maxChecks = 100; // 10초 타임아웃
    
    const checkInterval = window.setInterval(() => {
      checkCount++;
      
      if (window.Tmapv3 && window.Tmapv3.Map && window.Tmapv3.LatLng) {
        console.log('[TMAP] ✅ SDK 로드 완료');
        setMapReady(true);
        window.clearInterval(checkInterval);
      } else if (checkCount >= maxChecks) {
        console.error('[TMAP] ❌ SDK 객체를 찾을 수 없습니다 (타임아웃)');
        window.clearInterval(checkInterval);
        setError('TMAP SDK가 로드되지 않았습니다. 페이지를 새로고침해주세요.');
      }
    }, 100);

    return () => {
      window.clearInterval(checkInterval);
    };
  }, []);

  // 클릭 핸들러를 ref로 저장하여 의존성 문제 해결
  const clickHandlerRef = useRef<(lat: number, lon: number) => void>(onLocationSelect);
  
  useEffect(() => {
    clickHandlerRef.current = onLocationSelect;
  }, [onLocationSelect]);

  // 지도 초기화
  useEffect(() => {
    // Tmapv3 또는 Tmapvector 확인
    const tmap = window.Tmapv3 || window.Tmapvector;
    
    if (!mapReady || !containerRef.current || !tmap) {
      return;
    }

    // 컨테이너가 DOM에 있는지 확인
    if (!containerRef.current.parentElement) {
      console.warn('[TMAP] 컨테이너가 DOM에 없습니다');
      return;
    }

    // SDK가 완전히 로드되었는지 확인
    if (!tmap.Map || !tmap.LatLng) {
      console.warn('[TMAP] SDK가 아직 완전히 로드되지 않았습니다.');
      return;
    }

    try {
      const centerLat = latitude ?? 37.5665;
      const centerLon = longitude ?? 126.9780;

      // 기존 지도가 있으면 제거하고 새로 생성
      if (mapRef.current) {
        try {
          mapRef.current.destroy?.();
        } catch (e) {
          console.warn('[TMAP] 기존 지도 제거 실패:', e);
        }
        mapRef.current = null;
      }

      console.log('[TMAP] 새 지도 생성 시작');

      // Tmapv3 또는 Tmapvector로 지도 생성
      const Tmap = tmap;
      mapRef.current = new Tmap.Map(containerRef.current, {
        center: new Tmap.LatLng(centerLat, centerLon),
        width: '100%',
        height,
        zoom: 15
      });

      // ConfigLoad 이벤트 대기 (공식 문서 권장 방식)
      mapRef.current.on('ConfigLoad', () => {
        console.log('[TMAP] 지도 설정 로드 완료');

        // 초기 마커가 있으면 표시
        if (latitude && longitude && Tmap.Marker) {
          try {
            markerRef.current = new Tmap.Marker({
              position: new Tmap.LatLng(latitude, longitude),
              map: mapRef.current
            });
            console.log('[TMAP] 초기 마커 생성 완료');
          } catch (e) {
            console.error('[TMAP] 마커 생성 에러:', e);
          }
        }

        // 지도 클릭 이벤트 등록
        mapRef.current.on('click', (evt: any) => {
          try {
            const lat = evt.latLng?.lat() ?? evt.latLng?._lat;
            const lon = evt.latLng?.lng() ?? evt.latLng?._lng;

            if (!lat || !lon) {
              console.error('[TMAP] 좌표를 가져올 수 없습니다:', evt);
              return;
            }

            // 기존 마커 제거
            if (markerRef.current) {
              markerRef.current.setMap(null);
            }

            // 새 마커 생성
            if (Tmap.Marker) {
              markerRef.current = new Tmap.Marker({
                position: new Tmap.LatLng(lat, lon),
                map: mapRef.current
              });
            }

            clickHandlerRef.current(lat, lon);
          } catch (e) {
            console.error('[TMAP] 클릭 핸들러 에러:', e);
          }
        });
      });

      console.log('[TMAP] 지도 초기화 완료');

      return () => {
        // cleanup: 지도 제거
        if (mapRef.current) {
          try {
            mapRef.current.destroy?.();
          } catch (e) {
            console.warn('[TMAP] 지도 제거 실패:', e);
          }
          mapRef.current = null;
        }
        markerRef.current = null;
      };
    } catch (error) {
      console.error('[TMAP] 지도 초기화 에러:', error);
      setError(`지도 초기화 실패: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [mapReady, height]);

  // 외부에서 위치가 변경되면 마커 이동
  useEffect(() => {
    const tmap = window.Tmapv3 || window.Tmapvector;
    if (!mapRef.current || !tmap || latitude === undefined || longitude === undefined) return;

    const position = new tmap.LatLng(latitude, longitude);

    if (markerRef.current) {
      markerRef.current.setPosition(position);
    } else if (tmap.Marker) {
      markerRef.current = new tmap.Marker({
        position,
        map: mapRef.current
      });
    }

    mapRef.current.setCenter(position);
  }, [latitude, longitude]);

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="w-full rounded-lg border border-gray-200"
        style={{ height }}
      >
        {error ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-sm text-red-600">
              <MapPin className="mx-auto mb-2 h-6 w-6 text-red-400" />
              <p className="font-medium">{error}</p>
              <p className="mt-2 text-xs text-gray-500">
                콘솔을 확인하거나 API 키 설정을 확인해주세요.
              </p>
            </div>
          </div>
        ) : !mapReady ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-sm text-gray-500">
              <MapPin className="mx-auto mb-2 h-6 w-6 text-gray-400 animate-pulse" />
              TMAP 지도를 불러오는 중입니다...
            </div>
          </div>
        ) : null}
      </div>
      {mapReady && (
        <p className="mt-2 text-xs text-gray-500">
          지도를 클릭하여 위치를 선택하세요.
        </p>
      )}
    </div>
  );
};

export default TmapSelector;

