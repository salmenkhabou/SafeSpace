import { PluginSetting } from '@/plugins/types';
import { SettingType } from '@/setting/schemas/types';

export default [
    {
        label: 'response_message',
        group: 'default',
        type: SettingType.multiple_text,
        value: [
            'Here’s what I found: ',
            'Let’s dive into the details: ',
        ],
    },
] as const satisfies PluginSetting[];
