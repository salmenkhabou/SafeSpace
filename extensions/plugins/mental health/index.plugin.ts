import { Block } from '@/chat/schemas/block.schema';
import { Context } from '@/chat/schemas/types/context';
import {
  OutgoingMessageFormat,
  StdOutgoingEnvelope,
  StdOutgoingTextEnvelope,
} from '@/chat/schemas/types/message';
import { BlockService } from '@/chat/services/block.service';
import { BaseBlockPlugin } from '@/plugins/base-block-plugin';
import { PluginService } from '@/plugins/plugins.service';
import { PluginBlockTemplate } from '@/plugins/types';
import { SettingService } from '@/setting/services/setting.service';
import { Injectable } from '@nestjs/common';

import axios from 'axios';
import MENTAL_SETTINGS from './settings';

@Injectable()
export class MentalHealthPlugin extends BaseBlockPlugin<
  typeof MENTAL_SETTINGS
> {
  template: PluginBlockTemplate = {
    patterns: ['mood', 'emotion', 'feeling'],
    starts_conversation: true,
    name: 'Mental Health Plugin',
  };

  constructor(
    pluginService: PluginService,
    private readonly blockService: BlockService,
    private readonly settingService: SettingService,
  ) {
    super('mental-health-plugin', pluginService);
  }

  getPath(): string {
    return __dirname;
  }

  async process(
    block: Block,
    context: Context,
    _convId: string,
  ): Promise<StdOutgoingEnvelope> {
    const userInput = context.text?.toLowerCase() || '';

    // Fetch emotions dynamically
    const emotionsData = await this.fetchEmotionsData();

    if (!emotionsData) {
      return {
        format: OutgoingMessageFormat.text,
        message: {
          text: 'I am sorry, I could not fetch emotions data at the moment.',
        },
      };
    }

    // Analyze input and find the best match
    const response = this.analyzeInput(userInput, emotionsData);

    return response;
  }

  private async fetchEmotionsData(): Promise<any[]> {
    try {
      const apiResponse = await axios.get(
        'https://mood-api.p.rapidapi.com/moods',
        {
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key':
              'e705103328mshbc746a4fd180b9ap140848jsnfe3926e9f2ec',
            'X-RapidAPI-Host': 'mood-api.p.rapidapi.com',
          },
        },
      );

      return apiResponse.data; // Assuming the API returns an array of emotions
    } catch (error) {
      console.error(
        'Error fetching emotions data:',
        error.response?.data || error.message,
      );
      return null;
    }
  }

  private analyzeInput(
    userInput: string,
    emotionsData: any[],
  ): StdOutgoingTextEnvelope {
    // Search for a matching emotion in the fetched data
    const matchedEmotion = emotionsData.find((item) =>
      userInput.includes(item.name.toLowerCase()),
    );

    // If a match is found, return the description
    if (matchedEmotion) {
      return {
        format: OutgoingMessageFormat.text,
        message: {
          text: `Emotion: ${matchedEmotion.name}\nDescription: ${matchedEmotion.description}`,
        },
      };
    }

    // Default response for unmatched input
    return {
      format: OutgoingMessageFormat.text,
      message: {
        text: 'I am sorry, I could not find a matching emotion.',
      },
    };
  }
}
