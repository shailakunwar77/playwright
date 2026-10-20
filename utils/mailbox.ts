import { expect, type APIRequestContext } from '@playwright/test';

export interface TestEmail { id: string; to: string; subject: string; text: string }

/** Reads the demo's authenticated test outbox; replace with a provider adapter for real email. */
export class Mailbox {
  constructor(private readonly request: APIRequestContext) {}

  async messagesFor(to: string): Promise<TestEmail[]> {
    const response = await this.request.get('/api/messages', { params: { to } });
    expect(response.ok(), 'Outbox API must be available to the authenticated user').toBeTruthy();
    return response.json();
  }

  async waitForInvitation(to: string): Promise<TestEmail> {
    await expect.poll(async () => (await this.messagesFor(to)).length, {
      message: `Waiting for invitation addressed to ${to}`,
      timeout: 5000,
    }).toBe(1);
    return (await this.messagesFor(to))[0];
  }
}
