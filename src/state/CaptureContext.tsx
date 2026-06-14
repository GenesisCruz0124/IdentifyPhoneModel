import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import type { CapturedImage, IdentificationResult } from '@/src/types';

interface CaptureContextValue {
  capturedImage: CapturedImage | null;
  setCapturedImage: (image: CapturedImage | null) => void;
  result: IdentificationResult | null;
  setResult: (result: IdentificationResult | null) => void;
}

const CaptureContext = createContext<CaptureContextValue | null>(null);

export function CaptureProvider({ children }: PropsWithChildren) {
  const [capturedImage, setCapturedImage] = useState<CapturedImage | null>(null);
  const [result, setResult] = useState<IdentificationResult | null>(null);

  const value = useMemo(
    () => ({ capturedImage, setCapturedImage, result, setResult }),
    [capturedImage, result]
  );

  return <CaptureContext.Provider value={value}>{children}</CaptureContext.Provider>;
}

export function useCapture(): CaptureContextValue {
  const ctx = useContext(CaptureContext);
  if (!ctx) {
    throw new Error('useCapture must be used within a CaptureProvider');
  }
  return ctx;
}
