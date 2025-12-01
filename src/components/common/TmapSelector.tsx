import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin } from 'lucide-react';
import type { CustodyLocation } from '../../apis/custodyLocation';

interface TmapSelectorProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect: (lat: number, lon: number) => void;
  height?: string;
  nearbyLocations?: CustodyLocation[];
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
  height = '360px',
  nearbyLocations = []
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const nearbyMarkersRef = useRef<any[]>([]);
  const polylinesRef = useRef<any[]>([]); // 경로 폴리라인 저장
  const [mapReady, setMapReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showRoutes, setShowRoutes] = useState<boolean>(true); // 경로 표시 여부 (기본값 true로 변경)
  const [loadingRoutes, setLoadingRoutes] = useState<boolean>(false); // 경로 로딩 중

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

        // 초기 마커가 있으면 표시 (현재 위치/선택 위치)
        if (latitude && longitude && Tmap.Marker) {
          try {
            // 기본 마커 사용 (icon 옵션 없이)
            markerRef.current = new Tmap.Marker({
              position: new Tmap.LatLng(latitude, longitude),
              map: mapRef.current,
              title: '현재 위치'
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

            // 새 마커 생성 (선택 위치)
            if (Tmap.Marker) {
              markerRef.current = new Tmap.Marker({
                position: new Tmap.LatLng(lat, lon),
                map: mapRef.current,
                title: '선택한 위치'
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
            // 주변 마커들 제거
            nearbyMarkersRef.current.forEach(marker => {
              try {
                marker.setMap(null);
              } catch (e) {
                console.warn('[TMAP] 주변 마커 제거 실패:', e);
              }
            });
            nearbyMarkersRef.current = [];
            
            // 폴리라인 제거
            polylinesRef.current.forEach(polyline => {
              try {
                polyline.setMap(null);
              } catch (e) {
                console.warn('[TMAP] 폴리라인 제거 실패:', e);
              }
            });
            polylinesRef.current = [];
            
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
        map: mapRef.current,
        title: '현재 위치'
      });
    }

    mapRef.current.setCenter(position);
  }, [latitude, longitude]);

  // TMap API로 도보 경로 가져오기
  const fetchWalkingRoute = async (startLat: number, startLon: number, endLat: number, endLon: number) => {
    const TMAP_REST_API_KEY = import.meta.env.VITE_TMAP_REST_API_KEY || import.meta.env.VITE_TMAP_JS_API_KEY;
    
    if (!TMAP_REST_API_KEY) {
      console.warn('[TMAP] TMap REST API 키가 설정되지 않았습니다.');
      return null;
    }

    try {
      const response = await fetch('https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1', {
        method: 'POST',
        headers: {
          'appKey': TMAP_REST_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startX: String(startLon),
          startY: String(startLat),
          endX: String(endLon),
          endY: String(endLat),
          reqCoordType: 'WGS84GEO',
          resCoordType: 'WGS84GEO',
          startName: '출발지',
          endName: '도착지',
          searchOption: '0'
        })
      });

      if (!response.ok) {
        console.error('[TMAP] 경로 API 호출 실패:', response.status);
        return null;
      }

      const data = await response.json();
      console.log('[TMAP] 경로 API 응답:', data);
      
      if (data.features && data.features.length > 0) {
        // 모든 LineString 타입의 geometry에서 coordinates 수집
        const allCoordinates: number[][] = [];
        
        data.features.forEach((feature: any) => {
          if (feature.geometry?.type === 'LineString' && feature.geometry?.coordinates) {
            // LineString의 coordinates는 이미 배열의 배열 형태
            allCoordinates.push(...feature.geometry.coordinates);
          } else if (feature.geometry?.type === 'MultiLineString' && feature.geometry?.coordinates) {
            // MultiLineString의 경우 각 LineString의 coordinates를 합침
            feature.geometry.coordinates.forEach((lineString: number[][]) => {
              allCoordinates.push(...lineString);
            });
          }
        });
        
        if (allCoordinates.length > 0) {
          console.log('[TMAP] 수집된 좌표 개수:', allCoordinates.length);
          return allCoordinates; // [[lon, lat], [lon, lat], ...] 형식
        }
      }
      
      console.warn('[TMAP] 경로 좌표를 찾을 수 없습니다. 응답:', data);
      return null;
    } catch (error) {
      console.error('[TMAP] 경로 가져오기 에러:', error);
      return null;
    }
  };

  // 도보 경로 시각화
  const drawWalkingRoutes = useCallback(async () => {
    const tmap = window.Tmapv3 || window.Tmapvector;
    if (!mapRef.current || !tmap || !nearbyLocations || nearbyLocations.length === 0) {
      return;
    }

    if (!latitude || !longitude) {
      console.warn('[TMAP] 출발지 좌표가 없습니다.');
      return;
    }

    setLoadingRoutes(true);

    // 기존 폴리라인 제거
    polylinesRef.current.forEach(polyline => {
      try {
        polyline.setMap(null);
      } catch (e) {
        console.warn('[TMAP] 폴리라인 제거 실패:', e);
      }
    });
    polylinesRef.current = [];

    try {
      // 각 보관소까지의 경로를 그리기
      for (let i = 0; i < Math.min(nearbyLocations.length, 5); i++) { // 최대 5개까지만
        const location = nearbyLocations[i];
        if (!location.latitude || !location.longitude) continue;

        const coordinates = await fetchWalkingRoute(
          latitude,
          longitude,
          location.latitude,
          location.longitude
        );

        if (coordinates && coordinates.length > 0) {
          console.log(`[TMAP] 경로 ${i + 1} 좌표 개수:`, coordinates.length);
          
          // 폴리라인 생성 (진한 빨간색으로 통일, 더 잘 보이게 설정)
          const routeColor = '#DC2626'; // 진한 빨간색 (red-600)
          const routeWeight = 6; // 두께 증가
          const routeOpacity = 0.95; // 불투명도 증가
          
          // TMapv3와 Tmapvector 모두 지원
          let polyline: any = null;
          
          // TMapv3 API 확인
          console.log('[TMAP] 사용 가능한 API:', {
            Polyline: !!tmap.Polyline,
            MultiPolyline: !!tmap.MultiPolyline,
            TMapv3: !!window.Tmapv3,
            Tmapvector: !!window.Tmapvector,
            Map: !!tmap.Map
          });
          
          // TMap Vector API의 경우 다른 방식 사용
          if (window.Tmapvector && !window.Tmapv3) {
            // TMap Vector API 사용
            try {
              // 좌표를 LatLng 배열로 변환
              const path = coordinates.map((coord: number[]) => 
                new tmap.LatLng(coord[1], coord[0]) // [lon, lat] -> LatLng(lat, lon)
              );
              
              if (tmap.Polyline) {
                polyline = new tmap.Polyline({
                  path: path,
                  strokeColor: routeColor,
                  strokeWeight: routeWeight,
                  strokeOpacity: routeOpacity,
                  map: mapRef.current
                });
                console.log(`[TMAP] Vector Polyline 생성 성공 (경로 ${i + 1})`);
              }
            } catch (e) {
              console.warn(`[TMAP] Vector Polyline 생성 실패 (경로 ${i + 1}):`, e);
            }
          } else {
            // TMapv3 API 사용
            // 좌표를 TMap LatLng 배열로 변환
            const path = coordinates.map((coord: number[]) => 
              new tmap.LatLng(coord[1], coord[0]) // [lon, lat] -> LatLng(lat, lon)
            );
            
            // 방법 1: TMapv3.Polyline 시도
            if (tmap.Polyline) {
              try {
                polyline = new tmap.Polyline({
                  path: path,
                  strokeColor: routeColor,
                  strokeWeight: routeWeight,
                  strokeOpacity: routeOpacity,
                  map: mapRef.current
                });
                console.log(`[TMAP] Polyline 생성 성공 (경로 ${i + 1})`);
              } catch (e) {
                console.warn(`[TMAP] Polyline 생성 실패 (경로 ${i + 1}):`, e);
                console.warn('[TMAP] 에러 상세:', e);
              }
            }
            
            // 방법 2: TMapv3.MultiPolyline 시도
            if (!polyline && tmap.MultiPolyline) {
              try {
                polyline = new tmap.MultiPolyline({
                  path: path,
                  strokeColor: routeColor,
                  strokeWeight: routeWeight,
                  strokeOpacity: routeOpacity,
                  map: mapRef.current
                });
                console.log(`[TMAP] MultiPolyline 생성 성공 (경로 ${i + 1})`);
              } catch (e) {
                console.warn(`[TMAP] MultiPolyline 생성 실패 (경로 ${i + 1}):`, e);
              }
            }

            // 방법 3: 직접 좌표 배열 사용 시도
            if (!polyline && tmap.Polyline) {
              try {
                // 좌표 배열을 직접 전달
                const pathArray = coordinates.map((coord: number[]) => [coord[1], coord[0]]);
                polyline = new tmap.Polyline({
                  path: pathArray,
                  strokeColor: routeColor,
                  strokeWeight: routeWeight,
                  strokeOpacity: routeOpacity,
                  map: mapRef.current
                });
                console.log(`[TMAP] Polyline 생성 성공 (방법3, 경로 ${i + 1})`);
              } catch (e) {
                console.warn(`[TMAP] Polyline 생성 실패 (방법3, 경로 ${i + 1}):`, e);
              }
            }
          }

          if (polyline) {
            polylinesRef.current.push(polyline);
            console.log(`[TMAP] 경로 ${i + 1} 추가 완료, polyline 객체:`, polyline);
            
            // 지도에 표시되는지 확인하기 위해 지도 범위 조정 (LatLngBounds가 있는 경우만)
            if (coordinates.length > 0 && tmap.LatLngBounds) {
              try {
                const bounds = new tmap.LatLngBounds();
                coordinates.forEach((coord: number[]) => {
                  bounds.extend(new tmap.LatLng(coord[1], coord[0]));
                });
                // 출발지와 도착지도 포함
                bounds.extend(new tmap.LatLng(latitude, longitude));
                bounds.extend(new tmap.LatLng(location.latitude, location.longitude));
                
                if (mapRef.current.fitBounds) {
                  mapRef.current.fitBounds(bounds);
                }
              } catch (e) {
                console.warn('[TMAP] fitBounds 실패:', e);
              }
            }
            
            // polyline이 실제로 지도에 추가되었는지 확인
            if (polyline.getMap && polyline.getMap() !== mapRef.current) {
              console.warn(`[TMAP] 경로 ${i + 1}이 지도에 제대로 추가되지 않았습니다.`);
              polyline.setMap(mapRef.current);
            }
          } else {
            console.warn(`[TMAP] 경로 ${i + 1}을 생성할 수 없습니다. TMap API 버전을 확인해주세요.`);
            console.warn('[TMAP] 사용 가능한 객체:', Object.keys(tmap));
            console.warn('[TMAP] tmap.Polyline 타입:', typeof tmap.Polyline);
            if (tmap.Polyline) {
              console.warn('[TMAP] Polyline 생성자:', tmap.Polyline.toString().substring(0, 200));
            }
          }
        } else {
          console.warn(`[TMAP] 경로 ${i + 1}의 좌표가 없습니다.`);
        }

        // API 호출 제한을 위한 딜레이
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      console.log(`[TMAP] 경로 ${polylinesRef.current.length}개 그리기 완료`);
    } catch (e) {
      console.error('[TMAP] 경로 그리기 에러:', e);
    } finally {
      setLoadingRoutes(false);
    }
  }, [nearbyLocations, latitude, longitude]);

  // 경로 표시 토글 및 자동 그리기
  useEffect(() => {
    if (showRoutes && nearbyLocations.length > 0 && latitude && longitude) {
      // nearbyLocations가 변경되면 자동으로 경로 그리기
      drawWalkingRoutes();
    } else {
      // 경로 숨기기
      polylinesRef.current.forEach(polyline => {
        try {
          polyline.setMap(null);
        } catch (e) {
          console.warn('[TMAP] 폴리라인 제거 실패:', e);
        }
      });
      polylinesRef.current = [];
    }
  }, [showRoutes, drawWalkingRoutes, nearbyLocations, latitude, longitude]);

  // 주변 보관소 마커 표시
  useEffect(() => {
    const tmap = window.Tmapv3 || window.Tmapvector;
    if (!mapRef.current || !tmap || !nearbyLocations || nearbyLocations.length === 0) {
      return;
    }

    // 기존 주변 마커들 제거
    nearbyMarkersRef.current.forEach(marker => {
      try {
        marker.setMap(null);
      } catch (e) {
        console.warn('[TMAP] 주변 마커 제거 실패:', e);
      }
    });
    nearbyMarkersRef.current = [];

    // 새로운 주변 보관소 마커들 생성
    try {
      nearbyLocations.forEach((location, index) => {
        if (location.latitude && location.longitude && tmap.Marker) {
          const marker = new tmap.Marker({
            position: new tmap.LatLng(location.latitude, location.longitude),
            map: mapRef.current,
            title: `${index + 1}. ${location.name}${location.walkingTime ? ` (도보 ${Math.round(location.walkingTime)}분)` : ''}`
          });
          nearbyMarkersRef.current.push(marker);
        }
      });
      console.log(`[TMAP] 주변 보관소 마커 ${nearbyMarkersRef.current.length}개 생성 완료`);
    } catch (e) {
      console.error('[TMAP] 주변 마커 생성 에러:', e);
    }

    return () => {
      // cleanup: 주변 마커들 제거
      nearbyMarkersRef.current.forEach(marker => {
        try {
          marker.setMap(null);
        } catch (e) {
          console.warn('[TMAP] 주변 마커 제거 실패:', e);
        }
      });
      nearbyMarkersRef.current = [];
    };
  }, [nearbyLocations]);

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
        <div className="mt-2 space-y-2">
          <p className="text-xs text-gray-500">
            지도를 클릭하여 위치를 선택하세요.
          </p>
          {nearbyLocations && nearbyLocations.length > 0 && latitude && longitude && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowRoutes(!showRoutes)}
                disabled={loadingRoutes}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  showRoutes
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${loadingRoutes ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loadingRoutes ? '경로 로딩 중...' : showRoutes ? '경로 숨기기' : '도보 경로 표시'}
              </button>
              {showRoutes && (
                <span className="text-xs text-gray-500">
                  최대 5개 보관소까지 경로를 표시합니다.
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TmapSelector;

