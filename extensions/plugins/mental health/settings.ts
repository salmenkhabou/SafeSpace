import { PluginSetting } from '@/plugins/types';
import { SettingType } from '@/setting/schemas/types';

export default [
  {
    label: 'message',
    group: 'default',
    type: SettingType.text,
    value: 'Hello World!', // Default model
  },
] as const satisfies PluginSetting[];
