import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// TMAP 스크립트를 로드 (로더가 document.write를 사용하므로 직접 SDK 파일 로드)
const loadTmapScript = () => {
  const apiKey = import.meta.env.VITE_TMAP_JS_API_KEY;
  if (!apiKey) {
    console.warn('[TMAP] VITE_TMAP_JS_API_KEY가 설정되지 않았습니다.');
    return Promise.resolve();
  }

  // 이미 Tmapv3가 있으면 완료
  if ((window as any).Tmapv3 && (window as any).Tmapv3.Map) {
    return Promise.resolve();
  }

  // 이미 로드 중이면 스킵
  if (document.querySelector('script[src*="tmapjs3.min.js"]')) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    // 1단계: 로더 스크립트 로드
    const loaderScript = document.createElement('script');
    loaderScript.src = `https://apis.openapi.sk.com/tmap/vectorjs?version=1&appKey=${apiKey}`;
    
    loaderScript.onload = () => {
      // 2단계: 로더의 _getScriptLocation()을 사용하여 실제 SDK 파일 직접 로드
      // 로더가 document.write를 사용하므로 직접 로드해야 함
      const tmapvector = (window as any).Tmapvector;
      if (!tmapvector || typeof tmapvector._getScriptLocation !== 'function') {
        reject(new Error('TMAP 로더를 찾을 수 없습니다'));
        return;
      }
      
      const sdkBaseUrl = tmapvector._getScriptLocation();
      console.log('[TMAP] SDK 기본 URL:', sdkBaseUrl);
      
      // 실제 SDK 파일 로드 (로더 코드에서 tmapjs3.min.js?version=20231206 사용)
      const sdkScript = document.createElement('script');
      sdkScript.src = `${sdkBaseUrl}tmapjs3.min.js?version=20231206`;
      
      // CSS도 로드
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = `${sdkBaseUrl}vsm.css`;
      document.head.appendChild(cssLink);
      
      sdkScript.onload = () => {
        // SDK가 완전히 로드될 때까지 대기
        let checkCount = 0;
        const checkInterval = setInterval(() => {
          checkCount++;
          if ((window as any).Tmapv3 && (window as any).Tmapv3.Map && (window as any).Tmapv3.LatLng) {
            clearInterval(checkInterval);
            console.log('[TMAP] ✅ SDK 로드 완료');
            resolve();
          } else if (checkCount >= 100) {
            clearInterval(checkInterval);
            console.error('[TMAP] SDK 객체를 찾을 수 없습니다');
            reject(new Error('TMAP SDK 객체를 찾을 수 없습니다'));
          }
        }, 100);
      };
      
      sdkScript.onerror = () => {
        reject(new Error('TMAP SDK 스크립트 로드 실패'));
      };
      
      document.head.appendChild(sdkScript);
    };
    
    loaderScript.onerror = () => {
      reject(new Error('TMAP 로더 스크립트 로드 실패'));
    };
    
    document.head.appendChild(loaderScript);
  });
};

// 스크립트 로드 후 앱 렌더링
loadTmapScript()
  .then(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  })
  .catch((error) => {
    console.error('[TMAP] 스크립트 로드 실패:', error);
    // 에러가 있어도 앱은 렌더링
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
