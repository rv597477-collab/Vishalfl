import React from 'react';

const EXAMPLE_PROMPTS = [
  { text: 'Create a mobile app about bolt.diy' },
  { text: 'Build a todo app in React using Tailwind' },
  { text: 'Build a simple blog using Astro' },
  { text: 'Create a cookie consent form using Material UI' },
  { text: 'Make a space invaders game' },
  { text: 'Make a Tic Tac Toe game in html, css and js only' },
];

export function ExamplePrompts(sendMessage?: { (event: React.UIEvent, messageInput?: string): void | undefined }) {
  return (
    <div id="examples" className="relative flex flex-col gap-5 w-full max-w-4xl mx-auto justify-center mt-8 px-4">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-bolt-elements-textTertiary">Try A Starter Prompt</p>
      </div>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        style={{
          animation: '.25s ease-out 0s 1 _fade-and-move-in_g2ptj_1 forwards',
        }}
      >
        {EXAMPLE_PROMPTS.map((examplePrompt, index: number) => {
          return (
            <button
              key={index}
              onClick={(event) => {
                sendMessage?.(event, examplePrompt.text);
              }}
              className="text-left border border-white/10 rounded-2xl bg-gradient-to-br from-bolt-elements-background-depth-2/90 to-bolt-elements-background-depth-3/80 hover:from-bolt-elements-background-depth-2 hover:to-bolt-elements-background-depth-3 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary px-4 py-3.5 text-sm leading-6 tracking-[0.01em] shadow-[0_10px_28px_-22px_rgba(0,0,0,0.75)] hover:shadow-[0_20px_36px_-24px_rgba(56,189,248,0.35)] hover:-translate-y-0.5 transition-all duration-200"
            >
              {examplePrompt.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
