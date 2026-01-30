module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/contact/send-email',
      handler: 'api::contact.contact.sendEmail',
      config: {
        auth: false,
        policies: [],
      },
    },
  ],
};
