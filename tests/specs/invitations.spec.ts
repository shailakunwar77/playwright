import { test, expect } from '../../fixtures/test.fixture';

test.beforeEach(async ({ workspace }) => { await workspace.goto(); });

test('cancelling a modal does not send an email', async ({ invitations, recipientEmail, mailbox }) => {
  await invitations.open();
  await expect(invitations.dialog).toBeVisible();
  await invitations.fillRecipient(recipientEmail);
  await invitations.cancel();
  await expect(invitations.dialog).toBeHidden();
  expect(await mailbox.messagesFor(recipientEmail)).toEqual([]);
  await invitations.open();
  await expect(invitations.dialog.getByRole('textbox', { name: 'Recipient email' })).toHaveValue('');
});

test('generated email receives one invitation with the correct content', async ({ invitations, recipientEmail, mailbox }) => {
  await invitations.open();
  await invitations.fillRecipient(recipientEmail);
  await invitations.send();
  await expect(invitations.dialog).toBeHidden();
  await expect(invitations.status).toHaveText(`Invitation sent to ${recipientEmail}`);
  const message = await mailbox.waitForInvitation(recipientEmail);
  expect(message.id).toBeTruthy();
  expect(message.to).toBe(recipientEmail);
  expect(message.subject).toBe('You are invited');
  expect(message.text).toBe('Welcome to the demo workspace.');
});

test('modal displays server validation and stays open for correction', async ({ invitations, recipientEmail, mailbox }) => {
  await invitations.open();
  await invitations.fillRecipient('someone@example.com');
  await invitations.send();
  await expect(invitations.dialog).toBeVisible();
  await expect(invitations.error).toHaveText('Use an example.test email address');
  await invitations.fillRecipient(recipientEmail);
  await invitations.send();
  await expect(invitations.dialog).toBeHidden();
  expect((await mailbox.waitForInvitation(recipientEmail)).to).toBe(recipientEmail);
});
