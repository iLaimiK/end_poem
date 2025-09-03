import { ref } from 'vue';

/**
 * 错误类型枚举
 */
export enum ErrorType {
  AUDIO_LOAD_ERROR = 'audio_load_error',
  AUDIO_PLAY_ERROR = 'audio_play_error',
  NETWORK_ERROR = 'network_error',
  PERMISSION_ERROR = 'permission_error',
  UNKNOWN_ERROR = 'unknown_error',
}

/**
 * 错误信息接口
 */
export interface ErrorInfo {
  type: ErrorType;
  message: string;
  timestamp: number;
  trackName?: string;
  trackUrl?: string;
}

/**
 * 加载状态枚举
 */
export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

/**
 * 全局错误状态管理
 */
export const useErrorHandler = () => {
  const errors = ref<ErrorInfo[]>([]);
  const currentError = ref<ErrorInfo | null>(null);
  const loadingState = ref<LoadingState>(LoadingState.IDLE);

  /**
   * 添加错误 - 使用节流避免错误风暴
   */
  const addError = _.throttle((error: Omit<ErrorInfo, 'timestamp'>) => {
    const errorInfo: ErrorInfo = {
      ...error,
      timestamp: Date.now(),
    };

    errors.value.unshift(errorInfo);
    currentError.value = errorInfo;

    // 限制错误历史数量
    if (errors.value.length > 10) {
      errors.value = errors.value.slice(0, 10);
    }

    // 自动清除当前错误
    setTimeout(() => {
      if (currentError.value === errorInfo) {
        currentError.value = null;
      }
    }, 5000);

    console.error('[APlayer Error]', errorInfo);
  }, 1000); // 每秒最多记录一个错误

  /**
   * 清除当前错误
   */
  const clearCurrentError = () => {
    currentError.value = null;
  };

  /**
   * 清除所有错误
   */
  const clearAllErrors = () => {
    errors.value = [];
    currentError.value = null;
  };

  /**
   * 设置加载状态
   */
  const setLoadingState = (state: LoadingState) => {
    loadingState.value = state;
  };

  /**
   * 处理音频加载错误
   */
  const handleAudioLoadError = (trackName: string, trackUrl: string, error?: any) => {
    let message = '音频加载失败';
    let type = ErrorType.AUDIO_LOAD_ERROR;

    if (error) {
      if (error.message?.includes('network')) {
        type = ErrorType.NETWORK_ERROR;
        message = '网络连接失败，无法加载音频';
      } else if (error.message?.includes('permission')) {
        type = ErrorType.PERMISSION_ERROR;
        message = '没有权限播放该音频';
      }
    }

    addError({
      type,
      message: `${message}: ${trackName}`,
      trackName,
      trackUrl,
    });

    setLoadingState(LoadingState.ERROR);
  };

  /**
   * 处理音频播放错误
   */
  const handleAudioPlayError = (trackName: string, error?: any) => {
    let message = '音频播放失败';

    if (error) {
      if (error.name === 'NotAllowedError') {
        message = '播放被浏览器阻止，请手动点击播放按钮';
      } else if (error.name === 'NotSupportedError') {
        message = '该音频格式不受支持';
      }
    }

    addError({
      type: ErrorType.AUDIO_PLAY_ERROR,
      message: `${message}: ${trackName}`,
      trackName,
    });
  };

  /**
   * 处理网络错误
   */
  const handleNetworkError = (message = '网络连接失败') => {
    addError({
      type: ErrorType.NETWORK_ERROR,
      message,
    });
  };

  /**
   * 处理未知错误
   */
  const handleUnknownError = (error: any, context = '未知操作') => {
    addError({
      type: ErrorType.UNKNOWN_ERROR,
      message: `${context}时发生未知错误: ${error?.message || '未知错误'}`,
    });
  };

  return {
    errors,
    currentError,
    loadingState,
    addError,
    clearCurrentError,
    clearAllErrors,
    setLoadingState,
    handleAudioLoadError,
    handleAudioPlayError,
    handleNetworkError,
    handleUnknownError,
  };
};

/**
 * 错误重试机制
 */
export class RetryHandler {
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  constructor(maxRetries = 3, retryDelay = 1000) {
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  /**
   * 执行带重试的异步操作
   */
  async execute<T>(operation: () => Promise<T>, onRetry?: (attempt: number, error: any) => void): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt < this.maxRetries) {
          onRetry?.(attempt, error);
          // 指数退避策略
          await this.delay(this.retryDelay * Math.pow(2, attempt - 1));
        }
      }
    }

    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
