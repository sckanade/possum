const twilio = require("twilio");
const { twilio: twilioConfig } = require("../config/env");

async function sendPurchaseNotification({ to, customerName, invoiceNumber, total }) {
  if (!twilioConfig.accountSid || !twilioConfig.authToken || !twilioConfig.whatsappFrom) {
    return {
      delivered: false,
      reason: "Twilio credentials are not configured"
    };
  }

  const client = twilio(twilioConfig.accountSid, twilioConfig.authToken);
  const body = `Halo ${customerName}, pembelian Anda dengan invoice ${invoiceNumber} sebesar Rp${total} telah berhasil.`;

  const result = await client.messages.create({
    from: twilioConfig.whatsappFrom,
    to,
    body
  });

  return {
    delivered: true,
    sid: result.sid
  };
}

module.exports = {
  sendPurchaseNotification
};
