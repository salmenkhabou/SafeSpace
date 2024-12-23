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
import SETTINGS from './settings';

@Injectable()
export class SexualHealthPlugin extends BaseBlockPlugin<typeof SETTINGS> {
  template: PluginBlockTemplate = {
    patterns: ['symptoms', 'cycle insights', 'educational content'],
    starts_conversation: true,
    name: 'Sexual Health Awareness Plugin',
  };

  constructor(
    pluginService: PluginService,
    private readonly blockService: BlockService,
    private readonly settingService: SettingService,
  ) {
    super('sexual-health-plugin', pluginService);
  }

  getPath(): string {
    return __dirname;
  }

  async process(
    block: Block,
    context: Context,
    _convId: string,
  ): Promise<StdOutgoingEnvelope> {
    // Extracting user input from context
    const userInput =
      (context as any)?.payload?.text ||
      (context as any)?.input ||
      'No input provided';

    if (block.patterns.includes('symptoms')) {
      const response = await this.fetchSymptomChecker(userInput);
      return this.createMessage(response, {}, context);
    }

    if (block.patterns.includes('cycle insights')) {
      const response = await this.fetchCycleInsights(userInput);
      return this.createMessage(response, {}, context);
    }

    if (block.patterns.includes('educational content')) {
      const response = await this.fetchEducationalContent();
      return this.createMessage(response, {}, context);
    }

    return this.createMessage('Unknown request.', {}, context);
  }

  private async fetchSymptomChecker(symptoms: string): Promise<string> {
    try {
      const apiResponse = await axios.post(
        'https://mental-health-care-file.p.rapidapi.com/symptoms',
        { symptoms },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return apiResponse.data.message;
    } catch (error) {
      console.error('Error fetching symptoms:', error.message);
      return 'Failed to fetch symptom information.';
    }
  }

  private async fetchCycleInsights(day: string): Promise<string> {
    try {
      const apiResponse = await axios.get(
        `https://mental-health-care-file.p.rapidapi.com/cycleInsights?day=${day}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return apiResponse.data.message;
    } catch (error) {
      console.error('Error fetching cycle insights:', error.message);
      return 'Failed to fetch cycle insights.';
    }
  }

  private async fetchEducationalContent(): Promise<string> {
    try {
      const apiResponse = await axios.get(
        'https://mental-health-care-file.p.rapidapi.com/educationalContent',
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return apiResponse.data.message;
    } catch (error) {
      console.error('Error fetching educational content:', error.message);
      return 'Failed to fetch educational content.';
    }
  }

  private createMessage(
    response: string,
    settings: any,
    context: Context,
  ): StdOutgoingTextEnvelope {
    return {
      format: OutgoingMessageFormat.text,
      message: {
        text: this.blockService.processText(response, context, {}, settings),
      },
    };
  }
}
