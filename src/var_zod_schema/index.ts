import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';

/**
 * 物品对象 schema
 */
const itemSchema = () =>
  z.object({
    desc: z.string(),
    type: z.string(),
    quantity: z.coerce.number(),
  });

/**
 * 锁定物品 schema（值不可变）
 */
const lockedItemSchema = (defaultDesc: string, defaultType: string, defaultQuantity = 1) =>
  z
    .object({
      desc: z
        .string()
        .prefault(defaultDesc)
        .transform(() => defaultDesc),
      type: z
        .string()
        .prefault(defaultType)
        .transform(() => defaultType),
      quantity: z.coerce
        .number()
        .prefault(defaultQuantity)
        .transform(() => defaultQuantity),
    })
    .prefault({});

/**
 * 创建锁定字符串 schema
 */
const lockedString = (value: string) =>
  z
    .string()
    .prefault(value)
    .transform(() => value);

/**
 * 数组去重 transform
 */
const uniqueArrayTransform = <T>(arr: T[]) => _.uniq(arr);

/**
 * 数组去重并强制包含特定值
 */
const uniqueArrayWithRequired =
  <T>(required: T[]) =>
  (arr: T[]) =>
    _.uniq([...arr, ...required]);

/**
 * 数值范围限制 transform
 */
const clampTransform = (min: number, max: number) => (val: number) => _.clamp(val, min, max);

/**
 * 外观对象 schema
 */
const appearanceSchema = (defaults: Record<string, string> = {}) => z.record(z.string(), z.string()).prefault(defaults);

/**
 * 身份数组 schema（带去重）
 */
const identityArraySchema = (defaults: string[] = []) =>
  z.array(z.string()).prefault(defaults).transform(uniqueArrayTransform);

/**
 * 身份数组 schema（带去重和强制值）
 */
const identityArrayWithRequired = (defaults: string[], required: string[]) =>
  z.array(z.string()).prefault(defaults).transform(uniqueArrayWithRequired(required));

/**
 * 状态数组 schema
 */
const stateArraySchema = () => z.array(z.string()).prefault([]).transform(uniqueArrayTransform);

/**
 * 好感度/信任值等数值 schema
 */
const clampedNumberSchema = (defaultVal: number, min: number, max: number) =>
  z.coerce.number().prefault(defaultVal).transform(clampTransform(min, max));

// 常量定义
const ShiroAbilities = ['存在即法则', '全知', '概念消除', '泡泡空间'];
const SecondaryCharEnum = z.enum([
  '莉瑟尔·冯·阿尔卡德',
  '艾露薇娅·瑟兰迪尔',
  '理子',
  '露克希娅',
  '青璇',
  '橘奈绪',
  '琥珀',
]);

export const Schema = z.object({
  全局信息: z.object({
    日期: z.templateLiteral([`终焉纪元${z.coerce.number()}年${z.coerce.number()}月${z.coerce.number()}日`]),
    时间: z.templateLiteral([z.coerce.number(), ':', z.coerce.number()]),
    当前位置: z.string(),
    天气: z.string(),
    异常: z.record(z.string(), z.string()).prefault({}),
  }),
  plot_record: z.object({
    剧情进度: z.string().prefault('v1'),
    剧情节点记录: stateArraySchema(),
  }),
  主要角色: z
    .object({
      白: z.object({
        身份: identityArrayWithRequired(['外神'], ['外神']),
        关注度: clampedNumberSchema(0.01, 0, 1),
        外观: appearanceSchema({
          头发: '白色及腰长发，发尾内卷，散发着冰冷的、非尘世的光泽',
          眼睛: '异色瞳(左眼群青色，右眼朱红色)',
          身材: '身形纤细娇小，四肢匀称，比例完美得超乎常理',
          肤色: '毫无瑕疵的陶瓷白',
        }),
        服饰: appearanceSchema({
          帽子: '小巧的、配有黑纱的哥特风格迷你礼帽',
          上衣: '制作精良的哥特洛丽塔风格洋装，以黑白为主色调',
          袜子: '50D白色连裤袜',
          鞋子: '黑色玛丽珍鞋',
        }),
        姿态动作: z.string(),
        持有物品: z.intersection(
          z.object({
            // 强制锁定
            黑白配色的蕾丝阳伞: lockedItemSchema('白随身携带的阳伞，几乎从不离手。伞面洁净，不染尘埃', '神之造物'),
          }),
          z.record(z.string(), itemSchema()),
        ),
        能力: z
          .unknown()
          .transform(() => ShiroAbilities)
          .prefault(ShiroAbilities),
      }),
      澪: z.object({
        身份: identityArraySchema(['失踪人员', '拾荒者']),
        好感度: clampedNumberSchema(0.01, -1, 1),
        治愈进度: clampedNumberSchema(0, 0, 90),
        注入星尘稳定剂: z.boolean().prefault(false),
        当前状态: stateArraySchema(),
        外观: z.object({
          外貌: appearanceSchema({
            头发: '齐腰的银紫色长发，因缺乏打理而显得有些蓬乱',
            眼睛: '略显疲惫的紫罗兰色眼眸，瞳色很深',
            身材: '病态的纤瘦，仿佛一阵风就能吹倒',
            肤色: '极久病般的苍白，薄得能看到皮肤下青色的血管',
          }),
          服饰: appearanceSchema({
            上衣: '洗得发白的淡紫色连衣裙',
          }),
        }),
        姿态动作: z.string(),
        持有物品: z.intersection(
          z.object({
            // 锁定
            星星吊坠: lockedItemSchema(
              '用黑色皮绳穿起来的、朴实无华的金属星星状吊坠，吊坠表面布满划痕，但被澪摩挲得十分光滑',
              '纪念品',
            ),
          }),
          z.record(z.string(), itemSchema()),
        ),
        能力: z.intersection(
          z.object({
            // 强制锁定
            法则解析: lockedString(
              "通过纯粹的智力运算和精灵血统带来的超凡感知，对失序区的'强加法则'进行逻辑层面上的精密解读和破译",
            ),
            法则预判: lockedString(
              '在完全解析一条法则后，能够预判出该法则在特定条件刺激下可能发生的连锁反应或次级变异',
            ),
            锚点感应: lockedString("对'现实锚点'发出的稳定波动有微弱的感知能力，能在一定范围内大致判断出稳定区的方向"),
            能量亲和: lockedString(
              '精灵血统使她对以太能量有微弱的调动能力，虽不足以施展传统魔法，但可以用来激活某些前文明的魔法造物或遗物',
            ),
            记忆宫殿: lockedString(
              '澪的头脑是一个井然有序的、巨大的图书馆。她能将所有亲身经历和习得的知识，以绝对精准、永不磨损的形式储存在记忆中，并随时进行高速检索和交叉引用',
            ),
          }),
          z.record(z.string(), z.string()),
        ),
      }),
    })
    .catchall(
      z.object({
        身份: identityArraySchema(['探索者']),
        当前状态: stateArraySchema(),
        持有物品: z
          .object({
            // 必需物品
            断章: lockedItemSchema(
              '一件来自前文明的遗物，由多种未知合金制成，能够根据使用者的需要和环境法则进行形态切换',
              '可变形复合式构装兵器',
            ),
            多功能背包: lockedItemSchema(
              '多功能背包，可储存各种物品。内含攀爬索、紧急医疗包、水源过滤器、能量棒等基础生存物资',
              '随身装备',
            ),
            通讯终端: lockedItemSchema(
              '一台经过改造的、坚固耐用的短距离通讯设备，只能在"现实锚点"附近或法则相对稳定的区域连接到区域性网络',
              '可复用物品',
            ),
            救生筏胶囊: lockedItemSchema('遗物猎人公会的标准高科技求生装备，能在任何水域提供临时的庇护', '可复用物品'),
          })
          .catchall(itemSchema())
          .prefault({}),
        能力: z
          .object({
            // 必需能力
            法则律动: lockedString("以类似肌肉记忆的直觉方式，在短时间内本能地感知、适应并利用失序区内的'强加法则'"),
            快速适应: lockedString('心智对法则悖论有极强的韧性，不易因现实扭曲而陷入疯狂或认知失调'),
            战斗直觉: lockedString('即使不完全理解法则的原理，也能通过战斗本能找到最优的行动方案'),
          })
          .catchall(z.string())
          .prefault({}),
        当前任务: z.string().prefault('暂无'),
      }),
    ),
  特殊角色: z.object({
    Lily: z.object({
      已在队伍: z.boolean().prefault(false),
      身份: identityArrayWithRequired(['白巫女'], ['白巫女']),
      好感度: clampedNumberSchema(0.1, -1, 1),
      污秽侵蚀度: clampedNumberSchema(0.1, 0, 1),
      当前状态: stateArraySchema(),
      外观: z.object({
        外貌: appearanceSchema(),
        服饰: appearanceSchema(),
      }),
      姿态动作: z.string(),
      持有物品: z.object({}).catchall(itemSchema()).prefault({}),
      能力: z
        .object({
          // 必需能力
          召唤: lockedString(''),
          净化: lockedString(''),
          祈祷: lockedString(''),
        })
        .catchall(z.string())
        .prefault({}),
      可用灵魂: z
        .object({
          // 必需
          黑色骑士: z
            .object({
              desc: z.string().prefault('说自己来自异国的黑衣骑士。即使成为污秽之魂，还保有自我意识'),
              灵魂能力: z.record(z.string(), z.string()).prefault({}),
            })
            .prefault({}),
        })
        .catchall(
          z.object({
            desc: z.string(),
            灵魂能力: z.record(z.string(), z.string()).prefault({}),
          }),
        )
        .prefault({}),
    }),
    布施翠: {
      已在队伍: z.boolean().prefault(false),
      身份: identityArrayWithRequired(['被诅咒的孩子'], ['被诅咒的孩子']),
      因子: lockedString('猫'),
      依赖度: clampedNumberSchema(0.01, -1, 1),
      模因侵蚀率: clampedNumberSchema(0.358, 0, 1),
      当前状态: stateArraySchema(),
      外观: z.object({
        外貌: appearanceSchema({
          猫耳: '头顶有一对覆盖着白色绒毛的猫耳',
          头发: '柔顺的白色长发，发梢有些分叉',
          眼睛: '紫罗兰色的眼眸，眼神清澈',
          身材: '瘦弱，骨架纤细，身形娇小',
          肤色: '缺乏日照的苍白肤色，细腻但毫无血色',
        }),
        服饰: appearanceSchema({
          帽子: '沾满灰尘的宽大黑色魔女帽',
          发饰: '用一条褪色的紫色缎带随意束起一部分头发',
          上衣: '略有磨损的淡粉色衬衫，领口为紫色',
          裙子: '褪色且裙摆有细微撕裂痕迹的深紫色短裙',
          袜子: '深紫色长筒袜',
          鞋子: '黑色帆布鞋',
        }),
      }),
      姿态动作: z.string(),
      持有物品: z
        .object({
          // 必需物品
          黑色魔女帽: lockedItemSchema('宽大的黑色魔女帽，帽檐上装饰着黑色的缎带和两个白色的小球', '重要之物'),
        })
        .catchall(itemSchema())
        .prefault({}),
      能力: z
        .object({
          // 必需能力
          '畸变病毒-猫因子': lockedString(
            "作为猫型'受诅之子'，翠体内的畸变病毒赋予了她超乎常人的敏捷性、平衡感和瞬间爆发力。她的听觉和嗅觉也得到了极大的强化",
          ),
          气味占卜: lockedString('一种基于超常嗅觉的特殊能力，是翠的独特感知方式'),
          法则适应性: lockedString("与所有'受诅之子'一样，拥有对'强加法则'的本能适应力"),
        })
        .catchall(z.string())
        .prefault({}),
    },
    蛭子小比奈: {
      已在队伍: z.boolean().prefault(false),
      身份: identityArrayWithRequired(['被诅咒的孩子', '恶魔之子'], ['被诅咒的孩子', '恶魔之子']),
      因子: lockedString('螳螂'),
      认可度: clampedNumberSchema(0.01, -1, 1),
      模因侵蚀率: clampedNumberSchema(0.168, 0, 1),
      当前状态: stateArraySchema(),
      外观: z.object({
        外貌: appearanceSchema({
          头发: '蓝色的及肩短发，带有自然的波浪卷，看起来柔软蓬松',
          眼睛: '鲜红色的眼眸',
          身材: '身形娇小',
          肤色: '略显苍白的肤色',
        }),
        服饰: appearanceSchema({
          上衣: '缀有复杂蕾丝和花边的深蓝色哥特式连身洋装',
          鞋子: '特制的平底小皮靴，前端有蓝白条纹，饰有蝴蝶结',
        }),
      }),
      姿态动作: z.string(),
      持有物品: z
        .object({
          // 必需物品
          錵制小太刀: lockedItemSchema(
            "由超硬金属'錵'打造的小太刀，刀刃锋利无比，是小比奈最主要的武器",
            '重要的武器',
            2,
          ),
        })
        .catchall(itemSchema())
        .prefault({}),
      能力: z
        .object({
          // 必需能力
          '畸变病毒-螳螂因子': lockedString(
            "作为螳螂型'受诅之子'，她体内的畸变病毒赋予了她无与伦比的近战能力，其速度、力量、反应能力和动态视力都达到了人类无法企及的高度",
          ),
          '双刀/四刀流剑术': lockedString('精通使用小太刀进行战斗，刀法凌厉致命，是纯粹为了杀戮而磨练出的技艺'),
          法则适应性: lockedString("与所有'受诅之子'一样，拥有对'强加法则'的本能适应力"),
        })
        .catchall(z.string())
        .prefault({}),
    },
  }),
  次要角色: z
    .record(
      z.string(),
      z.object({
        身份: z.string(),
        信任值: clampedNumberSchema(0.01, -1, 1),
        外观: z.string(),
        姿态动作: z.string(),
        持有物品: z.record(z.string(), itemSchema()).prefault({}),
        能力: z.record(z.string(), z.string()).prefault({}),
      }),
    )
    .transform(obj => {
      // 过滤掉不允许的次要角色
      const filtered: Record<string, any> = {};
      const removedCharacters: string[] = [];

      for (const key in obj) {
        if (SecondaryCharEnum.safeParse(key).success) {
          filtered[key] = obj[key];
        } else {
          removedCharacters.push(key);
        }
      }

      if (removedCharacters.length > 0) {
        console.log(`[次要角色限制] 检测到不允许的角色，已移除: ${removedCharacters.join(', ')}`);
      }

      return filtered;
    })
    .prefault({}),
  次要角色记录: z.record(z.string(), z.any()).prefault({}),
  _internal: z.record(z.any(), z.any()).optional(),
});

$(() => {
  registerMvuSchema(Schema);
});
