import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Trash2, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SignaturePadProps {
  onSave: (signatureURL: string) => void;
  onClear: () => void;
}

export default function SignaturePad({ onSave, onClear }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const { t } = useTranslation();

  const clear = () => {
    sigCanvas.current?.clear();
    onClear();
  };

  const save = () => {
    if (sigCanvas.current?.isEmpty()) {
      return;
    }
    const dataURL = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
    if (dataURL) {
      onSave(dataURL);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-2xl overflow-hidden bg-white dark:bg-stone-800">
        <SignatureCanvas
          ref={sigCanvas}
          penColor="#f97316"
          canvasProps={{
            className: 'signature-canvas w-full h-48 cursor-crosshair',
          }}
          onEnd={save}
        />
      </div>
      <div className="flex justify-between items-center">
        <p className="text-xs text-stone-500 dark:text-stone-400 italic">
          {t('Please sign inside the box to authorize your order.')}
        </p>
        <button
          type="button"
          onClick={clear}
          className="flex items-center gap-2 text-stone-400 hover:text-red-500 transition-colors text-sm font-medium"
        >
          <Trash2 className="w-4 h-4" />
          {t('Clear')}
        </button>
      </div>
    </div>
  );
}
