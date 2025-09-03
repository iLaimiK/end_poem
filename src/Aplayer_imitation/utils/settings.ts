import { PlayOrder } from '../types/enums';

/**
 * 播放器设置的 Zod Schema
 */
export const PlayerSettingsSchema = z.object({
  /** 默认音量 (0-1) */
  defaultVolume: z.number().min(0).max(1).default(0.7),

  /** 默认播放模式 */
  defaultOrder: z.enum(PlayOrder).default(PlayOrder.LIST),

  /** 是否自动播放 */
  autoPlay: z.boolean().default(false),

  /** 播放列表是否默认折叠 */
  listFolded: z.boolean().default(true),

  /** 播放器是否默认最小化 */
  isMinimized: z.boolean().default(false),

  /** 自定义歌曲列表 */
  customAudioList: z
    .array(
      z.object({
        name: z.string(),
        artist: z.string(),
        url: z.url(),
        cover: z.url().optional(),
      }),
    )
    .optional(),
});

export type PlayerSettings = z.infer<typeof PlayerSettingsSchema>;

/**
 * 获取默认设置
 */
export const getDefaultSettings = (): PlayerSettings => {
  return PlayerSettingsSchema.parse({});
};

/**
 * 验证和规范化设置
 */
export const validateSettings = (settings: unknown): PlayerSettings => {
  return PlayerSettingsSchema.parse(settings);
};
