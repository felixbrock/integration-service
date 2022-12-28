import { WebClient } from '@slack/web-api';
import { appConfig } from '../../config';
import {
  ISlackApiRepo,
  SlackMessageConfig,
} from '../../domain/slack-api/i-slack-api-repo';
import { SlackConversationInfo } from '../../domain/value-types/slack-conversation-info';

export default class SlackApiRepo implements ISlackApiRepo {
  sendAlert = async (
    accessToken: string,
    channelName: string,
    messageConfig: SlackMessageConfig,
  ): Promise<void> => {
    try {
      const client = new WebClient(accessToken);

      await client.chat.postMessage({
        channel: `#${channelName}`,
        text: 'Something went wrong',
        // attachments: [
        //   {
        //     mrkdwn_in: ['text'],
        //     ...messageConfig,
        //     color: '#6f47ef',
        //     fields: messageFieldConfigs,
        //     footer_icon:
        //       'https://platform.slack-edge.com/img/default_application_icon.png',
        //   },
        // ],
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `${messageConfig.anomalyMessagePart}`,
            },
          },
          {
            type: 'section', 
            text: {
              text: messageConfig.summaryPart,
              type: 'mrkdwn',
            },
            fields: [
              {
                type: 'mrkdwn',
                text: messageConfig.detectedValuePart,
              },
              {
                type: 'mrkdwn',
                text: messageConfig.expectedRangePart,
              },
            ],
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                style: 'danger',
                url: `${appConfig.slack.buttonBaseUrl}?alertId=${messageConfig.alertId}&testType=${messageConfig.testType}&userFeedbackIsAnomaly=1`,
                text: {
                  type: 'plain_text',
                  text: 'Mark as Anomaly',
                },
                value: 'click_me_123',
                action_id: 'mark-anomaly-button',
              },
              {
                type: 'button',
                style: 'primary',
                url: `${appConfig.slack.buttonBaseUrl}?alertId=${messageConfig.alertId}&testType=${messageConfig.testType}&userFeedbackIsAnomaly=0`,
                text: {
                  type: 'plain_text',
                  text: 'Mark as Normal',
                },
                value: 'click_me_123',
                action_id: 'mark-normal-button',
              },
            ],
          },
          {
            type: 'divider',
          },
          {
            type: 'context',
            elements: [
              {
                type: 'plain_text',
                text: `occurred on: ${messageConfig.occurredOn}`,
              },
              {
                type: 'plain_text',
                text: `alert id: ${messageConfig.alertId}`,
              },
            ],
          },
        ],
      });

      return await Promise.resolve();
    } catch (error: unknown) {
      if(error instanceof Error) console.error(error.stack); 
    else if (error) console.trace(error);
    return Promise.reject(new Error(''));
    }
  };

  getConversations = async (
    accessToken: string
  ): Promise<SlackConversationInfo[]> => {
    try {
      const client = new WebClient(accessToken);

      const result = await client.conversations.list({
        exclude_archived: true,
      });

      const { channels } = result;

      if (!channels) throw new Error('No channels found');

      const channelInfo: SlackConversationInfo[] = channels
        .map((channel) =>
          channel
            ? {
                id: channel.id,
                name: channel.name,
                isChannel: channel.is_channel,
                isPrivate: channel.is_private,
              }
            : undefined
        )
        .filter((element): element is SlackConversationInfo => !!element);

      return channelInfo;
    } catch (error: unknown) {
      if(error instanceof Error) console.error(error.stack); 
    else if (error) console.trace(error);
    return Promise.reject(new Error(''));
    }
  };

  joinConversation = async (
    accessToken: string,
    channelId: string
  ): Promise<void> => {
    try {
      const client = new WebClient(accessToken);

      const result = await client.conversations.join({
        channel: channelId,
        token: accessToken,
      });

      if (!result.ok) throw new Error('Joining channel failed');

      return await Promise.resolve();
    } catch (error: unknown) {
      if(error instanceof Error) console.error(error.stack); 
      else if (error) console.trace(error);
      return Promise.reject(new Error(''));
    }
  };

  leaveConversation = async (
    accessToken: string,
    channelId: string
  ): Promise<void> => {
    try {
      const client = new WebClient(accessToken);

      const result = await client.conversations.leave({
        channel: channelId,
        token: accessToken,
      });

      if (!result.ok) throw new Error('Leaving channel failed');

      return await Promise.resolve();
    } catch (error: unknown) {
      if(error instanceof Error) console.error(error.stack); 
    else if (error) console.trace(error);
    return Promise.reject(new Error(''));
    }
  };
}
