import React, { useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { classNames } from '~/utils/classNames';
import { PROVIDER_LIST } from '~/utils/constants';
import { ModelSelector } from '~/components/chat/ModelSelector';
import { LOCAL_PROVIDERS } from '~/lib/stores/settings';
import FilePreview from './FilePreview';
import { ScreenshotStateManager } from './ScreenshotStateManager';
import { SendButton } from './SendButton.client';
import { IconButton } from '~/components/ui/IconButton';
import { SpeechRecognitionButton } from '~/components/chat/SpeechRecognition';
import styles from './BaseChat.module.scss';
import type { ProviderInfo } from '~/types/model';
import { ColorSchemeDialog } from '~/components/ui/ColorSchemeDialog';
import type { DesignScheme } from '~/types/design-scheme';
import type { ElementInfo } from '~/components/workbench/Inspector';
import { McpTools } from './MCPTools';
import { WebSearch } from './WebSearch.client';
import type { ProgressAnnotation } from '~/types/context';

interface ChatBoxProps {
  isModelSettingsCollapsed: boolean;
  setIsModelSettingsCollapsed: (collapsed: boolean) => void;
  provider: any;
  providerList: any[];
  modelList: any[];
  apiKeys: Record<string, string>;
  isModelLoading: string | undefined;
  onApiKeysChange: (providerName: string, apiKey: string) => void;
  uploadedFiles: File[];
  imageDataList: string[];
  textareaRef: React.RefObject<HTMLTextAreaElement> | undefined;
  input: string;
  handlePaste: (e: React.ClipboardEvent) => void;
  TEXTAREA_MIN_HEIGHT: number;
  TEXTAREA_MAX_HEIGHT: number;
  isStreaming: boolean;
  handleSendMessage: (event: React.UIEvent, messageInput?: string) => void;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  chatStarted: boolean;
  exportChat?: () => void;
  qrModalOpen: boolean;
  setQrModalOpen: (open: boolean) => void;
  handleFileUpload: () => void;
  setProvider?: ((provider: ProviderInfo) => void) | undefined;
  model?: string | undefined;
  setModel?: ((model: string) => void) | undefined;
  setUploadedFiles?: ((files: File[]) => void) | undefined;
  setImageDataList?: ((dataList: string[]) => void) | undefined;
  handleInputChange?: ((event: React.ChangeEvent<HTMLTextAreaElement>) => void) | undefined;
  handleStop?: (() => void) | undefined;
  enhancingPrompt?: boolean | undefined;
  enhancePrompt?: (() => void) | undefined;
  onWebSearchResult?: (result: string) => void;
  chatMode?: 'discuss' | 'build';
  setChatMode?: (mode: 'discuss' | 'build') => void;
  designScheme?: DesignScheme;
  setDesignScheme?: (scheme: DesignScheme) => void;
  selectedElement?: ElementInfo | null;
  setSelectedElement?: ((element: ElementInfo | null) => void) | undefined;
  progressAnnotations?: ProgressAnnotation[];
}

export const ChatBox: React.FC<ChatBoxProps> = (props) => {
  const [showModelSelector, setShowModelSelector] = useState(false);
  const latestProgress = props.progressAnnotations?.[props.progressAnnotations.length - 1];
  const latestMessage = latestProgress?.message?.toLowerCase() || '';
  const hasFailure = /fail|error|unable|timed out/.test(latestMessage);
  const completed = !props.isStreaming && !!latestProgress;

  // Check if provider needs API key
  const needsApiKey =
    props.provider && !LOCAL_PROVIDERS.includes(props.provider.name) && !props.apiKeys[props.provider?.name];

  let activeStage: 'generating' | 'editing files' | 'running build' = 'generating';

  if (/file|edit|write|create|modify|patch/.test(latestMessage)) {
    activeStage = 'editing files';
  }

  if (/build|compile|pnpm|npm|bun|test|run/.test(latestMessage)) {
    activeStage = 'running build';
  }

  const stageItems = [
    { key: 'generating', icon: 'i-ph:sparkle-fill' },
    { key: 'editing', icon: 'i-ph:pencil-simple-fill' },
    { key: 'building', icon: 'i-ph:terminal-window-fill' },
    { key: 'done', icon: 'i-ph:check-circle-fill' },
  ] as const;

  return (
    <div
      className={classNames(
        'relative backdrop-blur-2xl p-5 lg:p-6 rounded-3xl border border-white/[0.08] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.02)_inset] w-full max-w-chat mx-auto z-prompt',
        'bg-gradient-to-b from-bolt-elements-background-depth-2/95 to-bolt-elements-background-depth-1/90',
      )}
    >
      {/* Animated border effect */}
      <svg className={classNames(styles.PromptEffectContainer)}>
        <defs>
          <linearGradient
            id="line-gradient"
            x1="20%"
            y1="0%"
            x2="-14%"
            y2="10%"
            gradientUnits="userSpaceOnUse"
            gradientTransform="rotate(-45)"
          >
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0%"></stop>
            <stop offset="40%" stopColor="#8b5cf6" stopOpacity="80%"></stop>
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="80%"></stop>
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0%"></stop>
          </linearGradient>
          <linearGradient id="shine-gradient">
            <stop offset="0%" stopColor="white" stopOpacity="0%"></stop>
            <stop offset="40%" stopColor="#ffffff" stopOpacity="80%"></stop>
            <stop offset="50%" stopColor="#ffffff" stopOpacity="80%"></stop>
            <stop offset="100%" stopColor="white" stopOpacity="0%"></stop>
          </linearGradient>
        </defs>
        <rect className={classNames(styles.PromptEffectLine)} pathLength="100" strokeLinecap="round"></rect>
        <rect className={classNames(styles.PromptShine)} x="48" y="24" width="70" height="1"></rect>
      </svg>

      {/* Progress indicators - only show when streaming */}
      {props.isStreaming && (
        <div className="mb-4 flex items-center gap-2">
          {stageItems.map((stage, index) => {
            const stageMapping: Record<string, number> = {
              generating: 0,
              'editing files': 1,
              'running build': 2,
            };
            const currentStageIndex = stageMapping[activeStage] ?? 0;
            const isActive = index === currentStageIndex;
            const isPast = index < currentStageIndex;

            return (
              <div
                key={stage.key}
                className={classNames(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300',
                  {
                    'bg-gradient-to-r from-blue-500/20 to-violet-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.2)]':
                      isActive,
                    'bg-white/[0.04] text-white/40 border border-white/[0.06]': !isActive && !isPast,
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': isPast,
                  },
                )}
              >
                <span className={classNames(stage.icon, 'text-sm', isActive && 'animate-pulse')} />
                <span className="capitalize">{stage.key}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Completion indicator */}
      {completed && !hasFailure && !props.isStreaming && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <span className="i-ph:check-circle-fill text-emerald-400" />
          <span className="text-sm text-emerald-400 font-medium">Generation complete</span>
        </div>
      )}

      {/* Error indicator */}
      {hasFailure && !props.isStreaming && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
          <span className="i-ph:warning-circle-fill text-red-400" />
          <span className="text-sm text-red-400 font-medium">An error occurred</span>
        </div>
      )}

      {/* Provider connection CTA - shows when API key is needed */}
      {needsApiKey && (
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <span className="i-ph:key-fill text-xl text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Connect {props.provider?.name}</p>
                <p className="text-xs text-white/50">Add your API key to start building</p>
              </div>
            </div>
            <button
              onClick={() => setShowModelSelector(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-amber-500/20"
            >
              Connect
            </button>
          </div>
        </div>
      )}

      {/* Model selector - collapsible */}
      <ClientOnly>
        {() => (
          <>
            {(showModelSelector || !props.isModelSettingsCollapsed) && (
              <div className="mb-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-wider text-white/40 font-medium">AI Model</span>
                  <button
                    onClick={() => {
                      setShowModelSelector(false);
                      props.setIsModelSettingsCollapsed(true);
                    }}
                    className="text-white/40 hover:text-white/60 transition-colors"
                  >
                    <span className="i-ph:x text-sm" />
                  </button>
                </div>
                <ModelSelector
                  key={props.provider?.name + ':' + props.modelList.length}
                  model={props.model}
                  setModel={props.setModel}
                  modelList={props.modelList}
                  provider={props.provider}
                  setProvider={props.setProvider}
                  providerList={props.providerList || (PROVIDER_LIST as ProviderInfo[])}
                  apiKeys={props.apiKeys}
                  modelLoading={props.isModelLoading}
                />
                {props.provider && !LOCAL_PROVIDERS.includes(props.provider.name) && (
                  <div className="mt-3 pt-3 border-t border-white/[0.06]">
                    <label className="block text-xs text-white/40 mb-2">API Key</label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={props.apiKeys[props.provider.name] || ''}
                        onChange={(e) => props.onApiKeysChange(props.provider.name, e.target.value)}
                        placeholder={`Enter ${props.provider.name} API key`}
                        className="flex-1 px-3 py-2 text-sm bg-white/[0.03] border border-white/[0.08] rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50"
                      />
                      <a
                        href={getProviderKeyUrl(props.provider.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
                      >
                        Get Key
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </ClientOnly>

      {/* File preview */}
      <FilePreview
        files={props.uploadedFiles}
        imageDataList={props.imageDataList}
        onRemove={(index) => {
          props.setUploadedFiles?.(props.uploadedFiles.filter((_, i) => i !== index));
          props.setImageDataList?.(props.imageDataList.filter((_, i) => i !== index));
        }}
      />

      <ClientOnly>
        {() => (
          <ScreenshotStateManager
            setUploadedFiles={props.setUploadedFiles}
            setImageDataList={props.setImageDataList}
            uploadedFiles={props.uploadedFiles}
            imageDataList={props.imageDataList}
          />
        )}
      </ClientOnly>

      {/* Selected element indicator */}
      {props.selectedElement && (
        <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] py-2 px-3 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <code className="bg-gradient-to-r from-blue-500 to-violet-500 rounded-md px-2 py-0.5 text-xs text-white font-medium">
              {props?.selectedElement?.tagName}
            </code>
            <span className="text-white/50">selected for inspection</span>
          </div>
          <button
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            onClick={() => props.setSelectedElement?.(null)}
          >
            Clear
          </button>
        </div>
      )}

      {/* Main input area */}
      <div
        className={classNames(
          'relative border border-white/[0.08] rounded-2xl bg-white/[0.02] overflow-hidden transition-all duration-300',
          'focus-within:border-blue-500/40 focus-within:shadow-[0_0_20px_rgba(59,130,246,0.15)]',
          'hover:border-white/[0.12]',
        )}
      >
        <textarea
          ref={props.textareaRef}
          className={classNames(
            'w-full pl-5 pt-5 pr-16 outline-none resize-none text-white placeholder-white/30 bg-transparent text-[15px] leading-relaxed',
          )}
          onDragEnter={(e) => {
            e.preventDefault();
            e.currentTarget.style.border = '2px solid #3b82f6';
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.style.border = '2px solid #3b82f6';
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.currentTarget.style.border = 'none';
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.style.border = 'none';

            const files = Array.from(e.dataTransfer.files);
            files.forEach((file) => {
              if (file.type.startsWith('image/')) {
                const reader = new FileReader();

                reader.onload = (ev) => {
                  const base64Image = ev.target?.result as string;
                  props.setUploadedFiles?.([...props.uploadedFiles, file]);
                  props.setImageDataList?.([...props.imageDataList, base64Image]);
                };
                reader.readAsDataURL(file);
              }
            });
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              if (event.shiftKey) {
                return;
              }

              event.preventDefault();

              if (props.isStreaming) {
                props.handleStop?.();
                return;
              }

              if (event.nativeEvent.isComposing) {
                return;
              }

              props.handleSendMessage?.(event);
            }
          }}
          value={props.input}
          onChange={(event) => {
            props.handleInputChange?.(event);
          }}
          onPaste={props.handlePaste}
          style={{
            minHeight: props.TEXTAREA_MIN_HEIGHT,
            maxHeight: props.TEXTAREA_MAX_HEIGHT,
          }}
          placeholder="Describe what you want to build..."
          translate="no"
        />

        {/* Send button */}
        <ClientOnly>
          {() => (
            <SendButton
              show={props.input.length > 0 || props.isStreaming || props.uploadedFiles.length > 0}
              isStreaming={props.isStreaming}
              disabled={!props.providerList || props.providerList.length === 0}
              onClick={(event) => {
                if (props.isStreaming) {
                  props.handleStop?.();
                  return;
                }

                if (props.input.length > 0 || props.uploadedFiles.length > 0) {
                  props.handleSendMessage?.(event);
                }
              }}
            />
          )}
        </ClientOnly>

        {/* Bottom toolbar */}
        <div className="flex justify-between items-center p-3 pt-1 border-t border-white/[0.04]">
          <div className="flex items-center gap-1">
            <IconButton title="Design preferences" className="w-8 h-8 rounded-lg hover:bg-white/[0.06] transition-all">
              <ColorSchemeDialog designScheme={props.designScheme} setDesignScheme={props.setDesignScheme} />
            </IconButton>
            <IconButton title="MCP Tools" className="w-8 h-8 rounded-lg hover:bg-white/[0.06] transition-all">
              <McpTools />
            </IconButton>
            <IconButton
              title="Upload file"
              className="w-8 h-8 rounded-lg hover:bg-white/[0.06] transition-all"
              onClick={() => props.handleFileUpload()}
            >
              <div className="i-ph:paperclip text-lg text-white/50 hover:text-white/70 transition-colors"></div>
            </IconButton>
            <IconButton title="Web search" className="w-8 h-8 rounded-lg hover:bg-white/[0.06] transition-all">
              <WebSearch onSearchResult={(result) => props.onWebSearchResult?.(result)} disabled={props.isStreaming} />
            </IconButton>
            <IconButton
              title="Model settings"
              className="w-8 h-8 rounded-lg hover:bg-white/[0.06] transition-all"
              onClick={() => {
                setShowModelSelector(!showModelSelector);
                props.setIsModelSettingsCollapsed(!props.isModelSettingsCollapsed);
              }}
            >
              <div className="i-ph:sliders-horizontal text-lg text-white/50 hover:text-white/70 transition-colors"></div>
            </IconButton>
          </div>

          <div className="flex items-center gap-2">
            {/* Current model indicator */}
            {props.provider && props.model && (
              <button
                onClick={() => {
                  setShowModelSelector(!showModelSelector);
                  props.setIsModelSettingsCollapsed(!props.isModelSettingsCollapsed);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.06] transition-all text-xs"
              >
                <span className="i-ph:cpu text-white/40" />
                <span className="text-white/60 max-w-[120px] truncate">{props.model}</span>
              </button>
            )}

            {/* Voice input */}
            <ClientOnly>
              {() => (
                <SpeechRecognitionButton
                  isListening={props.isListening}
                  onStart={props.startListening}
                  onStop={props.stopListening}
                  disabled={props.isStreaming}
                />
              )}
            </ClientOnly>
          </div>
        </div>
      </div>
    </div>
  );
};

function getProviderKeyUrl(providerName: string): string {
  const urls: Record<string, string> = {
    OpenAI: 'https://platform.openai.com/api-keys',
    Anthropic: 'https://console.anthropic.com/settings/keys',
    Google: 'https://aistudio.google.com/app/apikey',
    Groq: 'https://console.groq.com/keys',
    OpenRouter: 'https://openrouter.ai/keys',
    Mistral: 'https://console.mistral.ai/api-keys',
    xAI: 'https://console.x.ai',
    Cohere: 'https://dashboard.cohere.com/api-keys',
  };
  return urls[providerName] || '#';
}
