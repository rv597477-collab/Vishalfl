import { AnimatePresence, cubicBezier, motion } from 'framer-motion';

interface SendButtonProps {
  show: boolean;
  isStreaming?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onImagesSelected?: (images: File[]) => void;
}

const customEasingFn = cubicBezier(0.4, 0, 0.2, 1);

export const SendButton = ({ show, isStreaming, disabled, onClick }: SendButtonProps) => {
  return (
    <AnimatePresence>
      {show ? (
        <motion.button
          className="absolute flex justify-center items-center top-[20px] right-[24px] p-1.5 bg-gradient-to-r from-sky-500 to-cyan-400 hover:brightness-110 text-white rounded-full w-11 h-11 border border-white/35 shadow-[0_14px_30px_-14px_rgba(56,189,248,0.85)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          transition={{ ease: customEasingFn, duration: 0.17 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          disabled={disabled}
          onClick={(event) => {
            event.preventDefault();

            if (!disabled) {
              onClick?.(event);
            }
          }}
        >
          <div className="text-lg">
            {!isStreaming ? <div className="i-ph:arrow-right"></div> : <div className="i-ph:stop-circle-bold"></div>}
          </div>
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
};
