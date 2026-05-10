export default (ctx) => {
  ctx.reply('Choose an action:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Start - restart bot', callback_data: 'start' }],
        [{ text: 'Reset - clear context', callback_data: 'reset' }],
      ],
    },
  });
};
